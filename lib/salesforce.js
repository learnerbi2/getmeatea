
import jsforce from "jsforce"

let conn        = null
let tokenExpiry = null

export const connectSalesforce = async () => {
    if (conn && conn.accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return conn
    }

    try {
        const loginUrl = process.env.SALESFORCE_LOGIN_URL

        console.log("🔍 Using login URL:", loginUrl)
        console.log("🔍 Client ID starts with:", 
            process.env.SALESFORCE_CLIENT_ID?.slice(0, 15))

        const body = new URLSearchParams({
            grant_type:    "client_credentials",
            client_id:     process.env.SALESFORCE_CLIENT_ID,
            client_secret: process.env.SALESFORCE_CLIENT_SECRET,
        })

        const response = await fetch(
            `${loginUrl}/services/oauth2/token`,
            {
                method:  "POST",
                headers: { 
                    "Content-Type": "application/x-www-form-urlencoded" 
                },
                body,
            }
        )

        const data = await response.json()
        console.log("🔍 Token response:", data)

        if (!response.ok || data.error) {
            throw new Error(
                `${data.error}: ${data.error_description}`
            )
        }

        conn = new jsforce.Connection({
            instanceUrl: data.instance_url,
            accessToken: data.access_token,
        })

        // ✅ Token valid for 55 mins
        tokenExpiry = Date.now() + 55 * 60 * 1000

        console.log("✅ Salesforce connected!")
        console.log("✅ Instance URL:", data.instance_url)

        return conn

    } catch (error) {
        conn        = null
        tokenExpiry = null
        console.error("❌ Salesforce failed:", error.message)
        throw error
    }
}

export const createContact = async (user) => {
    try {
        const c = await connectSalesforce()
        const result = await c.sobject("Contact").create({
            FirstName: user.name?.split(" ")[0]  || "",
            LastName:  user.name?.split(" ")[1]  || user.username || "Unknown",
            Email:     user.email,
        })
        console.log("✅ Contact created:", result.id)
        return result
    } catch (error) {
        console.error("❌ createContact error:", error.message)
        return null
    }
}

export const createOpportunity = async (payment) => {
    try {
        const c = await connectSalesforce()
        const result = await c.sobject("Opportunity").create({
            Name:        `Pledge by ${payment.name || "Anonymous"}`,
            Amount:      payment.amount,
            StageName:   "Closed Won",
            CloseDate:   new Date().toISOString().split("T")[0],
            Description: payment.message || "",
        })
        console.log("✅ Opportunity created:", result.id)
        return result
    } catch (error) {
        console.error("❌ createOpportunity error:", error.message)
        return null
    }
}