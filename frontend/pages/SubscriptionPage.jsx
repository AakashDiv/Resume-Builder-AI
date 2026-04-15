import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchCurrentUser } from "../services/authApi.js";
import { createCheckoutSession } from "../services/billingApi.js";

const plans = [
  {
    id: "free",
    title: "Free",
    price: "INR 0/month",
    features: [
      "Job Search",
      "Resume Builder",
      "ATS Score",
      "Basic resume improvement"
    ]
  },
  {
    id: "pro",
    title: "Pro",
    price: "₹299/month",
    features: [
      "Everything in Free",
      "Resume Tailoring",
      "Priority AI improvements",
      "Premium optimization workflows"
    ]
  }
];

export default function SubscriptionPage() {
  const [searchParams] = useSearchParams();
  const [currentPlan, setCurrentPlan] = useState("free");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const status = useMemo(() => searchParams.get("status") || "", [searchParams]);

  useEffect(() => {
    fetchCurrentUser()
      .then((data) => setCurrentPlan(data.user?.plan || "free"))
      .catch(() => setCurrentPlan("free"));
  }, []);

  async function handleUpgrade() {
    if (currentPlan === "pro" || loading) return;

    setLoading(true);
    setError("");

    try {
      const data = await createCheckoutSession();
      if (!data.url) {
        throw new Error("Checkout URL missing");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to start Stripe checkout");
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-xl font-bold">Subscription</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Current plan: <span className="font-semibold uppercase">{currentPlan}</span>
        </p>

        {status === "success" ? (
          <p className="mt-3 rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-600/20 dark:text-emerald-100">
            Payment successful. Your plan will update shortly.
          </p>
        ) : null}

        {status === "cancelled" ? (
          <p className="mt-3 rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-800 dark:bg-amber-600/20 dark:text-amber-100">
            Checkout cancelled. You can retry anytime.
          </p>
        ) : null}

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isPro = plan.id === "pro";

          return (
            <article
              key={plan.id}
              className={`rounded-2xl border p-5 shadow-sm ${
                isCurrent
                  ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-600/10"
                  : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold">{plan.title}</h4>
                {isCurrent ? (
                  <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">Current</span>
                ) : null}
              </div>

              <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{plan.price}</p>

              <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                {plan.features.map((feature) => (
                  <li key={feature}>- {feature}</li>
                ))}
              </ul>

              {isPro ? (
                <button
                  onClick={handleUpgrade}
                  disabled={isCurrent || loading}
                  className="mt-5 w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCurrent ? "Active" : loading ? "Redirecting..." : "Upgrade"}
                </button>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
