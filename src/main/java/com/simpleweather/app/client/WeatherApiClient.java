package com.simpleweather.app.client;

import com.simpleweather.app.model.LocationDetails;
import com.simpleweather.app.model.WeatherSnapshot;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WeatherApiClient {

    Optional<LocationDetails> findLocationByCity(String city);

    List<LocationDetails> findLocations(String query, int count);

    List<WeatherSnapshot> getHourlyForecast(LocationDetails location, LocalDate date);
}
