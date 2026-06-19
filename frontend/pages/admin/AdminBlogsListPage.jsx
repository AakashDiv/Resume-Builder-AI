import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { deleteSuperAdminBlog, fetchSuperAdminBlogs } from "../../services/adminBlogApi.js";

const S = {
  page: { padding: 32 },
  topBar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 },
  heading: { fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 },
  btnPrimary: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "9px 18px", background: "#6366f1", color: "#fff",
    borderRadius: 8, fontSize: 14, textDecoration: "none", fontWeight: 600
  },
  filterBar: {
    display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap"
  },
  input: {
    padding: "8px 14px", border: "1.5px solid #e2e8f0", borderRadius: 8,
    fontSize: 14, outline: "none", background: "#fff", color: "#0f172a"
  },
  select: {
    padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8,
    fontSize: 14, outline: "none", background: "#fff", color: "#374151"
  },
  panel: { background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left", padding: "12px 16px", fontSize: 11.5, fontWeight: 600,
    color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em",
    background: "#f8fafc", borderBottom: "1px solid #f1f5f9"
  },
  td: { padding: "14px 16px", fontSize: 13.5, color: "#374151", verticalAlign: "middle", borderBottom: "1px solid #f8fafc" },
  badge: (status) => ({
    display: "inline-block", padding: "3px 10px", borderRadius: 100, fontSize: 11.5, fontWeight: 600,
    background: status === "published" ? "#dcfce7" : "#fef9c3",
    color: status === "published" ? "#166534" : "#854d0e"
  }),
  pagination: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid #f1f5f9" },
  pageBtn: (disabled) => ({
    padding: "6px 14px", border: "1.5px solid #e2e8f0", borderRadius: 7,
    fontSize: 13, fontWeight: 500, color: disabled ? "#cbd5e1" : "#374151",
    background: "#fff", cursor: disabled ? "not-allowed" : "pointer"
  })
};

const CATEGORIES = [
  "Resume Tips", "Career Advice", "Job Search", "Interview Tips",
  "ATS Guide", "Cover Letter", "LinkedIn Tips", "Salary Guide", "Remote Work"
];

export default function AdminBlogsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ items: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [deletingId, setDeletingId] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const searchRef = useRef(null);

  const page = Number(searchParams.get("page") || 1);
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";
  const category = searchParams.get("category") || "";
  const fromDate = searchParams.get("fromDate") || "";
  const toDate = searchParams.get("toDate") || "";

  async function load() {
    setLoading(true);
    setError("");
    try {
      const result = await fetchSuperAdminBlogs({ page, q, status, category, fromDate, toDate, limit: 10 });
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load blogs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page, q, status, category, fromDate, toDate]);

  function setFilter(next) {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    if (!("page" in next)) params.set("page", "1");
    setSearchParams(params);
  }

  function submitSearch(e) {
    e.preventDefault();
    setFilter({ q: query.trim(), page: "1" });
  }

  async function confirmDelete() {
    if (!showDeleteModal) return;
    setDeletingId(showDeleteModal._id);
    setShowDeleteModal(null);
    try {
      await deleteSuperAdminBlog(showDeleteModal._id);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to delete blog.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div style={S.page}>
      <div style={S.topBar}>
        <div>
          <h1 style={S.heading}>All Blogs</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#64748b" }}>
            {data.total} blog{data.total !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link to="/admin/blogs/create" style={S.btnPrimary}>
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Blog
        </Link>
      </div>

      <div style={S.filterBar}>
        <form onSubmit={submitSearch} style={{ display: "flex", gap: 8 }}>
          <input
            ref={searchRef}
            style={{ ...S.input, width: 220 }}
            type="text"
            placeholder="Search blogs…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button type="submit" style={{ padding: "8px 14px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, fontSize: 13.5, cursor: "pointer", fontWeight: 500 }}>
            Search
          </button>
          {q && (
            <button
              type="button"
              onClick={() => { setQuery(""); setFilter({ q: "", page: "1" }); }}
              style={{ padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "#fff", color: "#64748b" }}
            >
              Clear
            </button>
          )}
        </form>

        <select style={S.select} value={status} onChange={e => setFilter({ status: e.target.value })}>
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        <select style={S.select} value={category} onChange={e => setFilter({ category: e.target.value })}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <input
          type="date"
          style={{ ...S.select, color: fromDate ? "#0f172a" : "#94a3b8" }}
          value={fromDate}
          onChange={e => setFilter({ fromDate: e.target.value })}
          title="From date"
        />
        <input
          type="date"
          style={{ ...S.select, color: toDate ? "#0f172a" : "#94a3b8" }}
          value={toDate}
          onChange={e => setFilter({ toDate: e.target.value })}
          title="To date"
        />
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 16px", marginBottom: 16, color: "#dc2626", fontSize: 14 }}>
          {error}
        </div>
      )}

      <div style={S.panel}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>Loading…</div>
        ) : data.items.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>
            No blogs found.{" "}
            <Link to="/admin/blogs/create" style={{ color: "#6366f1" }}>Create the first one</Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 72 }}>Image</th>
                  <th style={S.th}>Title</th>
                  <th style={S.th}>Slug</th>
                  <th style={S.th}>Category</th>
                  <th style={S.th}>Status</th>
                  <th style={S.th}>Published</th>
                  <th style={{ ...S.th, textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map(blog => (
                  <tr key={blog._id}>
                    <td style={S.td}>
                      {blog.featuredImage?.url ? (
                        <img
                          src={blog.featuredImage.url}
                          alt={blog.featuredImage.alt || blog.title}
                          style={{ width: 56, height: 40, objectFit: "cover", borderRadius: 6, display: "block" }}
                        />
                      ) : (
                        <div style={{ width: 56, height: 40, background: "#f1f5f9", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#cbd5e1" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td style={S.td}>
                      <span style={{ fontWeight: 500, color: "#1e293b" }}>
                        {blog.title.length > 50 ? blog.title.slice(0, 50) + "…" : blog.title}
                      </span>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                        {blog.readingTime} min read
                      </div>
                    </td>
                    <td style={{ ...S.td, color: "#64748b", fontSize: 12.5 }}>
                      <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>
                        {blog.slug.length > 30 ? blog.slug.slice(0, 30) + "…" : blog.slug}
                      </code>
                    </td>
                    <td style={{ ...S.td, color: "#64748b" }}>{blog.category || "—"}</td>
                    <td style={S.td}>
                      <span style={S.badge(blog.status)}>{blog.status}</span>
                    </td>
                    <td style={{ ...S.td, color: "#64748b", whiteSpace: "nowrap", fontSize: 12.5 }}>
                      {blog.publishedAt
                        ? new Date(blog.publishedAt).toLocaleDateString()
                        : <span style={{ color: "#cbd5e1" }}>—</span>}
                    </td>
                    <td style={{ ...S.td, textAlign: "center" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                        <a
                          href={`/blog/${blog.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ padding: "5px 10px", border: "1.5px solid #e2e8f0", borderRadius: 6, fontSize: 12.5, color: "#64748b", textDecoration: "none" }}
                          title="View"
                        >
                          View
                        </a>
                        <Link
                          to={`/admin/blogs/edit/${blog._id}`}
                          style={{ padding: "5px 10px", border: "1.5px solid #6366f1", borderRadius: 6, fontSize: 12.5, color: "#6366f1", textDecoration: "none" }}
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setShowDeleteModal(blog)}
                          disabled={deletingId === blog._id}
                          style={{
                            padding: "5px 10px", border: "1.5px solid #fca5a5", borderRadius: 6,
                            fontSize: 12.5, color: "#dc2626", background: "transparent", cursor: "pointer"
                          }}
                        >
                          {deletingId === blog._id ? "…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data.pages > 1 && (
          <div style={S.pagination}>
            <button
              onClick={() => setFilter({ page: String(page - 1) })}
              disabled={page <= 1}
              style={S.pageBtn(page <= 1)}
            >
              ← Previous
            </button>
            <span style={{ fontSize: 13.5, color: "#64748b" }}>
              Page {page} of {data.pages}
            </span>
            <button
              onClick={() => setFilter({ page: String(page + 1) })}
              disabled={page >= data.pages}
              style={S.pageBtn(page >= data.pages)}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20
          }}
          onClick={() => setShowDeleteModal(null)}
        >
          <div
            style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 420, width: "100%" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <div style={{ width: 52, height: 52, background: "#fef2f2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
            </div>
            <h3 style={{ textAlign: "center", fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>
              Delete Blog
            </h3>
            <p style={{ textAlign: "center", color: "#64748b", fontSize: 14, margin: "0 0 6px" }}>
              Are you sure you want to delete this blog?
            </p>
            <p style={{ textAlign: "center", fontWeight: 600, color: "#1e293b", fontSize: 14, margin: "0 0 24px" }}>
              "{showDeleteModal.title}"
            </p>
            <p style={{ textAlign: "center", color: "#dc2626", fontSize: 13, margin: "0 0 24px" }}>
              This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowDeleteModal(null)}
                style={{ flex: 1, padding: "10px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, cursor: "pointer", background: "#fff", color: "#374151", fontWeight: 500 }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{ flex: 1, padding: "10px", background: "#dc2626", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", color: "#fff", fontWeight: 600 }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
