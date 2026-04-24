package com.simpleweather.app.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record OpenMeteoForecastResponse(HourlyForecast hourly) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record HourlyForecast(
        List<String> time,
        @JsonProperty("temperature_2m")
        List<Double> temperature2m,
        @JsonProperty("weather_code")
        List<Integer> weatherCode,
        @JsonProperty("precipitation_probability")
        List<Integer> precipitationProbability
    ) {
    }
}
