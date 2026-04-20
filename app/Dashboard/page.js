"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { fetchuser, updateProfile } from '@/actions/useractions'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import { useCallback } from 'react';

  const InputField = ({
  label,
  name,
  type = "text",
  placeholder = "",
  value,
  onChange
}) => (
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
    const { data: session,status, update} = useSession()
    const router = useRouter()
    const [form, setform] = useState({})
    const [loading, setLoading] = useState(false) 

useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated" || !session) {
      router.push("/login")
    }
  }, [status, session, router])

  const getData = useCallback(async () => {
    if (!session?.user?.email) return
    const u = await fetchuser(session.user.email)
    if (!u) return
    setform(u)
  }, [session])

  useEffect(() => {
    if (status === "authenticated") {
      getData()
    }
  }, [status, getData])

  if (status === "loading" || !session) {
    return <div className="text-white p-4">Loading dashboard...</div>
  }
    const handleChange = (e) => {
        setform({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()  // ✅ Prevent default form submission
        setLoading(true)
        try {

            let a = await updateProfile(form, session.user.username)
            
            if (a?.error) {
                toast(a.error, {
                    position: "top-right",
                    autoClose: 5000,
                    theme: "light",
                    type: "error",
                    transition: Bounce,
                })
                return
            }

            // ✅ Update session with new username
            await update()
            await getData() 

            toast('Profile Updated Successfully!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light",
                transition: Bounce,
            })
            
        } catch (err) {
            toast('Something went wrong. Please try again.', {
                type: "error",
                position: "top-right",
                autoClose: 5000,
                theme: "light",
            })
        } finally {
            setLoading(false)
        }
    }

    // -------------------------------------------------------
    // Reusable input field component
    // -------------------------------------------------------
  
    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <div className='container mx-auto py-5 px-6'>
                <h1 className='text-center my-5 text-3xl font-bold'>
                    Welcome to your Dashboard
                </h1>

                <form className="max-w-2xl mx-auto" onSubmit={handleSubmit}>

                    {/* ─── Basic Info ─────────────────────────────── */}
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
                     {/* <InputField
                       label="Username"
                        name="username"
                        placeholder="your-username"
                    /> */}
                    <InputField
                        label="Username"
                        name="username"
                        placeholder="your-username"
                         value={form.username}
                        onChange={handleChange}
                    />
                    {/* ─── Profile Appearance ──────────────────────── */}
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

                    {/* ─── Preview ─────────────────────────────────── */}
                    {(form.profilepic || form.coverpic) && (
                        <div className="my-4 rounded-lg overflow-hidden border border-gray-600">
                            {/* Cover preview */}
                            {form.coverpic && (
                                <img
                                    src={form.coverpic}
                                    alt="Cover Preview"
                                    className="w-full h-28 object-cover"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            )}
                            {/* Profile pic preview */}
                            {form.profilepic && (
                                <div className="flex items-center gap-3 p-3">
                                    <img
                                        src={form.profilepic}
                                        alt="Profile Preview"
                                        className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                    <span className="text-gray-400 text-sm">
                                        @{form.username || "username"}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── Stripe Info ─────────────────────────────── */}
                    {/* 
                        ✅ Stripe uses a single global secret key (in .env)
                           No per-user keys needed anymore.
                           Show a status indicator instead.
                    */}
                    <h2 className="text-lg font-semibold text-gray-300 mt-6 mb-2 border-b border-gray-600 pb-1">
                        Payment Settings
                    </h2>

                    <div className="my-4 p-4 bg-gray-700 rounded-lg flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                        <div>
                            <p className="text-white text-sm font-medium">
                                Stripe Payments Active ✅
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                                Stripe is configured globally. No per-user keys required.
                                Payments go directly to your Stripe account.
                            </p>
                        </div>
                    </div>

            
                    {/* ─── Save Button ─────────────────────────────── */}
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