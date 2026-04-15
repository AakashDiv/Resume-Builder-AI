import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../services/authStorage.js";

const plans = [
  {
    id: "free",
    title: "Free",
    price: "?0/month",
    points: ["Public resume builder", "ATS basics", "Standard templates", "Job search"]
  },
  {
    id: "pro",
    title: "Pro",
    price: "?299/month",
    points: ["Everything in Free", "Resume tailoring", "Priority AI rewrite", "Premium templates"]
  }
];

export default function PublicPricingPage() {
  const navigate = useNavigate();
  const authed = isAuthenticated();

  function handleProAction() {
    if (!authed) {
      navigate("/login");
      return;
    }
    navigate("/app/subscription");
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold">Simple Pricing</h1>
        <p className="mt-4 text-lg text-slate-600">Start free. Upgrade only when you need advanced optimization features.</p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`rounded-2xl border p-6 ${
              plan.id === "pro" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white"
            }`}
          >
            <p className="text-3xl font-extrabold">{plan.title}</p>
            <p className="mt-1 text-4xl font-extrabold">{plan.price}</p>
            <ul className="mt-6 space-y-2 text-sm text-slate-700">
              {plan.points.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>

            {plan.id === "free" ? (
              <button
                onClick={() => navigate("/builder")}
                className="mt-8 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Start Free
              </button>
            ) : (
              <button
                onClick={handleProAction}
                className="mt-8 w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                {authed ? "Upgrade to Pro" : "Log In to Upgrade"}
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
