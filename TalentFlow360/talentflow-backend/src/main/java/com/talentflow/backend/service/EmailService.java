package com.talentflow.backend.service;

import com.talentflow.backend.entity.Interview;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    // In-memory cache for development/fallback so users can always see the generated OTP
    private final Map<String, String> devOtpCache = new ConcurrentHashMap<>();

    public String getDevOtp(String email) {
        return devOtpCache.get(email.toLowerCase().trim());
    }

    public void storeDevOtp(String email, String otp) {
        devOtpCache.put(email.toLowerCase().trim(), otp);
    }

    public void sendLoginOtpEmail(String toEmail, String otpCode) {
        storeDevOtp(toEmail, otpCode);
        String subject = "Your TalentFlow 360 Login OTP: " + otpCode;
        String htmlContent = """
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 32px 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">TalentFlow 360</h1>
                    <p style="color: #e0f2fe; margin: 6px 0 0 0; font-size: 13px;">Enterprise Recruitment & Intelligent Talent Platform</p>
                </div>
                <div style="padding: 32px 28px;">
                    <h2 style="color: #0f172a; font-size: 18px; margin-top: 0; font-weight: 700;">One-Time Login Verification</h2>
                    <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                        You requested a secure login to your TalentFlow 360 account. Please use the 6-digit verification code below to complete your sign-in:
                    </p>
                    <div style="text-align: center; margin: 28px 0;">
                        <span style="display: inline-block; background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #15803d; padding: 14px 28px;">
                            {{OTP}}
                        </span>
                    </div>
                    <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-bottom: 24px;">
                        ⏱️ This verification code is valid for <strong>10 minutes</strong>. If you did not initiate this request, please ignore this email or contact security.
                    </p>
                    <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 11px;">
                        TalentFlow 360 Technologies Pvt Ltd &bull; Bengaluru &bull; Hyderabad &bull; Mumbai &bull; Pune
                    </div>
                </div>
            </div>
            """.replace("{{OTP}}", otpCode);

        sendEmail(toEmail, subject, htmlContent);
    }

    public void sendRegistrationOtpEmail(String toEmail, String otpCode) {
        storeDevOtp(toEmail, otpCode);
        String subject = "Verify Your Email: TalentFlow 360 Registration Code - " + otpCode;
        String htmlContent = """
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); padding: 32px 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">TalentFlow 360</h1>
                    <p style="color: #e0e7ff; margin: 6px 0 0 0; font-size: 13px;">New Account Registration & Email Verification</p>
                </div>
                <div style="padding: 32px 28px;">
                    <h2 style="color: #0f172a; font-size: 18px; margin-top: 0; font-weight: 700;">Welcome to TalentFlow 360!</h2>
                    <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                        Thank you for starting your registration. To verify that this email address belongs to you, please enter the 6-digit verification code below:
                    </p>
                    <div style="text-align: center; margin: 28px 0;">
                        <span style="display: inline-block; background: #eef2ff; border: 2px dashed #4f46e5; border-radius: 12px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4338ca; padding: 14px 28px;">
                            {{OTP}}
                        </span>
                    </div>
                    <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-bottom: 24px;">
                        ⏱️ This verification code is valid for <strong>10 minutes</strong>. If you did not request this registration, you can safely ignore this email.
                    </p>
                    <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 11px;">
                        TalentFlow 360 Technologies Pvt Ltd &bull; Bengaluru &bull; Hyderabad &bull; Mumbai &bull; Pune
                    </div>
                </div>
            </div>
            """.replace("{{OTP}}", otpCode);

        sendEmail(toEmail, subject, htmlContent);
    }

    public void sendForgotPasswordOtpEmail(String toEmail, String otpCode) {
        storeDevOtp(toEmail, otpCode);
        String subject = "Reset Your TalentFlow 360 Password - Code: " + otpCode;
        String htmlContent = """
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 32px 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">TalentFlow 360</h1>
                    <p style="color: #fef2f2; margin: 6px 0 0 0; font-size: 13px;">Security & Password Recovery</p>
                </div>
                <div style="padding: 32px 28px;">
                    <h2 style="color: #0f172a; font-size: 18px; margin-top: 0; font-weight: 700;">Password Reset Request</h2>
                    <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                        We received a request to reset the password associated with your account. Use the verification code below to authorize your password update:
                    </p>
                    <div style="text-align: center; margin: 28px 0;">
                        <span style="display: inline-block; background: #fef2f2; border: 2px dashed #dc2626; border-radius: 12px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #b91c1c; padding: 14px 28px;">
                            {{OTP}}
                        </span>
                    </div>
                    <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-bottom: 24px;">
                        ⏱️ This reset code is valid for <strong>10 minutes</strong>. If you did not request a password reset, no further action is required.
                    </p>
                    <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 11px;">
                        TalentFlow 360 Security Team &bull; All Rights Reserved
                    </div>
                </div>
            </div>
            """.replace("{{OTP}}", otpCode);

        sendEmail(toEmail, subject, htmlContent);
    }

    public void sendApplicationConfirmationEmail(String toEmail, String candidateName, String jobTitle, String companyName) {
        String subject = "Application Received: " + jobTitle + " at " + companyName + " - TalentFlow 360";
        String htmlContent = """
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">TalentFlow 360</h1>
                    <p style="color: #ecfdf5; margin: 6px 0 0 0; font-size: 13px;">Enterprise Recruitment & Intelligent Talent Management</p>
                </div>
                <div style="padding: 32px 28px;">
                    <div style="display: inline-block; background: #ecfdf5; color: #047857; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px;">
                        Application Submitted Successfully
                    </div>
                    <h2 style="color: #0f172a; font-size: 20px; margin: 0 0 12px 0; font-weight: 800;">Dear {{CANDIDATE_NAME}},</h2>
                    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
                        Thank you for applying for the <strong>{{JOB_TITLE}}</strong> position at <strong>{{COMPANY_NAME}}</strong> through TalentFlow 360!
                    </p>
                    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                        We have successfully received your application portfolio and primary resume. Our talent acquisition and engineering review team is currently evaluating your profile against the role criteria.
                    </p>
                    
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                        <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">Application Summary</h4>
                        <table style="width: 100%; font-size: 13px; color: #475569;">
                            <tr>
                                <td style="padding: 4px 0; font-weight: 600; width: 120px;">Position:</td>
                                <td style="padding: 4px 0; color: #0f172a;">{{JOB_TITLE}}</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0; font-weight: 600;">Organization:</td>
                                <td style="padding: 4px 0; color: #0f172a;">{{COMPANY_NAME}}</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0; font-weight: 600;">Initial Status:</td>
                                <td style="padding: 4px 0;"><span style="color: #0284c7; font-weight: 700;">APPLIED (Stage 1 of 10)</span></td>
                            </tr>
                        </table>
                    </div>

                    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
                        We appreciate your interest in joining <strong>{{COMPANY_NAME}}</strong>. We will get back to you shortly with next steps regarding technical evaluation and interviews. You can track your application status live on your TalentFlow Candidate Dashboard.
                    </p>

                    <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 11px;">
                        Talent Acquisition Team &bull; {{COMPANY_NAME}} &bull; Powered by TalentFlow 360 ATS
                    </div>
                </div>
            </div>
            """
            .replace("{{CANDIDATE_NAME}}", candidateName != null ? candidateName : "Applicant")
            .replace("{{JOB_TITLE}}", jobTitle)
            .replace("{{COMPANY_NAME}}", companyName);

        sendEmail(toEmail, subject, htmlContent);
    }

    public void sendApplicationStatusUpdateEmail(String toEmail, String candidateName, String jobTitle,
                                               String companyName, String newStatus, String remarks) {
        String subject = "Status Update: Your application for " + jobTitle + " at " + companyName + " is now " + newStatus;
        String htmlContent = """
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">TalentFlow 360</h1>
                    <p style="color: #dbeafe; margin: 6px 0 0 0; font-size: 13px;">Applicant Tracking & Career Pipeline</p>
                </div>
                <div style="padding: 32px 28px;">
                    <h2 style="color: #0f172a; font-size: 20px; margin: 0 0 12px 0; font-weight: 800;">Application Status Update</h2>
                    <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                        Dear <strong>{{CANDIDATE_NAME}}</strong>,
                    </p>
                    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                        The recruitment team at <strong>{{COMPANY_NAME}}</strong> has updated the status of your application for the <strong>{{JOB_TITLE}}</strong> opening.
                    </p>
                    
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                        <table style="width: 100%; font-size: 13px; color: #475569;">
                            <tr>
                                <td style="padding: 6px 0; font-weight: 600; width: 130px;">New Status:</td>
                                <td style="padding: 6px 0;"><span style="background: #eff6ff; color: #1d4ed8; font-weight: 800; padding: 3px 10px; border-radius: 9999px; border: 1px solid #bfdbfe;">{{NEW_STATUS}}</span></td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; font-weight: 600;">Position:</td>
                                <td style="padding: 6px 0; color: #0f172a;">{{JOB_TITLE}}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; font-weight: 600;">Organization:</td>
                                <td style="padding: 6px 0; color: #0f172a;">{{COMPANY_NAME}}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; font-weight: 600; vertical-align: top;">Recruiter Notes:</td>
                                <td style="padding: 6px 0; color: #334155; font-style: italic;">{{REMARKS}}</td>
                            </tr>
                        </table>
                    </div>

                    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
                        Log in to your <strong>TalentFlow 360</strong> candidate dashboard anytime to view your complete application history and interview details.
                    </p>

                    <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 11px;">
                        Talent Acquisition Team &bull; {{COMPANY_NAME}} &bull; Powered by TalentFlow 360 ATS
                    </div>
                </div>
            </div>
            """
            .replace("{{CANDIDATE_NAME}}", candidateName != null ? candidateName : "Applicant")
            .replace("{{JOB_TITLE}}", jobTitle)
            .replace("{{COMPANY_NAME}}", companyName)
            .replace("{{NEW_STATUS}}", newStatus)
            .replace("{{REMARKS}}", (remarks != null && !remarks.isBlank()) ? remarks : "Your application has moved forward to the next stage.");

        sendEmail(toEmail, subject, htmlContent);
    }

    private static final DateTimeFormatter IST_FORMATTER = DateTimeFormatter
            .ofPattern("EEEE, dd MMMM yyyy 'at' hh:mm a (z)")
            .withZone(ZoneId.of("Asia/Kolkata"));

    public void sendInterviewInvitationEmail(Interview interview) {
        if (interview == null || interview.getCandidate() == null) return;

        String candidateEmail = interview.getCandidate().getEmail();
        String candidateName = interview.getCandidate().getFullName();
        String jobTitle = interview.getJob() != null ? interview.getJob().getTitle() : "Position";
        String companyName = (interview.getJob() != null && interview.getJob().getCompany() != null)
                ? interview.getJob().getCompany().getName() : "TalentFlow 360 Partner";

        String formattedDate = IST_FORMATTER.format(interview.getScheduledStartTime());
        String meetingLink = interview.getMeetingLink() != null && !interview.getMeetingLink().isBlank()
                ? interview.getMeetingLink() : "https://meet.google.com/talentflow-room";

        String subject = "Interview Scheduled: " + interview.getRoundName() + " for " + jobTitle + " at " + companyName;

        String htmlContent = """
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 32px 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">TalentFlow 360</h1>
                    <p style="color: #ccfbf1; margin: 6px 0 0 0; font-size: 13px;">Official Interview Invitation</p>
                </div>
                <div style="padding: 32px 28px;">
                    <div style="display: inline-block; background: #f0fdfa; color: #0f766e; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; border: 1px solid #99f6e4;">
                        {{ROUND_NAME}}
                    </div>
                    <h2 style="color: #0f172a; font-size: 20px; margin: 0 0 12px 0; font-weight: 800;">Hello {{CANDIDATE_NAME}},</h2>
                    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                        Congratulations! The hiring team at <strong>{{COMPANY_NAME}}</strong> has reviewed your application for <strong>{{JOB_TITLE}}</strong> and is excited to invite you for an interview.
                    </p>

                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                        <h4 style="margin: 0 0 12px 0; font-size: 13px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">Interview Details</h4>
                        <table style="width: 100%; font-size: 13px; color: #475569;">
                            <tr>
                                <td style="padding: 6px 0; font-weight: 600; width: 140px;">Round:</td>
                                <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">{{ROUND_NAME}}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; font-weight: 600;">Date & Time (IST):</td>
                                <td style="padding: 6px 0; color: #0f766e; font-weight: 700;">{{SCHEDULED_TIME}}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; font-weight: 600;">Meeting Platform:</td>
                                <td style="padding: 6px 0; color: #0f172a;">{{MEETING_MODE}}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; font-weight: 600;">Interviewer:</td>
                                <td style="padding: 6px 0; color: #0f172a;">{{INTERVIEWER_NAME}} ({{INTERVIEWER_EMAIL}})</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; font-weight: 600; vertical-align: top;">Instructions:</td>
                                <td style="padding: 6px 0; color: #334155; font-style: italic;">{{INSTRUCTIONS}}</td>
                            </tr>
                        </table>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{{MEETING_LINK}}" target="_blank" style="display: inline-block; background: #0f766e; color: #ffffff; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 10px; text-decoration: none; box-shadow: 0 4px 12px rgba(15, 118, 110, 0.3);">
                            🎥 Join Video Meeting
                        </a>
                    </div>

                    <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin-bottom: 24px;">
                        Please log in to your <strong>TalentFlow 360</strong> candidate portal to confirm your attendance or request a reschedule if needed. Ensure you have a stable internet connection and webcam ready 5 minutes prior to the start time.
                    </p>

                    <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 11px;">
                        Talent Acquisition Team &bull; {{COMPANY_NAME}} &bull; Bengaluru &bull; Hyderabad &bull; Mumbai &bull; Pune
                    </div>
                </div>
            </div>
            """
            .replace("{{CANDIDATE_NAME}}", candidateName != null ? candidateName : "Candidate")
            .replace("{{JOB_TITLE}}", jobTitle)
            .replace("{{COMPANY_NAME}}", companyName)
            .replace("{{ROUND_NAME}}", interview.getRoundName())
            .replace("{{SCHEDULED_TIME}}", formattedDate)
            .replace("{{MEETING_MODE}}", interview.getMeetingMode() != null ? interview.getMeetingMode().name().replace('_', ' ') : "Online Video")
            .replace("{{INTERVIEWER_NAME}}", interview.getInterviewerName() != null ? interview.getInterviewerName() : "Recruitment Team")
            .replace("{{INTERVIEWER_EMAIL}}", interview.getInterviewerEmail() != null ? interview.getInterviewerEmail() : "careers@" + (companyName.toLowerCase().replaceAll("[^a-z]", "")) + ".com")
            .replace("{{INSTRUCTIONS}}", interview.getInstructions() != null && !interview.getInstructions().isBlank() ? interview.getInstructions() : "Please bring your resume and be prepared for coding and architectural discussions.")
            .replace("{{MEETING_LINK}}", meetingLink);

        sendEmail(candidateEmail, subject, htmlContent);

        // Also notify the interviewer if provided and different
        if (interview.getInterviewerEmail() != null && !interview.getInterviewerEmail().equalsIgnoreCase(candidateEmail)) {
            sendEmail(interview.getInterviewerEmail(), "[Interviewer Copy] " + subject, htmlContent);
        }
    }

    public void sendInterviewStatusUpdateEmail(Interview interview, String updatedByRole) {
        if (interview == null || interview.getCandidate() == null) return;

        String candidateEmail = interview.getCandidate().getEmail();
        String candidateName = interview.getCandidate().getFullName();
        String jobTitle = interview.getJob() != null ? interview.getJob().getTitle() : "Role";
        String companyName = (interview.getJob() != null && interview.getJob().getCompany() != null)
                ? interview.getJob().getCompany().getName() : "TalentFlow 360 Partner";

        String subject = "Interview Update: " + interview.getRoundName() + " is now " + interview.getStatus();

        String htmlContent = """
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="background: linear-gradient(135deg, #4338ca 0%, #3730a3 100%); padding: 32px 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">TalentFlow 360</h1>
                    <p style="color: #e0e7ff; margin: 6px 0 0 0; font-size: 13px;">Interview Schedule Update</p>
                </div>
                <div style="padding: 32px 28px;">
                    <h2 style="color: #0f172a; font-size: 18px; margin-top: 0; font-weight: 700;">Schedule Status Changed</h2>
                    <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                        The interview for <strong>{{ROUND_NAME}}</strong> ({{JOB_TITLE}} at {{COMPANY_NAME}}) has been updated to:
                    </p>
                    <div style="text-align: center; margin: 20px 0;">
                        <span style="display: inline-block; background: #eef2ff; border: 1px solid #c7d2fe; color: #3730a3; font-weight: 800; font-size: 18px; padding: 10px 24px; border-radius: 9999px;">
                            {{NEW_STATUS}}
                        </span>
                    </div>
                    <p style="color: #475569; font-size: 13px; line-height: 1.6;">
                        <strong>Candidate Notes / Reason:</strong> {{REASON}}
                    </p>
                    <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 11px;">
                        TalentFlow 360 &bull; Automated Interview Workflow Notification
                    </div>
                </div>
            </div>
            """
            .replace("{{ROUND_NAME}}", interview.getRoundName())
            .replace("{{JOB_TITLE}}", jobTitle)
            .replace("{{COMPANY_NAME}}", companyName)
            .replace("{{NEW_STATUS}}", interview.getStatus().name())
            .replace("{{REASON}}", interview.getRescheduleReason() != null ? interview.getRescheduleReason() : "No special notes provided.");

        sendEmail(candidateEmail, subject, htmlContent);

        if (interview.getRecruiter() != null && interview.getRecruiter().getEmail() != null) {
            sendEmail(interview.getRecruiter().getEmail(), "[Recruiter Notice] " + subject, htmlContent);
        }
    }

    public void sendInterviewFeedbackEmail(Interview interview) {
        if (interview == null || interview.getCandidate() == null) return;

        String candidateEmail = interview.getCandidate().getEmail();
        String candidateName = interview.getCandidate().getFullName();
        String jobTitle = interview.getJob() != null ? interview.getJob().getTitle() : "Role";
        String companyName = (interview.getJob() != null && interview.getJob().getCompany() != null)
                ? interview.getJob().getCompany().getName() : "Partner Company";

        String subject = "Interview Completed: " + interview.getRoundName() + " for " + jobTitle;

        String htmlContent = """
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="background: linear-gradient(135deg, #15803d 0%, #166534 100%); padding: 32px 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">TalentFlow 360</h1>
                    <p style="color: #dcfce7; margin: 6px 0 0 0; font-size: 13px;">Evaluation Scorecard Submitted</p>
                </div>
                <div style="padding: 32px 28px;">
                    <h2 style="color: #0f172a; font-size: 18px; margin-top: 0; font-weight: 700;">Dear {{CANDIDATE_NAME}},</h2>
                    <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                        Thank you for taking the time to complete your <strong>{{ROUND_NAME}}</strong> interview with {{COMPANY_NAME}}. The interviewer evaluation scorecard has been submitted to the talent acquisition review board.
                    </p>
                    <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                        Our hiring committee will review your scores alongside other candidates and reach out shortly with our hiring decision or next stage scheduling.
                    </p>
                    <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 11px;">
                        Talent Acquisition Team &bull; {{COMPANY_NAME}} &bull; Powered by TalentFlow 360
                    </div>
                </div>
            </div>
            """
            .replace("{{CANDIDATE_NAME}}", candidateName != null ? candidateName : "Applicant")
            .replace("{{ROUND_NAME}}", interview.getRoundName())
            .replace("{{JOB_TITLE}}", jobTitle)
            .replace("{{COMPANY_NAME}}", companyName);

        sendEmail(candidateEmail, subject, htmlContent);
    }

    private void sendEmail(String toEmail, String subject, String htmlContent) {
        log.info("==========================================================================");
        log.info("📧 [OUTGOING EMAIL DISPATCH]");
        log.info("To:      {}", toEmail);
        log.info("Subject: {}", subject);
        log.info("==========================================================================");

        if (mailSender != null && senderEmail != null && !senderEmail.isBlank()) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(senderEmail, "TalentFlow 360");
                helper.setTo(toEmail);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);

                mailSender.send(message);
                log.info("✅ Email successfully sent via SMTP to: {}", toEmail);
                return;
            } catch (Exception e) {
                log.warn("⚠️ SMTP dispatch failed (e.g. Mail server credentials not configured). Falling back to console dispatch: {}", e.getMessage());
            }
        } else {
            log.info("ℹ️ SMTP server not configured in application.yml. Email successfully generated & logged above for local testing.");
        }
    }
}
