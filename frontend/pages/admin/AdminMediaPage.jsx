import { useEffect, useState } from "react";
import { fetchSuperAdminMedia } from "../../services/adminBlogApi.js";

const S = {
  page: { padding: 32 },
  heading: { fontSize: 24, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" },
  sub: { fontSize: 14, color: "#64748b", margin: "0 0 24px" },
  filterBar: { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" },
  input: { padding: "8px 14px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none", background: "#fff", color: "#0f172a" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 },
  card: { background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
  imgWrap: { width: "100%", aspectRatio: "16/9", overflow: "hidden", background: "#f1f5f9", position: "relative" },
  cardBody: { padding: 12 },
  cardTitle: { fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cardMeta: { fontSize: 11.5, color: "#94a3b8", marginBottom: 10 },
  btnCopy: { padding: "5px 12px", border: "1.5px solid #6366f1", borderRadius: 6, fontSize: 12.5, color: "#6366f1", background: "transparent", cursor: "pointer", fontWeight: 500 },
  pagination: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 28 },
  pageBtn: (disabled) => ({
    padding: "7px 16px", border: "1.5px solid #e2e8f0", borderRadius: 7,
    fontSize: 13, fontWeight: 500, color: disabled ? "#cbd5e1" : "#374151",
    background: "#fff", cursor: disabled ? "not-allowed" : "pointer"
  })
};

export default function AdminMediaPage() {
  const [data, setData] = useState({ media: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [copied, setCopied] = useState("");

  async function load(p = 1, query = q) {
    setLoading(true);
    try {
      const result = await fetchSuperAdminMedia({ page: p, limit: 24, q: query });
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(page, q); }, [page, q]);

  function copyUrl(url) {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(url);
      setTimeout(() => setCopied(""), 2000);
    });
  }

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    setQ(searchInput.trim());
  }

  return (
    <div style={S.page}>
      <h1 style={S.heading}>Media Library</h1>
      <p style={S.sub}>Featured images from all blog posts</p>

      <div style={S.filterBar}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
          <input
            style={{ ...S.input, width: 240 }}
            type="text"
            placeholder="Search by blog title…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          <button type="submit" style={{ padding: "8px 14px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, fontSize: 13.5, cursor: "pointer" }}>
            Search
          </button>
          {q && (
            <button type="button" onClick={() => { setSearchInput(""); setQ(""); setPage(1); }}
              style={{ padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "#fff", color: "#64748b" }}>
              Clear
            </button>
          )}
        </form>
        <span style={{ fontSize: 13.5, color: "#94a3b8", marginLeft: "auto" }}>
          {data.total} image{data.total !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>Loading media…</div>
      ) : data.media.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
          No images found. Publish blogs with featured images to see them here.
        </div>
      ) : (
        <>
          <div style={S.grid}>
            {data.media.map(item => (
              <div key={item.id} style={S.card}>
                <div style={S.imgWrap}>
                  <img
                    src={item.url}
                    alt={item.alt || item.blogTitle}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    loading="lazy"
                  />
                </div>
                <div style={S.cardBody}>
                  <div style={S.cardTitle} title={item.blogTitle}>{item.blogTitle}</div>
                  <div style={S.cardMeta}>
                    {item.width && item.height ? `${item.width}×${item.height} · ` : ""}
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                  <button
                    style={{ ...S.btnCopy, background: copied === item.url ? "#dcfce7" : "transparent", borderColor: copied === item.url ? "#16a34a" : "#6366f1", color: copied === item.url ? "#16a34a" : "#6366f1" }}
                    onClick={() => copyUrl(item.url)}
                  >
                    {copied === item.url ? "✓ Copied!" : "Copy URL"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {data.pages > 1 && (
            <div style={S.pagination}>
              <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} style={S.pageBtn(page <= 1)}>
                ← Previous
              </button>
              <span style={{ fontSize: 13.5, color: "#64748b" }}>Page {page} of {data.pages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= data.pages} style={S.pageBtn(page >= data.pages)}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
