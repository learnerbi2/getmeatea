// app/api/test-salesforce/route.js
import { NextResponse } from "next/server"

export const GET = async () => {
    try {
        // ✅ Check env vars loaded
        console.log("CLIENT_ID:", process.env.SALESFORCE_CLIENT_ID?.slice(0,20))
        console.log("CLIENT_SECRET:", process.env.SALESFORCE_CLIENT_SECRET?.slice(0,10))
        console.log("LOGIN_URL:", process.env.SALESFORCE_LOGIN_URL)

        const body = new URLSearchParams({
            grant_type:    "client_credentials",
            client_id:     process.env.SALESFORCE_CLIENT_ID,
            client_secret: process.env.SALESFORCE_CLIENT_SECRET,
        })

        console.log("Sending request to Salesforce...")

        const tokenResponse = await fetch(
            `${process.env.SALESFORCE_LOGIN_URL}/services/oauth2/token`,
            {
                method:  "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body:    body,
            }
        )

        // ✅ Log full raw response
        const rawText = await tokenResponse.text()
        console.log("Raw Salesforce response:", rawText)

        const tokenData = JSON.parse(rawText)

        if (!tokenResponse.ok || tokenData.error) {
            return NextResponse.json({
                success:   false,
                error:     tokenData.error,
                error_desc: tokenData.error_description,
                status:    tokenResponse.status,
            }, { status: 500 })
        }

        return NextResponse.json({
            success:      true,
            message:      "✅ Salesforce Connected!",
            instance_url: tokenData.instance_url,
            token_type:   tokenData.token_type,
        })

    } catch (error) {
        return NextResponse.json({
            success: false,
            error:   error.message,
        }, { status: 500 })
    }
}