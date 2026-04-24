package com.simpleweather.app.service;

import com.simpleweather.app.client.WeatherApiClient;
import com.simpleweather.app.dto.request.WeatherRequest;
import com.simpleweather.app.dto.response.LocationOptionResponse;
import com.simpleweather.app.dto.response.WeatherResponse;
import com.simpleweather.app.exception.CityNotFoundException;
import com.simpleweather.app.exception.InvalidWeatherRequestException;
import com.simpleweather.app.model.LocationDetails;
import com.simpleweather.app.model.WeatherSnapshot;
import com.simpleweather.app.support.WeatherDescriptor;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class WeatherServiceImpl implements WeatherService {

    private static final LocalTime DEFAULT_TIME = LocalTime.NOON;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final int LOCATION_RESULT_LIMIT = 8;

    private final WeatherApiClient weatherApiClient;
    private final Clock clock;

    public WeatherServiceImpl(WeatherApiClient weatherApiClient, Clock clock) {
        this.weatherApiClient = weatherApiClient;
        this.clock = clock;
    }

    @Override
    public WeatherResponse getWeather(WeatherRequest request) {
        validateRequest(request);

        LocationDetails location = resolveLocation(request);

        LocalTime requestedTime = normalizeRequestedTime(request.time());
        LocalDateTime targetDateTime = LocalDateTime.of(request.date(), requestedTime);

        List<WeatherSnapshot> snapshots = weatherApiClient.getHourlyForecast(location, request.date());

        WeatherSnapshot selectedSnapshot = snapshots.stream()
            .filter(snapshot -> snapshot.dateTime().equals(targetDateTime))
            .findFirst()
            .orElseThrow(() -> new InvalidWeatherRequestException("Nao ha previsao disponivel para a data e hora informadas."));

        WeatherDescriptor descriptor = WeatherDescriptor.fromCode(selectedSnapshot.weatherCode());

        return new WeatherResponse(
            location.displayName(),
            request.date(),
            requestedTime.format(TIME_FORMATTER),
            selectedSnapshot.temperature(),
            descriptor.descriptionPtBr(),
            selectedSnapshot.rainProbability(),
            descriptor.iconCode()
        );
    }

    @Override
    public List<LocationOptionResponse> searchLocations(String query) {
        String sanitizedQuery = query == null ? "" : query.trim();

        if (sanitizedQuery.length() < 2) {
            throw new InvalidWeatherRequestException("Digite pelo menos 2 caracteres para buscar cidades.");
        }

        return weatherApiClient.findLocations(sanitizedQuery, LOCATION_RESULT_LIMIT).stream()
            .map(location -> new LocationOptionResponse(
                location.city(),
                location.state(),
                location.country(),
                location.timezone(),
                location.latitude(),
                location.longitude(),
                location.displayName()
            ))
            .toList();
    }

    private void validateRequest(WeatherRequest request) {
        LocalDate today = LocalDate.now(clock);
        boolean hasCoordinates = request.latitude() != null || request.longitude() != null;
        boolean hasCity = request.city() != null && !request.city().isBlank();

        if (!hasCity && !hasCoordinates) {
            throw new InvalidWeatherRequestException("Selecione uma cidade na lista ou use a localizacao atual.");
        }

        if (request.latitude() == null ^ request.longitude() == null) {
            throw new InvalidWeatherRequestException("Latitude e longitude precisam ser informadas juntas.");
        }

        if (request.latitude() != null && (request.latitude() < -90 || request.latitude() > 90)) {
            throw new InvalidWeatherRequestException("Latitude invalida.");
        }

        if (request.longitude() != null && (request.longitude() < -180 || request.longitude() > 180)) {
            throw new InvalidWeatherRequestException("Longitude invalida.");
        }

        if (request.date().isBefore(today)) {
            throw new InvalidWeatherRequestException("A data precisa ser hoje ou futura.");
        }

        if (request.date().isAfter(today.plusDays(15))) {
            throw new InvalidWeatherRequestException("A API utilizada permite consultar ate 16 dias a partir de hoje.");
        }

    }

    private LocalTime normalizeRequestedTime(LocalTime requestedTime) {
        if (requestedTime == null) {
            return DEFAULT_TIME;
        }

        return requestedTime.truncatedTo(ChronoUnit.HOURS);
    }

    private LocationDetails resolveLocation(WeatherRequest request) {
        if (request.latitude() != null && request.longitude() != null) {
            String label = request.label() == null || request.label().isBlank()
                ? "Sua localizacao"
                : request.label().trim();

            return new LocationDetails(
                label,
                null,
                null,
                "auto",
                request.latitude(),
                request.longitude()
            );
        }

        return weatherApiClient.findLocationByCity(request.city().trim())
            .orElseThrow(() -> new CityNotFoundException("Cidade nao encontrada."));
    }
}
