package com.simpleweather.app.exception;

public class InvalidWeatherRequestException extends RuntimeException {

    public InvalidWeatherRequestException(String message) {
        super(message);
    }
}
