import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Welcome back, {user?.firstName || "there"}!
        </h2>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Here&apos;s your financial overview
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Total Networth
          </p>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            $0.00
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Connect accounts to get started
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Assets
          </p>
          <p className="mt-2 text-3xl font-bold text-green-600">$0.00</p>
          <p className="mt-1 text-sm text-zinc-500">0 accounts</p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Liabilities
          </p>
          <p className="mt-2 text-3xl font-bold text-red-600">$0.00</p>
          <p className="mt-1 text-sm text-zinc-500">0 accounts</p>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-zinc-600 dark:text-zinc-400">
          No accounts connected yet. Connect your first bank account to start
          tracking your networth.
        </p>
        <button className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
          Connect Bank Account
        </button>
      </div>
    </div>
  );
}
