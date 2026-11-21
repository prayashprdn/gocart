import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/store/status?userId=xxx — get a store's status for the given user
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "userId is required" }, { status: 400 });
    }

    // 1. Check if store exists for this user directly
    let store = await prisma.store.findUnique({ where: { userId } });

    // 2. Fallback to check if a demo store exists
    if (!store) {
      store = await prisma.store.findFirst({
        where: {
          OR: [
            { userId: "USER_ID" },
            { id: "seller_1" },
          ],
        },
      });
    }

    return NextResponse.json({ success: true, store });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
