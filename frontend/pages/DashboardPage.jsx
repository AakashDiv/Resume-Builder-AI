import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearToken } from "../services/authStorage.js";
import { fetchCurrentUser } from "../services/authApi.js";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCurrentUser()
      .then((data) => setUser(data.user))
      .catch(() => setError("Session is invalid. Please login again."));
  }, []);

  function onLogout() {
    clearToken();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <button
            onClick={onLogout}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>

        <p className="mt-2 text-sm text-slate-600">
          Authentication is live. Resume builder and ATS modules will be plugged in next.
        </p>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        {user ? (
          <div className="mt-6 grid gap-3 text-sm text-slate-700">
            <p><span className="font-semibold">Name:</span> {user.name}</p>
            <p><span className="font-semibold">Email:</span> {user.email}</p>
            <p><span className="font-semibold">Plan:</span> {user.plan}</p>
            <p><span className="font-semibold">Created:</span> {new Date(user.createdAt).toLocaleString()}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
