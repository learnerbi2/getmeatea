// app/api/salesforce-status/route.js
import { connectSalesforce } from "@/lib/salesforce"
import { NextResponse } from "next/server"

export const GET = async () => {
    try {
        const conn = await connectSalesforce()
        const identity = await conn.identity()
        return NextResponse.json({ 
            connected: true,
            user: identity.username 
        })
    } catch {
        return NextResponse.json({ 
            connected: false 
        })
    }
}