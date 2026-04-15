import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard.jsx";
import AuthForm from "../components/AuthForm.jsx";
import { register } from "../services/authApi.js";
import { setToken } from "../services/authStorage.js";

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function onChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await register(form);
      setToken(data.token);
      navigate("/app/job-search", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-slate-100 px-4">
      <AuthCard title="Create your account" subtitle="Start building your AI-powered resume workflow.">
        <AuthForm
          isSignup
          form={form}
          onChange={onChange}
          onSubmit={onSubmit}
          loading={loading}
          error={error}
        />
      </AuthCard>
    </div>
  );
}
