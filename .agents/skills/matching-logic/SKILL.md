---
name: matching-logic
description: Business logic for job matching and security policies.
---

# Matching Logic & Core Features Skill

This skill defines the core business rules and security requirements for the BestMatch platform.

## Job Matching Algorithm

- **Threshold:** Only jobs with a **Match Score > 70%** should be displayed or delivered to the user.
- **Score Calculation:** Based on alignment between User Skills, Target Role, and Job Description.
- **Scraping:** Use Apify for job data collection.

## Authentication & Delivery

- **Magic Links:** Strictly use Magic Links for authentication (via Supabase). NO password-based authentication.
- **Email Delivery:** Use Resend or SendGrid for sending match digests.
- **Frequency:** Allow users to choose between Daily and Weekly digests (see Preferences card in prototype).

## Security Policies

- **Supabase RLS:** Use Row Level Security to protect user match history.
- **Environment Variables:** Validate all API keys (Gemini, Supabase, Resend) at runtime.
- **Prohibitions:** 
    - No automated job applications.
    - No resume rewriting.
