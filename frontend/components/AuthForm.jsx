import { Link } from "react-router-dom";

export default function AuthForm({ isSignup, form, onChange, onSubmit, loading, error }) {
  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {isSignup ? (
        <div>
          <label className="label-dark">Full Name</label>
          <input name="name" type="text" value={form.name} onChange={onChange} required
            className="input-dark" placeholder="Alex Sharma" />
        </div>
      ) : null}

      <div>
        <label className="label-dark">Email Address</label>
        <input name="email" type="email" value={form.email} onChange={onChange} required
          autoComplete="email" className="input-dark" placeholder="alex@example.com" />
      </div>

      <div>
        <label className="label-dark">Password</label>
        <input name="password" type="password" value={form.password} onChange={onChange} required
          autoComplete={isSignup ? "new-password" : "current-password"}
          className="input-dark" placeholder="••••••••" />
      </div>

      {error ? (
        <div style={{
          background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)",
          borderRadius: 10, padding: "10px 14px",
          fontSize: 13, color: "#f87171"
        }}>{error}</div>
      ) : null}

      <button type="submit" disabled={loading} className="btn-primary"
        style={{ width: "100%", padding: "13px", fontSize: 14, marginTop: 4, justifyContent: "center" }}>
        {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
      </button>

      <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />

      <p style={{ fontSize: 13, color: "var(--t2)", textAlign: "center" }}>
        {isSignup ? "Already have an account? " : "New here? "}
        <Link to={isSignup ? "/login" : "/signup"}
          style={{ color: "var(--cyan)", fontWeight: 700, textDecoration: "none" }}>
          {isSignup ? "Log In" : "Create Account"}
        </Link>
      </p>
    </form>
  );
}
