package com.simpleweather.app.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record WeatherRequest(
    String city,
    String label,
    Double latitude,
    Double longitude,
    @NotNull(message = "A data e obrigatoria.")
    @JsonFormat(pattern = "yyyy-MM-dd")
    LocalDate date,
    @JsonFormat(pattern = "HH:mm")
    LocalTime time
) {
}
