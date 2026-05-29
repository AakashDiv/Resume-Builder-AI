export default function AuthCard({ title, subtitle, children }) {
  return (
    <div style={{
      width: "100%", maxWidth: 420,
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: 20, padding: 36,
      boxShadow: "0 24px 64px rgba(0,0,0,0.5)"
    }}>
      {/* Logo mark */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "linear-gradient(135deg, #22d3ee, #818cf8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "Sora, sans-serif"
        }}>N</div>
        <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "Sora, sans-serif", color: "var(--t1)" }}>
          NightHire<span style={{ color: "var(--cyan)" }}>.</span>ai
        </span>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 800, fontFamily: "Sora, sans-serif", marginBottom: 6, color: "var(--t1)" }}>{title}</h1>
      <p style={{ fontSize: 13, color: "var(--t2)", marginBottom: 28 }}>{subtitle}</p>
      {children}
    </div>
  );
}
