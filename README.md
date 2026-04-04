# DanaRoute - Smart Money Management

DanaRoute adalah aplikasi pengelolaan keuangan pribadi dengan fitur AI-powered insights, budgeting 50/30/20, dan tracking hutang/piutang.

## Features

- 📊 Dashboard keuangan real-time
- 💰 Tracking transaksi income & expense
- 📈 Budget management (50/30/20 rule)
- 🤖 AI Financial Advisor
- 💳 Multi-account management
- 📱 Responsive design

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Framework:** Next.js 16
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth with MFA support
- **AI:** Google Gemini
- **Styling:** Tailwind CSS

## Security

This application implements bank-grade security:
- Row Level Security (RLS)
- CSRF Protection
- Rate Limiting
- Input Validation (Zod)
- Secure Headers (CSP, HSTS, etc.)

See `SUPABASE_SECURITY_CONFIG.md` for security setup instructions.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com).

Check out [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
