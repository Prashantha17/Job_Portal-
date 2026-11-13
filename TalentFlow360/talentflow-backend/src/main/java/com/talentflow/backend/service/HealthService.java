package com.talentflow.backend.service;

import com.talentflow.backend.dto.HealthResponseDTO;
import com.talentflow.backend.dto.SystemInfoDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class HealthService {

    private static final Logger log = LoggerFactory.getLogger(HealthService.class);

    @Value("${app.name:TalentFlow 360}")
    private String appName;

    @Value("${app.version:1.0.0-SNAPSHOT}")
    private String appVersion;

    @Autowired(required = false)
    private DataSource dataSource;

    @Autowired
    private Environment environment;

    public HealthResponseDTO checkHealth() {
        String dbStatus = "UNKNOWN";
        String dbProduct = "N/A";
        long dbLatencyMs = -1;

        if (dataSource != null) {
            long startTime = System.currentTimeMillis();
            try (Connection conn = dataSource.getConnection()) {
                DatabaseMetaData metaData = conn.getMetaData();
                dbProduct = metaData.getDatabaseProductName() + " " + metaData.getDatabaseProductVersion();
                dbStatus = "UP";
                dbLatencyMs = System.currentTimeMillis() - startTime;
            } catch (Exception ex) {
                log.error("Database health check failed: {}", ex.getMessage());
                dbStatus = "DOWN: " + ex.getMessage();
            }
        } else {
            dbStatus = "NOT_CONFIGURED";
        }

        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory() / (1024 * 1024);
        long freeMemory = runtime.freeMemory() / (1024 * 1024);
        long usedMemory = totalMemory - freeMemory;
        long maxMemory = runtime.maxMemory() / (1024 * 1024);

        SystemInfoDTO systemInfo = SystemInfoDTO.builder()
                .javaVersion(System.getProperty("java.version"))
                .javaVendor(System.getProperty("java.vendor"))
                .osName(System.getProperty("os.name"))
                .osArch(System.getProperty("os.arch"))
                .availableProcessors(runtime.availableProcessors())
                .totalMemoryMb(totalMemory)
                .freeMemoryMb(freeMemory)
                .usedMemoryMb(usedMemory)
                .maxMemoryMb(maxMemory)
                .build();

        long uptimeSeconds = ManagementFactory.getRuntimeMXBean().getUptime() / 1000;

        Map<String, Object> services = new LinkedHashMap<>();
        services.put("database", Map.of(
                "status", dbStatus,
                "product", dbProduct,
                "latencyMs", dbLatencyMs
        ));
        services.put("authentication", Map.of(
                "status", "ACTIVE",
                "mode", "JWT / Spring Security 6",
                "rolesSupported", java.util.List.of("ROLE_JOB_SEEKER", "ROLE_RECRUITER", "ROLE_HR_MANAGER", "ROLE_SUPER_ADMIN")
        ));
        services.put("jobEngine", Map.of("status", "READY", "version", "v1"));
        services.put("smartMatchingEngine", Map.of("status", "INITIALIZED_PHASE_9", "algorithm", "Cosine/SkillMatrix"));

        String overallStatus = dbStatus.startsWith("UP") ? "UP" : "DEGRADED";

        return HealthResponseDTO.builder()
                .status(overallStatus)
                .applicationName(appName)
                .version(appVersion)
                .environment(String.join(",", environment.getActiveProfiles().length > 0 ? environment.getActiveProfiles() : new String[]{"default"}))
                .timestamp(Instant.now())
                .uptimeSeconds(uptimeSeconds)
                .databaseStatus(dbStatus)
                .databaseProduct(dbProduct)
                .services(services)
                .systemInfo(systemInfo)
                .build();
    }
}

