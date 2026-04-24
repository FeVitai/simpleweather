package com.simpleweather.app.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.simpleweather.app.client.WeatherApiClient;
import com.simpleweather.app.dto.request.WeatherRequest;
import com.simpleweather.app.dto.response.WeatherResponse;
import com.simpleweather.app.exception.InvalidWeatherRequestException;
import com.simpleweather.app.model.LocationDetails;
import com.simpleweather.app.model.WeatherSnapshot;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class WeatherServiceImplTests {

    private final Clock fixedClock = Clock.fixed(Instant.parse("2026-04-24T10:00:00Z"), ZoneId.of("UTC"));

    @Test
    void shouldUseDefaultNoonWhenTimeIsMissing() {
        WeatherApiClient client = new StubWeatherApiClient();
        WeatherServiceImpl service = new WeatherServiceImpl(client, fixedClock);

        WeatherResponse response = service.getWeather(
            new WeatherRequest("Sao Paulo", null, null, null, LocalDate.of(2026, 4, 24), null)
        );

        assertEquals("Sao Paulo, Sao Paulo, Brasil", response.city());
        assertEquals("12:00", response.time());
        assertEquals("Chuva", response.condition());
        assertEquals(21.4, response.temperature());
        assertEquals(70, response.rainProbability());
    }

    @Test
    void shouldRejectPastDates() {
        WeatherApiClient client = new StubWeatherApiClient();
        WeatherServiceImpl service = new WeatherServiceImpl(client, fixedClock);

        assertThrows(
            InvalidWeatherRequestException.class,
            () -> service.getWeather(new WeatherRequest("Sao Paulo", null, null, null, LocalDate.of(2026, 4, 23), null))
        );
    }

    @Test
    void shouldUseCoordinatesWhenProvided() {
        WeatherApiClient client = new StubWeatherApiClient();
        WeatherServiceImpl service = new WeatherServiceImpl(client, fixedClock);

        WeatherResponse response = service.getWeather(
            new WeatherRequest(null, "Minha localizacao", -23.55, -46.63, LocalDate.of(2026, 4, 24), null)
        );

        assertEquals("Minha localizacao", response.city());
        assertEquals("12:00", response.time());
    }

    @Test
    void shouldNormalizeTimeToFullHour() {
        WeatherApiClient client = new StubWeatherApiClient();
        WeatherServiceImpl service = new WeatherServiceImpl(client, fixedClock);

        WeatherResponse response = service.getWeather(
            new WeatherRequest("Sao Paulo", null, null, null, LocalDate.of(2026, 4, 24), LocalTime.of(12, 45))
        );

        assertEquals("12:00", response.time());
    }

    private static class StubWeatherApiClient implements WeatherApiClient {

        @Override
        public Optional<LocationDetails> findLocationByCity(String city) {
            return Optional.of(new LocationDetails("Sao Paulo", "Sao Paulo", "Brasil", "America/Sao_Paulo", -23.55, -46.63));
        }

        @Override
        public List<LocationDetails> findLocations(String query, int count) {
            return List.of(new LocationDetails("Sao Paulo", "Sao Paulo", "Brasil", "America/Sao_Paulo", -23.55, -46.63));
        }

        @Override
        public List<WeatherSnapshot> getHourlyForecast(LocationDetails location, LocalDate date) {
            return List.of(
                new WeatherSnapshot(LocalDateTime.of(date, java.time.LocalTime.NOON), 21.4, 70, 63)
            );
        }
    }
}
