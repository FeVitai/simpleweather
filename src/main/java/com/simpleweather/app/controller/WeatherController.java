package com.simpleweather.app.controller;

import com.simpleweather.app.dto.request.WeatherRequest;
import com.simpleweather.app.dto.response.LocationOptionResponse;
import com.simpleweather.app.dto.response.WeatherResponse;
import com.simpleweather.app.service.WeatherService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WeatherController {

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping(value = "/locations", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<LocationOptionResponse>> searchLocations(@RequestParam("query") String query) {
        return ResponseEntity.ok(weatherService.searchLocations(query));
    }

    @PostMapping("/weather")
    public ResponseEntity<WeatherResponse> getWeather(@Valid @RequestBody WeatherRequest request) {
        return ResponseEntity.ok(weatherService.getWeather(request));
    }
}
