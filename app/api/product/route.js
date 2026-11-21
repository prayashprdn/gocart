import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/product — fetch all in-stock products with store & ratings
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { inStock: true, store: { isActive: true } },
      include: { store: true, rating: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
