import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST /api/rating/add
export async function POST(req) {
  try {
    const { userId, productId, orderId, rating, review } = await req.json();

    if (!userId || !productId || !orderId || !rating) {
      return NextResponse.json({ success: false, message: "userId, productId, orderId and rating are required" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, message: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const created = await prisma.rating.create({
      data: {
        userId,
        productId,
        orderId,
        rating: parseInt(rating),
        review: review || "",
      },
    });

    return NextResponse.json({ success: true, rating: created });
  } catch (error) {
    // Unique constraint: user already rated this product for this order
    if (error.code === "P2002") {
      return NextResponse.json({ success: false, message: "You already rated this product" }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
