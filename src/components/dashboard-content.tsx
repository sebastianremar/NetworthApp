"use client";

import { useState, useEffect, useCallback } from "react";
import { PlaidLinkButton } from "./plaid-link-button";

interface Account {
  id: string;
  name: string;
  officialName: string | null;
  type: string;
  subtype: string | null;
  mask: string | null;
  currentBalance: number | null;
  institutionName: string | null;
}

interface Summary {
  assets: number;
  liabilities: number;
  networth: number;
  accountCount: number;
}

interface DashboardContentProps {
  userName: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function DashboardContent({ userName }: DashboardContentProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summary, setSummary] = useState<Summary>({
    assets: 0,
    liabilities: 0,
    networth: 0,
    accountCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await fetch("/api/plaid/accounts");
      const data = await response.json();
      if (data.accounts) {
        setAccounts(data.accounts);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handlePlaidSuccess = () => {
    fetchAccounts();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/plaid/refresh-balances", {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        setLastRefreshed(new Date());
        await fetchAccounts();
      }
    } catch (error) {
      console.error("Failed to refresh balances:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Welcome back, {userName}!
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
            {formatCurrency(summary.networth)}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {summary.accountCount} account{summary.accountCount !== 1 ? "s" : ""} connected
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Assets
          </p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {formatCurrency(summary.assets)}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {accounts.filter((a) => a.type === "depository" || a.type === "investment").length} accounts
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Liabilities
          </p>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {formatCurrency(summary.liabilities)}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {accounts.filter((a) => a.type === "credit" || a.type === "loan").length} accounts
          </p>
        </div>
      </div>

      {accounts.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Connected Accounts
              </h3>
              {lastRefreshed && (
                <p className="text-xs text-zinc-500">
                  Last refreshed: {lastRefreshed.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                <svg
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
              <PlaidLinkButton onSuccess={handlePlaidSuccess} />
            </div>
          </div>
          <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {account.name}
                    {account.mask && (
                      <span className="ml-2 text-zinc-500">••••{account.mask}</span>
                    )}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {account.institutionName} • {account.subtype || account.type}
                  </p>
                </div>
                <p
                  className={`text-lg font-semibold ${
                    account.type === "credit" || account.type === "loan"
                      ? "text-red-600"
                      : "text-zinc-900 dark:text-zinc-100"
                  }`}
                >
                  {formatCurrency(account.currentBalance || 0)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-zinc-600 dark:text-zinc-400">
            No accounts connected yet. Connect your first bank account to start
            tracking your networth.
          </p>
          <div className="mt-4">
            <PlaidLinkButton onSuccess={handlePlaidSuccess} />
          </div>
        </div>
      )}
    </div>
  );
}
