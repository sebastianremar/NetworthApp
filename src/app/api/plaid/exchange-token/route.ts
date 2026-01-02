import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { plaidAdapter } from "@/lib/banking/plaid-adapter";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { publicToken } = await request.json();

    if (!publicToken) {
      return NextResponse.json(
        { error: "Missing public token" },
        { status: 400 }
      );
    }

    // Exchange token and get accounts from Plaid
    const result = await plaidAdapter.exchangePublicToken(publicToken);

    // Save PlaidItem and Accounts to database
    const plaidItem = await db.plaidItem.create({
      data: {
        userId,
        accessToken: result.accessToken,
        itemId: result.itemId,
        institutionId: result.institutionId,
        institutionName: result.institutionName,
        accounts: {
          create: result.accounts.map((acc) => ({
            userId,
            plaidAccountId: acc.id,
            name: acc.name,
            officialName: acc.officialName,
            type: acc.type,
            subtype: acc.subtype,
            mask: acc.mask,
            currentBalance: acc.currentBalance,
            availableBalance: acc.availableBalance,
            isoCurrencyCode: acc.isoCurrencyCode,
          })),
        },
      },
      include: {
        accounts: true,
      },
    });

    return NextResponse.json({
      success: true,
      institutionName: result.institutionName,
      accountCount: plaidItem.accounts.length,
    });
  } catch (error) {
    console.error("Error exchanging token:", error);
    return NextResponse.json(
      { error: "Failed to connect bank account" },
      { status: 500 }
    );
  }
}
