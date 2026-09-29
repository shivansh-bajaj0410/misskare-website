import { NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(req) {
  const body = await req.json();
  const { items, email, shipping, discount = 0, promoCode = null } = body;

  if (!items?.length) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }
  if (!email || !shipping?.name || !shipping?.line1 || !shipping?.city) {
    return NextResponse.json({ error: "Missing shipping details." }, { status: 400 });
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const total = subtotal - discount;
  const session = getSessionUser();

  try {
    const razorpay = getRazorpay();

    // Razorpay amounts are in the smallest currency unit (paise for INR).
    const razorpayOrder = await razorpay.orders.create({
      amount: total * 100,
      currency: "INR",
      receipt: `misskare_${Date.now()}`,
      notes: { email, promoCode: promoCode || "" },
    });

    const order = await prisma.order.create({
      data: {
        userId: session?.sub || null,
        email,
        status: "pending",
        razorpayOrderId: razorpayOrder.id,
        subtotal,
        discount,
        total,
        promoCode,
        shippingName: shipping.name,
        shippingLine1: shipping.line1,
        shippingLine2: shipping.line2 || null,
        shippingCity: shipping.city,
        shippingState: shipping.state,
        shippingPostal: shipping.postal,
        shippingCountry: shipping.country || "India",
        items: {
          create: items.map((i) => ({
            productId: i.id,
            name: i.name,
            size: i.size,
            color: i.color,
            price: i.price,
            qty: i.qty,
          })),
        },
      },
    });

    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      dbOrderId: order.id,
      email,
      name: shipping.name,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Could not start checkout." },
      { status: 500 }
    );
  }
}
