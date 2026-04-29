
"use client"
import React, { useEffect, useState, useCallback } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { fetchuser, updateProfile } from '@/actions/useractions'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Bounce } from 'react-toastify'
import { setUserRole } from '@/actions/useractions'

const InputField = ({ label, name, type = "text", placeholder = "", value, onChange }) => (
    <div className="my-2">
        <label className="block mb-2 text-sm font-medium text-gray-400">
            {label}
        </label>
        <input
            value={value || ""}
            onChange={onChange}
            type={type}
            name={name}
            id={name}
            placeholder={placeholder}
            className="block w-full p-2 text-white border border-gray-600 rounded-lg bg-gray-700 text-sm"
        />
    </div>
)

const Dashboard = () => {
    const { data: session, status, update } = useSession()
    const router    = useRouter()
    const [form, setform]       = useState({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (status === "loading") return
        if (status === "unauthenticated") router.push("/login")
    }, [status, router])

    const getData = useCallback(async () => {
        if (!session?.user?.email) return
        const u = await fetchuser(session.user.email)
        if (!u) {
            // ✅ Prefill from session if DB empty
            setform({
                name:       session.user.name  || "",
                email:      session.user.email || "",
                profilepic: session.user.image || "",
                username:   "",
                coverpic:   "",
                creatorType: "",
            })
            return
        }
        setform(u)
    }, [session])

    useEffect(() => {
        if (status === "authenticated" && session?.user?.email) {
    setUserRole(session.user.email, "creator")
    getData()
  }
}, [status, session, getData])

    if (status === "loading" || !session) {
        return (
            <div className="text-white p-4 text-center mt-20">
                Loading dashboard...
            </div>
        )
    }

    const handleChange = (e) => {
        setform({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            // ✅ Set role to creator when saving dashboard
            const dataToSave = { ...form, role: "creator" }

            const result = await updateProfile(dataToSave, session.user.username)

            if (result?.error) {
                toast(result.error, {
                    type: "error", position: "top-right",
                    autoClose: 5000, theme: "light", transition: Bounce,
                })
                return
            }

            await update()
            await getData()

            toast('Profile Updated Successfully! ✅', {
                position: "top-right", autoClose: 5000,
                theme: "light", transition: Bounce,
            })

        } catch (err) {
            toast('Something went wrong. Please try again.', {
                type: "error", position: "top-right",
                autoClose: 5000, theme: "light",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <ToastContainer
                position="top-right" autoClose={5000}
                hideProgressBar={false} newestOnTop={false}
                closeOnClick rtl={false} pauseOnFocusLoss
                draggable pauseOnHover theme="light"
            />

            <div className='container mx-auto py-5 px-6'>
                <h1 className='text-center my-5 text-3xl font-bold'>
                    Welcome to your Dashboard
                </h1>

                {/* ✅ Show creator profile link */}
                {form.username && (
                    <div className="max-w-2xl mx-auto mb-4 p-3 bg-green-900 rounded-lg flex items-center justify-between">
                        <p className="text-green-300 text-sm">
                            ✅ Your profile is live at:
                        </p>
                        <a
                            href={`/${form.username}`}
                            target="_blank"
                            className="text-blue-400 hover:underline text-sm font-medium"
                        >
                        /{form.username} →
                        </a>
                    </div>
                )}

                {/* ✅ Warning if username not set */}
                {!form.username && (
                    <div className="max-w-2xl mx-auto mb-4 p-3 bg-yellow-900 rounded-lg">
                        <p className="text-yellow-300 text-sm">
                            ⚠️ Please set your username so fans can find and support you!
                        </p>
                    </div>
                )}

                <form className="max-w-2xl mx-auto" onSubmit={handleSubmit}>

                    {/* ─── Basic Info ──────────────────────────── */}
                    <h2 className="text-lg font-semibold text-gray-300 mt-6 mb-2 border-b border-gray-600 pb-1">
                        Basic Info
                    </h2>

                    <InputField
                        label="Name"
                        name="name"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={handleChange}
                    />
                    <InputField
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={handleChange}
                    />
                    <InputField
                        label="Username"
                        name="username"
                        placeholder="your-username (fans will search this)"
                        value={form.username}
                        onChange={handleChange}
                    />
                    <InputField
                        label="Creator Type"
                        name="creatorType"
                        placeholder="e.g., YouTuber, Artist, Developer"
                        value={form.creatorType}
                        onChange={handleChange}
                    />

                    {/* ─── Profile Appearance ──────────────────── */}
                    <h2 className="text-lg font-semibold text-gray-300 mt-6 mb-2 border-b border-gray-600 pb-1">
                        Profile Appearance
                    </h2>

                    <InputField
                        label="Profile Picture URL"
                        name="profilepic"
                        placeholder="https://example.com/photo.jpg"
                        value={form.profilepic}
                        onChange={handleChange}
                    />
                    <InputField
                        label="Cover Picture URL"
                        name="coverpic"
                        placeholder="https://example.com/cover.jpg"
                        value={form.coverpic}
                        onChange={handleChange}
                    />

                    {/* ─── Live Preview ────────────────────────── */}
                    {(form.profilepic || form.coverpic) && (
                        <div className="my-4 rounded-lg overflow-hidden border border-gray-600">
                            {form.coverpic && (
                                <img
                                    src={form.coverpic}
                                    alt="Cover Preview"
                                    className="w-full h-28 object-cover"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            )}
                            {form.profilepic && (
                                <div className="flex items-center gap-3 p-3">
                                    <img
                                        src={form.profilepic}
                                        alt="Profile Preview"
                                        className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                    <div>
                                        <p className="text-white text-sm font-medium">
                                            {form.name || "Your Name"}
                                        </p>
                                        <p className="text-gray-400 text-xs">
                                            @{form.username || "username"}
                                            {form.creatorType && ` · ${form.creatorType}`}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── Payment Settings ────────────────────── */}
                    <h2 className="text-lg font-semibold text-gray-300 mt-6 mb-2 border-b border-gray-600 pb-1">
                        Payment Settings
                    </h2>
                    <div className="my-4 p-4 bg-gray-700 rounded-lg flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                        <div>
                            <p className="text-white text-sm font-medium">
                                Stripe Payments Active ✅
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                                Fans can donate to you via card, GPay and UPI.
                            </p>
                        </div>
                    </div>

                    {/* ─── Save Button ─────────────────────────── */}
                    <div className="my-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="block w-full p-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:ring-blue-500 focus:ring-4 focus:outline-none font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>

                </form>
            </div>
        </>
    )
}

export default Dashboard