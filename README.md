# TalentFlow 360
### Intelligent Recruitment & Talent Management Platform

![Status](https://img.shields.io/badge/status-Phase%206%20Completed-emerald)
![Security](https://img.shields.io/badge/Security-Spring%20Security%206%20%2B%20JWT-indigo)
![Java](https://img.shields.io/badge/Java-25%20%2F%2027-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.2-brightgreen)
![React](https://img.shields.io/badge/React-18.3%20TypeScript-61dafb)
![MySQL](https://img.shields.io/badge/MySQL-8.4-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

---

## 🚀 Overview

**TalentFlow 360** is a centralized, enterprise-level recruitment platform bridging Job Seekers, Recruiters, HR Managers, and Platform Administrators. Designed for high-volume modern hiring workflows, it streamlines the full lifecycle: candidate discovery, skill-based candidate matching, a 10-stage Applicant Tracking System (ATS), interview coordination, and hiring analytics.

---

## 📁 Repository Structure

```
TalentFlow360/
├── talentflow-backend/             # Spring Boot 3.4.2 REST API Server
│   ├── src/main/java/com/talentflow/backend/
│   │   ├── config/                 # CORS, OpenAPI/Swagger configurations
│   │   ├── controller/             # CandidateController, RecruiterController, SkillController, AuthController, HealthController
│   │   ├── dto/                    # profile, auth, health DTO packages
│   │   ├── entity/                 # User, Role, CandidateProfile, RecruiterProfile, Education, Experience, Skill, CandidateSkill, Resume, RefreshToken
│   │   ├── mapper/                 # ProfileMapper entity-DTO converter
│   │   ├── repository/             # 10 Spring Data JPA repositories
│   │   ├── service/                # ProfileService, SkillService, AuthService, HealthService, DataInitializerService
│   │   └── TalentFlowApplication.java
│   ├── src/main/resources/
│   │   └── application.yml         # MySQL datasource, HikariCP, Actuator configs
│   ├── src/test/java/              # JUnit 5 & Mockito test suites (20/20 passing)
│   └── pom.xml
│
├── talentflow-frontend/            # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/               # AuthModal with 1-click test credential chips
│   │   │   ├── common/             # Button, Badge, Card, Input, BackendStatusBanner
│   │   │   ├── landing/            # HeroSection, FeaturedJobsSection, CompanySection, AtsPipelinePreview, PlatformBenefitsSection, RecruiterCta
│   │   │   └── layout/             # Navbar, Footer
│   │   ├── context/                # AuthContext
│   │   ├── pages/                  # LandingPage, CandidateDashboard, RecruiterDashboard
│   │   ├── services/               # profileService, authService, healthService, api client
│   │   ├── types/                  # auth, health, job types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── docs/                           # Architecture blueprints & API documentation
│   ├── ARCHITECTURE.md
│   ├── API_SPECIFICATION.md
│   ├── PHASE1_COMPLETION_REPORT.md
│   └── PHASE2_COMPLETION_REPORT.md
│
├── setup.bat                       # One-click environment verification & dependency setup
├── start.bat                       # One-click backend & frontend launcher
├── stop.bat                        # Safe graceful shutdown script
└── README.md
```

---

## 🛠️ Technology Stack

### Backend
- **Language**: Java 25 / Java 27 compatibility (compiled with `--release 21`)
- **Framework**: Spring Boot 3.4.2
- **Data Access**: Spring Data JPA & Hibernate 6.6
- **Database Engine**: MySQL 8.4 (InnoDB) with HikariCP connection pooling
- **Validation**: Jakarta Bean Validation
- **Diagnostics**: Spring Boot Actuator & custom `/api/v1/health`
- **Documentation**: Springdoc OpenAPI 3.0 / Swagger UI
- **Testing**: JUnit 5, Mockito, Spring Test (20 automated tests, 100% passing)

### Frontend
- **Framework**: React 18.3 with TypeScript 5.7
- **Build Tool**: Vite 6.0
- **Styling**: Tailwind CSS 3.4 with custom SaaS slate & brand blue palette
- **Icons**: Lucide React
- **HTTP Client**: Axios with automatic request interception & Vite reverse proxy

---

## 🚦 One-Click Management Scripts

- **Setup Environment**: `setup.bat` (checks Java, Maven, Node.js, MySQL, compiles backend & installs frontend dependencies)
- **Start All Services**: `start.bat` (boots Spring Boot on port 8080 and Vite on port 5173)
- **Stop All Services**: `stop.bat` (cleanly kills background servers on ports 8080 and 5173)

---

## 📊 Phase Deliverables Completed

### Phase 1: Project Foundation (Verified)
- [x] Initialized workspace structure
- [x] Spring Boot backend created with clean layered architecture
- [x] Connected to local MySQL 8.4 database (`talentflow_db`) via HikariCP
- [x] Comprehensive health check endpoint `/api/v1/health` with JVM diagnostics, memory allocation, and database latency
- [x] React 18 + TypeScript + Vite frontend created with Tailwind CSS styling
- [x] Interactive live connection banner (`BackendStatusBanner`) communicating in real-time with Spring Boot `/api/v1/health`
- [x] Production-grade landing page with Hero, Search, Job Cards, Company Cards, ATS Preview, Benefits, and Footer

### Phase 2: Authentication & Security (Verified)
- [x] Normalized relational entities: `User`, `Role`, `RefreshToken` with Many-to-Many mapping via `user_roles`
- [x] 4 Distinct System Roles: `ROLE_JOB_SEEKER`, `ROLE_RECRUITER`, `ROLE_HR_MANAGER`, `ROLE_SUPER_ADMIN`
- [x] Spring Security 6 filter chain with BCrypt password hashing and stateless session management
- [x] Stateless JWT implementation (`JwtTokenProvider`) with HS256 digital signature, claim extraction, and expiration validation
- [x] `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `GET /api/v1/auth/me`
- [x] Automated test suite passing cleanly (`AuthControllerTest`, `JwtTokenProviderTest`, etc.)
- [x] React.js Authentication Layer (`AuthContext`, `authService`, `AuthModal`, header profile dropdown, quick-login chips)

### Phase 3: Candidate & Recruiter Profile Management (Verified)
- [x] Candidate portfolio entities: `CandidateProfile`, `Education`, `Experience`, `Skill`, `CandidateSkill`, `Resume`
- [x] Recruiter corporate entities: `RecruiterProfile` with verification status and company affiliation
- [x] Master taxonomy of skills with `SkillCategory` enum and pre-seeded industry catalog
- [x] Clean architecture service layer: `ProfileService`, `SkillService`, `ProfileMapper`
- [x] Candidate profile management REST APIs:
  - `GET /api/v1/candidates/me` - Profile portfolio retrieval
  - `PUT /api/v1/candidates/me` - Profile update
  - `POST /api/v1/candidates/me/education` - Add education entry
  - `DELETE /api/v1/candidates/me/education/{id}` - Remove education
  - `POST /api/v1/candidates/me/experience` - Add work experience
  - `DELETE /api/v1/candidates/me/experience/{id}` - Remove work experience
  - `POST /api/v1/candidates/me/skills` - Add / update candidate proficiency
  - `DELETE /api/v1/candidates/me/skills/{id}` - Remove candidate skill
  - `POST /api/v1/candidates/me/resume` - Upload / register candidate CV
  - `GET /api/v1/candidates/me/resume` - List uploaded resumes
  - `DELETE /api/v1/candidates/me/resume/{id}` - Delete resume
  - `PATCH /api/v1/candidates/me/resume/{id}/primary` - Set primary resume
- [x] Recruiter profile management REST APIs:
  - `GET /api/v1/recruiters/me` - Recruiter profile retrieval
  - `PUT /api/v1/recruiters/me` - Recruiter profile update
- [x] Skills catalog REST APIs:
  - `GET /api/v1/skills` - Search catalog skills by query or category
  - `POST /api/v1/skills` - Register new skill
- [x] Automatic portfolio seeder (`DataInitializerService`):
  - Pre-seeds 19 industry skills across Backend, Frontend, DevOps, and Database
  - Pre-seeds complete demo candidate portfolio for Alex Morgan
  - Pre-seeds verified recruiter profile for Sarah Jenkins @ Apex Global Technologies
- [x] Frontend Candidate Dashboard (`CandidateDashboard.tsx`):
  - Profile strength completion meter (0-100%)
  - Bio & career overview tab
  - Work experience manager with "+ Add Experience" modal
  - Education history manager with "+ Add Education" modal
  - Skills & proficiencies manager with proficiency badges & "+ Add Skill" modal
  - Resume document repository with primary resume toggle & "+ Upload Resume" modal
- [x] Frontend Recruiter Dashboard (`RecruiterDashboard.tsx`):
  - Company affiliation overview & verification badge
  - Edit recruiter profile modal
  - Hiring pipeline analytics cards (Active Openings, Total Applicants, Interviews Set, Hire Rate)
- [x] Role-aware Navbar routing between Landing Page, Candidate Career Hub, and Recruiter Operations
- [x] 27/27 Backend Automated Tests Passing cleanly

### Phase 4: Company and Job Management (Verified)
- [x] Normalized relational entities: `Company`, `Job`, `JobSkill`, with enums:
  - `WorkplaceType`: `REMOTE`, `HYBRID`, `ON_SITE`
  - `EmploymentType`: `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERNSHIP`
  - `JobStatus`: `DRAFT`, `PUBLISHED`, `CLOSED`, `ARCHIVED`
  - `SkillRequirementLevel`: `REQUIRED`, `PREFERRED`
- [x] Dynamic JPA Specifications (`JobSpecifications.filterJobs`) for multifaceted search:
  - Keyword search (searches job title, description, company name)
  - Location matching
  - Workplace policy & Employment type filters
  - Minimum & Maximum salary thresholds
  - Required skill IDs mapping
- [x] RESTful API endpoints:
  - `GET /api/v1/jobs` - Search and filter job vacancies with pagination & sorting
  - `GET /api/v1/jobs/{id}` - Comprehensive job vacancy details with view count tracking
  - `GET /api/v1/jobs/my` - Recruiter's published job vacancies
  - `POST /api/v1/jobs` - Recruiter publishes new vacancy with skills requirements
  - `PUT /api/v1/jobs/{id}` - Recruiter updates vacancy information
  - `PATCH /api/v1/jobs/{id}/status` - Recruiter toggles status (`PUBLISHED`, `CLOSED`)
  - `DELETE /api/v1/jobs/{id}` - Recruiter deletes vacancy
  - `GET /api/v1/companies` - Verified employer directory with pagination
  - `GET /api/v1/companies/{id}` - Public company profile
  - `GET /api/v1/companies/me` - Recruiter's linked company
  - `PUT /api/v1/companies/{id}` - Company profile update
- [x] Pre-seeded 4 top enterprise companies (Apex Global Technologies, CloudScale Systems, NexaByte AI, Finova Solutions) and 6 realistic tech job vacancies with required vs preferred skills
- [x] Candidate Job Search & Browse Hub (`BrowseJobs.tsx` / `#jobs`):
  - Live search bar and location input
  - Sidebar filters (workplace policy, employment type, salary slider)
  - Responsive job cards with company branding, verified badge, salary, and tech skills chips
  - High-fidelity `JobDetailsModal.tsx` displaying full responsibilities, requirements, and "Apply" action
- [x] Recruiter Vacancy Management & Creation Console (`RecruiterDashboard.tsx`):
  - Live listings of all vacancies posted by recruiter with status badges and candidate metrics
  - One-click status toggle (`Publish` / `Close`) and delete actions
  - Full "Publish New Job Vacancy" modal with multi-field inputs and interactive skills tagger
- [x] All 27 backend unit & integration tests passing (`mvn test`)
- [x] Frontend TypeScript production build passing cleanly (`tsc && vite build`) in 2.72s
- [x] Vite React Frontend compiles with 0 errors (`npm run build` verified)

### Phase 5: Job Applications & Applicant Tracking (10-Stage ATS) (Verified)
- [x] Normalized relational entities: `Application` (`job_applications`), `ApplicationStatusHistory`
- [x] 10-Stage recruitment pipeline enum: `APPLIED`, `UNDER_REVIEW`, `SHORTLISTED`, `TECH_INTERVIEW`, `HR_INTERVIEW`, `SELECTED`, `OFFER_RELEASED`, `HIRED`, `REJECTED`, `WITHDRAWN`
- [x] Real-time candidate portfolio submission with primary resume linkage and cover letter notes
- [x] Automated status transition history with actor tracking and audit trail timestamps
- [x] Automated Gmail confirmation dispatch upon application submission and stage transitions via Spring Mail SMTP
- [x] Recruiter ATS Dashboard Drawer (`RecruiterDashboard.tsx`):
  - Job vacancies with live applicant count indicators
  - Interactive pipeline stage filter pills
  - Fast stage advance dropdown with transition remarks modal
  - Complete candidate audit trail modal displaying status timeline
- [x] Candidate Application Tracker (`CandidateDashboard.tsx`):
  - Dedicated "My Applications" tab with real-time status badges
  - Live audit trail viewer for each application
  - Instant status refresh

### Phase 6: Interview Management & Scheduling System (Verified)
- [x] Normalized backend entities: `Interview` (`interviews`), `InterviewStatus`, `InterviewType`, `MeetingMode`, `RecommendationType`
- [x] Multi-type interview rounds: `TECH_ROUND_1`, `TECH_ROUND_2`, `SYSTEM_DESIGN`, `HR_ROUND`, `MANAGERIAL`
- [x] Multi-platform meeting modes: `GOOGLE_MEET`, `ZOOM`, `MICROSOFT_TEAMS`, `IN_PERSON_OFFICE`
- [x] Full RESTful API endpoints (`/api/v1/interviews`):
  - `POST /api/v1/interviews/schedule` - Schedule round, generate meeting link, advance ATS stage, and dispatch live Gmail calendar invitation
  - `GET /api/v1/interviews/{id}` - Complete interview record
  - `GET /api/v1/interviews/application/{appId}` - All rounds for a specific candidate application
  - `GET /api/v1/interviews/candidate/my` - Scheduled interviews for logged-in candidate
  - `GET /api/v1/interviews/recruiter/my` - Scheduled interviews for logged-in recruiter
  - `PATCH /api/v1/interviews/{id}/status` - 1-click candidate attendance confirmation or reschedule request
  - `POST /api/v1/interviews/{id}/feedback` - Submits multi-category evaluation scorecard (Technical, Problem Solving, Communication, Cultural Fit) and overall recommendation (`STRONG_HIRE`, `HIRE`, `HOLD`, `NO_HIRE`)
- [x] Automated HTML email notifications via Spring Mail SMTP (`hmp7964@gmail.com`):
  - Official Interview Invitation with Google Meet link and IST scheduling
  - Reschedule & status change alert emails
  - Scorecard & evaluation feedback notification
- [x] Candidate Dashboard UI (`CandidateDashboard.tsx`):
  - Dedicated "Interviews & Schedules" tab with countdowns and status indicators
  - Direct "Join Video Room" button (Google Meet integration)
  - 1-click "Confirm Attendance" action
  - "Request Reschedule" modal with reason and alternate IST timing preferences
  - Completed evaluation scorecard display with 5-star ratings and written notes
- [x] Recruiter Hub UI (`RecruiterDashboard.tsx`):
  - "Schedule Round" modal directly accessible on candidate applicant cards
  - "Scorecard & Evaluation" modal with 5-star rating matrix and recommendation selector
  - Dedicated "Interviews & Scheduling Calendar" tab tracking all rounds across company vacancies
  - Live candidate confirmation / reschedule request badges

---

## 📅 Roadmap to Completion

- **Phase 1: Project Foundation** ➔ **[COMPLETED]**
- **Phase 2: Authentication & Security** ➔ **[COMPLETED]**
- **Phase 3: Candidate & Recruiter Profile Management** ➔ **[COMPLETED]**
- **Phase 4: Company and Job Management** ➔ **[COMPLETED]**
- **Phase 5: Job Applications & Applicant Tracking (10-Stage ATS)** ➔ **[COMPLETED]**
- **Phase 6: Interview Management & Scheduling System** ➔ **[COMPLETED]**
- **Phase 7: Notification System (In-app & Email Center)** ➔ **[NEXT]**
- **Phase 8: Recruitment Analytics Dashboard**
- **Phase 9: Smart Candidate Matching Engine**
- **Phase 10: Testing, Docker & Containerized Deployment**
