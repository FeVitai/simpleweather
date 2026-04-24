package com.simpleweather.app.model;

public record LocationDetails(
    String city,
    String state,
    String country,
    String timezone,
    double latitude,
    double longitude
) {

    public String displayName() {
        StringBuilder builder = new StringBuilder(city);

        if (state != null && !state.isBlank()) {
            builder.append(", ").append(state);
        }

        if (country != null && !country.isBlank()) {
            builder.append(", ").append(country);
        }

        return builder.toString();
    }
}
