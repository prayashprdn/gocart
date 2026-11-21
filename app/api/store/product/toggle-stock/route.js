import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// PATCH /api/store/product/toggle-stock  { productId }
export async function PATCH(req) {
  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ success: false, message: "productId is required" }, { status: 400 });
    }

    const current = await prisma.product.findUnique({ where: { id: productId } });
    if (!current) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { inStock: !current.inStock },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
