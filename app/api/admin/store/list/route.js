import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/admin/store/list?status=pending  (or approved, or omit for all)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const stores = await prisma.store.findMany({
      where: status ? { status } : undefined,
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, stores });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
