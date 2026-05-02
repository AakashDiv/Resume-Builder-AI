import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchCurrentUser } from "../services/authApi.js";
import { activateTestFreePlan, activateTestProPlan, createCheckoutSession } from "../services/billingApi.js";

const plans = [
  {
    id: "free",
    title: "Free",
    price: "INR 0/month",
    features: [
      "JSearch-powered job search",
      "Resume Builder",
      "ATS Score",
      "Basic resume improvement",
      "Top 10 matched jobs"
    ]
  },
  {
    id: "pro",
    title: "Pro",
    price: "INR 299/month",
    features: [
      "Everything in Free",
      "All matched jobs",
      "Resume tailoring and cover letters",
      "Application tracker",
      "Auto-apply queue with 30s pacing",
      "Daily scheduled matching and digest controls"
    ]
  }
];

export default function SubscriptionPage() {
  const [searchParams] = useSearchParams();
  const [currentPlan, setCurrentPlan] = useState("free");
  const [loading, setLoading] = useState(false);
  const [activatingTestPro, setActivatingTestPro] = useState(false);
  const [activatingTestFree, setActivatingTestFree] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

  async function handleActivateTestPro() {
    if (activatingTestPro) return;

    setActivatingTestPro(true);
    setError("");
    setMessage("");

    try {
      const data = await activateTestProPlan();
      setCurrentPlan(data.user?.plan || "pro");
      setMessage("Test Pro activated for this local account.");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to activate Test Pro");
    } finally {
      setActivatingTestPro(false);
    }
  }

  async function handleActivateTestFree() {
    if (activatingTestFree) return;

    setActivatingTestFree(true);
    setError("");
    setMessage("");

    try {
      const data = await activateTestFreePlan();
      setCurrentPlan(data.user?.plan || "free");
      setMessage("Test Free activated for this local account.");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to activate Test Free");
    } finally {
      setActivatingTestFree(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Plan Access</p>
        <h3 className="mt-2 text-2xl font-bold">Subscription</h3>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Current plan: <span className="font-semibold uppercase">{currentPlan}</span>. Pro unlocks the automation layer:
          full matches, queueing, application tracking, and scheduled daily work.
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
        {message ? (
          <p className="mt-3 rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-600/20 dark:text-emerald-100">
            {message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isPro = plan.id === "pro";
          const isFree = plan.id === "free";

          return (
            <article
              key={plan.id}
              className={`rounded-3xl border p-5 shadow-sm ${
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
                  <li key={feature} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {isFree && import.meta.env.DEV ? (
                <button
                  type="button"
                  onClick={handleActivateTestFree}
                  disabled={isCurrent || activatingTestFree}
                  className="mt-5 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  {activatingTestFree ? "Activating..." : "Activate Test Free"}
                </button>
              ) : null}

              {isPro ? (
                <div className="mt-5 space-y-2">
                  <button
                    onClick={handleUpgrade}
                    disabled={isCurrent || loading}
                    className="w-full rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isCurrent ? "Active" : loading ? "Redirecting..." : "Upgrade"}
                  </button>
                  {import.meta.env.DEV ? (
                    <button
                      type="button"
                      onClick={handleActivateTestPro}
                      disabled={isCurrent || activatingTestPro}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                      {activatingTestPro ? "Activating..." : "Activate Test Pro"}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
