---
name: verification
description: Quality assurance standards, testing frameworks, and TDD workflow.
---

# Verification & TDD Skill

Guidelines for ensuring BestMatch meets its >80% test coverage requirement and maintains high code quality.

## Quality Gates

- **Test Coverage:** Mandatory **>80%** (Unit + Integration + E2E).
- **CI/CD:** Pipelines must run Lint -> Test -> Scan.
- **Static Analysis:** ESLint and Prettier are mandatory.

## Testing Frameworks

- **Unit/Integration:** Vitest.
- **E2E:** Playwright.

## TDD Workflow

1. **Write failing test:** Define functionality in a test file before implementation.
2. **Implement:** Write minimal code to pass the test.
3. **Refactor:** Clean up code while maintaining green tests.
4. **Annotate:** Link complex logic to GitHub Issues using `@issue [id]`.

## Deployment

- **Vercel Preview:** Every PR must pass all checks before being ready for preview.
- **Security Scanning:** Use CodeQL/Snyk in the CI pipeline.
