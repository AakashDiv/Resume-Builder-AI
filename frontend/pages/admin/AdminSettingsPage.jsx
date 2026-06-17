import { useState } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";
import { adminAuthVerify } from "../../services/adminBlogApi.js";

const S = {
  page: { padding: 32, maxWidth: 700 },
  heading: { fontSize: 24, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" },
  sub: { fontSize: 14, color: "#64748b", margin: "0 0 28px" },
  panel: { background: "#fff", borderRadius: 14, padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 20 },
  panelTitle: { fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f1f5f9" },
  label: { fontSize: 14, fontWeight: 500, color: "#374151" },
  value: { fontSize: 13.5, color: "#64748b" },
  badge: (ok) => ({
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "4px 12px", borderRadius: 100, fontSize: 12.5, fontWeight: 600,
    background: ok ? "#dcfce7" : "#fef2f2",
    color: ok ? "#166534" : "#dc2626"
  }),
  btn: {
    padding: "9px 20px", background: "#6366f1", color: "#fff",
    border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer"
  },
  btnDanger: {
    padding: "9px 20px", background: "#fff", color: "#dc2626",
    border: "1.5px solid #fca5a5", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer"
  }
};

export default function AdminSettingsPage() {
  const { adminLogout } = useAdminAuth();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(null);

  async function checkSession() {
    setVerifying(true);
    try {
      await adminAuthVerify();
      setVerified(true);
    } catch {
      setVerified(false);
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div style={S.page}>
      <h1 style={S.heading}>Settings</h1>
      <p style={S.sub}>Admin panel configuration and session management</p>

      <div style={S.panel}>
        <h2 style={S.panelTitle}>Session</h2>
        <div style={S.row}>
          <span style={S.label}>Authentication Status</span>
          {verified === null ? (
            <button onClick={checkSession} disabled={verifying} style={{ ...S.btn, padding: "7px 16px", fontSize: 13 }}>
              {verifying ? "Checking…" : "Verify Session"}
            </button>
          ) : (
            <span style={S.badge(verified)}>
              {verified ? "✓ Session Valid" : "✗ Session Invalid"}
            </span>
          )}
        </div>
        <div style={{ ...S.row, borderBottom: "none", paddingBottom: 0 }}>
          <div>
            <div style={S.label}>Sign Out</div>
            <div style={{ fontSize: 12.5, color: "#94a3b8", marginTop: 3 }}>Clears your admin session from this browser</div>
          </div>
          <button onClick={adminLogout} style={S.btnDanger}>Logout</button>
        </div>
      </div>

      <div style={S.panel}>
        <h2 style={S.panelTitle}>Environment</h2>
        <div style={S.row}>
          <span style={S.label}>Admin Routes</span>
          <span style={S.value}>/admin/*</span>
        </div>
        <div style={S.row}>
          <span style={S.label}>API Prefix</span>
          <span style={S.value}>/api/super-admin/*</span>
        </div>
        <div style={{ ...S.row, borderBottom: "none" }}>
          <span style={S.label}>Auth Endpoint</span>
          <span style={S.value}>/api/admin-auth/*</span>
        </div>
      </div>

      <div style={S.panel}>
        <h2 style={S.panelTitle}>SEO Checklist</h2>
        {[
          ["XML Sitemap", "/api/blogs/sitemap.xml", "Auto-generated from published blogs"],
          ["Robots.txt", "/robots.txt", "Auto-generated with sitemap reference"],
          ["Open Graph Tags", "Automatic", "Set OG title/description/image in blog editor"],
          ["Schema Markup", "Automatic", "Configure schema type per blog (Article, BlogPosting, etc.)"],
          ["Canonical URLs", "Per blog", "Set in the SEO panel of each blog"],
          ["Reading Time", "Automatic", "Calculated from word count at ~220 wpm"]
        ].map(([feat, val, desc]) => (
          <div key={feat} style={S.row}>
            <div>
              <div style={S.label}>{feat}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{desc}</div>
            </div>
            <span style={{ fontSize: 12.5, color: "#6366f1", fontWeight: 500 }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
