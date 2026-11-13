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
