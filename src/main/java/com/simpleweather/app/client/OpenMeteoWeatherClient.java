package com.simpleweather.app.client;

import com.simpleweather.app.dto.external.OpenMeteoForecastResponse;
import com.simpleweather.app.dto.external.OpenMeteoGeocodingResponse;
import com.simpleweather.app.exception.ApiUnavailableException;
import com.simpleweather.app.model.LocationDetails;
import com.simpleweather.app.model.WeatherSnapshot;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientException;

@Component
public class OpenMeteoWeatherClient implements WeatherApiClient {

    private final WebClient geocodingWebClient;
    private final WebClient forecastWebClient;
    private final Duration timeout;

    public OpenMeteoWeatherClient(
        @Qualifier("geocodingWebClient") WebClient geocodingWebClient,
        @Qualifier("forecastWebClient") WebClient forecastWebClient,
        Duration weatherApiTimeout
    ) {
        this.geocodingWebClient = geocodingWebClient;
        this.forecastWebClient = forecastWebClient;
        this.timeout = weatherApiTimeout;
    }

    @Override
    public Optional<LocationDetails> findLocationByCity(String city) {
        return findLocations(city, 1).stream().findFirst();
    }

    @Override
    public List<LocationDetails> findLocations(String query, int count) {
        try {
            OpenMeteoGeocodingResponse response = geocodingWebClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path("/search")
                    .queryParam("name", query)
                    .queryParam("count", count)
                    .queryParam("language", "pt")
                    .queryParam("format", "json")
                    .build())
                .retrieve()
                .bodyToMono(OpenMeteoGeocodingResponse.class)
                .timeout(timeout)
                .block();

            if (response == null || response.results() == null || response.results().isEmpty()) {
                return Collections.emptyList();
            }

            return response.results().stream()
                .map(this::toLocationDetails)
                .toList();
        } catch (WebClientException ex) {
            throw new ApiUnavailableException("API indisponivel no momento trazendo um 502", ex);
        }
    }

    @Override
    public List<WeatherSnapshot> getHourlyForecast(LocationDetails location, LocalDate date) {
        try {
            OpenMeteoForecastResponse response = forecastWebClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path("/forecast")
                    .queryParam("latitude", location.latitude())
                    .queryParam("longitude", location.longitude())
                    .queryParam("hourly", "temperature_2m,weather_code,precipitation_probability")
                    .queryParam("timezone", location.timezone())
                    .queryParam("start_date", date)
                    .queryParam("end_date", date)
                    .build())
                .retrieve()
                .bodyToMono(OpenMeteoForecastResponse.class)
                .timeout(timeout)
                .block();

            if (response == null || response.hourly() == null) {
                return Collections.emptyList();
            }

            List<String> times = response.hourly().time();
            List<Double> temperatures = response.hourly().temperature2m();
            List<Integer> weatherCodes = response.hourly().weatherCode();
            List<Integer> rainProbabilities = response.hourly().precipitationProbability();

            int size = Math.min(Math.min(times.size(), temperatures.size()), Math.min(weatherCodes.size(), rainProbabilities.size()));
            List<WeatherSnapshot> snapshots = new ArrayList<>(size);

            for (int index = 0; index < size; index++) {
                snapshots.add(new WeatherSnapshot(
                    LocalDateTime.parse(times.get(index)),
                    temperatures.get(index),
                    rainProbabilities.get(index),
                    weatherCodes.get(index)
                ));
            }

            return snapshots;
        } catch (RuntimeException ex) {
            throw new ApiUnavailableException("API indisponivel no momento trazendo um 502", ex);
        }
    }

    private LocationDetails toLocationDetails(OpenMeteoGeocodingResponse.GeocodingResult result) {
        return new LocationDetails(
            result.name(),
            result.admin1(),
            result.country(),
            result.timezone(),
            result.latitude(),
            result.longitude()
        );
    }
}
