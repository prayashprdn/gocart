import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/order/list?userId=xxx
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "userId is required" }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId },
          { userId: "USER_ID" },
        ],
      },
      include: {
        address: true,
        orderItems: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
