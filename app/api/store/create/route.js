import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST /api/store/create
export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, name, username, description, email, contact, address, logo } = body;

    if (!userId || !name || !username || !email || !contact || !address || !logo) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
    }

    const existing = await prisma.store.findFirst({
      where: { OR: [{ userId }, { username }] },
    });
    if (existing) {
      return NextResponse.json({ success: false, message: "Store already exists for this user or username is taken" }, { status: 409 });
    }

    const store = await prisma.store.create({
      data: { userId, name, username, description, email, contact, address, logo },
    });

    return NextResponse.json({ success: true, store });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
