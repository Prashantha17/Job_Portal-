package com.talentflow.backend.dto;

import java.time.Instant;
import java.util.Map;

public class HealthResponseDTO {
    private String status;
    private String applicationName;
    private String version;
    private String environment;
    private Instant timestamp;
    private long uptimeSeconds;
    private String databaseStatus;
    private String databaseProduct;
    private Map<String, Object> services;
    private SystemInfoDTO systemInfo;

    public HealthResponseDTO() {}

    public HealthResponseDTO(String status, String applicationName, String version, String environment,
                             Instant timestamp, long uptimeSeconds, String databaseStatus,
                             String databaseProduct, Map<String, Object> services, SystemInfoDTO systemInfo) {
        this.status = status;
        this.applicationName = applicationName;
        this.version = version;
        this.environment = environment;
        this.timestamp = timestamp;
        this.uptimeSeconds = uptimeSeconds;
        this.databaseStatus = databaseStatus;
        this.databaseProduct = databaseProduct;
        this.services = services;
        this.systemInfo = systemInfo;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getApplicationName() { return applicationName; }
    public void setApplicationName(String applicationName) { this.applicationName = applicationName; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public String getEnvironment() { return environment; }
    public void setEnvironment(String environment) { this.environment = environment; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public long getUptimeSeconds() { return uptimeSeconds; }
    public void setUptimeSeconds(long uptimeSeconds) { this.uptimeSeconds = uptimeSeconds; }

    public String getDatabaseStatus() { return databaseStatus; }
    public void setDatabaseStatus(String databaseStatus) { this.databaseStatus = databaseStatus; }

    public String getDatabaseProduct() { return databaseProduct; }
    public void setDatabaseProduct(String databaseProduct) { this.databaseProduct = databaseProduct; }

    public Map<String, Object> getServices() { return services; }
    public void setServices(Map<String, Object> services) { this.services = services; }

    public SystemInfoDTO getSystemInfo() { return systemInfo; }
    public void setSystemInfo(SystemInfoDTO systemInfo) { this.systemInfo = systemInfo; }

    public static HealthResponseDTOBuilder builder() {
        return new HealthResponseDTOBuilder();
    }

    public static class HealthResponseDTOBuilder {
        private String status;
        private String applicationName;
        private String version;
        private String environment;
        private Instant timestamp;
        private long uptimeSeconds;
        private String databaseStatus;
        private String databaseProduct;
        private Map<String, Object> services;
        private SystemInfoDTO systemInfo;

        public HealthResponseDTOBuilder status(String status) { this.status = status; return this; }
        public HealthResponseDTOBuilder applicationName(String applicationName) { this.applicationName = applicationName; return this; }
        public HealthResponseDTOBuilder version(String version) { this.version = version; return this; }
        public HealthResponseDTOBuilder environment(String environment) { this.environment = environment; return this; }
        public HealthResponseDTOBuilder timestamp(Instant timestamp) { this.timestamp = timestamp; return this; }
        public HealthResponseDTOBuilder uptimeSeconds(long uptimeSeconds) { this.uptimeSeconds = uptimeSeconds; return this; }
        public HealthResponseDTOBuilder databaseStatus(String databaseStatus) { this.databaseStatus = databaseStatus; return this; }
        public HealthResponseDTOBuilder databaseProduct(String databaseProduct) { this.databaseProduct = databaseProduct; return this; }
        public HealthResponseDTOBuilder services(Map<String, Object> services) { this.services = services; return this; }
        public HealthResponseDTOBuilder systemInfo(SystemInfoDTO systemInfo) { this.systemInfo = systemInfo; return this; }

        public HealthResponseDTO build() {
            return new HealthResponseDTO(status, applicationName, version, environment, timestamp, uptimeSeconds, databaseStatus, databaseProduct, services, systemInfo);
        }
    }
}
