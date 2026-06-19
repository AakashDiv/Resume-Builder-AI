import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchSuperAdminBlogs, fetchSuperAdminCategories } from "../../services/adminBlogApi.js";

const S = {
  page: { padding: 32 },
  heading: { fontSize: 24, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" },
  sub: { fontSize: 14, color: "#64748b", margin: "0 0 24px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 },
  card: {
    background: "#fff", borderRadius: 14, padding: "20px 22px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex",
    alignItems: "center", justifyContent: "space-between"
  },
  catName: { fontSize: 15, fontWeight: 600, color: "#1e293b" },
  count: { fontSize: 13, color: "#94a3b8", marginTop: 4 },
  badge: { padding: "4px 12px", background: "#e0e7ff", borderRadius: 100, fontSize: 13, fontWeight: 700, color: "#4338ca" },
  link: { fontSize: 13, color: "#6366f1", textDecoration: "none", fontWeight: 500 }
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchSuperAdminCategories(),
      fetchSuperAdminBlogs({ limit: 200, page: 1 })
    ]).then(([{ categories: cats }, { items }]) => {
      setCategories(cats);
      const c = {};
      (items || []).forEach(b => { c[b.category] = (c[b.category] || 0) + 1; });
      setCounts(c);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#6366f1" }}>Loading…</div>;
  }

  return (
    <div style={S.page}>
      <h1 style={S.heading}>Categories</h1>
      <p style={S.sub}>Blog categories derived from existing posts</p>

      {categories.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
          No categories yet. Categories are created when you create blogs.{" "}
          <Link to="/admin/blogs/create" style={{ color: "#6366f1" }}>Create a blog</Link>
        </div>
      ) : (
        <div style={S.grid}>
          {categories.map(cat => (
            <div key={cat} style={S.card}>
              <div>
                <div style={S.catName}>{cat}</div>
                <div style={S.count}>{counts[cat] || 0} post{counts[cat] !== 1 ? "s" : ""}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                <span style={S.badge}>{counts[cat] || 0}</span>
                <Link to={`/admin/blogs?category=${encodeURIComponent(cat)}`} style={S.link}>
                  View posts
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 32, background: "#fff", borderRadius: 14, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 12px" }}>About Categories</h2>
        <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, margin: 0 }}>
          Categories are automatically managed based on the blogs you create. To add a new category, simply{" "}
          <Link to="/admin/blogs/create" style={{ color: "#6366f1" }}>create a blog</Link> and select or type a new category name in the editor.
        </p>
      </div>
    </div>
  );
}
