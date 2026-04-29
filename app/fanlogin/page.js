
"use client"
export const dynamic = "force-dynamic"
import React, { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

function FanLogin() {
    const { data: session } = useSession()
    const router            = useRouter()

    const [isRegister, setIsRegister] = useState(false)
    const [form, setForm]     = useState({ email: "", password: "", name: "" })
    const [errors, setErrors] = useState({})
    const [serverError, setServerError] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        document.title = "Fan Login | Get Me A Tea"
        if (session) router.push('/')
    }, [session, router])

    if (session) return (
        <div className="text-white p-4 text-center">Redirecting...</div>
    )

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" })
        }
        setServerError("")
    }

    const validate = () => {
        const errs = {}
        if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errs.email = "Enter a valid email"
        }
        if (!form.password || form.password.length < 8) {
            errs.password = "Password must be at least 8 characters"
        }
        if (isRegister && !form.name.trim()) {
            errs.name = "Name is required"
        }
        return errs
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setServerError("")

        const validationErrors = validate()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        setLoading(true)
        try {
            const res = await signIn("credentials", {
                email:    form.email,
                password: form.password,
                name:     form.name,
                action:   isRegister ? "register" : "login",
                redirect: false,
                callbackUrl: "/",
            })

            if (res?.error) {
                setServerError(res.error)
            } else if (res?.ok) {
                router.push("/")
            }
        } catch {
            setServerError("Something went wrong.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='text-white py-10 container mx-auto'>
            <h1 className='text-center font-bold text-3xl mb-1'>
                {isRegister ? "Create Fan Account" : "Fan Login"}
            </h1>
            <p className="text-center text-gray-400 text-sm mb-6">
                {isRegister
                    ? "Join to support your favourite creators"
                    : "Sign in to support creators ☕"
                }
            </p>

            <div className="p-8 flex flex-col justify-center rounded-2xl bg-gray-900 border border-gray-700 max-w-md mx-auto gap-4">

                {serverError && (
                    <div className="p-3 bg-red-900 border border-red-600 rounded-lg">
                        <p className="text-red-300 text-sm">⚠️ {serverError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    {isRegister && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Your name"
                                className={`w-full p-3 rounded-lg bg-gray-800 border text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-500" : "border-gray-600"}`}
                            />
                            {errors.name && (
                                <p className="text-red-400 text-xs mt-1">⚠️ {errors.name}</p>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className={`w-full p-3 rounded-lg bg-gray-800 border text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-500" : "border-gray-600"}`}
                        />
                        {errors.email && (
                            <p className="text-red-400 text-xs mt-1">⚠️ {errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Min 8 characters"
                                className={`w-full p-3 pr-10 rounded-lg bg-gray-800 border text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? "border-red-500" : "border-gray-600"}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-white"
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-400 text-xs mt-1">⚠️ {errors.password}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-sm disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                {isRegister ? "Creating..." : "Signing in..."}
                            </span>
                        ) : (
                            isRegister ? "Create Fan Account" : "Sign In"
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-700" />
                    <span className="text-gray-500 text-xs">or</span>
                    <div className="flex-1 h-px bg-gray-700" />
                </div>

                {/* GitHub */}
                <button
                    onClick={() => signIn('github', { callbackUrl: '/' })}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-600 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-white text-sm"
                >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    Continue with GitHub
                </button>

                <p className="text-center text-gray-500 text-sm">
                    {isRegister ? (
                        <>Already have an account?{" "}
                            <button onClick={() => { setIsRegister(false); setErrors({}); setForm({ email: "", password: "", name: "" }) }}
                                className="text-blue-400 hover:underline">Sign In</button>
                        </>
                    ) : (
                        <>New fan?{" "}
                            <button onClick={() => { setIsRegister(true); setErrors({}); setForm({ email: "", password: "", name: "" }) }}
                                className="text-blue-400 hover:underline">Create Account</button>
                        </>
                    )}
                </p>

                <p className="text-center text-gray-500 text-xs">
                    Want to receive donations?{" "}
                    <a href="/login" className="text-blue-400 hover:underline">
                        Register as Creator →
                    </a>
                </p>
            </div>
        </div>
    )
}

export default FanLogin