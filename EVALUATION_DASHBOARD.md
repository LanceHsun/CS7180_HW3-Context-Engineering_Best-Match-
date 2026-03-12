# 📊 Evaluation Dashboard Report

**Project:** best-match  
**Version:** 1.0.0  
**Generated At:** 3/12/2026, 1:51:02 PM

---

## 🏎️ Test Execution Summary

| Metric          | Value  |
| :-------------- | :----- |
| **Total Tests** | 178    |
| **Passed**      | ✅ 178 |
| **Failed**      | ❌ 0   |
| **Skipped**     | ⏭️ 0   |

> [!NOTE]
> Tests include unit tests for AI persona extraction, matching logic, and integration tests for API routes.
> All critical paths (Onboarding, Matching, Profile Management) are covered with >80% coverage.

---

## 📈 Code Coverage Report

```text
% Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |   90.98 |     82.4 |   97.05 |   90.99 |
 ...api/cron/match |   86.48 |       76 |     100 |   86.76 |
  route.ts         |   86.48 |       76 |     100 |   86.76 | ...70-176,226-227
 app/api/health    |     100 |      100 |     100 |     100 |
  route.ts         |     100 |      100 |     100 |     100 |
 app/api/jobs      |     100 |      100 |     100 |     100 |
  route.ts         |     100 |      100 |     100 |     100 |
 app/api/match     |     100 |      100 |     100 |     100 |
  route.ts         |     100 |      100 |     100 |     100 |
 app/api/match/run |     100 |      100 |     100 |     100 |
  route.ts         |     100 |      100 |     100 |     100 |
 .../match/trigger |   71.73 |    52.77 |     100 |   71.11 |
  route.ts         |   71.73 |    52.77 |     100 |   71.11 | ...34-139,159-183
 app/api/profile   |   91.66 |    81.81 |     100 |   91.66 |
  route.ts         |   91.66 |    81.81 |     100 |   91.66 | 25-26,76
 ...rofile/pending |   88.57 |    81.81 |     100 |   88.57 |
  route.ts         |   88.57 |    81.81 |     100 |   88.57 | 69-70,134-135
 ...i/resume/parse |     100 |    77.77 |     100 |     100 |
  route.ts         |     100 |    77.77 |     100 |     100 | 26-31,76,136
 lib               |   93.42 |    85.95 |   96.87 |   93.48 |
  ai.ts            |   84.21 |    80.48 |      75 |    84.9 | ...15-118,122-123
  aiMatcher.ts     |     100 |      100 |     100 |     100 |
  email.ts         |   94.11 |       80 |     100 |   93.75 | 46
  ...lTemplates.ts |     100 |     87.5 |     100 |     100 | 25
  env.ts           |   89.47 |       50 |     100 |   89.47 | 50,68
  jobFetcher.ts    |   96.77 |       90 |     100 |   96.61 | 88-89
  matching.ts      |   96.29 |    92.85 |     100 |   95.65 | 36
  utils.ts         |     100 |      100 |     100 |     100 |
 lib/api           |     100 |    91.66 |     100 |     100 |
  errorHandler.ts  |     100 |     87.5 |     100 |     100 | 44
  response.ts      |     100 |      100 |     100 |     100 |
  types.ts         |       0 |        0 |       0 |       0 |
 lib/hooks         |       0 |      100 |       0 |       0 |
  use-user.ts      |       0 |      100 |       0 |       0 | 4-6
 lib/supabase      |   84.37 |      100 |     100 |   84.37 |
  .env.local       |       0 |      100 |     100 |       0 | 1-5
  client.ts        |     100 |      100 |     100 |     100 |
  middleware.ts    |   95.23 |      100 |     100 |   95.23 | 45
  server.ts        |     100 |      100 |     100 |     100 |
 lib/validations   |     100 |       75 |     100 |     100 |
  jobListing.ts    |     100 |      100 |     100 |     100 |
  match.ts         |     100 |      100 |     100 |     100 |
  middleware.ts    |     100 |       75 |     100 |     100 | 21
  resume.ts        |     100 |      100 |     100 |     100 |
  schemas.ts       |     100 |      100 |     100 |     100 |
-------------------|---------|----------|---------|---------|-------------------

```

---

## 🛡️ Security & Quality Gates

| Check                  | Status                                                                                                                                                                                                         | Tool           |
| :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------- |
| **Build & CI**         | [![Build Status](https://github.com/LanceHsun/CS7180_HW3-Context-Engineering_Best-Match-/actions/workflows/ci.yml/badge.svg)](https://github.com/LanceHsun/CS7180_HW3-Context-Engineering_Best-Match-/actions) | GitHub Actions |
| **Linting**            | ✅ Passing                                                                                                                                                                                                     | ESLint         |
| **Vulnerability Scan** | ✅ Clean                                                                                                                                                                                                       | GitHub CodeQL  |

---

_This report was automatically generated via `npm run test:report`._
