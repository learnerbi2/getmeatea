
"use server"
import Stripe from "stripe"
import Payment from "@/models/Payments"
import User from "@/models/Users"
import connectDb from "@/db/connectDb"
import { createOpportunity } from "@/lib/salesforce"

const stripe = new Stripe(process.env.KEY_SECRET)

// -------------------------------------------------------
// FETCH USER — by email or username
// -------------------------------------------------------
export const fetchuser = async (identifier) => {
    await connectDb()

    const u = await User.findOne({
        $or: [
            { email:    identifier },
            { username: identifier },
        ]
    }).lean()

    if (!u) return null

    // ✅ Serialize — convert ObjectId to string
    return JSON.parse(JSON.stringify(u))
}


// -------------------------------------------------------
// UPDATE PROFILE — creator updates their info
// -------------------------------------------------------
// actions/useractions.js
export const updateProfile = async (data, oldusername) => {
    await connectDb()

    let ndata = data instanceof FormData
        ? Object.fromEntries(data)
        : data

    // ✅ Trim all strings
    Object.keys(ndata).forEach(key => {
        if (typeof ndata[key] === "string") ndata[key] = ndata[key].trim()
    })

    // ✅ If user has a username — they are a creator
    if (ndata.username) {
        ndata.role = "creator"
    }

    if (oldusername && oldusername !== ndata.username) {
        const existing = await User.findOne({ username: ndata.username })
        if (existing && existing.email !== ndata.email) {
            return { error: "Username already taken" }
        }

        await User.updateOne(
            { email: ndata.email },
            { $set: ndata },
            { upsert: true }
        )

        await Payment.updateMany(
            { to_user: oldusername },
            { to_user: ndata.username }
        )

    } else {
        await User.updateOne(
            { email: ndata.email },
            { $set: ndata },
            { upsert: true }
        )
    }

    console.log("✅ Profile saved as creator:", ndata.email)
}

// -------------------------------------------------------
// SET USER ROLE
export const setUserRole = async (email, role) => {
    await connectDb()

    await User.updateOne(
        { email },
        { $set: { role } }
    )

    console.log(`✅ Role set to ${role} for:`, email)
}

// -------------------------------------------------------
// FETCH PAYMENTS
// -------------------------------------------------------
export const fetchpayments = async (username) => {
    await connectDb()

    const payments = await Payment
        .find({ to_user: username, done: true })
        .sort({ amount: -1 })
        .limit(10)
        .lean()

    return JSON.parse(JSON.stringify(payments))
}

// -------------------------------------------------------
// INITIATE PAYMENT
// -------------------------------------------------------
export const initiate = async (amount, to_username, paymentform) => {
    await connectDb()

    const MIN_AMOUNT = 5000
    if (Number.parseInt(amount) < MIN_AMOUNT) {
        throw new Error("Minimum payment amount is ₹50")
    }

    const user = await User.findOne({ username: to_username })
    if (!user) throw new Error("User not found")

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
            price_data: {
                currency: "inr",
                product_data: {
                    name:        `Support ${to_username} ☕`,
                    description: paymentform.message || "Thank you!",
                },
                unit_amount: Number.parseInt(amount),
            },
            quantity: 1,
        }],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_URL}/api/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:  `${process.env.NEXT_PUBLIC_URL}/${to_username}?paymentcancelled=true`,
        metadata: {
            to_user: to_username,
            name:    paymentform.name    || "Anonymous",
            message: paymentform.message || "",
        },
    })

    await Payment.create({
        oid:     session.id,
        amount:  amount / 100,
        to_user: to_username,
        name:    paymentform.name    || "Anonymous",
        message: paymentform.message || "",
        done:    false,
    })

    return { url: session.url }
}

// -------------------------------------------------------
// SEARCH CREATORS — fans search by username or name
// -------------------------------------------------------
export const searchCreators = async (query) => {
    await connectDb()

    if (!query?.trim()) return []

    const creators = await User.find({
        $or: [
            { username: { $regex: query, $options: "i" } },
            { name:     { $regex: query, $options: "i" } },
        ],
        // ✅ Must have username set
        username: { $exists: true, $ne: "" },
    })
    .select("username name profilepic coverpic creatorType")
    .limit(10)
    .lean()

    const result = JSON.parse(JSON.stringify(creators))
    
    // 🔍 Debug — check what's being returned
    console.log("Creators found:", result.map(c => c.username))
    
    return result
}