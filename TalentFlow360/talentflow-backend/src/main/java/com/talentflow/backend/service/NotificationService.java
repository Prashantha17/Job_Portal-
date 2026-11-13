package com.talentflow.backend.service;

import com.talentflow.backend.dto.notification.NotificationResponse;
import com.talentflow.backend.dto.notification.NotificationSummaryResponse;
import com.talentflow.backend.entity.Notification;
import com.talentflow.backend.entity.NotificationType;
import com.talentflow.backend.entity.User;
import com.talentflow.backend.exception.ResourceNotFoundException;
import com.talentflow.backend.repository.NotificationRepository;
import com.talentflow.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Notification createNotification(User recipient, String title, String message,
                                           NotificationType type, String actionUrl, String metadata) {
        if (recipient == null) {
            log.warn("Cannot create notification: recipient user is null");
            return null;
        }

        Notification notification = new Notification(recipient, title, message, type, actionUrl, metadata);
        Notification saved = notificationRepository.save(notification);
        log.info("🔔 Created in-app notification #{} for user '{}' [{}]", saved.getId(), recipient.getEmail(), type);
        return saved;
    }

    @Transactional
    public Notification createNotification(String recipientEmail, String title, String message,
                                           NotificationType type, String actionUrl, String metadata) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            return null;
        }

        String cleanEmail = recipientEmail.toLowerCase().trim();
        User recipient = userRepository.findByEmail(cleanEmail).orElse(null);
        if (recipient == null) {
            log.warn("Cannot create notification: no user found with email '{}'", cleanEmail);
            return null;
        }

        return createNotification(recipient, title, message, type, actionUrl, metadata);
    }

    @Transactional(readOnly = true)
    public NotificationSummaryResponse getUserNotifications(String email) {
        String cleanEmail = email.toLowerCase().trim();
        List<Notification> list = notificationRepository.findTop40ByRecipientEmailOrderByCreatedAtDesc(cleanEmail);
        long unreadCount = notificationRepository.countByRecipientEmailAndReadFalse(cleanEmail);

        List<NotificationResponse> responses = list.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return new NotificationSummaryResponse(unreadCount, responses);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        return notificationRepository.countByRecipientEmailAndReadFalse(email.toLowerCase().trim());
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId, String email) {
        String cleanEmail = email.toLowerCase().trim();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getRecipient().getEmail().equalsIgnoreCase(cleanEmail)) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized access to notification #" + notificationId);
        }

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(Instant.now());
            notification = notificationRepository.save(notification);
        }

        return toResponse(notification);
    }

    @Transactional
    public int markAllAsRead(String email) {
        String cleanEmail = email.toLowerCase().trim();
        return notificationRepository.markAllAsReadByRecipientEmail(cleanEmail, Instant.now());
    }

    @Transactional
    public void deleteNotification(Long notificationId, String email) {
        String cleanEmail = email.toLowerCase().trim();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getRecipient().getEmail().equalsIgnoreCase(cleanEmail)) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to delete notification #" + notificationId);
        }

        notificationRepository.delete(notification);
    }

    public NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.isRead(),
                n.getActionUrl(),
                n.getMetadata(),
                n.getCreatedAt(),
                n.getReadAt(),
                formatTimeAgo(n.getCreatedAt())
        );
    }

    private String formatTimeAgo(Instant createdAt) {
        if (createdAt == null) return "Just now";
        Duration diff = Duration.between(createdAt, Instant.now());
        long seconds = Math.max(0, diff.getSeconds());

        if (seconds < 60) {
            return "Just now";
        }
        long minutes = seconds / 60;
        if (minutes < 60) {
            return minutes + "m ago";
        }
        long hours = minutes / 60;
        if (hours < 24) {
            return hours + "h ago";
        }
        long days = hours / 24;
        if (days == 1) {
            return "Yesterday";
        }
        if (days < 30) {
            return days + "d ago";
        }
        long months = days / 30;
        return months + "mo ago";
    }
}

