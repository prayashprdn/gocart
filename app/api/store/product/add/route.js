import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST /api/store/product/add
export async function POST(req) {
  try {
    const body = await req.json();
    const { storeId, name, description, mrp, price, category, images } = body;

    if (!storeId || !name || !description || !mrp || !price || !category || !images?.length) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        storeId,
        name,
        description,
        mrp: parseFloat(mrp),
        price: parseFloat(price),
        category,
        images,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
