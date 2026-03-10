# Deployment Guide

This document describes how to deploy the BestMatch project to Vercel.

## Quick Start (Vercel GitHub Integration)

The easiest way to deploy this project is to use the Vercel GitHub integration:

1.  **Push your code** to a GitHub repository.
2.  **Import the project** in the [Vercel Dashboard](https://vercel.com/new).
3.  Vercel will automatically detect that this is a **Next.js** project.
4.  **Configure Environment Variables** (see the list below).
5.  Click **Deploy**.

## Environment Variables

You must configure the following environment variables in the Vercel project settings:

| Variable Name                   | Description                         | Required |
| :------------------------------ | :---------------------------------- | :------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL           | Yes      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key         | Yes      |
| `GEMINI_API_KEY`                | Your Google Gemini API Key          | Yes      |
| `ADZUNA_APP_ID`                 | Your Adzuna Application ID          | Yes      |
| `ADZUNA_APP_KEY`                | Your Adzuna Application Key         | Yes      |
| `SENDGRID_API_KEY`              | Your SendGrid API Key               | No       |
| `SENDGRID_FROM_EMAIL`           | Your verified SendGrid sender email | No       |

## Manual Deployment (Vercel CLI)

If you have the [Vercel CLI](https://vercel.com/download) installed and authenticated:

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Antigravity Integration

Antigravity can help you manage your deployment by:

- **Configuring `vercel.json`**: If you need special routing or cron jobs.
- **Optimizing Build Scripts**: If you have custom build steps.
- **Troubleshooting Builds**: Antigravity can analyze build logs if you provide them.

To allow Antigravity to deploy for you, ensure you have the Vercel CLI logged in on your local machine, and Antigravity can run the `vercel` commands for you.

## Troubleshooting

- **Build Failures**: Check the Vercel build logs. Common issues include missing environment variables or type errors.
- **PDF Parsing**: The project uses `pdf-parse`. This is configured as a `serverExternalPackage` in `next.config.ts` to ensure it works correctly in the Vercel serverless environment.
