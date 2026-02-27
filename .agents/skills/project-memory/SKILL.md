---
name: project-memory
description: Instructions for maintaining the project's persistent journal and history.
---

# Project Memory Maintenance Skill

This skill ensures the BestMatch project maintains a continuous and accurate record of its evolution, architectural decisions, and session history.

## Logging Protocol

### 1. The memory.md Journal
Located at: `project_memory/memory.md`
- **Mandatory Update:** Every session or significant task completion MUST result in a new entry in the "Session History" table.
- **Entry Requirements:**
  - **Date:** Current date.
  - **Conv ID:** The unique ID of the current interaction.
  - **Objective:** What was the primary goal?
  - **Key Actions:** Summary of file changes, migrations, or logic updates.
  - **Status:** Marks the outcome of the task (e.g., ✅ Complete, 🚧 In Progress).

### 2. Architectural Decision Log (ADR)
- Record any significant design choices (e.g., choice of library, API structure change) in the "Architectural Decisions" section of `memory.md`.
- Include the **Rationale** to help future agents understand the "Why" behind the "What".

### 3. Session History Archiving
- For exceptionally long or complex conversations, export a markdown summary of the chat to `project_memory/history/[conv-id].md`.

## Workflow
1. **Start of Session:** Read `project_memory/memory.md` to understand the current state and roadmap.
2. **During Session:** Take notes on major changes or deviations from the original plan.
3. **End of Session:** 
   - Update the `Session History` table.
   - Update the `Project Roadmap Status` checklist.
   - Record any new `Architectural Decisions`.

## Verification
- Ensure the `memory.md` file reflects the absolute current truth of the codebase.
- Verify that links to artifacts or files are correct.
