// app/api/test-email/route.js
import nodemailer from "nodemailer"
import { NextResponse } from "next/server"

export const GET = async () => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_SERVER_HOST,
            port: Number(process.env.EMAIL_SERVER_PORT),
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
            },
        })

        // ✅ Verify SMTP connection
        await transporter.verify()

        return NextResponse.json({
            success: true,
            message: "✅ Email server connected!",
            host:    process.env.EMAIL_SERVER_HOST,
            user:    process.env.EMAIL_SERVER_USER,
        })

    } catch (error) {
        return NextResponse.json({
            success: false,
            error:   error.message,
        }, { status: 500 })
    }
}