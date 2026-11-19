package com.talentflow.backend.repository;

import com.talentflow.backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByApplicationIdOrderByCreatedAtAsc(Long applicationId);

    long countByRecipientEmailAndIsReadFalse(String recipientEmail);

    long countByApplicationIdAndRecipientEmailAndIsReadFalse(Long applicationId, String recipientEmail);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.application.id = :applicationId AND m.recipientEmail = :recipientEmail AND m.isRead = false")
    int markMessagesAsReadForApplication(@Param("applicationId") Long applicationId, @Param("recipientEmail") String recipientEmail);

    @Modifying
    @Query("DELETE FROM ChatMessage m WHERE m.application.id = :applicationId")
    void deleteByApplicationId(@Param("applicationId") Long applicationId);
}
