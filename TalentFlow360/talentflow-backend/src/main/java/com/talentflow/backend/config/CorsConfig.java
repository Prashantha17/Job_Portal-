package com.talentflow.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
    private List<String> allowedOrigins;

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        config.setAllowCredentials(true);
        config.setAllowedOriginPatterns(allowedOrigins != null && !allowedOrigins.isEmpty() 
                ? allowedOrigins 
                : List.of("http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"));
        config.setAllowedHeaders(Arrays.asList("Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With", "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        config.setExposedHeaders(Arrays.asList("Origin", "Content-Type", "Accept", "Authorization", "Access-Control-Allow-Origin", "Access-Control-Allow-Credentials"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}

