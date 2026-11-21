import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/store/dashboard?storeId=xxx
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json({ success: false, message: "storeId is required" }, { status: 400 });
    }

    const [totalProducts, orders, ratings] = await Promise.all([
      prisma.product.count({ where: { storeId } }),
      prisma.order.findMany({ where: { storeId }, select: { total: true } }),
      prisma.rating.findMany({
        where: { product: { storeId } },
        include: { user: true, product: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const totalEarnings = orders.reduce((sum, o) => sum + o.total, 0);

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        totalEarnings,
        totalOrders: orders.length,
        ratings,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
