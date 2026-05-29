import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard.jsx";
import AuthForm from "../components/AuthForm.jsx";
import { login } from "../services/authApi.js";
import { setToken } from "../services/authStorage.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  function onChange(e) { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })); }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const data = await login(form);
      setToken(data.token);
      navigate("/app/dashboard", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Check your credentials.");
    } finally { setLoading(false); }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, position: "relative", overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", top: -200, right: -100, width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />
      <AuthCard title="Welcome back" subtitle="Sign in to your NightHire account.">
        <AuthForm isSignup={false} form={form} onChange={onChange} onSubmit={onSubmit} loading={loading} error={error} />
      </AuthCard>
    </div>
  );
}
