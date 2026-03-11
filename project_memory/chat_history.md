# BestMatch - Chat History

This file maintains a chronological record of all agent interactions, transcribed and enriched from historical session logs.

---

## [2026-03-10] Record Agent Chat History <a name="3fd39b1e"></a>
**ID:** `3fd39b1e` | **Objective:** Record Agent Chat History

### Chat Logs

**User:** I'd like to record the chat history with the agent in this project. I already have many chat histories, how should I proceed?

**Agent:** I suggest creating a `history/` directory under `project_memory/` and creating a separate Markdown file for each session.

**User:** Create a new branch from `main` first, then continue with this task.

**Agent:** Created the `feature/record-chat-history` branch and drafted an initial plan.

**User:** I think the content should include the Q&A records between the user (me) and the AI agent. The document should be titled something like "chat history", and all conversations should be recorded in the same document.

**Agent:** Understood. I will consolidate all conversation logs into `project_memory/chat_history.md` and include the Q&A details.

**User:** Modify `chat_history.md`, the chat history should be written in English.

**Agent:** Translating the entire document and all future logs to English.

**User:** Next, I'm going to collect agent chat history from other branches. Any suggestions?

**Agent:** I recommend searching for historical artifacts like `walkthrough.md` and `implementation_plan.md` in the `.gemini/antigravity/brain` directory to reconstruct the context.

### Key Outcomes
- Established `project_memory/chat_history.md` as the central logs.
- Linked `memory.md` to specific session anchors in this file.
- Reconstructed and translated major past session details.

---

## [2026-03-10] Header-based Origin Redirection Fix (v4) <a name="bb8f8f1b"></a>
**ID:** `bb8f8f1b` | **Objective:** Fixing Redirection Logic

### Summary
Addressed magic link redirection issues on Vercel by switching from protocol-agnostic origin detection to header-based detection (`x-forwarded-proto`, `host`).

### Key Outcomes
- Replaced `request.url` in `pending/route.ts` and `auth/callback/route.ts` with logic to detect `https` via headers.
- Verified that links in emails now correctly point to the production domain instead of `localhost`.

---

## [2026-03-10] Fixing Test Regressions <a name="af6ee35c"></a>
**ID:** `af6ee35c` | **Objective:** Fixing Test Regressions

### Summary
Fixed unit test failures in the profile API by correcting variable assignments and removing unused lint-triggering variables.

---

## [2026-03-10] Model Reliability & AI Import Refactoring <a name="29c01f4a"></a>
**ID:** `29c01f4a` | **Objective:** Improving Model Reliability

### Summary
Implemented a robust model fallback and retry system to handle Gemini API quota limits and transient errors.

### Key Outcomes
- Created `generateWithFallback` in `lib/ai.ts` with exponential backoff (1s, 2s, 4s).
- Expanded model pool to 9 variants to maximize throughput.
- Integrated "Search Now" button in the Dashboard for manual match triggers.
- Cleaned up stale AI imports in `aiMatcher.ts` and `parse/route.ts`.

---

## [2026-03-10] Editable Target Role <a name="f92da615"></a>
**ID:** `f92da615` | **Objective:** Modifying Dashboard Profile

### Summary
Implemented inline editing for the "Target Role" field in the Dashboard profile card.

### Key Outcomes
- Added interactive `Input` component with **Auto-save on Blur**.
- Integrated direct Supabase updates for partial profile synchronization.
- Added visual feedback ("Updated") for user actions.

---

## [2026-03-10] Debugging Magic Link Redirection <a name="8d6fef29"></a>
**ID:** `8d6fef29` | **Objective:** Debugging Magic Link Redirection

### Summary
Introduced `getURL()` utility in `lib/utils.ts` to determine the app's base URL across Vercel and local environments. Note: Refined later in `bb8f8f1b`.

---

## [2026-03-06] Match History Feature <a name="ea05ecb5"></a>
**ID:** `ea05ecb5` | **Objective:** Implementing Match History

### Summary
Implemented the "Match History" section on the dashboard to show recent job matches.

### Key Outcomes
- Created `ScoreBadge` component with color coding (Green >= 90%, Blue >= 80%, Amber < 80%).
- Implemented `MatchHistory` component with pagination (last 5 matches) and loading skeletons.
- Enabled job role links to external job portals.

---

## [2026-03-06] Candidate Preferences Feature <a name="bac3a972"></a>
**ID:** `bac3a972` | **Objective:** Implementing Preferences

### Summary
Added a "Preferences" card for candidates to set job digest frequencies and location filters.

### Key Outcomes
- Implemented `PreferencesCard` with Daily/Weekly toggle and location tags.
- Integrated `supabase.upsert` for persistent preference storage.
- Added `framer-motion` for smooth UI transitions when adding/removing locations.

---

## [2026-03-06] Improving Branch Coverage <a name="0c2d1863"></a>
**ID:** `0c2d1863` | **Objective:** Improving Branch Coverage

### Summary
Focused on increasing unit test coverage for critical API routes (`/api/resume/parse`, `/api/profile/pending`) to meet the mandatory 80% threshold.

---

## [2026-03-05] Resume Update Modal & Quota Fix <a name="85b1d510"></a>
**ID:** `85b1d510` | **Objective:** Debugging Profile Save Error

### Summary
Implemented the "Update Resume" modal and resolved Supabase persistence errors.

### Key Outcomes
- Refactored `ResumeDropzone` for modal integration.
- Fixed "Failed to save profile" error by implementing `onConflict: 'user_id'` in `upsert` calls.
- Implemented model fallback system in resume parsing API.

---

## [2026-03-05] Onboarding Flow Fixes <a name="7a81b010"></a>
**ID:** `7a81b010` | **Objective:** Fixing Onboarding Tests

### Summary
Resolved E2E and unit test failures in the onboarding journey.

### Key Outcomes
- Implemented `ExtractionResults` completion logic for anonymous profile creation.
- Added `sb-mock-user` cookie bypass for development environment.
- Fixed Playwright E2E path issues for PDF uploads.

---

## [2026-03-05] Updating Happy Path Docs <a name="27ea6fb6"></a>
**ID:** `27ea6fb6` | **Objective:** Updating Happy Path Docs

### Summary
Aligned internal documentation with the "Silent Signup" flow to allow prototype testing without mandatory email activation.

---

## [2026-03-04] Happy Path Testing Complete <a name="b0d47e15"></a>
**ID:** `b0d47e15` | **Objective:** Happy Path Testing Complete

### Summary
Verified the complete end-to-end flow from resume upload to dashboard redirection. Achieved 85.91% global branch coverage.

---

## [2026-03-04] Finalizing Onboarding & Auth Bypass <a name="993a1c3d"></a>
**ID:** `993a1c3d` | **Objective:** Finalizing Onboarding

### Summary
Initial implementation of the onboarding flow with AI animation and dev authentication bypass.

---

## [2026-03-04] Implement Session Persistence <a name="87d36805"></a>
**ID:** `87d36805` | **Objective:** Implement Session Persistence

### Summary
Configured Supabase session persistence and route protection middleware using the `useUser` hook.

---

## [Persistent LRU Cache - Homework Context] <a name="4fe7f77e"></a>
**ID:** `4fe7f77e` | **Objective:** Implement Persistent LRU Cache

### Summary
Implemented a `PersistentLRUCache` class in TypeScript with TTL support and `localStorage` persistence for a coding challenge. (Historical record from CS7180_HW1).
