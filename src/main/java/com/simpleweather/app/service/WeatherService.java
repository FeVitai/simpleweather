package com.simpleweather.app.service;

import com.simpleweather.app.dto.request.WeatherRequest;
import com.simpleweather.app.dto.response.LocationOptionResponse;
import com.simpleweather.app.dto.response.WeatherResponse;
import java.util.List;

public interface WeatherService {

    WeatherResponse getWeather(WeatherRequest request);

    List<LocationOptionResponse> searchLocations(String query);
}
