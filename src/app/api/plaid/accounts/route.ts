import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const accounts = await db.account.findMany({
      where: { userId },
      include: {
        plaidItem: {
          select: {
            institutionName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate totals
    const assets = accounts
      .filter((a) => a.type === "depository" || a.type === "investment")
      .reduce((sum, a) => sum + (a.currentBalance || 0), 0);

    const liabilities = accounts
      .filter((a) => a.type === "credit" || a.type === "loan")
      .reduce((sum, a) => sum + Math.abs(a.currentBalance || 0), 0);

    const networth = assets - liabilities;

    return NextResponse.json({
      accounts: accounts.map((a) => ({
        id: a.id,
        name: a.name,
        officialName: a.officialName,
        type: a.type,
        subtype: a.subtype,
        mask: a.mask,
        currentBalance: a.currentBalance,
        availableBalance: a.availableBalance,
        institutionName: a.plaidItem.institutionName,
      })),
      summary: {
        assets,
        liabilities,
        networth,
        accountCount: accounts.length,
      },
    });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}
