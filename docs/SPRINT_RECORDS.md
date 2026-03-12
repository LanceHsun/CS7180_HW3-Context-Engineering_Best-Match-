# Sprint Records & Agile Process

The development of BestMatch was executed in two intensive Sprints following Agile methodologies.

## Sprint 1: Infrastructure & Core Onboarding

- **Focus**: Project scaffolding, Auth integration, and AI Resume Parsing.
- **Key Deliverables**:
  - PDF extraction engine (using Gemini).
  - Supabase schema design and RLS implementation.
  - Magic Link sign-in flow.
  - Onboarding UI and 'ScanLine' animation.
- **Roles**: Zixin Lin (Frontend Lead) & Yun Feng (Backend & AI Lead).

## Sprint 2: Dashboard & Matching Engine

- **Focus**: User features, Job Matching algorithm, and Automated Notifications.
- **Key Deliverables**:
  - Dashboard Profile Management (editable Target Role).
  - Job fetching module (Adzuna integration).
  - AI Scoring logic (Zod validated).
  - SendGrid email digest integration.
  - Vercel Cron job for daily matching.
- **Roles**: Zixin Lin (Frontend Lead) & Yun Feng (Backend & AI Lead).

## Retrospective Highlights

- **Validation is Key**: Using Zod to validate environment variables and API payloads at runtime saved us from hours of debugging deployment errors.
- **Resilience is a Choice**: Our multi-model fallback showed that you can build reliable apps on top of unpredictable AI services if you design for failure.
- **POCs Matter**: We initially lost a day to a bugged PDF library. Testing core dependencies in a small Proof of Concept (POC) before full integration is mandatory.
- **Ground Truth**: While AI is great for generating ideas, humans must verify the state against the raw data (database records).
