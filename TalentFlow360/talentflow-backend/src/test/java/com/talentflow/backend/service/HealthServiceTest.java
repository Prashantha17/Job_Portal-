package com.talentflow.backend.service;

import com.talentflow.backend.dto.HealthResponseDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HealthServiceTest {

    @Mock
    private Environment environment;

    @InjectMocks
    private HealthService healthService;

    @Test
    @DisplayName("checkHealth() returns valid DTO when DataSource is not injected")
    void testCheckHealth_NoDataSource() {
        when(environment.getActiveProfiles()).thenReturn(new String[]{"test"});

        HealthResponseDTO response = healthService.checkHealth();

        assertNotNull(response);
        assertEquals("DEGRADED", response.getStatus());
        assertEquals("NOT_CONFIGURED", response.getDatabaseStatus());
        assertNotNull(response.getSystemInfo());
        assertTrue(response.getSystemInfo().getAvailableProcessors() > 0);
        assertNotNull(response.getTimestamp());
    }

    @Test
    @DisplayName("checkHealth() captures active environment profile correctly")
    void testCheckHealth_EnvironmentProfile() {
        when(environment.getActiveProfiles()).thenReturn(new String[]{"production"});

        HealthResponseDTO response = healthService.checkHealth();

        assertNotNull(response);
        assertEquals("production", response.getEnvironment());
    }
}
