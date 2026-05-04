// app/admin/page.jsx
// Only accessible by admin email

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL

export default async function AdminPage() {
    const session = await getServerSession()

    // ✅ Only admin can access
    if (session?.user?.email !== ADMIN_EMAIL) {
        redirect("/")
    }

    return (
        <div className="container mx-auto py-10 text-white h-screen">
            <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Reports */}
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-bold mb-4">🚩 Pending Reports</h2>
                    {/* List reported creators */}
                    {/* Verify / Dismiss / Ban buttons */}
                </div>

                {/* Verifications */}
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-bold mb-4">✅ Verify Creators</h2>
                    {/* List unverified creators */}
                    {/* Approve verification button */}
                </div>

                {/* Refunds */}
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-bold mb-4">💰 Refund Requests</h2>
                    {/* List refund requests */}
                    {/* Approve / Reject buttons */}
                </div>

            </div>
        </div>
    )
}