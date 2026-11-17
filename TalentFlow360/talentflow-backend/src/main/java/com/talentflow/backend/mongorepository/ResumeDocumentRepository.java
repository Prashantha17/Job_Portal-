package com.talentflow.backend.mongorepository;

import com.talentflow.backend.document.ResumeDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeDocumentRepository extends MongoRepository<ResumeDocument, String> {
    List<ResumeDocument> findByCandidateProfileId(Long candidateProfileId);
    List<ResumeDocument> findByCandidateEmail(String candidateEmail);
    Optional<ResumeDocument> findByCandidateProfileIdAndIsPrimaryTrue(Long candidateProfileId);
    Optional<ResumeDocument> findByCandidateEmailAndIsPrimaryTrue(String candidateEmail);
}
