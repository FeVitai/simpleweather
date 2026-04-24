package com.simpleweather.app.dto.response;

import java.time.OffsetDateTime;

public record ApiErrorResponse(
    String message,
    int status,
    OffsetDateTime timestamp
) {
}
