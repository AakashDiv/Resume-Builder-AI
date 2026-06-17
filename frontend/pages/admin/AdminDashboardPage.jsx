import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchSuperAdminBlogs, fetchSuperAdminStats } from "../../services/adminBlogApi.js";

const S = {
  page: { padding: 32 },
  heading: { fontSize: 26, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" },
  sub: { fontSize: 14, color: "#64748b", margin: "0 0 28px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 18, marginBottom: 28 },
  card: { background: "#fff", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", gap: 16 },
  iconBox: { width: 46, height: 46, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  val: { fontSize: 28, fontWeight: 700, color: "#0f172a", lineHeight: 1 },
  lbl: { fontSize: 12.5, color: "#64748b", marginTop: 4 },
  panel: { background: "#fff", borderRadius: 14, padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
  panelHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  panelTitle: { fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "8px 12px", fontSize: 11.5, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9" },
  td: { padding: "12px", fontSize: 13.5, color: "#374151", verticalAlign: "middle" },
  badge: (status) => ({
    padding: "3px 10px",
    borderRadius: 100,
    fontSize: 11.5,
    fontWeight: 600,
    background: status === "published" ? "#dcfce7" : "#fef9c3",
    color: status === "published" ? "#166534" : "#854d0e"
  }),
  btnOutline: { padding: "7px 16px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#374151", textDecoration: "none", fontWeight: 500 },
  btnPrimary: { padding: "7px 16px", background: "#6366f1", color: "#fff", borderRadius: 8, fontSize: 13, textDecoration: "none", fontWeight: 600 }
};

function Stat({ label, value, bg, iconPath, iconColor }) {
  return (
    <div style={S.card}>
      <div style={{ ...S.iconBox, background: bg }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
      </div>
      <div>
        <div style={S.val}>{value ?? "—"}</div>
        <div style={S.lbl}>{label}</div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchSuperAdminStats(), fetchSuperAdminBlogs({ limit: 8, page: 1 })])
      .then(([s, b]) => {
        setStats(s);
        setBlogs(b.items || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ color: "#6366f1", fontSize: 16 }}>Loading dashboard…</div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <h1 style={S.heading}>Dashboard</h1>
      <p style={S.sub}>Blog management overview</p>

      <div style={S.grid}>
        <Stat
          label="Total Blogs"
          value={stats?.totalBlogs}
          bg="#e0e7ff"
          iconColor="#6366f1"
          iconPath="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6M7 8h2v4"
        />
        <Stat
          label="Published"
          value={stats?.publishedBlogs}
          bg="#dcfce7"
          iconColor="#16a34a"
          iconPath="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <Stat
          label="Drafts"
          value={stats?.draftBlogs}
          bg="#fef9c3"
          iconColor="#ca8a04"
          iconPath="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
        <Stat
          label="Total Views"
          value={(stats?.totalViews || 0).toLocaleString()}
          bg="#fce7f3"
          iconColor="#db2777"
          iconPath="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </div>

      <div style={S.panel}>
        <div style={S.panelHead}>
          <h2 style={S.panelTitle}>Recent Blogs</h2>
          <div style={{ display: "flex", gap: 10 }}>
            <Link to="/admin/blogs" style={S.btnOutline}>View All</Link>
            <Link to="/admin/blogs/create" style={S.btnPrimary}>+ New Blog</Link>
          </div>
        </div>

        {blogs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
            No blogs yet.{" "}
            <Link to="/admin/blogs/create" style={{ color: "#6366f1" }}>
              Create your first blog
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Title</th>
                  <th style={S.th}>Category</th>
                  <th style={S.th}>Status</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Views</th>
                  <th style={S.th}>Date</th>
                  <th style={S.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map(blog => (
                  <tr key={blog._id} style={{ borderBottom: "1px solid #f8fafc" }}>
                    <td style={S.td}>
                      <span style={{ fontWeight: 500, color: "#1e293b" }}>
                        {blog.title.length > 55 ? blog.title.slice(0, 55) + "…" : blog.title}
                      </span>
                    </td>
                    <td style={{ ...S.td, color: "#64748b" }}>{blog.category || "—"}</td>
                    <td style={S.td}>
                      <span style={S.badge(blog.status)}>{blog.status}</span>
                    </td>
                    <td style={{ ...S.td, textAlign: "right", color: "#64748b" }}>
                      {(blog.viewCount || 0).toLocaleString()}
                    </td>
                    <td style={{ ...S.td, color: "#64748b", whiteSpace: "nowrap" }}>
                      {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}
                    </td>
                    <td style={S.td}>
                      <Link
                        to={`/admin/blogs/edit/${blog._id}`}
                        style={{ color: "#6366f1", fontSize: 13, textDecoration: "none", fontWeight: 500 }}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
