package com.simpleweather.app.support;

public record WeatherDescriptor(String descriptionPtBr, String iconCode) {

    public static WeatherDescriptor fromCode(int weatherCode) {
        return switch (weatherCode) {
            case 0 -> new WeatherDescriptor("Ceu limpo", "CLEAR");
            case 1, 2 -> new WeatherDescriptor("Parcialmente nublado", "PARTLY_CLOUDY");
            case 3 -> new WeatherDescriptor("Nublado", "CLOUDY");
            case 45, 48 -> new WeatherDescriptor("Nevoeiro", "FOG");
            case 51, 53, 55, 56, 57 -> new WeatherDescriptor("Garoa", "DRIZZLE");
            case 61, 63, 65, 66, 67, 80, 81, 82 -> new WeatherDescriptor("Chuva", "RAIN");
            case 71, 73, 75, 77, 85, 86 -> new WeatherDescriptor("Neve", "SNOW");
            case 95, 96, 99 -> new WeatherDescriptor("Tempestade", "THUNDER");
            default -> new WeatherDescriptor("Condicao variavel", "VARIABLE");
        };
    }
}
