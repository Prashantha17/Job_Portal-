package com.talentflow.backend.mongorepository;

import com.talentflow.backend.document.AtsAnalysisDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsAnalysisDocumentRepository extends MongoRepository<AtsAnalysisDocument, String> {
    Optional<AtsAnalysisDocument> findByApplicationId(Long applicationId);
    List<AtsAnalysisDocument> findByJobId(Long jobId);
    List<AtsAnalysisDocument> findByCandidateEmail(String candidateEmail);
}
