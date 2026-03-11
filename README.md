# BestMatch

![Build Status](https://github.com/LanceHsun/CS7180_HW3-Context-Engineering_Best-Match-/actions/workflows/ci.yml/badge.svg)
![Codecov](https://img.shields.io/codecov/c/github/LanceHsun/CS7180_HW3-Context-Engineering_Best-Match-)
![Security Scan](https://img.shields.io/github/actions/workflow/status/LanceHsun/CS7180_HW3-Context-Engineering_Best-Match-/ci.yml?label=Security%20Scan)

## 📊 Evaluation Dashboard

| Metric                | Status                                                                                                                                           | Tool             |
| :-------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- | :--------------- |
| **Build & CI**        | ![CI Status](https://github.com/LanceHsun/CS7180_HW3-Context-Engineering_Best-Match-/actions/workflows/ci.yml/badge.svg)                         | GitHub Actions   |
| **Test Coverage**     | ![Codecov](https://img.shields.io/codecov/c/github/LanceHsun/CS7180_HW3-Context-Engineering_Best-Match-)                                         | Vitest & Codecov |
| **Security Scanning** | ![Security Scan](https://img.shields.io/github/actions/workflow/status/LanceHsun/CS7180_HW3-Context-Engineering_Best-Match-/ci.yml?label=CodeQL) | GitHub CodeQL    |
| **Code Quality**      | ![Lint Status](https://img.shields.io/badge/eslint-passing-brightgreen)                                                                          | ESLint           |

BestMatch is an AI-driven job matching dashboard that helps candidates find high-probability roles by automatically scanning job boards and tailoring recommendations based on their master resume.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd CS7180_HW3-Context-Engineering_Best-Match-
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Setup environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in the required keys in `.env.local`.

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Code Quality

- **Linting**: `npm run lint`
- **Formatting**: `npm run format`
- **Pre-commit Hooks**: Husky automatically runs `lint-staged` on every commit to ensure code quality.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS v4, Shadcn UI
- **Backend**: Next.js API Routes (Node.js)
- **Database/Auth**: Supabase
- **AI**: Gemini 1.5 Pro
- **Job Search API**: Adzuna

## Deployment

For instructions on how to deploy this project to Vercel, please refer to the [Deployment Guide](./DEPLOYMENT.md).
