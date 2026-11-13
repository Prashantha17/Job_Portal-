package com.talentflow.backend.service;

import com.talentflow.backend.dto.notification.NotificationResponse;
import com.talentflow.backend.dto.notification.NotificationSummaryResponse;
import com.talentflow.backend.entity.Notification;
import com.talentflow.backend.entity.NotificationType;
import com.talentflow.backend.entity.User;
import com.talentflow.backend.entity.UserStatus;
import com.talentflow.backend.repository.NotificationRepository;
import com.talentflow.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User("alex.morgan@example.com", "hash", "Alex", "Morgan", "+919876543210", UserStatus.ACTIVE);
        testUser.setId(101L);
    }

    @Test
    @DisplayName("createNotification with User saves notification correctly")
    void testCreateNotification_WithUser() {
        Notification notification = new Notification(testUser, "Offer Letter Released", "Apex rolled out offer", NotificationType.OFFER_RELEASED, "#candidate-hub", "meta");
        notification.setId(1L);

        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        Notification result = notificationService.createNotification(
                testUser, "Offer Letter Released", "Apex rolled out offer", NotificationType.OFFER_RELEASED, "#candidate-hub", "meta"
        );

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Offer Letter Released", result.getTitle());
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    @DisplayName("createNotification with email looks up user and saves")
    void testCreateNotification_WithEmail() {
        when(userRepository.findByEmail("alex.morgan@example.com")).thenReturn(Optional.of(testUser));
        Notification notification = new Notification(testUser, "Interview Scheduled", "System Design", NotificationType.INTERVIEW_SCHEDULED, "#candidate-hub", null);
        notification.setId(2L);
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        Notification result = notificationService.createNotification(
                "alex.morgan@example.com", "Interview Scheduled", "System Design", NotificationType.INTERVIEW_SCHEDULED, "#candidate-hub", null
        );

        assertNotNull(result);
        assertEquals(2L, result.getId());
        verify(userRepository, times(1)).findByEmail("alex.morgan@example.com");
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    @DisplayName("getUserNotifications returns summary with unread count and mapped list")
    void testGetUserNotifications() {
        Notification n1 = new Notification(testUser, "Offer", "Offer text", NotificationType.OFFER_RELEASED, "#candidate-hub", null);
        n1.setId(1L);
        n1.setCreatedAt(Instant.now());

        when(notificationRepository.findTop40ByRecipientEmailOrderByCreatedAtDesc("alex.morgan@example.com"))
                .thenReturn(List.of(n1));
        when(notificationRepository.countByRecipientEmailAndReadFalse("alex.morgan@example.com"))
                .thenReturn(1L);

        NotificationSummaryResponse summary = notificationService.getUserNotifications("alex.morgan@example.com");

        assertNotNull(summary);
        assertEquals(1L, summary.unreadCount());
        assertEquals(1, summary.notifications().size());
        assertEquals("Offer", summary.notifications().get(0).title());
    }

    @Test
    @DisplayName("markAsRead updates notification state to read")
    void testMarkAsRead() {
        Notification n = new Notification(testUser, "Alert", "Msg", NotificationType.SYSTEM_ALERT, null, null);
        n.setId(5L);
        n.setRead(false);

        when(notificationRepository.findById(5L)).thenReturn(Optional.of(n));
        when(notificationRepository.save(any(Notification.class))).thenReturn(n);

        NotificationResponse response = notificationService.markAsRead(5L, "alex.morgan@example.com");

        assertNotNull(response);
        assertTrue(n.isRead());
        assertNotNull(n.getReadAt());
        verify(notificationRepository, times(1)).save(n);
    }

    @Test
    @DisplayName("markAllAsRead calls repository bulk update")
    void testMarkAllAsRead() {
        when(notificationRepository.markAllAsReadByRecipientEmail(eq("alex.morgan@example.com"), any(Instant.class)))
                .thenReturn(3);

        int count = notificationService.markAllAsRead("alex.morgan@example.com");

        assertEquals(3, count);
        verify(notificationRepository, times(1)).markAllAsReadByRecipientEmail(eq("alex.morgan@example.com"), any(Instant.class));
    }

    @Test
    @DisplayName("deleteNotification deletes notification when owned by user")
    void testDeleteNotification() {
        Notification n = new Notification(testUser, "Dismiss me", "Text", NotificationType.SYSTEM_ALERT, null, null);
        n.setId(9L);

        when(notificationRepository.findById(9L)).thenReturn(Optional.of(n));

        notificationService.deleteNotification(9L, "alex.morgan@example.com");

        verify(notificationRepository, times(1)).delete(n);
    }
}

