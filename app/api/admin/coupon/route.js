import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/admin/coupon — list all coupons
export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, coupons });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/admin/coupon — add a coupon
export async function POST(req) {
  try {
    const body = await req.json();
    const { code, description, discount, forNewUser, forMember, isPublic, expiresAt } = body;

    if (!code || !description || discount === undefined || !expiresAt) {
      return NextResponse.json({ success: false, message: "code, description, discount and expiresAt are required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        description,
        discount: parseFloat(discount),
        forNewUser: !!forNewUser,
        forMember: !!forMember,
        isPublic: !!isPublic,
        expiresAt: new Date(expiresAt),
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json({ success: false, message: "Coupon code already exists" }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/coupon?code=SAVE10
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ success: false, message: "Coupon code is required" }, { status: 400 });
    }

    await prisma.coupon.delete({ where: { code } });
    return NextResponse.json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
