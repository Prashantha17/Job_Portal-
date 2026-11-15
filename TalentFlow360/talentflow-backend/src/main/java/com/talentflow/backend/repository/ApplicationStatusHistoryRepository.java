package com.talentflow.backend.repository;

import com.talentflow.backend.entity.ApplicationStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationStatusHistoryRepository extends JpaRepository<ApplicationStatusHistory, Long> {
    List<ApplicationStatusHistory> findByApplicationIdOrderByChangedAtAsc(Long applicationId);

    @Query("SELECT h FROM ApplicationStatusHistory h WHERE h.application.id IN :applicationIds ORDER BY h.changedAt ASC")
    List<ApplicationStatusHistory> findByApplicationIdIn(@Param("applicationIds") List<Long> applicationIds);
}


