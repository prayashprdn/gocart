import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/coupon/check?code=SAVE10
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ success: false, message: "Coupon code is required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({ where: { code } });

    if (!coupon) {
      return NextResponse.json({ success: false, message: "Invalid coupon code" }, { status: 404 });
    }

    if (new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ success: false, message: "Coupon has expired" }, { status: 400 });
    }

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
