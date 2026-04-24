package com.simpleweather.app.dto.response;

public record LocationOptionResponse(
    String name,
    String state,
    String country,
    String timezone,
    double latitude,
    double longitude,
    String displayName
) {
}
