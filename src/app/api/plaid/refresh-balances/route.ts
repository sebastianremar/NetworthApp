import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { plaidAdapter } from "@/lib/banking/plaid-adapter";

export const dynamic = "force-dynamic";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all PlaidItems for this user
  const plaidItems = await db.plaidItem.findMany({
    where: { userId },
    include: { accounts: true },
  });

  if (plaidItems.length === 0) {
    return NextResponse.json(
      { error: "No connected accounts found" },
      { status: 404 }
    );
  }

  const updatedAccounts = [];
  const errors = [];

  // Refresh balances for each PlaidItem
  for (const item of plaidItems) {
    try {
      const freshBalances = await plaidAdapter.getBalances(item.accessToken);

      // Update each account with fresh balance data
      for (const freshAccount of freshBalances) {
        const existingAccount = item.accounts.find(
          (acc) => acc.plaidAccountId === freshAccount.id
        );

        if (existingAccount) {
          const updated = await db.account.update({
            where: { id: existingAccount.id },
            data: {
              currentBalance: freshAccount.currentBalance,
              availableBalance: freshAccount.availableBalance,
              updatedAt: new Date(),
            },
          });

          // Record balance history
          await db.balanceHistory.create({
            data: {
              accountId: existingAccount.id,
              balance: freshAccount.currentBalance ?? 0,
            },
          });

          updatedAccounts.push({
            id: updated.id,
            name: updated.name,
            currentBalance: updated.currentBalance,
            institutionName: item.institutionName,
          });
        }
      }
    } catch (error) {
      console.error(`Failed to refresh balances for item ${item.id}:`, error);
      errors.push({
        itemId: item.id,
        institutionName: item.institutionName,
        error: "Failed to refresh balances",
      });
    }
  }

  return NextResponse.json({
    success: true,
    updatedCount: updatedAccounts.length,
    updatedAccounts,
    errors: errors.length > 0 ? errors : undefined,
  });
}
