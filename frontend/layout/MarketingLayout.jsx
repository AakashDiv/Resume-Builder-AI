import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../services/authStorage.js";

const navItems = [
  { label: "Features", to: "/#features" },
  { label: "Job Scraper", to: "/app/job-search" },
  { label: "Templates", to: "/templates" },
  { label: "Pricing", to: "/pricing" },
  { label: "Enterprise", to: "/enterprise" }
];

export default function MarketingLayout() {
  const navigate = useNavigate();
  const authed = isAuthenticated();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-xl font-bold text-white">R</span>
            <span className="text-2xl font-bold tracking-tight">ResumeAI</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
            {navItems.map((item) => (
              <NavLink key={item.label} to={item.to} className="hover:text-slate-900">
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {authed ? (
              <button
                onClick={() => navigate("/app/job-search")}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Sign Up Free
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="mt-20 border-t border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 md:grid-cols-3 md:px-6">
          <div>
            <p className="text-xl font-bold">ResumeAI</p>
            <p className="mt-3 text-sm text-slate-600">Empowering job seekers with AI to build interview-winning resumes.</p>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Product</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>Resume Builder</p>
              <p>ATS Analysis</p>
              <p>Templates</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Support</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>Help Center</p>
              <p>Contact</p>
              <p>Privacy Policy</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
