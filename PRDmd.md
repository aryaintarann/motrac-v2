# Motrac — Product Requirements Document

> **Version:** 1.0 · **Date:** March 2026 · **Status:** Draft
> **Platform:** Web (Desktop + Mobile-Responsive) · iOS · Android · PWA
> **Stack:** Next.js 16.2.0 · Vercel · Supabase

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [Scope](#3-scope)
4. [Target Users & Personas](#4-target-users--personas)
5. [Technical Stack](#5-technical-stack)
6. [Feature Requirements](#6-feature-requirements)
7. [Database Schema Overview](#7-database-schema-overview)
8. [UX & Design System](#8-ux--design-system)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Notification Strategy](#10-notification-strategy)
11. [AI Feature Design](#11-ai-feature-design)
12. [Open Questions](#12-open-questions)
13. [Glossary](#13-glossary)

---

## 1. Executive Summary

Motrac (Money Tracker) is a cross-platform personal finance tracker designed for individuals who want intelligent control over their money. It combines core financial recording (transactions, accounts, debts) with AI-driven budgeting and spending insights, wrapped in a sleek, modern interface with a light color scheme and a blue undertone.

The product targets Indonesian users managing multiple wallets — cash, bank accounts, and e-wallets such as GoPay and OVO. Motrac is not a bank. It is a smart financial mirror that helps users understand, plan, and improve their financial behaviour.

---

## 2. Goals & Success Metrics

### 2.1 Product Goals

- Reduce the time to log a recurring transaction to **under 2 seconds** via Quick Add Templates.
- Replace manual budgeting with **AI-driven 50/30/20 smart allocation** on each paycheck.
- Provide actionable AI insights that surface spending patterns in plain language.
- Deliver a seamless, consistent experience across Web, iOS, Android, and PWA.
- Ensure financial data accuracy through account reconciliation and transfer tracking.

### 2.2 Success Metrics

| Metric | Target (3 months) | Measurement |
|---|---|---|
| Daily Active Users | 500 DAU | Supabase analytics |
| Avg. transaction log time | < 5 seconds | Client-side timing events |
| AI budget adoption | > 60% of active users | Feature usage flag in DB |
| PDF report exports | > 40% of users/month | Export event log |
| App crash rate | < 0.5% | Sentry / error tracking |

---

## 3. Scope

### 3.1 In Scope (v1.0)

- Multi-account management (bank, e-wallet, cash) with balance reconciliation.
- Three transaction types: Income, Expense, and Transfer.
- Debt and receivable tracking with installment payment history.
- User-customizable transaction categories.
- AI-powered weekly Safe-to-Spend pacing widget.
- AI 50/30/20 budget allocation triggered on income entry.
- AI monthly insights with natural-language commentary.
- Transaction calendar view and PDF financial report export.
- Quick Add Templates for sub-2-second expense logging.
- Cross-platform delivery: Web (desktop + mobile-responsive), iOS, Android, PWA.

### 3.2 Out of Scope (v1.0)

- Open Banking / bank API integration (manual entry only in v1).
- Multi-user or family accounts.
- Investment portfolio tracking.
- Cryptocurrency support.
- Receipt or invoice OCR scanning.

---

## 4. Target Users & Personas

| Persona | Profile | Core Need |
|---|---|---|
| **The Young Professional** | 25–35, salaried, heavy GoPay/BCA user, overspends on food delivery. | Quick expense logging + AI nudges on category overspending. |
| **The Debt Juggler** | Multiple active debts, currently tracks payments in spreadsheets. | Single consolidated debt view with installment reminders. |
| **The Freelancer** | Irregular income, multiple clients, unpredictable monthly cash flow. | Smart allocation that adjusts to each variable paycheck. |
| **The Cash-Heavy User** | Prefers cash, mistrusts digital wallets, needs accurate bookkeeping. | Reliable cash account ledger with manual reconciliation tool. |

---

## 5. Technical Stack

| Layer | Technology | Notes |
|---|---|---|
| **Web Frontend** | Next.js 16.2.0 (App Router) | React Server Components; Tailwind CSS; deployed on Vercel. |
| **Mobile** | Expo (React Native) | Shared business logic with web via shared utilities; targets iOS and Android. EAS Build for distribution. |
| **PWA** | Next.js PWA plugin | Installable on desktop and mobile browsers. Online-only — no offline transaction queuing. |
| **Authentication** | Supabase Auth — Email/Password + Google OAuth | No Apple Sign-In in v1.0. Google OAuth covers social login for both web and Expo mobile. |
| **Backend / Database** | Supabase (PostgreSQL + Auth + Storage) | Row-Level Security on all tables. Realtime for balance sync. |
| **Deployment** | Vercel (web) + EAS Build (mobile) | Preview deploys on each PR. Edge Functions for AI proxy. |
| **AI Provider** | Google Gemini API | Routed through `/api/ai/[feature]` via Vercel Edge Function. API key stored as Vercel environment secret. |
| **PDF Export** | react-pdf or Puppeteer | Server-side rendering for consistent report output. |
| **Notifications** | Supabase Edge Functions + FCM/APNs | Debt installment reminders and budget alerts. |

---

## 6. Feature Requirements

### 6.1 Smart Dashboard (Home Screen)

The home screen is the primary daily touchpoint. It must load within 1 second and surface the most actionable information immediately without requiring navigation.

#### Header — Total Balance

- Hero card displaying the aggregate balance across all accounts (Bank + E-Wallet + Cash), formatted in Rupiah with thousand-separator dots.
- Tapping the hero card expands a per-account breakdown modal.
- Balance updates in real-time as transactions are added.

#### AI Pacing Widget (Weekly Safe-to-Spend)

- Displays the remaining discretionary budget for the current week.
- Color-coded status ring: **Green** (> 50% remaining), **Yellow** (20–50% remaining), **Red** (< 20% remaining).
- Recalculates daily at midnight based on all Expense transactions tagged as *Wants*.
- Tapping the widget opens a weekly spending breakdown chart.

#### Quick Add Templates

- A horizontally scrollable row of template shortcut buttons (e.g., Coffee, Gas, Lunch, Gojek).
- Each template pre-fills category, default amount (optional), and source account.
- One tap opens a minimal confirmation sheet; user adjusts amount and confirms in under 2 seconds.
- Templates are user-configurable: create, rename, reorder, and delete from Settings.

#### Recent Transactions Feed

- Displays the last 5–10 transactions with icon, label, amount, and relative timestamp.
- Swipe-left gesture on a transaction to delete; tap to open the edit form.

---

### 6.2 Multi-Account Management & Reconciliation

#### Account Management

- Supported account types: Cash, Bank (BCA, Mandiri, etc.), E-Wallet (GoPay, OVO, etc.), Credit Card.
- Each account stores: name, type, color tag, currency (IDR only), and initial balance.
- Accounts listing page shows current balance and last-updated timestamp per account.
- Accounts can be archived (hidden from dashboard totals) but not permanently deleted if linked to transactions.

#### Balance Reconciliation

- Triggered from any account's detail screen via a **Reconcile** button.
- User enters the actual current balance from their bank app or statement.
- App calculates and displays the discrepancy (App Balance vs. Actual Balance).
- If a discrepancy exists, an auto-adjustment transaction (category: *Reconciliation Adjustment*) is created to correct the ledger.
- All reconciliation events are stored in `account_reconciliations` with timestamp and adjustment amount.

---

### 6.3 Core Transaction Recording

#### Transaction Types

| Type | Effect |
|---|---|
| **Income** | Increases the balance of the target account. |
| **Expense** | Decreases the balance of the target account. |
| **Transfer** | Debits one account and credits another. Net worth is unchanged. |

#### Transaction Fields

| Field | Required | Notes |
|---|---|---|
| Type | ✅ | Income / Expense / Transfer |
| Amount | ✅ | |
| Date & Time | ✅ | Defaults to now; fully editable. |
| Category | ✅ | Required for Income and Expense; not applicable for Transfer. |
| Account | ✅ | Source account; plus destination account for Transfer. |
| Note / Merchant | ❌ | Optional free text. |
| Linked Debt | ❌ | Optional attachment to a Debt or Receivable record. |

#### Entry Modes

- **Quick Add (via Template):** 2-field confirmation sheet. All other fields pre-filled from template.
- **Full Form:** All fields available, accessible via the FAB (+) button.

---

### 6.4 Custom Categories

- A default set of categories is seeded on first launch (Food & Drink, Transport, Shopping, Health, Entertainment, Salary, Business Income, etc.).
- Users can create categories with a name, icon (emoji or icon set), and direction (Income or Expense).
- Categories can be edited or soft-deleted. Deleting prompts bulk reassignment of linked transactions.
- Categories are referenced in budget allocation, AI insights, calendar, and reports.

---

### 6.5 Debt & Receivable Management

#### Recording Debts and Receivables

- **Debt:** Money the user owes to another party (*I owe*).
- **Receivable:** Money owed to the user by another party (*Owed to me*).
- Fields: counterparty name, direction, principal amount, start date, due date, interest rate (optional), installment schedule, notes, and linked account.

#### Payment History

- Each debt or receivable has a `DebtPayment` log.
- Recording a payment automatically creates a corresponding transaction in the linked account.
- Outstanding balance is auto-calculated as principal minus the sum of all payments.

#### Debt Manager View

- Dedicated screen with two tabs: **I Owe** (Debts) and **Owed to Me** (Receivables).
- Each card displays counterparty name, outstanding balance, next installment date, and a repayment progress bar.
- Overdue items are visually highlighted in red with an overdue badge.
- Push notification sent D-1 and on the due date for each upcoming installment.

---

### 6.6 AI Budgeting & Smart Allocation (50/30/20)

This feature replaces a manual budget system. It is triggered automatically when the user records an Income transaction above a configurable minimum threshold (default: Rp 500,000).

#### Allocation Flow

1. On income entry, the AI receives: income amount, debts with installments due this month, recurring fixed expenses, and the user's preferred split ratio (default 50/30/20, configurable).
2. AI first deducts debt installments due this month from the **Needs** bucket.
3. AI then allocates remaining income across **Needs**, **Wants**, and **Savings**.
4. User receives a summary card: income received, amounts per bucket, and a note on any debt deductions.
5. User can accept the AI allocation or manually adjust the split before confirming.
6. Confirmed allocations become the budget baseline driving the AI Pacing Widget.

#### Budget Progress Screen

- Dedicated Budget screen showing real-time progress bars per bucket (Needs, Wants, Savings).
- Drill-down per bucket to see individual category spend vs. allocated amount.

---

### 6.7 AI Reports & Insights

#### Monthly Graphical Report

- Income vs. Expense grouped bar chart comparing the last 6 months.
- Expense breakdown donut chart by category for the selected month.
- Net savings trend line chart.
- Debt repayment progress summary panel.

#### AI Insights Panel

- 2–4 sentence natural-language commentary generated by AI, surfaced as a card on the Reports screen.
- Example: *"Your GoFood spending rose 15% this month. With only Rp 100,000 left in your Wants budget, consider cooking at home this week."*
- Insights are generated server-side once per day (cron) and cached in `ai_insights` to avoid redundant API calls.
- Insight types: Spending Pattern, Budget Warning, Positive Reinforcement, Debt Reminder.
- User can thumbs-up or thumbs-down an insight to provide feedback for future prompt iteration.

#### Transaction Calendar View

- Monthly calendar where each date cell shows the total spend for that day.
- Color intensity reflects relative spending (light blue = low, deep blue = high).
- Tapping a date expands an inline list of individual transactions for that day.

---

### 6.8 Financial Reports & PDF Export

- User selects a custom date range and applies account or category filters.
- Generated PDF includes: cover page with date range and account summary, full transaction list, income vs. expense summary, category breakdown chart, and debt status overview.
- PDF is rendered server-side for consistent formatting and downloaded directly to the device.
- Report layout follows the Motrac design system: blue undertone, clean typography, white card sections.

---

## 7. Database Schema Overview

All tables include standard columns: `id` (UUID, primary key), `user_id` (FK to `auth.users`, Row-Level Security enforced), `created_at`, and `updated_at`.

| Table | Key Columns | Purpose |
|---|---|---|
| `accounts` | name, type, balance, currency, color, is_archived | User wallets: cash, bank, e-wallet, credit card. |
| `transactions` | type, amount, date, category_id, account_id, to_account_id, note, debt_id | Core ledger. `to_account_id` is populated for Transfer type. |
| `categories` | name, icon, type (income/expense), is_default | User-customizable transaction groupings. |
| `debts` | direction, counterparty, principal, due_date, interest_rate, account_id | Debt and receivable records. |
| `debt_payments` | debt_id, amount, paid_at, transaction_id | Installment payment history; each row links to a transaction. |
| `account_reconciliations` | account_id, actual_balance, app_balance, adjustment, reconciled_at | Audit log of all reconciliation events. |
| `budgets` | month, needs_amount, wants_amount, savings_amount, income_ref | AI-generated monthly budget per user. |
| `templates` | name, icon, category_id, account_id, default_amount, sort_order | Quick Add Template definitions. |
| `ai_insights` | type, content, period, thumbs_up, thumbs_down, generated_at | Cached AI insight texts with feedback signals. |

---

## 8. UX & Design System

### 8.1 Visual Language

- **Color Palette:** White / light grey (`#F5F7FA`) backgrounds · Primary blue (`#1A6FD6`) · Accent (`#2196F3`) · Near-black text (`#333333`).
- **Typography:** Clean sans-serif (Inter or System UI). Sizes: 32px titles, 20px section headers, 15px body copy.
- **Layout:** Floating white cards with subtle drop shadows on a light grey canvas.
- **Iconography:** Outline-style icons, 2px consistent stroke, blue tint on active / selected states.

### 8.2 Navigation Structure

| Platform | Pattern |
|---|---|
| Mobile | Bottom tab bar: Home · Accounts · Add (+) · Reports · Settings |
| Desktop Web | Collapsible left sidebar with the same top-level sections |
| FAB (+) | Persistent floating button; opens a transaction type selector sheet |

### 8.3 Responsive Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | < 768px | Single column, bottom navigation bar |
| Tablet | 768px – 1024px | Two-column layout, bottom navigation retained |
| Desktop | > 1024px | Sidebar navigation, three-column dashboard grid |

### 8.4 Accessibility

- WCAG 2.1 AA compliance target.
- All interactive elements: minimum 44×44px touch target.
- Color is never the sole indicator of state; icons and text labels accompany all color signals.
- Screen reader support for all critical flows (add transaction, view balance, check budget).

---

## 9. Non-Functional Requirements

| Category | Requirement | Target / Detail |
|---|---|---|
| Performance | Initial page load (web) | < 2s on 4G (Largest Contentful Paint) |
| Performance | Transaction save latency | < 300ms via optimistic UI update |
| Availability | Service uptime SLA | 99.5% (Vercel + Supabase managed infrastructure) |
| Security | Data isolation | Supabase RLS enforced on every table; cross-user data access is impossible |
| Security | AI API key exposure | Keys stored as Vercel environment secrets; never sent to client |
| Privacy | Data sent to AI provider | Only aggregated category totals — no raw notes, names, or account numbers |
| Offline (PWA) | Offline mode | Not supported in v1.0. App requires an active internet connection. Graceful error state shown when offline. |
| Scalability | Transactions per user | Schema and indexes must sustain > 100,000 rows per user without degradation |

---

## 10. Notification Strategy

| Trigger | Channel | Timing |
|---|---|---|
| Debt installment due | Push notification | D-1 and on the due date |
| Wants budget > 80% spent | Push notification | Real-time threshold breach |
| Monthly AI insights ready | In-app badge + optional push | On cron job completion |
| Reconciliation nudge | In-app prompt | Weekly, for high-volume accounts |

> All notifications are **opt-in per type** and fully configurable in **Settings → Notifications**.

---

## 11. AI Feature Design

### 11.1 Provider Architecture

Motrac uses the **Google Gemini API** as its AI provider. All AI calls are routed through a single internal API route (`/api/ai/[feature]`) on Vercel Edge Functions, keeping the Gemini API key server-side at all times. This proxy layer also makes it straightforward to swap models within the Gemini family (e.g., from `gemini-1.5-flash` to `gemini-1.5-pro`) without any frontend changes.

### 11.2 AI Features at a Glance

| Feature | Input to AI | Expected Output |
|---|---|---|
| **Weekly Pacing** | Wants budget, Wants spend this week, days remaining | Safe-to-Spend amount + status color (green/yellow/red) |
| **50/30/20 Allocation** | Income amount, debts due this month, preferred split ratio | Allocation amounts per bucket + brief narrative summary |
| **Monthly Insights** | Category spending totals (current vs. prior month) + budget adherence | 2–4 sentence narrative with insight type tag |

### 11.3 Cost Management

- Insights are generated by a server-side cron job (once per day maximum) — not on every page load.
- The Pacing Widget is recalculated on-device using arithmetic only — **no AI call per refresh**.
- The 50/30/20 allocation is called once per income transaction, keeping it low-frequency.
- AI responses are cached in `ai_insights` with a TTL; the stale cache is served while a fresh response generates in the background.

---

## 12. Open Questions

All previously open questions have been resolved. No blocking decisions remain for v1.0.

| # | Question | Decision | Status |
|---|---|---|---|
| 1 | Which AI provider for v1.0? | **Google Gemini API** | ✅ Resolved |
| 2 | Mobile strategy: Expo or separate native codebases? | **Expo (React Native)** | ✅ Resolved |
| 3 | App name? | **Motrac** (Money Tracker) | ✅ Resolved |
| 4 | PWA offline-first or online-only? | **Online-only** with graceful error state | ✅ Resolved |
| 5 | Currency scope in v1.0? | **IDR only** — multi-currency deferred to v2 | ✅ Resolved |
| 6 | Authentication providers? | **Email/Password + Google OAuth** — no Apple Sign-In in v1.0 | ✅ Resolved |

---

## 13. Glossary

| Term | Definition |
|---|---|
| **Safe-to-Spend** | The remaining discretionary budget for the current week, calculated as weekly Wants allocation minus Wants spend to date. |
| **Reconciliation** | The process of aligning the app ledger balance with an actual bank or wallet balance, creating an adjustment entry for any discrepancy. |
| **50/30/20** | A budgeting framework allocating 50% of income to Needs, 30% to Wants, and 20% to Savings. Split ratios are user-configurable in Motrac. |
| **Transfer** | A transaction moving funds between two accounts owned by the same user. Does not affect total net worth. |
| **Quick Add Template** | A pre-configured home screen shortcut for a recurring expense (e.g., Coffee), enabling single-tap transaction logging. |
| **Debt** | In Motrac: money the user owes to another party (accounts payable). |
| **Receivable** | In Motrac: money owed to the user by another party (accounts receivable). |
| **RLS** | Row-Level Security — a PostgreSQL feature ensuring each user can only read and write their own data rows. |
| **FAB** | Floating Action Button — the persistent `+` button used to open the transaction entry form. |

---

*— End of Document — Motrac PRD v1.0 · © 2026 Motrac. All rights reserved.*
