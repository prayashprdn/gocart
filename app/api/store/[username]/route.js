import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/store/:username — public store page data
export async function GET(req, { params }) {
  try {
    const { username } = await params;
    const store = await prisma.store.findUnique({
      where: { username },
      include: {
        Product: {
          where: { inStock: true },
          include: { rating: { include: { user: true } } },
        },
      },
    });

    if (!store) {
      return NextResponse.json({ success: false, message: "Store not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, store, products: store.Product });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
