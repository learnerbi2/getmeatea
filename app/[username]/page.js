// app/[username]/page.jsx
import { notFound } from "next/navigation"
import connectDb from "@/db/connectDb"
import User from "@/models/Users"
import PaymentPage from "@/components/PaymentPage"

const Username = async ({ params }) => {
    const { username } = await params

    await connectDb()

    const u = await User.findOne({ username }).lean()

    if (!u) {
        console.log("User not found:", username) // 🔍 debug
        return notFound()
    }

    return <PaymentPage username={username} />
}

export default Username

export async function generateMetadata({ params }) {
    const { username } = await params
    return {
        title: `Support ${username} - Get Me A Tea`,
    }
}