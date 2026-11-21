import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST /api/user/sync  — called after Clerk sign-in to upsert the user into our DB
export async function POST(req) {
  try {
    const { id, name, email, image } = await req.json();

    if (!id || !email) {
      return NextResponse.json({ success: false, message: "id and email are required" }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { id },
      update: { name: name ?? "", email, image: image ?? "" },
      create: { id, name: name ?? "", email, image: image ?? "" },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
