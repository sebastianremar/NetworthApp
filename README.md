# NetworthApp

A personal networth tracking application that connects to your bank accounts and provides a unified view of your financial health.

## What We're Building

### Tech Stack

- **Frontend/Backend:** Next.js (App Router)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** Clerk
- **Banking Integration:** Plaid (behind abstraction layer)
- **UI Library:** shadcn/ui + Tailwind CSS
- **Deployment:** Vercel + Railway/Supabase (DB)

### Architecture Decisions

- **Banking Service Abstraction:** All bank integrations go through a `BankingService` interface. This allows us to swap Plaid for another provider (Teller, Yodlee, etc.) without touching app logic.

### Major Components

1. **Auth System** - User signup/login via Clerk
2. **BankingService Interface** - Abstract contract for bank integrations
3. **PlaidAdapter** - Plaid implementation of BankingService
4. **Account Sync Service** - Fetches and stores balances/transactions
5. **Networth Calculator** - Aggregates assets minus liabilities
6. **Dashboard UI** - Visualizes networth over time, accounts breakdown
7. **Scheduled Jobs** - Refreshes balances periodically

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.
