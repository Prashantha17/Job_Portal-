package com.talentflow.backend.controller;

import com.talentflow.backend.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class RootController {

    @Value("${app.name:TalentFlow 360}")
    private String appName;

    @Value("${app.version:1.0.0-SNAPSHOT}")
    private String appVersion;

    @GetMapping("/")
    @Hidden
    public ResponseEntity<ApiResponse<Map<String, Object>>> getApiIndex() {
        Map<String, Object> index = new LinkedHashMap<>();
        index.put("platform", appName);
        index.put("version", appVersion);
        index.put("description", "Enterprise Intelligent Recruitment & Talent Management Platform");
        index.put("documentation", "/swagger-ui.html");
        index.put("apiDocs", "/v3/api-docs");
        index.put("healthCheck", "/api/v1/health");
        index.put("status", "ACTIVE");
        return ResponseEntity.ok(ApiResponse.ok("Welcome to TalentFlow 360 API Services", index));
    }
}

