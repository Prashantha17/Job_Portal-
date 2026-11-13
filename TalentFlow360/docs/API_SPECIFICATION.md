# TalentFlow 360 - REST API Specifications (v1)

## Base URL
```
http://localhost:8080/api/v1
```

## Standard Response Envelope
All API endpoints follow a unified response structure:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-11-05T02:00:00Z"
}
```

---

## 1. Authentication & Security Endpoints

### 1. Register User
- **Endpoint**: `POST /api/v1/auth/register`
- **Request Body**:
```json
{
  "email": "jane.doe@talentflow360.com",
  "password": "SecurePassword@123",
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+1-555-0199",
  "role": "RECRUITER"
}
```
- **Response**: `201 Created` with `AuthResponse` containing `accessToken`, `refreshToken`, user details, and roles.

### 2. Login User
- **Endpoint**: `POST /api/v1/auth/login`
- **Request Body**:
```json
{
  "email": "candidate@talentflow360.com",
  "password": "Candidate@123"
}
```
- **Response**: `200 OK` with JWT `accessToken` (HS256) and `refreshToken`.

### 3. Refresh Access Token
- **Endpoint**: `POST /api/v1/auth/refresh`
- **Request Body**:
```json
{
  "refreshToken": "<uuid-refresh-token>"
}
```
- **Response**: `200 OK` with freshly signed JWT access token.

### 4. Current User Identity Profile
- **Endpoint**: `GET /api/v1/auth/me`
- **Header**: `Authorization: Bearer <token>`
- **Response**: `200 OK` with User profile and granted role authorities.

---

## 2. Skills Catalog Endpoints (Phase 3 Implemented)

### 1. List / Search Skills
- **Endpoint**: `GET /api/v1/skills`
- **Query Parameters**:
  - `q` (optional): Filter by name substring (e.g. `?q=java`)
  - `category` (optional): Filter by category enum (`BACKEND`, `FRONTEND`, `DATABASE`, `DEVOPS`, etc.)
- **Security**: Publicly accessible.
- **Response**: `200 OK` with list of `SkillDTO` (`id`, `name`, `category`).

### 2. Register New Skill
- **Endpoint**: `POST /api/v1/skills`
- **Request Body**:
```json
{
  "name": "GraphQL",
  "category": "BACKEND"
}
```
- **Response**: `201 Created`.

---

## 3. Candidate Profile Endpoints (Phase 3 Implemented)

### 1. Get Candidate Profile Portfolio
- **Endpoint**: `GET /api/v1/candidates/me`
- **Header**: `Authorization: Bearer <candidate_jwt>`
- **Authorization**: `ROLE_JOB_SEEKER` or `ROLE_SUPER_ADMIN`
- **Response**: `200 OK` with full `CandidateProfileResponse` including educations, experiences, skills, and resumes.

### 2. Update Candidate Profile Details
- **Endpoint**: `PUT /api/v1/candidates/me`
- **Header**: `Authorization: Bearer <candidate_jwt>`
- **Request Body**:
```json
{
  "firstName": "Alex",
  "lastName": "Morgan",
  "phone": "+1-555-0103",
  "headline": "Senior Full Stack Java Engineer | Microservices",
  "bio": "Experienced software engineer specializing in high-load distributed systems...",
  "location": "San Francisco, CA",
  "totalExperienceYears": 5.0,
  "currentSalary": 130000.0,
  "expectedSalary": 150000.0,
  "linkedinUrl": "https://linkedin.com/in/alexmorgan-dev",
  "githubUrl": "https://github.com/alexmorgan-dev",
  "websiteUrl": "https://alexmorgan.dev"
}
```
- **Response**: `200 OK` with updated profile.

### 3. Add Education
- **Endpoint**: `POST /api/v1/candidates/me/education`
- **Request Body**:
```json
{
  "institution": "Stanford University",
  "degree": "Master of Science",
  "fieldOfStudy": "Computer Science",
  "startDate": "2022",
  "endDate": "2024",
  "grade": "3.95 GPA",
  "description": "Focus in distributed systems and cloud architecture."
}
```
- **Response**: `201 Created` with `EducationDTO`.

### 4. Delete Education
- **Endpoint**: `DELETE /api/v1/candidates/me/education/{id}`
- **Response**: `204 No Content`.

### 5. Add Work Experience
- **Endpoint**: `POST /api/v1/candidates/me/experience`
- **Request Body**:
```json
{
  "companyName": "Google",
  "jobTitle": "Senior Software Engineer",
  "location": "Mountain View, CA",
  "startDate": "2022-01",
  "endDate": "Present",
  "isCurrent": true,
  "description": "Leading cloud backend development with Spring Boot and Kubernetes."
}
```
- **Response**: `201 Created` with `ExperienceDTO`.

### 6. Delete Work Experience
- **Endpoint**: `DELETE /api/v1/candidates/me/experience/{id}`
- **Response**: `204 No Content`.

### 7. Add / Update Skill
- **Endpoint**: `POST /api/v1/candidates/me/skills`
- **Request Body**:
```json
{
  "skillName": "Kubernetes",
  "category": "DEVOPS",
  "proficiencyLevel": "EXPERT",
  "yearsOfExperience": 4.0
}
```
- **Response**: `201 Created` with `CandidateSkillDTO`.

### 8. Remove Skill
- **Endpoint**: `DELETE /api/v1/candidates/me/skills/{id}`
- **Response**: `204 No Content`.

### 9. Upload / Register Resume
- **Endpoint**: `POST /api/v1/candidates/me/resume`
- **Request Body**:
```json
{
  "title": "Alex Morgan Senior Engineer Resume 2026.pdf",
  "fileName": "Alex_Morgan_Resume_2026.pdf",
  "filePath": "/uploads/resumes/Alex_Morgan_Resume_2026.pdf",
  "isPrimary": true
}
```
- **Response**: `201 Created` with `ResumeDTO`.

### 10. List Resumes
- **Endpoint**: `GET /api/v1/candidates/me/resume`
- **Response**: `200 OK` with list of uploaded resumes.

### 11. Delete Resume
- **Endpoint**: `DELETE /api/v1/candidates/me/resume/{id}`
- **Response**: `204 No Content`.

### 12. Set Primary Resume
- **Endpoint**: `PATCH /api/v1/candidates/me/resume/{id}/primary`
- **Response**: `200 OK` with updated primary resume.

---

## 4. Recruiter Profile Endpoints (Phase 3 Implemented)

### 1. Get Recruiter Profile
- **Endpoint**: `GET /api/v1/recruiters/me`
- **Header**: `Authorization: Bearer <recruiter_jwt>`
- **Authorization**: `ROLE_RECRUITER`, `ROLE_HR_MANAGER`, or `ROLE_SUPER_ADMIN`
- **Response**: `200 OK` with `RecruiterProfileDTO`.

### 2. Update Recruiter Profile
- **Endpoint**: `PUT /api/v1/recruiters/me`
- **Header**: `Authorization: Bearer <recruiter_jwt>`
- **Request Body**:
```json
{
  "companyName": "Apex Global Technologies",
  "designation": "Director of Technical Talent",
  "department": "Engineering Recruiting",
  "corporateEmail": "sarah.jenkins@apextech.com",
  "corporatePhone": "+1-415-555-0199",
  "linkedinUrl": "https://linkedin.com/in/sarahjenkins-talent"
}
```
- **Response**: `200 OK` with updated `RecruiterProfileDTO`.
