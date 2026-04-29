
import NextAuth from 'next-auth'
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import connectDb from '@/db/connectDb'
import User from '@/models/Users'
import bcrypt from "bcrypt"
import { createContact } from '@/lib/salesforce'
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import clientPromise from '@/lib/mongodb'

export const handler = NextAuth({
    // ✅ Remove adapter when using CredentialsProvider
    // adapter causes issues with credentials login
    // adapter: MongoDBAdapter(clientPromise),

    providers: [
        GitHubProvider({
            clientId:     process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),

        // ✅ Email + Password Provider
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email:    { label: "Email",    type: "email" },
                password: { label: "Password", type: "password" },
                action:   { label: "Action",   type: "text" }, // login or register
                name:     { label: "Name",     type: "text" },
            },

            async authorize(credentials) {
                try {
                    await connectDb()

                    const { email, password, action, name } = credentials

                    // ─── REGISTER ──────────────────────────────
                    if (action === "register") {

                        // Check if user exists
                        const existing = await User.findOne({ email })
                        if (existing) {
                            throw new Error("Email already registered. Please login.")
                        }

                        // Generate unique username
                        const baseUsername = email
                            .split("@")[0]
                            .toLowerCase()
                            .replace(/[^a-z0-9]/g, "")

                        let username = baseUsername
                        let count = 1
                        while (await User.findOne({ username })) {
                            username = `${baseUsername}${count}`
                            count++
                        }

                        // Hash password
                        const hashedPassword = await bcrypt.hash(password, 12)

                        // Create user
                        const newUser = await User.create({
                            email,
                            name:     name || "",
                            username,
                            password: hashedPassword,
                            role:     "fan",
                        })

                        // Salesforce contact
                        try {
                            await createContact({
                                name:  name || username,
                                email,
                                username,
                            })
                        } catch (sfErr) {
                            console.error("❌ Salesforce:", sfErr.message)
                        }

                        return {
                            id:    newUser._id.toString(),
                            email: newUser.email,
                            name:  newUser.username,
                        }
                    }

                    // ─── LOGIN ─────────────────────────────────
                    if (action === "login") {

                        const user = await User.findOne({ email })
                        if (!user) {
                            throw new Error("No account found with this email.")
                        }

                        if (!user.password) {
                            throw new Error("This account uses GitHub login. Please sign in with GitHub.")
                        }

                        const isValid = await bcrypt.compare(password, user.password)
                        if (!isValid) {
                            throw new Error("Incorrect password. Please try again.")
                        }

                        return {
                            id:    user._id.toString(),
                            email: user.email,
                            name:  user.username,
                        }
                    }

                    throw new Error("Invalid action")

                } catch (error) {
                    throw new Error(error.message)
                }
            }
        }),
    ],

    session: {
        strategy: "jwt", // ✅ required for CredentialsProvider
    },

    callbacks: {

        async signIn({ user, account }) {
            if (account.provider === "github") {
                try {
                    await connectDb()

                    const currentUser = await User.findOne({
                        email: user.email
                    }).lean()

                    if (!currentUser) {
                        const baseUsername = user.email
                            .split("@")[0]
                            .toLowerCase()
                            .replace(/[^a-z0-9]/g, "")

                        let username = baseUsername
                        let count = 1
                        while (await User.findOne({ username })) {
                            username = `${baseUsername}${count}`
                            count++
                        }

                        await User.create({
                            email:      user.email,
                            username,
                            name:       user.name  || "",
                            profilepic: user.image || "",
                            role:       "fan",
                        })

                        console.log("✅ GitHub user created:", user.email)
                    }

                    return true

                } catch (error) {
                    console.error("❌ signIn error:", error)
                    return false
                }
            }

            return true
        },

        async session({ session, token }) {
            try {
                await connectDb()

                const dbUser = await User.findOne({
                    email: session.user.email
                }).lean()

                if (dbUser) {
                    session.user.username    = dbUser.username    || ""
                    session.user.name        = dbUser.name        || ""
                    session.user.profilepic  = dbUser.profilepic  || ""
                    session.user.coverpic    = dbUser.coverpic    || ""
                    session.user.role        = dbUser.role        || "fan"
                    session.user.creatorType = dbUser.creatorType || ""
                }

                return session

            } catch (error) {
                console.error("❌ session error:", error)
                return session
            }
        },

        async jwt({ token, user }) {
            if (user) token.user = user
            return token
        },
    },

    pages: {
        signIn: "/login",
        error:  "/login",
    },

    secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }