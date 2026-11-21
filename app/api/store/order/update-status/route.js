import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// PATCH /api/store/order/update-status  { orderId, status }
export async function PATCH(req) {
  try {
    const { orderId, status } = await req.json();

    const validStatuses = ["ORDER_PLACED", "PROCESSING", "SHIPPED", "DELIVERED"];
    if (!orderId || !validStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: "Valid orderId and status are required" }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
