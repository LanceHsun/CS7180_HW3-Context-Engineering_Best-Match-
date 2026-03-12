# AI Mastery & Human-AI Collaboration

This project was developed using an "AI-Centric" workflow, leveraging multiple AI agents to maximize productivity and code quality.

## Collaborative Architecture

We utilized a "Macro and Micro" AI strategy to maximize productivity:

### 1. Claude Web: Architect and Project Manager

We used **Claude 3.5 Sonnet** for high-level planning.

- **Prototyping**: Claude generated our initial Prototypes and Mockups based on our Product Requirements Document (PRD). These designs became the "North Star" for development.
- **Agile Planning**: Claude helped us break down goals into detailed Feature Issues and split them into two Sprints. It even helped us allocate tasks—Zixin focused on the Framer Motion UI while Yun Feng focused on the AI fallback logic.

### 2. IDE AI (Antigravity): Implementation Specialist

For coding, we used **Antigravity**. It reads our file context and generates code that follows our naming conventions.

- **Problem Solving**: Antigravity was instrumental in writing the complex SQL for our `idx_match_runs_user_date` index. It understood the nuances of timezones in PostgreSQL, ensuring our idempotency checks worked across different user locales.
- **Automated Testing**: Antigravity helped generate comprehensive unit and integration tests, maintaining our >80% coverage requirement.

## Prompt Engineering

We employed structured, multi-shot prompting for Gemini 1.5 Pro to ensure consistent JSON extraction from diverse resume formats.

### Digital Recruiter Persona

In the matching phase, we use a highly specific **Recruiter Persona Prompt** that instructs the AI to look for "must-have" vs "nice-to-have" skills. The AI provides a score from 0 to 100. We set a strict gate: only matches scoring ≥ 70% are saved and sent to the user.

### Strict Schema Enforcement

To make the system production-ready, we used **Zod schemas** to force the AI to output strictly typed JSON. If the AI hallucinates, the schema catches it, and we don't save bad data to Supabase.

## Resilience and Fallbacks

AI services can be unpredictable. To ensure production reliability, we implemented a **multi-model fallback** strategy:

- **Key Rotation**: Cycling through multiple API keys to avoid 429 rate limits.
- **Model Cascade**: If the premium Gemini 1.5 Pro model is unavailable, we cascade through fallback models (like Flash).
- **Exponential Backoff**: Retrying failed calls to handle temporary network blips.
