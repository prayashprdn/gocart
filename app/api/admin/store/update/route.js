import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// PATCH /api/admin/store/update  { storeId, status?, isActive? }
export async function PATCH(req) {
  try {
    const { storeId, status, isActive } = await req.json();

    if (!storeId) {
      return NextResponse.json({ success: false, message: "storeId is required" }, { status: 400 });
    }

    const data = {};
    if (status !== undefined) data.status = status;
    if (isActive !== undefined) data.isActive = isActive;

    // When approving, also activate the store
    if (status === "approved") data.isActive = true;
    if (status === "rejected") data.isActive = false;

    const store = await prisma.store.update({ where: { id: storeId }, data });
    return NextResponse.json({ success: true, store });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
