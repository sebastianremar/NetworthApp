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
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Connected Accounts
            </h3>
            <PlaidLinkButton onSuccess={handlePlaidSuccess} />
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
