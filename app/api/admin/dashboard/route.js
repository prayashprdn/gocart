import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/admin/dashboard
export async function GET() {
  try {
    const [products, stores, orders] = await Promise.all([
      prisma.product.count(),
      prisma.store.count({ where: { isActive: true } }),
      prisma.order.findMany({ select: { total: true, createdAt: true } }),
    ]);

    const revenue = orders.reduce((sum, o) => sum + o.total, 0);

    return NextResponse.json({
      success: true,
      data: {
        products,
        stores,
        orders: orders.length,
        revenue,
        allOrders: orders,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
