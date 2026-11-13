package com.talentflow.backend.dto.interview;

import com.talentflow.backend.entity.RecommendationType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class SubmitFeedbackRequest {

    @NotNull(message = "Technical rating is required (1-5)")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer technicalRating;

    @NotNull(message = "Problem solving rating is required (1-5)")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer problemSolvingRating;

    @NotNull(message = "Communication rating is required (1-5)")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer communicationRating;

    @NotNull(message = "Cultural fit rating is required (1-5)")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer culturalFitRating;

    @NotNull(message = "Recommendation is required")
    private RecommendationType recommendation;

    private String interviewerFeedback;

    public SubmitFeedbackRequest() {}

    public Integer getTechnicalRating() { return technicalRating; }
    public void setTechnicalRating(Integer technicalRating) { this.technicalRating = technicalRating; }

    public Integer getProblemSolvingRating() { return problemSolvingRating; }
    public void setProblemSolvingRating(Integer problemSolvingRating) { this.problemSolvingRating = problemSolvingRating; }

    public Integer getCommunicationRating() { return communicationRating; }
    public void setCommunicationRating(Integer communicationRating) { this.communicationRating = communicationRating; }

    public Integer getCulturalFitRating() { return culturalFitRating; }
    public void setCulturalFitRating(Integer culturalFitRating) { this.culturalFitRating = culturalFitRating; }

    public RecommendationType getRecommendation() { return recommendation; }
    public void setRecommendation(RecommendationType recommendation) { this.recommendation = recommendation; }

    public String getInterviewerFeedback() { return interviewerFeedback; }
    public void setInterviewerFeedback(String interviewerFeedback) { this.interviewerFeedback = interviewerFeedback; }
}

