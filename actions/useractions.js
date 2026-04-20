"use server"
import Stripe from "stripe"
import Payment from "@/models/Payments"
import User  from "@/models/Users"
import connectDb from "@/db/connectDb"

const stripe = new Stripe(process.env.KEY_SECRET)

// -------------------------------------------------------
// INITIATE PAYMENT
// -------------------------------------------------------
export const initiate = async (amount, to_username, paymentform) => {
    await connectDb()

    let user = await User.findOne({ username: to_username })
    if (!user) throw new Error("User not found")

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "inr",
                    product_data: {
                        name:        `Support ${to_username}`,
                        description: paymentform.message || "Thank you for your support!",
                    },
                    unit_amount: Number.parseInt(amount), // in paise
                },
                quantity: 1,
            },
        ],
        mode: "payment",

        // ✅ success_url hits your API to mark payment done
        success_url: `${process.env.NEXT_PUBLIC_URL}/api/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:  `${process.env.NEXT_PUBLIC_URL}/${to_username}?paymentcancelled=true`,

        metadata: {
            to_user: to_username,
            name:    paymentform.name    || "Anonymous",
            message: paymentform.message || "",
        },
    })

    // Save pending payment to DB
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
// FETCH USER — unchanged
// -------------------------------------------------------
export const fetchuser = async (username) => {
    await connectDb()
    let u = await User.findOne({ username })|| await User.findOne({ email: username })
        console.log("Fetched user:", u) // 🔍 Debug log

    if (!u) return null
     let user = u.toObject({ flattenObjectIds: true })
    return user
}


// -------------------------------------------------------
// FETCH PAYMENTS — unchanged
// -------------------------------------------------------
export const fetchpayments = async (username) => {
    await connectDb()
    return await Payment
        .find({ to_user: username, done: true })
        .sort({ amount: -1 })
        .limit(10)
        .lean()
}

// -------------------------------------------------------
// UPDATE PROFILE — unchanged
// -------------------------------------------------------
export const updateProfile = async (data, oldusername) => {
    await connectDb()
    
    let ndata = data

    // 🔍 Debug logs — remove after fixing
    console.log("Saving profile for:", oldusername)
    console.log("Data received:", ndata)

    // If the username is being updated, check if username is available
    if (oldusername !== ndata.username) {
        let u = await User.findOne({ username: ndata.username })
        if (u) {
            return { error: "Username already exists" }
        }   
        await User.updateOne({email: ndata.email}, ndata)
        // Now update all the usernames in the Payments table 
        await Payment.updateMany({to_user: oldusername}, {to_user: ndata.username})
        
    }
    else{

        
        await User.updateOne({email: ndata.email}, ndata)
    }
}
// "use server"


// export const initiate = async (amount, to_username, paymentform) => {
//     await connectDb()
//     // fetch the secret of the user who is getting the payment 
//     let user = await User.findOne({username: to_username})
//     const secret = user.razorpaysecret

//     var instance = new Razorpay({ key_id: user.razorpayid, key_secret: secret })

//      let options = {
//         amount: Number.parseInt(amount),
//         currency: "INR",
//     }
    
//  let x = await instance.orders.create(options)

// // create a payment object which shows a pending payment in the database
//     await Payment.create({ oid: x.id, amount: amount/100, to_user: to_username, name: paymentform.name, message: paymentform.message })

//     return x

// }

// export const fetchuser = async (username) => {
//     await connectDb()
//     let u = await User.findOne({ username: username })
//     let user = u.toObject({ flattenObjectIds: true })
//     return user
// }

// export const fetchpayments = async (username) => {
//     await connectDb()
//     // find all payments sorted by decreasing order of amount and flatten object ids
//     let p = await Payment.find({ to_user: username, done:true }).sort({ amount: -1 }).limit(10).lean()
//     return p
// }

// export const updateProfile = async (data, oldusername) => {
//     await connectDb()
//     let ndata = Object.fromEntries(data)

//  // If the username is being updated, check if username is available
//     if (oldusername !== ndata.username) {
//         let u = await User.findOne({ username: ndata.username })
//         if (u) {
//             return { error: "Username already exists" }
//         }   
//         await User.updateOne({email: ndata.email}, ndata)
//         // Now update all the usernames in the Payments table 
//         await Payment.updateMany({to_user: oldusername}, {to_user: ndata.username})
        
//     } else{
//         await User.updateOne({email: ndata.email}, ndata)
//     }
// }

