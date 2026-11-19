package com.talentflow.backend.service;

import com.talentflow.backend.dto.chat.ChatMessageDTO;
import com.talentflow.backend.dto.chat.SendMessageRequest;
import com.talentflow.backend.entity.*;
import com.talentflow.backend.exception.ResourceNotFoundException;
import com.talentflow.backend.repository.ApplicationRepository;
import com.talentflow.backend.repository.ChatMessageRepository;
import com.talentflow.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private ChatService chatService;

    private User candidateUser;
    private User recruiterUser;
    private Job job;
    private Application application;

    @BeforeEach
    void setUp() {
        candidateUser = new User("candidate@talentflow360.com", "hash", "Rahul", "Verma", "+91 99999 11111", UserStatus.ACTIVE);
        candidateUser.setId(1L);

        recruiterUser = new User("recruiter@talentflow360.com", "hash", "Sarah", "Connor", "+1 555 2222", UserStatus.ACTIVE);
        recruiterUser.setId(2L);

        Company company = new Company();
        company.setName("Acme Tech");

        job = new Job();
        job.setId(10L);
        job.setTitle("Senior Full Stack Developer");
        job.setCompany(company);
        job.setPostedBy(recruiterUser);

        application = new Application();
        application.setId(100L);
        application.setJob(job);
        application.setCandidateEmail("candidate@talentflow360.com");
        application.setCandidateName("Rahul Verma");
    }

    @Test
    @DisplayName("Candidate successfully sends message to Recruiter")
    void testSendMessage_FromCandidate() {
        when(applicationRepository.findById(100L)).thenReturn(Optional.of(application));
        when(userRepository.findByEmail("candidate@talentflow360.com")).thenReturn(Optional.of(candidateUser));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenAnswer(inv -> {
            ChatMessage msg = inv.getArgument(0);
            msg.setId(501L);
            return msg;
        });

        SendMessageRequest req = new SendMessageRequest(100L, "Hello, excited about the position!");
        ChatMessageDTO result = chatService.sendMessage("candidate@talentflow360.com", req);

        assertNotNull(result);
        assertEquals(501L, result.getId());
        assertEquals("CANDIDATE", result.getSenderRole());
        assertEquals("candidate@talentflow360.com", result.getSenderEmail());
        assertEquals("recruiter@talentflow360.com", result.getRecipientEmail());
        assertEquals("Hello, excited about the position!", result.getContent());

        verify(chatMessageRepository, times(1)).save(any(ChatMessage.class));
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/applications/100/chat"), any(ChatMessageDTO.class));
    }

    @Test
    @DisplayName("Recruiter successfully sends message to Candidate")
    void testSendMessage_FromRecruiter() {
        when(applicationRepository.findById(100L)).thenReturn(Optional.of(application));
        when(userRepository.findByEmail("recruiter@talentflow360.com")).thenReturn(Optional.of(recruiterUser));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenAnswer(inv -> {
            ChatMessage msg = inv.getArgument(0);
            msg.setId(502L);
            return msg;
        });

        SendMessageRequest req = new SendMessageRequest(100L, "We loved your resume. Are you available for a chat?");
        ChatMessageDTO result = chatService.sendMessage("recruiter@talentflow360.com", req);

        assertNotNull(result);
        assertEquals("RECRUITER", result.getSenderRole());
        assertEquals("recruiter@talentflow360.com", result.getSenderEmail());
        assertEquals("candidate@talentflow360.com", result.getRecipientEmail());
    }

    @Test
    @DisplayName("getChatHistory fetches messages and marks unread as read")
    void testGetChatHistory() {
        when(applicationRepository.findById(100L)).thenReturn(Optional.of(application));

        ChatMessage m1 = new ChatMessage(application, "candidate@talentflow360.com", "Rahul", "CANDIDATE", "recruiter@talentflow360.com", "Hi");
        m1.setId(1L);

        when(chatMessageRepository.findByApplicationIdOrderByCreatedAtAsc(100L)).thenReturn(List.of(m1));

        List<ChatMessageDTO> history = chatService.getChatHistory(100L, "recruiter@talentflow360.com");

        assertNotNull(history);
        assertEquals(1, history.size());
        verify(chatMessageRepository, times(1)).markMessagesAsReadForApplication(100L, "recruiter@talentflow360.com");
    }

    @Test
    @DisplayName("Unauthorized user cannot view chat history")
    void testGetChatHistory_Unauthorized() {
        when(applicationRepository.findById(100L)).thenReturn(Optional.of(application));
        when(userRepository.findByEmail("intruder@example.com")).thenReturn(Optional.empty());

        assertThrows(AccessDeniedException.class, () ->
                chatService.getChatHistory(100L, "intruder@example.com")
        );
    }
}
