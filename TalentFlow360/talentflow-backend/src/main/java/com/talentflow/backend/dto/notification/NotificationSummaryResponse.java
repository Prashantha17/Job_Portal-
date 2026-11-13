package com.talentflow.backend.dto.notification;

import java.util.List;

public record NotificationSummaryResponse(
        long unreadCount,
        List<NotificationResponse> notifications
) {}

