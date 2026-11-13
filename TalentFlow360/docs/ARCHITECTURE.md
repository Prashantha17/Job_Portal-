# TalentFlow 360 - Architectural Blueprint

## 1. System Overview
**TalentFlow 360** is an enterprise-grade recruitment and talent management platform designed to connect Job Seekers, Recruiters, HR Managers, and Administrators with high-performance hiring tools and intelligent matching.

---

## 2. Layered Clean Architecture

```
com.talentflow.backend
|
|-- config          # CORS, OpenAPI/Swagger, DataSource & Security configs
|-- security        # JWT filters, authentication providers, user principal, BCrypt
|-- controller      # HTTP REST controllers (Candidate, Recruiter, Skill, Auth, Health)
|-- service         # Core business logic, transaction boundaries (ProfileService, SkillService, AuthService)
|-- repository      # Spring Data JPA repositories & query specs (10 active repositories)
|-- entity          # JPA relational entity mappings (User, Role, CandidateProfile, RecruiterProfile, ...)
|-- dto             # Request & Response Data Transfer Objects (profile, auth, health)
|-- mapper          # ProfileMapper component for entity-DTO transformations
|-- exception       # Custom exceptions & GlobalExceptionHandler
|-- validation      # Custom validators & Bean validation constraints
|-- notification    # In-app & transactional email triggers
|-- common          # Utility classes & constants
```

---

## 3. Database Schema Overview (MySQL 8.4)

### Implemented Tables (Phases 1 - 3):
- **roles**: System roles (`ROLE_JOB_SEEKER`, `ROLE_RECRUITER`, `ROLE_HR_MANAGER`, `ROLE_SUPER_ADMIN`)
- **users**: Master credential records (`id`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `status`, `created_at`, `updated_at`)
- **user_roles**: Join table linking users and roles (Many-to-Many)
- **refresh_tokens**: Secure refresh token storage (`id`, `user_id`, `token`, `expiry_date`, `revoked`, `created_at`)
- **skills**: Master catalog taxonomy of skills (`id`, `name`, `category`)
- **candidate_profiles**: Bio, headline, location, experience years, current salary, expected salary, github/linkedin/website URLs
- **recruiter_profiles**: Recruiter corporate profile, designation, department, corporate email/phone, verified status
- **educations**: Institution, degree, field of study, start date, end date, grade, description
- **experiences**: Company name, job title, location, start date, end date, is current, description
- **candidate_skills**: Normalized join table linking candidate profile with skill, proficiency level (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT) and years of experience
- **resumes**: Candidate uploaded CV artifacts, file metadata, is_primary indicator

### Upcoming Tables (Phases 4 - 6):
- **companies**: Verified employer entity, domain, industry, size, logo URL, verification badge
- **jobs**: Vacancies with title, description, workplace type, salary ranges, status
- **job_skills**: Required and nice-to-have skill requirements per vacancy
- **applications**: Candidate job submission record with current pipeline status
- **application_status_history**: Immutable audit trail of every status transition
- **interviews**: Scheduled rounds (date/time, mode, link, status, calendar sync)
- **interview_feedback**: Multi-category scorecard from interviewer panel
- **notifications**: In-app push notifications with read receipts
- **saved_jobs**: Candidate favorite job bookmarks
- **audit_logs**: Platform-wide administrative security audit records

---

## 4. 10-Stage Applicant Tracking System (ATS) Pipeline

1. **APPLIED**: Application received, automated resume parser extracts key signals.
2. **UNDER_REVIEW**: Recruiter or hiring manager evaluates candidate portfolio.
3. **SHORTLISTED**: Profile cleared for interview scheduling.
4. **TECHNICAL_INTERVIEW**: Deep technical screening and live coding assessments.
5. **HR_INTERVIEW**: Culture fit, compensation expectations, and background check.
6. **SELECTED**: Candidate approved by executive hiring committee.
7. **OFFER_RELEASED**: Formal offer letter issued with compensation package.
8. **HIRED**: Offer accepted, candidate converted to active employee.
9. **REJECTED**: Respectful automated rejection notification with recruiter notes.
10. **WITHDRAWN**: Candidate voluntarily withdrawn from pipeline.

---

## 5. Security & Authentication Model
- **Stateless Architecture**: Zero session cookies; requests authenticated via JSON Web Tokens (`Authorization: Bearer <jwt>`).
- **Cryptographic Hashing**: Passwords stored as BCrypt salts (strength 10).
- **Role-Based Access Control (RBAC)**: Endpoint method security using `@PreAuthorize("hasAnyRole(...)")`.
- **Token Rotation**: 1-to-1 in-place refresh token rotation preventing replay attacks.
