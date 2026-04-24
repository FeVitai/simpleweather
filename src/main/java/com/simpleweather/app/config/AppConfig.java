package com.simpleweather.app.config;

import java.time.Clock;
import java.time.Duration;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class AppConfig {

    @Bean
    Clock systemClock() {
        return Clock.systemDefaultZone();
    }

    @Bean
    WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }

    @Bean
    WebClient geocodingWebClient(
        WebClient.Builder builder,
        @Value("${weather.api.geocoding-base-url}") String geocodingBaseUrl
    ) {
        return builder
            .baseUrl(geocodingBaseUrl)
            .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
            .build();
    }

    @Bean
    WebClient forecastWebClient(
        WebClient.Builder builder,
        @Value("${weather.api.forecast-base-url}") String forecastBaseUrl
    ) {
        return builder
            .baseUrl(forecastBaseUrl)
            .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
            .build();
    }

    @Bean
    Duration weatherApiTimeout(@Value("${weather.api.timeout-seconds}") long timeoutSeconds) {
        return Duration.ofSeconds(timeoutSeconds);
    }

    @Bean
    WebMvcConfigurer corsConfigurer(@Value("${app.cors.allowed-origins}") List<String> allowedOrigins) {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins(allowedOrigins.toArray(String[]::new))
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*");
            }
        };
    }
}
