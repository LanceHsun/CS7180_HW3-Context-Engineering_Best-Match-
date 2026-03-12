# Best-Match Public API Reference

Welcome to the **Best-Match API Reference**. This documentation provides instructions for interacting with the core backend services, including user profiling, resume parsing, job fetching, and AI-powered job matching.

## Base URL

All API requests should be made relative to the base URL:

```
https://www.bestmatch.page/api
```

## Authentication

Most endpoints require authentication via Supabase standard sessions. Provide your session cookie or Authorization header as dictated by Supabase Auth mechanism.

Endpoints strictly meant for internal automation (like cron jobs) require an Admin Secret passed via the `Authorization` header.

---

## 1. System Health

### Check Service Health

Verify connectivity to the database and third-party services (e.g., Gemini AI).

- **URL:** `/health`
- **Method:** `GET`
- **Auth Required:** No

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "database": "ok",
    "gemini": "ok",
    "timestamp": "2026-03-10T12:00:00.000Z"
  }
}
```

---

## 2. Resume & Document Parsing

### Parse Resume PDF

Extract intelligence (target role, skills, experience level) from a candidate's resume using AI.

- **URL:** `/resume/parse`
- **Method:** `POST`
- **Auth Required:** No (used during onboarding)
- **Content-Type:** `multipart/form-data`

**Request Body:**
Form field `file` containing a valid `.pdf` document.

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "targetRole": "Software Engineer",
    "skills": ["JavaScript", "TypeScript", "React", "Node.js"],
    "yearsOfExperience": 4
  }
}
```

---

## 3. User Profiles & Preferences

### Fetch Current Profile

Retrieve the profile details for the currently authenticated user.

- **URL:** `/profile`
- **Method:** `GET`
- **Auth Required:** Yes

**Success Response (200 OK):**

```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "target_role": "Software Engineer",
    "skills": ["React", "Node.js"],
    "experience_level": "mid"
  }
}
```

### Upsert Profile

Create or update the currently authenticated user's profile.

- **URL:** `/profile`
- **Method:** `POST`
- **Auth Required:** Yes
- **Content-Type:** `application/json`

**Request Body:**

```json
{
  "targetRole": "Frontend Developer",
  "skills": ["TypeScript", "CSS"],
  "yearsOfExperience": 3
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Profile saved."
}
```

### Save Pending Profile

Securely save a profile for a user _before_ they have fully authenticated (e.g., during Magic Link sign-up).

- **URL:** `/profile/pending`
- **Method:** `POST`
- **Auth Required:** No
- **Content-Type:** `application/json`

**Request Body:**

```json
{
  "email": "user@example.com",
  "targetRole": "Backend Engineer",
  "skills": ["Go", "PostgreSQL"],
  "yearsOfExperience": 5
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Profile saved securely."
}
```

---

## 4. Jobs

### Fetch Job Listings

Fetch active job listings from external providers (e.g., Adzuna), filtered by role and optional location.

- **URL:** `/jobs`
- **Method:** `GET`
- **Auth Required:** No
- **Query Parameters:**
  - `role` (string, required): The job title or main keyword.
  - `location` (string, optional): The geographic location.

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "title": "Senior Frontend Engineer",
        "company": "Tech Corp",
        "description": "...",
        "apply_url": "https://...",
        "location": "New York, NY"
      }
    ],
    "count": 1
  }
}
```

---

## 5. AI Matching Engine

### Trigger Manual Match

Manually triggers the end-to-end matching process for the authenticated user. This fetches top jobs, runs AI profile scoring against them, persists high-confidence matches to the database, and sends an email digest to the user.

- **URL:** `/match/trigger`
- **Method:** `POST`
- **Auth Required:** Yes

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "job": {
          /* JobDetails */
        },
        "score": 85,
        "reasoning": "Strong overlap in Node.js and AWS skills."
      }
    ],
    "filtered_count": 8
  }
}
```

### Run Batch Match (Internal)

Runs AI scoring against a specific set of jobs for a given profile ID. High-confidence matches (score >= 70) are saved to the database.

- **URL:** `/match/run`
- **Method:** `POST`
- **Auth Required:** Yes
- **Content-Type:** `application/json`

**Request Body:**

```json
{
  "profileId": "uuid",
  "jobs": [
    /* Array of Job Objects */
  ]
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "matches": [
      /* Scored Matches */
    ],
    "filtered_count": 0
  }
}
```

### Trigger Automated Cron Match

A secure endpoint intended only for a scheduled cron runner. Iterates through all users requiring updates (daily or weekly), fetches jobs, runs AI scoring, saves matches, and dispatches email digests. Implements strict idempotency to prevent duplicate emails.

- **URL:** `/cron/match`
- **Method:** `GET`
- **Auth Required:** Yes (Cron Secret)
- **Headers:** `Authorization: Bearer <CRON_SECRET>`

**Success Response (200 OK):**

```json
{
  "processed": 50,
  "results": [
    {
      "user_id": "uuid",
      "status": "success",
      "matches": 3,
      "email": "success"
    }
  ]
}
```
