package com.talentflow.backend.service;

import com.talentflow.backend.dto.chat.ChatMessageDTO;
import com.talentflow.backend.dto.chat.SendMessageRequest;
import com.talentflow.backend.entity.Application;
import com.talentflow.backend.entity.ChatMessage;
import com.talentflow.backend.entity.NotificationType;
import com.talentflow.backend.entity.User;
import com.talentflow.backend.exception.ResourceNotFoundException;
import com.talentflow.backend.repository.ApplicationRepository;
import com.talentflow.backend.repository.ChatMessageRepository;
import com.talentflow.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final ChatMessageRepository chatMessageRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatService(ChatMessageRepository chatMessageRepository,
                       ApplicationRepository applicationRepository,
                       UserRepository userRepository,
                       @Lazy NotificationService notificationService,
                       @Lazy SimpMessagingTemplate messagingTemplate) {
        this.chatMessageRepository = chatMessageRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public List<ChatMessageDTO> getChatHistory(Long applicationId, String currentUserEmail) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        validateParticipant(app, currentUserEmail);

        // Mark unread messages addressed to the current user as read
        chatMessageRepository.markMessagesAsReadForApplication(applicationId, currentUserEmail);

        List<ChatMessage> list = chatMessageRepository.findByApplicationIdOrderByCreatedAtAsc(applicationId);
        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public ChatMessageDTO sendMessage(String senderEmail, SendMessageRequest request) {
        Application app = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", request.getApplicationId()));

        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", senderEmail));

        String candidateEmail = app.getCandidateEmail();
        String recruiterEmail = (app.getJob() != null && app.getJob().getPostedBy() != null)
                ? app.getJob().getPostedBy().getEmail()
                : null;

        String senderRole;
        String senderName;
        String recipientEmail;

        if (senderEmail.equalsIgnoreCase(candidateEmail)) {
            senderRole = "CANDIDATE";
            senderName = (app.getCandidateName() != null && !app.getCandidateName().isBlank())
                    ? app.getCandidateName()
                    : (sender.getFirstName() + " " + sender.getLastName()).trim();
            recipientEmail = recruiterEmail != null ? recruiterEmail : "recruiter@talentflow360.com";
        } else if (recruiterEmail != null && senderEmail.equalsIgnoreCase(recruiterEmail)) {
            senderRole = "RECRUITER";
            senderName = (sender.getFirstName() + " " + sender.getLastName()).trim();
            if (senderName.isBlank()) senderName = "Recruiter";
            recipientEmail = candidateEmail;
        } else {
            // Check if super admin
            senderRole = "RECRUITER";
            senderName = "Hiring Team (" + sender.getFirstName() + ")";
            recipientEmail = candidateEmail;
        }

        ChatMessage message = new ChatMessage(
                app,
                senderEmail,
                senderName,
                senderRole,
                recipientEmail,
                request.getContent().trim()
        );

        ChatMessage saved = chatMessageRepository.save(message);
        ChatMessageDTO dto = toDTO(saved);

        // 1. Broadcast to Application chat room via WebSocket
        if (messagingTemplate != null) {
            try {
                messagingTemplate.convertAndSend("/topic/applications/" + app.getId() + "/chat", dto);
                messagingTemplate.convertAndSendToUser(recipientEmail, "/queue/chat", dto);

                long unreadCount = chatMessageRepository.countByRecipientEmailAndIsReadFalse(recipientEmail);
                messagingTemplate.convertAndSendToUser(recipientEmail, "/queue/chat-unread-count", unreadCount);
            } catch (Exception ex) {
                log.warn("WebSocket dispatch failed for chat message #{}: {}", saved.getId(), ex.getMessage());
            }
        }

        // 2. Dispatch In-App Notification to recipient
        if (notificationService != null && recipientEmail != null) {
            try {
                String jobTitle = (app.getJob() != null) ? app.getJob().getTitle() : "Job Application";
                String title = "💬 New Message from " + senderName;
                String body = "For '" + jobTitle + "': " + (request.getContent().length() > 60 ? request.getContent().substring(0, 57) + "..." : request.getContent());
                notificationService.createNotification(
                        recipientEmail,
                        title,
                        body,
                        NotificationType.CHAT_MESSAGE,
                        "/applications/" + app.getId() + "/chat",
                        String.valueOf(app.getId())
                );
            } catch (Exception ex) {
                log.warn("Notification creation failed for chat message #{}: {}", saved.getId(), ex.getMessage());
            }
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String userEmail) {
        return chatMessageRepository.countByRecipientEmailAndIsReadFalse(userEmail);
    }

    @Transactional
    public void markAsRead(Long applicationId, String userEmail) {
        chatMessageRepository.markMessagesAsReadForApplication(applicationId, userEmail);
    }

    private void validateParticipant(Application app, String userEmail) {
        String candidateEmail = app.getCandidateEmail();
        String recruiterEmail = (app.getJob() != null && app.getJob().getPostedBy() != null)
                ? app.getJob().getPostedBy().getEmail()
                : null;

        boolean isCandidate = candidateEmail != null && candidateEmail.equalsIgnoreCase(userEmail);
        boolean isRecruiter = recruiterEmail != null && recruiterEmail.equalsIgnoreCase(userEmail);

        if (!isCandidate && !isRecruiter) {
            boolean isAdmin = userRepository.findByEmail(userEmail)
                    .map(u -> u.getRoles() != null && u.getRoles().stream().anyMatch(r -> r.getName().name().equals("ROLE_SUPER_ADMIN")))
                    .orElse(false);
            if (!isAdmin) {
                throw new AccessDeniedException("You are not authorized to view this application conversation");
            }
        }
    }

    private ChatMessageDTO toDTO(ChatMessage m) {
        String jobTitle = (m.getApplication() != null && m.getApplication().getJob() != null)
                ? m.getApplication().getJob().getTitle()
                : "Application";
        String companyName = (m.getApplication() != null && m.getApplication().getJob() != null && m.getApplication().getJob().getCompany() != null)
                ? m.getApplication().getJob().getCompany().getName()
                : "Hiring Organization";

        return new ChatMessageDTO(
                m.getId(),
                m.getApplication().getId(),
                jobTitle,
                companyName,
                m.getSenderEmail(),
                m.getSenderName(),
                m.getSenderRole(),
                m.getRecipientEmail(),
                m.getContent(),
                m.isRead(),
                m.getCreatedAt()
        );
    }
}
