import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { plaidAdapter } from "@/lib/banking/plaid-adapter";

export const dynamic = "force-dynamic";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const linkToken = await plaidAdapter.createLinkToken(userId);
    return NextResponse.json({ linkToken });
  } catch (error) {
    console.error("Error creating link token:", error);
    return NextResponse.json(
      { error: "Failed to create link token" },
      { status: 500 }
    );
  }
}
