# Product Requirements Document: BestMatch 

Project Name: BestMatch

Status: Initial Draft

Team: Lance Lin (Zixin Lin), Yun Feng

## 1\. Problem Statement

The current job market requires candidates to manually scan dozens of boards and tailor resumes for every application. This leads to "search fatigue" and missed opportunities. BestMatch flips the script: users upload one Master Resume, and an AI-driven backend continuously scans and matches roles to their existing profile, delivering a curated inbox of opportunities.

## 2\. Target Users

* Efficiency-Oriented Seekers: Active job hunters who want to skip manual filtering and focus only on high-probability roles.  
* Passive Candidates: Professionals not actively looking but willing to apply if a "perfect match" appears with zero manual effort.

## 3\. User Personas & Stories

### **Must Have**

* **User Registration & Auth**: As a new user, I want to create an account and log in securely, so that my resume and preferences are saved.  
* **Resume Persona Extraction**: As a seeker, I want to upload my PDF resume, so that the AI can automatically extract my skills, experience level, and professional tags.  
* **Preference Setting**: As a candidate, I want to define my target locations and notification frequency, so that I only receive relevant job alerts at my preferred intervals.  
* **Automated Email Delivery**: As a busy professional, I want to receive a formatted email with a list of matched jobs, so that I can quickly review opportunities that fit my profile.

### **Should Have**

* **Match Scoring**: As a user, I want to see a percentage score for each job, so that I can understand why it was recommended and prioritize high-probability roles.  
* **Direct Linkage**: As a seeker, I want a direct 'Apply' link in the email, so that I can easily navigate to the original job posting.

### **Could Have**

* **Feedback Loop**: As a user, I want to be able to 'dislike' a match, so that the AI can refine and improve its future suggestions for me.  
* **Auto-Apply**: As a system designer, I want to explicitly exclude automated job applications, so that we avoid legal compliance issues and ensure the user maintains control over application quality.

## 4\. Technical Constraints

| Component | Technology | Reason for AI-Friendliness |
| :---- | :---- | :---- |
| Frontend | Next.js (TS) \+ Shadcn UI | Strong typing and component-based structure reduce AI hallucinations. |
| Backend | [Next.js](http://Next.js) API routes | Unified full-stack TypeScript environment allows the AI to seamlessly share types, data models, and logic between the client and server. |
| Auth & DB | Supabase | Simplifies Auth logic; AI handles Supabase-js/py SDKs with high reliability. |
| Deployment | Vercel / Railway | Standardized CI/CD paths that AI can easily configure via YAML. |

## 5\. Success Metrics

* Onboarding Completion: % of users who successfully upload a resume and set preferences after signup.  
* Match Relevance: User-reported accuracy of the first 5 job recommendations.  
* Click-Through Rate (CTR): Percentage of users clicking job links in the automated emails.

## 6\. Functional Requirements (Data Flow)

1. Onboarding: User signs up → Uploads PDF → FastAPI sends PDF to LLM → LLM returns JSON profile → Saved to Supabase.  
2. Matching Engine: Cron job triggers (Daily/Weekly) → Backend fetches new jobs (via API/Scraper) → LLM compares Job Description vs. User Profile → Calculates Match Score.  
3. Delivery: Backend filters scores \> 70% → Generates email template via SendGrid/SES → Sent to User.

## 7\. Out of Scope

* Resume Rewriting: We do not offer tools to edit the user's resume.  
* Interview Coaching: No AI-mock interview features for this version.  
* Internal Messaging: No communication platform between candidates and recruiters.

