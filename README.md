# Backend RSS to LinkedIn Poster

This is a backend Next.js app that parses RSS, summarizes new items, posts to LinkedIn, and tracks processed links in PostgreSQL via Prisma. Deployed on Vercel with cron.

Setup:

pnpm i
Copy .env.example to .env.local and fill vars
pnpm prisma:generate
pnpm prisma:migrate
pnpm dev (for local)
For local cron test: pnpm cron
Deploy to Vercel, set env vars, cron runs daily at midnight UTC.
