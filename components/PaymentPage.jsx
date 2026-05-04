
"use client"
import React, { useEffect, useState, useCallback } from 'react'
import { fetchuser, fetchpayments, initiate } from '@/actions/useractions'
import { useSearchParams } from 'next/navigation'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import { useRouter } from 'next/navigation'

const PaymentPage = ({ username }) => {
    const [paymentform, setPaymentform] = useState({ name: "", message: "", amount: "" })
    const [currentUser, setcurrentUser] = useState({})
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(false) 
    const searchParams = useSearchParams()
    const router = useRouter()
//additional report handling
const [showReport, setShowReport] = useState(false)
const [reportReason, setReportReason] = useState("")
const [reportDetails, setReportDetails] = useState("")

    // ✅ Define getData before using it in useEffect
    const getData = useCallback(async () => {
        let u = await fetchuser(username)
        setcurrentUser(u)
        let dbpayments = await fetchpayments(username)
        setPayments(dbpayments)
    }, [username])

    useEffect(() => {
        getData()
    }, [getData])

  useEffect(() => {
    const paymentdone      = searchParams.get("paymentdone")
    const paymentcancelled = searchParams.get("paymentcancelled")

    if (paymentdone === "true") {
        toast('Thanks for your donation! 🎉', {
            position:  "top-right",
            autoClose: 5000,
            theme:     "light",
            transition: Bounce,
        })
        // ✅ Clean the URL without triggering a reload
        router.replace(`/${username}`)
    }

    if (paymentcancelled === "true") {
        toast('Payment was cancelled.', {
            position:  "top-right",
            autoClose: 4000,
            theme:     "light",
        })
        router.replace(`/${username}`)
    }
    
}, [])

    const handleChange = (e) => {
        setPaymentform({ ...paymentform, [e.target.name]: e.target.value })
    }

    // ✅ Stripe pay function — replaces Razorpay modal
    const pay = async (amount) => {
        setLoading(true)
        try {
            let a = await initiate(amount, username, paymentform)
            // Redirect to Stripe Checkout page
            window.location.href = a.url
        } catch (err) {
            toast("Payment failed. Please try again.", { type: "error" })
            setLoading(false)
        }
    }

// -------------------------------------------------------
// components/PaymentPage.jsx — Report button
const handleReport = async () => {
    if (!reportReason) return
    
    const res = await reportReason(
        username,
        session?.user?.email || "anonymous",
        reportReason,
        reportDetails
    )

    if (res.success) {
        toast("Report submitted. We'll review within 24 hours.", { 
            type: "success" 
        })
        setShowReport(false)
    }
};
// In JSX:
<button
    onClick={() => setShowReport(true)}
    className="text-gray-500 hover:text-red-400 text-xs underline mt-2"
>
    🚩 Report this profile
</button>

{showReport && (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-gray-900 p-6 rounded-xl max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-white font-bold text-lg mb-4">
                Report Profile
            </h3>
            
            <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm mb-3"
            >
                <option value="">Select reason</option>
                <option value="fake_identity">Fake or impersonated identity</option>
                <option value="fraud">Fraudulent fundraising</option>
                <option value="inappropriate">Inappropriate content</option>
                <option value="spam">Spam</option>
                <option value="other">Other</option>
            </select>

            <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Provide more details (optional)"
                rows={3}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm mb-4 resize-none"
            />

            <div className="flex gap-3">
                <button
                    onClick={handleReport}
                    disabled={!reportReason}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm disabled:opacity-50"
                >
                    Submit Report
                </button>
                <button
                    onClick={() => setShowReport(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
)}
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

            <div className='cover w-full bg-red-50 relative'>
                <img className='object-cover w-full h-48 md:h-[350] shadow-blue-700 shadow-sm' src={currentUser.coverpic || "/default-coverpic.jpg"} alt="" />
                <div className='absolute -bottom-20 right-[33%] md:right-[44%] border-white overflow-hidden border-2 rounded-full size-36'>
                    <img className='rounded-full object-cover size-36' width={128} height={128}  src={currentUser.profilepic || "/avatar.jpg"  } alt="" />
                </div>
            </div>

            <div className="info flex justify-center items-center my-24 mb-32 flex-col gap-2">
                <div className='font-bold text-lg'>@{username}</div>
                <div className='text-slate-400'>Lets help {username} get a Tea!</div>
                <div className='text-slate-400'>
                    {payments.length} Payments · ₹{payments.reduce((a, b) => a + b.amount, 0)} raised
                </div>

                <div className="payment flex gap-3 w-[80%] mt-11 flex-col md:flex-row">
                    {/* Supporters leaderboard — unchanged */}
                    <div className="supporters w-full md:w-1/2 bg-slate-900 rounded-lg text-white px-2 md:p-10">
                        <h2 className='text-2xl font-bold my-5'>Top 10 Supporters</h2>
                        <ul className='mx-5 text-lg'>
                            {payments.length == 0 && <li>No payments yet</li>}
                            {payments.map((p, i) => (
                                <li key={i} className='my-4 flex gap-2 items-center'>
                                    <img width={33} src="/coffee-break.gif" alt="user avatar" />
                                    <span>
                                        {p.name} donated <span className='font-bold'>₹{p.amount}</span> with a message &quot;{p.message}&quot;
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Payment form */}
                    <div className="makePayment w-full md:w-1/2 bg-slate-900 rounded-lg text-white px-2 md:p-10">
                        <h2 className='text-2xl font-bold my-5'>Make a Payment</h2>
                        <div className='flex gap-2 flex-col'>
                            <input
                                onChange={handleChange}
                                value={paymentform.name}
                                name='name'
                                type="text"
                                className='w-full p-3 rounded-lg bg-slate-800'
                                placeholder='Enter Name'
                            />
                            <input
                                onChange={handleChange}
                                value={paymentform.message}
                                name='message'
                                type="text"
                                className='w-full p-3 rounded-lg bg-slate-800'
                                placeholder='Enter Message'
                            />
                            <input
                                onChange={handleChange}
                                value={paymentform.amount}
                                name="amount"
                                type="number" 
                                className='w-full p-3 rounded-lg bg-slate-800'
                                placeholder='Enter Amount (₹)'
                            />

                            {/* ✅ Pay button with loading state */}
                            <button
                                onClick={() => pay(Number.parseInt(paymentform.amount) * 100)}
                                type="button"
                                disabled={
                                    loading ||
                                    paymentform.name?.length < 3 ||
                                    paymentform.message?.length < 4 ||
                                    paymentform.amount?.length < 1
                                }
                                className="text-white bg-linear-to-br from-purple-900 to-blue-900 hover:bg-linear-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Redirecting to Stripe..." : `Pay ₹${paymentform.amount || 0}`}
                            </button>
                        </div>

                        {/* Quick amount buttons */}
                        <div className='flex flex-col md:flex-row gap-2 mt-5'>
                            <button
                                className='bg-slate-800 p-3 rounded-lg hover:bg-slate-700 disabled:opacity-50'
                                onClick={() => pay(10000)}
                                disabled={loading}
                            >
                                Pay ₹100
                            </button>
                            <button
                                className='bg-slate-800 p-3 rounded-lg hover:bg-slate-700 disabled:opacity-50'
                                onClick={() => pay(20000)}
                                disabled={loading}
                            >
                                Pay ₹200
                            </button>
                            <button
                                className='bg-slate-800 p-3 rounded-lg hover:bg-slate-700 disabled:opacity-50'
                                onClick={() => pay(30000)}
                                disabled={loading}
                            >
                                Pay ₹300
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PaymentPage
