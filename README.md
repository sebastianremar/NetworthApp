# NetworthApp

A personal networth tracking application that connects to your bank accounts and provides a unified view of your financial health.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Clerk account
- Plaid account (sandbox is free)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Database
DATABASE_URL="postgresql://..."

# Plaid
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
PLAID_ENV=sandbox
```

### Installation

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Testing with Plaid Sandbox

Use these test credentials when connecting a bank:
- **Institution:** Search for "Platypus" or "First Platypus Bank"
- **Username:** `user_good`
- **Password:** `pass_good`

## Next Steps

### High Priority
- [ ] **Balance Refresh** - Add button to refresh account balances from Plaid
- [ ] **Networth Chart** - Visualize networth over time using BalanceHistory
- [ ] **Disconnect Bank** - Allow users to remove connected institutions

### Medium Priority
- [ ] **Manual Accounts** - Add assets Plaid doesn't support (crypto, real estate, vehicles)
- [ ] **Account Categories** - Group accounts by type with custom labels
- [ ] **Multiple Institution UI** - Better display when multiple banks connected

### Polish
- [ ] **Dark Mode Toggle** - Add theme switcher in header
- [ ] **Loading States** - Skeleton loaders and toast notifications
- [ ] **Error Handling** - Better error messages and retry logic

### Future
- [ ] **Scheduled Sync** - Cron job to track balance history daily
- [ ] **Goals** - Set and track networth targets
- [ ] **Insights** - Spending patterns and trends
- [ ] **Export** - Download data as CSV/PDF
