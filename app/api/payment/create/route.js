// app/api/payment/create/route.js
import Stripe from "stripe";
import connectDb from "@/db/connectDb";
import Payment from "@/models/Payments";
import User from "@/models/Users";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.KEY_SECRET);

export const POST = async (req) => {
  await connectDb();

  const { amount, to_user, name, message } = await req.json();

  // 1. Check if the user exists
  const user = await User.findOne({ username: to_user });
  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  // 2. Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: `Pledge to ${to_user}`,
            description: message || "Thank you for your support!",
          },
          unit_amount: amount * 100, // convert to paise
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_URL}/${to_user}?paymentdone=true`,
    cancel_url:  `${process.env.NEXT_PUBLIC_URL}/${to_user}?paymentcancelled=true`,
    metadata: { to_user, name, message }, 
  });

  // 3. Save pending payment to DB
  await Payment.create({
    oid:     session.id,
    to_user,
    amount,
    name:    name || "Anonymous",
    message: message || "",
    done:    false,
  });

  // 4. Return session URL to frontend
  return NextResponse.json({ success: true, url: session.url });
};