import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST /api/address/add
export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, name, email, street, city, state, zip, country, phone } = body;

    if (!userId || !name || !email || !street || !city || !state || !zip || !country || !phone) {
      return NextResponse.json({ success: false, message: "All address fields are required" }, { status: 400 });
    }

    const address = await prisma.address.create({
      data: { userId, name, email, street, city, state, zip, country, phone },
    });

    return NextResponse.json({ success: true, address });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
