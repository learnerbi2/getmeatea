// app/api/payment/success/route.js
import Stripe from "stripe"
import connectDb from "@/db/connectDb"
import Payment from "@/models/Payments"
import { NextResponse } from "next/server"

const stripe = new Stripe(process.env.KEY_SECRET)

export const GET = async (req) => {
    await connectDb()

    // -------------------------------------------------------
    // STEP 1: Get session_id from URL query param
    // -------------------------------------------------------
    const { searchParams } = new URL(req.url)
    const session_id = searchParams.get("session_id")

    if (!session_id) {
        return NextResponse.json(
            { success: false, message: "Session ID missing" },
            { status: 400 }
        )
    }

    // -------------------------------------------------------
    // STEP 2: Verify payment with Stripe directly
    // -------------------------------------------------------
    let session
    try {
        session = await stripe.checkout.sessions.retrieve(session_id)
    } catch (err) {
        return NextResponse.json(
            { success: false, message: "Invalid session ID" },
            { status: 400 }
        )
    }

    // -------------------------------------------------------
    // STEP 3: Check payment status returned by Stripe
    // -------------------------------------------------------
    if (session.payment_status !== "paid") {
        return NextResponse.json(
            { success: false, message: "Payment not completed" },
            { status: 402 }
        )
    }

    // -------------------------------------------------------
    // STEP 4: Find payment record in DB
    // -------------------------------------------------------
    const payment = await Payment.findOne({ oid: session_id })
    if (!payment) {
        return NextResponse.json(
            { success: false, message: "Payment record not found" },
            { status: 404 }
        )
    }

    // -------------------------------------------------------
    // STEP 5: Mark as done (only if not already done)
    // -------------------------------------------------------
    if (!payment.done) {
        await Payment.findOneAndUpdate(
            { oid: session_id },
            { done: true },
            { new: true }
        )
    }

    // -------------------------------------------------------
    // STEP 6: Redirect to campaign page with success param
    // -------------------------------------------------------
    const to_user = session.metadata.to_user
    return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/${to_user}?paymentdone=true`
    )
}