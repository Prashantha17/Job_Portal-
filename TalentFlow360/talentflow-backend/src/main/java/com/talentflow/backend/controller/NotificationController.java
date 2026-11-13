package com.talentflow.backend.controller;

import com.talentflow.backend.dto.ApiResponse;
import com.talentflow.backend.dto.notification.NotificationResponse;
import com.talentflow.backend.dto.notification.NotificationSummaryResponse;
import com.talentflow.backend.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notification System", description = "In-app notifications, unread count badge, mark-as-read, and alert management")
@SecurityRequirement(name = "BearerAuth")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    private String getAuthenticatedEmail(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new org.springframework.security.access.AccessDeniedException("User is not authenticated");
        }
        return authentication.getName();
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user's notifications and unread count")
    public ResponseEntity<ApiResponse<NotificationSummaryResponse>> getMyNotifications(Authentication authentication) {
        String email = getAuthenticatedEmail(authentication);
        NotificationSummaryResponse summary = notificationService.getUserNotifications(email);
        return ResponseEntity.ok(ApiResponse.ok("Notifications retrieved successfully", summary));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get count of unread notifications for navbar badge")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Authentication authentication) {
        String email = getAuthenticatedEmail(authentication);
        long count = notificationService.getUnreadCount(email);
        return ResponseEntity.ok(ApiResponse.ok("Unread count retrieved", count));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark single notification as read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        String email = getAuthenticatedEmail(authentication);
        NotificationResponse updated = notificationService.markAsRead(id, email);
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read", updated));
    }

    @PatchMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark all notifications as read for current user")
    public ResponseEntity<ApiResponse<Integer>> markAllAsRead(Authentication authentication) {
        String email = getAuthenticatedEmail(authentication);
        int count = notificationService.markAllAsRead(email);
        return ResponseEntity.ok(ApiResponse.ok(count + " notifications marked as read", count));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete / dismiss a notification")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @PathVariable Long id,
            Authentication authentication) {
        String email = getAuthenticatedEmail(authentication);
        notificationService.deleteNotification(id, email);
        return ResponseEntity.ok(ApiResponse.ok("Notification removed", null));
    }
}

