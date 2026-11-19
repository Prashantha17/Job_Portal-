package com.talentflow.backend.controller;

import com.talentflow.backend.dto.ApiResponse;
import com.talentflow.backend.dto.chat.ChatMessageDTO;
import com.talentflow.backend.dto.chat.SendMessageRequest;
import com.talentflow.backend.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
@Tag(name = "In-App Direct Chat", description = "Real-time messaging between recruiters and candidates for active job applications")
@SecurityRequirement(name = "BearerAuth")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    private String getAuthenticatedEmail(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new org.springframework.security.access.AccessDeniedException("User is not authenticated");
        }
        return authentication.getName();
    }

    @GetMapping("/applications/{applicationId}")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get direct chat conversation history for an application", description = "Fetches all chronological messages and marks unread messages as read.")
    public ResponseEntity<ApiResponse<List<ChatMessageDTO>>> getChatHistory(
            @PathVariable Long applicationId,
            Authentication authentication) {
        List<ChatMessageDTO> history = chatService.getChatHistory(applicationId, getAuthenticatedEmail(authentication));
        return ResponseEntity.ok(ApiResponse.ok("Chat history retrieved successfully", history));
    }

    @PostMapping("/send")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Send a direct message in an application conversation", description = "Saves message and dispatches it via real-time WebSocket and in-app notification.")
    public ResponseEntity<ApiResponse<ChatMessageDTO>> sendMessage(
            @Valid @RequestBody SendMessageRequest request,
            Authentication authentication) {
        ChatMessageDTO saved = chatService.sendMessage(getAuthenticatedEmail(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Message sent successfully", saved));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get total unread chat messages for current user")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Authentication authentication) {
        long count = chatService.getUnreadCount(getAuthenticatedEmail(authentication));
        return ResponseEntity.ok(ApiResponse.ok("Unread count retrieved", count));
    }

    @PatchMapping("/applications/{applicationId}/read")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Mark messages as read for an application")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long applicationId,
            Authentication authentication) {
        chatService.markAsRead(applicationId, getAuthenticatedEmail(authentication));
        return ResponseEntity.ok(ApiResponse.ok("Messages marked as read", null));
    }
}
