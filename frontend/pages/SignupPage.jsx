import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard.jsx";
import AuthForm from "../components/AuthForm.jsx";
import { signup } from "../services/authApi.js";
import { setToken } from "../services/authStorage.js";

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  function onChange(e) { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })); }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const data = await signup(form);
      setToken(data.token);
      navigate("/app/dashboard", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Sign up failed. Please try again.");
    } finally { setLoading(false); }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, position: "relative", overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", top: -200, left: -100, width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(129,140,248,0.07) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />
      <AuthCard title="Create your account" subtitle="Start building your AI-optimized resume for free.">
        <AuthForm isSignup={true} form={form} onChange={onChange} onSubmit={onSubmit} loading={loading} error={error} />
      </AuthCard>
    </div>
  );
}
