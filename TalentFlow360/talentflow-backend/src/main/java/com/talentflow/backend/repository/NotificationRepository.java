package com.talentflow.backend.repository;

import com.talentflow.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String email);

    List<Notification> findTop40ByRecipientEmailOrderByCreatedAtDesc(String email);

    long countByRecipientEmailAndReadFalse(String email);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true, n.readAt = :now WHERE n.recipient.email = :email AND n.read = false")
    int markAllAsReadByRecipientEmail(@Param("email") String email, @Param("now") Instant now);
}

