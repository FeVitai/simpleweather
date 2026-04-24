package com.simpleweather.app.model;

import java.time.LocalDateTime;

public record WeatherSnapshot(
    LocalDateTime dateTime,
    double temperature,
    int rainProbability,
    int weatherCode
) {
}
