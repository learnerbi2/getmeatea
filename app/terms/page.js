// app/terms/page.jsx
export default function TermsPage() {
    return (
        <div className="container mx-auto py-10 px-6 text-white max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2 text-blue-400">
                    Our Responsibility
                </h2>
                <p className="text-gray-400">
                    Get Me A Tea acts as a platform connecting fans and creators.
                    All payments are processed securely by Stripe — a globally 
                    trusted payment processor used by Amazon, Google and millions 
                    of businesses.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2 text-blue-400">
                    Fraud Protection
                </h2>
                <ul className="text-gray-400 space-y-2">
                    <li>✅ All creators must verify email before receiving payments</li>
                    <li>✅ Payments held for 7 days before reaching creator</li>
                    <li>✅ Report fraudulent profiles — reviewed within 24 hours</li>
                    <li>✅ Refunds available within 48 hours of payment</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2 text-blue-400">
                    Stripe Security
                </h2>
                <p className="text-gray-400">
                    We never store your card details. All payments are encrypted 
                    by Stripe which is PCI DSS Level 1 certified — the highest 
                    level of payment security available.
                </p>
            </section>
        </div>
    )
}