package com.talentflow.backend.dto.notification;

import com.talentflow.backend.entity.NotificationType;
import java.time.Instant;

public record NotificationResponse(
        Long id,
        String title,
        String message,
        NotificationType type,
        boolean read,
        String actionUrl,
        String metadata,
        Instant createdAt,
        Instant readAt,
        String timeAgo
) {}

