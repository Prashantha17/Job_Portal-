package com.talentflow.backend.controller;

import com.talentflow.backend.dto.ApiResponse;
import com.talentflow.backend.dto.HealthResponseDTO;
import com.talentflow.backend.service.HealthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health Check & Diagnostics", description = "Endpoints for monitoring platform health and system diagnostics")
public class HealthController {

    private final HealthService healthService;

    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    @GetMapping
    @Operation(summary = "Get full system health status", description = "Returns deep health status including database connectivity, memory utilization, and system uptime.")
    public ResponseEntity<ApiResponse<HealthResponseDTO>> getHealth() {
        HealthResponseDTO health = healthService.checkHealth();
        return ResponseEntity.ok(ApiResponse.ok("System status evaluated successfully", health));
    }

    @GetMapping("/ping")
    @Operation(summary = "Lightweight ping test", description = "Quick ping endpoint to verify HTTP availability for edge routers and frontend health polls.")
    public ResponseEntity<ApiResponse<Map<String, String>>> ping() {
        return ResponseEntity.ok(ApiResponse.ok("TalentFlow 360 backend is alive", Map.of(
                "status", "PONG",
                "timestamp", String.valueOf(System.currentTimeMillis())
        )));
    }

    @GetMapping("/db")
    @Operation(summary = "Check database connectivity", description = "Verifies active database connection pool status and driver version.")
    public ResponseEntity<ApiResponse<Map<String, String>>> checkDatabase() {
        HealthResponseDTO health = healthService.checkHealth();
        return ResponseEntity.ok(ApiResponse.ok(
                "Database health check",
                Map.of(
                        "databaseStatus", health.getDatabaseStatus(),
                        "databaseProduct", health.getDatabaseProduct()
                )
        ));
    }
}

