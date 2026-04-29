
"use client"
import React, { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

// ✅ Validation helper
const validate = (email, password, name, isRegister) => {
    const errors = {}

    // Email
    if (!email) {
        errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Enter a valid email address"
    }

    // Password
    if (!password) {
        errors.password = "Password is required"
    } else if (password.length < 8) {
        errors.password = "Password must be at least 8 characters"
    } else if (!/[A-Z]/.test(password)) {
        errors.password = "Password must have at least one uppercase letter"
    } else if (!/[0-9]/.test(password)) {
        errors.password = "Password must have at least one number"
    } else if (!/[!@#$%^&*]/.test(password)) {
        errors.password = "Password must have at least one special character (!@#$%^&*)"
    }

    // Name (only for register)
    if (isRegister && !name.trim()) {
        errors.name = "Name is required"
    }

    return errors
}

function Page() {
    const { data: session } = useSession()
    const router            = useRouter()
    const searchParams      = useSearchParams()
    const errorParam        = searchParams.get("error")

    const [isRegister, setIsRegister] = useState(false)
    const [form, setForm]   = useState({ email: "", password: "", name: "" })
    const [errors, setErrors] = useState({})
    const [serverError, setServerError] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        document.title = isRegister
            ? "Register - Get Me A Tea"
            : "Login - Get Me A Tea"
    }, [isRegister])

    useEffect(() => {
        if (session) router.push('/Dashboard')
    }, [session, router])

    useEffect(() => {
        if (errorParam === "OAuthAccountNotLinked") {
            setServerError("This email is registered with a different method. Try GitHub login.")
        }
        if (errorParam === "CredentialsSignin") {
            setServerError("Invalid email or password. Please try again.")
        }
    }, [errorParam])

    if (session) return (
        <div className="text-white p-4 text-center">
            Redirecting...
        </div>
    )

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        // ✅ Clear error on type
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" })
        }
        setServerError("")
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setServerError("")

        // ✅ Validate
        const validationErrors = validate(
            form.email,
            form.password,
            form.name,
            isRegister
        )

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
                callbackUrl: "/Dashboard",
            })

            if (res?.error) {
                setServerError(res.error)
            } else if (res?.ok) {
                router.push("/Dashboard")
            }

        } catch (err) {
            setServerError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    // ✅ Password strength indicator
    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: "", color: "" }
        let score = 0
        if (password.length >= 8)          score++
        if (/[A-Z]/.test(password))        score++
        if (/[0-9]/.test(password))        score++
        if (/[!@#$%^&*]/.test(password))   score++

        if (score <= 1) return { strength: 25,  label: "Weak",   color: "bg-red-500" }
        if (score === 2) return { strength: 50,  label: "Fair",   color: "bg-yellow-500" }
        if (score === 3) return { strength: 75,  label: "Good",   color: "bg-blue-500" }
        return              { strength: 100, label: "Strong", color: "bg-green-500" }
    }

    const pwStrength = getPasswordStrength(form.password)

    return (
        <div className='text-white py-14 container mx-auto'>
            <h1 className='text-center font-bold text-3xl mb-1'>
                {isRegister ? "Create Creator Account" : "Creator Login"}
            </h1>
            <p className="text-center text-gray-400 text-sm mb-6">
                {isRegister
                    ? "Register to start receiving support ☕"
                    : "Sign in to manage your creator profile ☕"
                }
            </p>

            <div className="max-w-md mx-auto bg-gray-900 p-8 rounded-2xl border border-gray-700">

                {/* ─── Server Error ────────────────────────── */}
                {serverError && (
                    <div className="mb-4 p-3 bg-red-900 border border-red-600 rounded-lg">
                        <p className="text-red-300 text-sm">⚠️ {serverError}</p>
                    </div>
                )}

                {/* ─── Form ────────────────────────────────── */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    {/* Name — only for register */}
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
                                placeholder="John Doe"
                                className={`w-full p-3 rounded-lg bg-gray-800 border text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.name
                                        ? "border-red-500"
                                        : "border-gray-600"
                                }`}
                            />
                            {errors.name && (
                                <p className="text-red-400 text-xs mt-1">
                                    ⚠️ {errors.name}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className={`w-full p-3 rounded-lg bg-gray-800 border text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.email
                                    ? "border-red-500"
                                    : "border-gray-600"
                            }`}
                        />
                        {errors.email && (
                            <p className="text-red-400 text-xs mt-1">
                                ⚠️ {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password */}
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
                                placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special"
                                className={`w-full p-3 pr-10 rounded-lg bg-gray-800 border text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.password
                                        ? "border-red-500"
                                        : "border-gray-600"
                                }`}
                            />
                            {/* Show/Hide toggle */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-white"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* ✅ Password strength bar */}
                        {form.password && (
                            <div className="mt-2">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-500">Password strength</span>
                                    <span className={`font-medium ${
                                        pwStrength.label === "Strong" ? "text-green-400" :
                                        pwStrength.label === "Good"   ? "text-blue-400"  :
                                        pwStrength.label === "Fair"   ? "text-yellow-400":
                                        "text-red-400"
                                    }`}>
                                        {pwStrength.label}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-1.5">
                                    <div
                                        className={`h-1.5 rounded-full transition-all duration-300 ${pwStrength.color}`}
                                        style={{ width: `${pwStrength.strength}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {errors.password && (
                            <p className="text-red-400 text-xs mt-1">
                                ⚠️ {errors.password}
                            </p>
                        )}

                        {/* ✅ Password requirements hint */}
                        {isRegister && (
                            <ul className="mt-2 text-xs text-gray-500 space-y-0.5 ml-1">
                                <li className={form.password.length >= 8         ? "text-green-400" : ""}>
                                    {form.password.length >= 8 ? "✅" : "○"} At least 8 characters
                                </li>
                                <li className={/[A-Z]/.test(form.password)       ? "text-green-400" : ""}>
                                    {/[A-Z]/.test(form.password) ? "✅" : "○"} One uppercase letter
                                </li>
                                <li className={/[0-9]/.test(form.password)       ? "text-green-400" : ""}>
                                    {/[0-9]/.test(form.password) ? "✅" : "○"} One number
                                </li>
                                <li className={/[!@#$%^&*]/.test(form.password)  ? "text-green-400" : ""}>
                                    {/[!@#$%^&*]/.test(form.password) ? "✅" : "○"} One special character (!@#$%^&*)
                                </li>
                            </ul>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                {isRegister ? "Creating account..." : "Signing in..."}
                            </span>
                        ) : (
                            isRegister ? "Create Account" : "Sign In"
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-gray-700" />
                    <span className="text-gray-500 text-xs">or</span>
                    <div className="flex-1 h-px bg-gray-700" />
                </div>

                {/* GitHub Button */}
                <button
                    onClick={() => signIn('github', { callbackUrl: '/Dashboard' })}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-600 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-white text-sm font-medium"
                >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    Continue with GitHub
                </button>

                {/* Toggle login/register */}
                <p className="text-center text-gray-500 text-sm mt-5">
                    {isRegister ? (
                        <>
                            Already have an account?{" "}
                            <button
                                onClick={() => {
                                    setIsRegister(false)
                                    setErrors({})
                                    setServerError("")
                                    setForm({ email: "", password: "", name: "" })
                                }}
                                className="text-blue-400 hover:underline font-medium"
                            >
                                Sign In
                            </button>
                        </>
                    ) : (
                        <>
                            New creator?{" "}
                            <button
                                onClick={() => {
                                    setIsRegister(true)
                                    setErrors({})
                                    setServerError("")
                                    setForm({ email: "", password: "", name: "" })
                                }}
                                className="text-blue-400 hover:underline font-medium"
                            >
                                Create Account
                            </button>
                        </>
                    )}
                </p>

            </div>
        </div>
    )
}

export default Page