package com.simpleweather.app.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;

public record WeatherResponse(
    String city,
    @JsonFormat(pattern = "yyyy-MM-dd")
    LocalDate date,
    String time,
    double temperature,
    String condition,
    int rainProbability,
    String iconCode
) {
}
