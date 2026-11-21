import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST /api/order/create
// Accepts either addressId (existing DB address) OR a full address object.
// Also upserts the user so the app works before full auth is wired up.
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      userId,         // string — real user id from auth (or placeholder)
      userInfo,       // { name, email, image? } — used to upsert a placeholder user
      storeId,
      addressId,      // pass this if address is already in the DB
      address,        // pass this full object if address is NOT yet in the DB
      items,          // [{ productId, quantity, price }]
      total,
      paymentMethod,  // "COD" | "STRIPE"
      coupon,         // { code, discount } | null
    } = body;

    if (!userId || !storeId || !items?.length || !total || !paymentMethod) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    if (!addressId && !address) {
      return NextResponse.json({ success: false, message: "Provide addressId or a full address object" }, { status: 400 });
    }

    // 1. Upsert the user so the FK is always satisfied (pre-auth phase)
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        name: userInfo?.name ?? "Guest",
        email: userInfo?.email ?? `${userId}@gocart.local`,
        image: userInfo?.image ?? "",
      },
    });

    // 1b. Ensure the store (and its owner) exist — handles dummy/placeholder storeIds
    const storeExists = await prisma.store.findUnique({ where: { id: storeId } });
    if (!storeExists) {
      const sellerUserId = `seller_owner_${storeId}`;
      await prisma.user.upsert({
        where: { id: sellerUserId },
        update: {},
        create: {
          id: sellerUserId,
          name: "Store Owner",
          email: `${sellerUserId}@gocart.local`,
          image: "",
        },
      });
      await prisma.store.create({
        data: {
          id: storeId,
          userId: sellerUserId,
          name: "Demo Store",
          description: "Auto-created placeholder store",
          username: `store_${storeId}`,
          address: "Demo Address",
          logo: "",
          email: `${storeId}@gocart.local`,
          contact: "0000000000",
          status: "approved",
          isActive: true,
        },
      });
    }

    // 2. Resolve the address — use existing id or create a new address row
    let resolvedAddressId = addressId;
    if (!resolvedAddressId) {
      const created = await prisma.address.create({
        data: {
          userId,
          name: address.name,
          email: address.email,
          street: address.street,
          city: address.city,
          state: address.state,
          zip: String(address.zip),
          country: address.country,
          phone: String(address.phone),
        },
      });
      resolvedAddressId = created.id;
    }

    // 3. Upsert each product so the OrderItem FK is satisfied (handles dummy product IDs)
    for (const item of items) {
      // Next.js static image imports are objects {src, width, height, ...} — extract just the URL string
      const imageUrls = (item.images ?? []).map((img) =>
        typeof img === "string" ? img : img?.src ?? ""
      ).filter(Boolean);

      await prisma.product.upsert({
        where: { id: item.productId },
        update: {},
        create: {
          id: item.productId,
          storeId,
          name: item.name ?? "Product",
          description: item.description ?? "",
          mrp: parseFloat(item.price),
          price: parseFloat(item.price),
          category: item.category ?? "Others",
          images: imageUrls,
        },
      });
    }

    // 4. Create the order
    const order = await prisma.order.create({
      data: {
        userId,
        storeId,
        addressId: resolvedAddressId,
        total: parseFloat(total),
        paymentMethod,
        isCouponUsed: !!coupon?.code,
        coupon: coupon ?? {},
        orderItems: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: parseInt(item.quantity),
            price: parseFloat(item.price),
          })),
        },
      },
      include: {
        orderItems: { include: { product: true } },
        address: true,
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
