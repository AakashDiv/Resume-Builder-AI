import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  createSuperAdminBlog,
  deleteSuperAdminBlog,
  fetchSuperAdminBlog,
  updateSuperAdminBlog,
  uploadSuperAdminContentImage
} from "../../services/adminBlogApi.js";

const CATEGORIES = [
  "Resume Tips", "Career Advice", "Job Search", "Interview Tips",
  "ATS Guide", "Cover Letter", "LinkedIn Tips", "Salary Guide", "Remote Work"
];

const SCHEMA_TYPES = ["Article", "BlogPosting", "NewsArticle", "HowTo", "FAQPage"];

const EMPTY = {
  title: "", slug: "", excerpt: "", content: "", category: "",
  tags: "", keywords: "", canonicalUrl: "", featuredImageAlt: "",
  metaTitle: "", metaDescription: "", focusKeyword: "",
  ogTitle: "", ogDescription: "", ogImage: "", schemaType: "Article",
  status: "draft", featuredImage: null
};

function slugify(v) {
  return String(v || "").toLowerCase().trim()
    .replace(/['"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 200);
}

function wordCount(html) {
  return String(html || "").replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
}

function readingTime(html) {
  return Math.max(1, Math.ceil(wordCount(html) / 220));
}

const QUILL_MODULES = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link", "image"],
      [{ align: [] }],
      ["clean"]
    ]
  }
};

const QUILL_FORMATS = [
  "header", "bold", "italic", "underline", "strike",
  "list", "bullet", "blockquote", "code-block",
  "link", "image", "align"
];

const S = {
  page: { padding: 32, maxWidth: 1200, fontFamily: "system-ui, -apple-system, sans-serif" },
  topBar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  heading: { fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 },
  btnGroup: { display: "flex", gap: 10, flexWrap: "wrap" },
  grid: { display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" },
  panel: { background: "#fff", borderRadius: 14, padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 20 },
  panelTitle: { fontSize: 14, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16, margin: "0 0 14px" },
  label: { display: "block", fontSize: 13.5, fontWeight: 600, color: "#374151", marginBottom: 6 },
  input: {
    width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 9,
    fontSize: 14, outline: "none", color: "#0f172a", background: "#fff", boxSizing: "border-box"
  },
  textarea: {
    width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 9,
    fontSize: 14, outline: "none", color: "#0f172a", background: "#fff", resize: "vertical",
    boxSizing: "border-box", fontFamily: "inherit"
  },
  select: {
    width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 9,
    fontSize: 14, outline: "none", color: "#374151", background: "#fff", boxSizing: "border-box"
  },
  row: { marginBottom: 16 },
  hint: { fontSize: 12, color: "#94a3b8", marginTop: 4 },
  errBox: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 16px", color: "#dc2626", fontSize: 14, marginBottom: 18 },
  btnPrimary: { padding: "10px 22px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnSuccess: { padding: "10px 22px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnOutline: { padding: "10px 18px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", background: "#fff", color: "#374151" },
  btnDanger: { padding: "10px 18px", border: "1.5px solid #fca5a5", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", background: "#fff", color: "#dc2626" },
};

export default function AdminBlogEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(EMPTY);
  const [existingImage, setExistingImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const quillRef = useRef(null);

  useEffect(() => {
    if (!isEditing) return;
    let active = true;
    setLoading(true);
    fetchSuperAdminBlog(id)
      .then(({ blog }) => {
        if (!active) return;
        setExistingImage(blog.featuredImage || null);
        setForm({
          title: blog.title || "",
          slug: blog.slug || "",
          excerpt: blog.excerpt || "",
          content: blog.content || "",
          category: blog.category || "",
          tags: (blog.tags || []).join(", "),
          keywords: (blog.keywords || []).join(", "),
          canonicalUrl: blog.canonicalUrl || "",
          featuredImageAlt: blog.featuredImage?.alt || "",
          metaTitle: blog.metaTitle || "",
          metaDescription: blog.metaDescription || "",
          focusKeyword: blog.focusKeyword || "",
          ogTitle: blog.ogTitle || "",
          ogDescription: blog.ogDescription || "",
          ogImage: blog.ogImage || "",
          schemaType: blog.schemaType || "Article",
          status: blog.status || "draft",
          featuredImage: null
        });
      })
      .catch(err => setError(err?.response?.data?.message || "Unable to load blog."))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, isEditing]);

  function set(key, value) {
    setForm(p => {
      const next = { ...p, [key]: value };
      if (key === "title" && !isEditing) next.slug = slugify(value);
      return next;
    });
  }

  function handleImageFile(file) {
    if (!file) return;
    setForm(p => ({ ...p, featuredImage: file }));
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  }

  const words = useMemo(() => wordCount(form.content), [form.content]);
  const readMin = useMemo(() => readingTime(form.content), [form.content]);

  const seoScore = useMemo(() => {
    let s = 0;
    if (form.title.length >= 30 && form.title.length <= 70) s += 20;
    if (form.metaDescription.length >= 120 && form.metaDescription.length <= 160) s += 20;
    if (form.excerpt.length >= 80) s += 10;
    if (form.category) s += 10;
    if (form.focusKeyword) s += 10;
    if (form.tags.trim()) s += 10;
    if (words >= 600) s += 20;
    return s;
  }, [form, words]);

  async function imageHandler() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        const { image } = await uploadSuperAdminContentImage(file, "");
        const editor = quillRef.current?.getEditor();
        if (editor) {
          const range = editor.getSelection(true);
          editor.insertEmbed(range.index, "image", image.url);
        }
      } catch (err) {
        setError("Image upload failed: " + (err?.response?.data?.message || err.message));
      }
    };
    input.click();
  }

  const modules = useMemo(() => ({
    ...QUILL_MODULES,
    toolbar: {
      ...QUILL_MODULES.toolbar,
      handlers: { image: imageHandler }
    }
  }), []);

  async function save(publishStatus) {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        ...form,
        status: publishStatus ?? form.status,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        keywords: form.keywords.split(",").map(k => k.trim()).filter(Boolean)
      };
      if (isEditing) {
        await updateSuperAdminBlog(id, payload);
        setSuccess("Blog updated successfully.");
      } else {
        const { blog } = await createSuperAdminBlog(payload);
        setSuccess("Blog created successfully!");
        navigate(`/admin/blogs/edit/${blog._id}`, { replace: true });
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await deleteSuperAdminBlog(id);
      navigate("/admin/blogs", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Delete failed.");
      setSaving(false);
    }
  }

  if (loading) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#6366f1" }}>Loading…</div>;
  }

  return (
    <div style={S.page}>
      <div style={S.topBar}>
        <h1 style={S.heading}>{isEditing ? "Edit Blog" : "Create Blog"}</h1>
        <div style={S.btnGroup}>
          {isEditing && (
            <button onClick={() => setShowDeleteModal(true)} style={S.btnDanger} disabled={saving}>
              Delete
            </button>
          )}
          <button onClick={() => save("draft")} style={S.btnOutline} disabled={saving}>
            {saving ? "Saving…" : "Save Draft"}
          </button>
          <button onClick={() => save("published")} style={S.btnSuccess} disabled={saving}>
            {saving ? "Publishing…" : isEditing ? "Update & Publish" : "Publish"}
          </button>
        </div>
      </div>

      {error && <div style={S.errBox}>{error}</div>}
      {success && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "12px 16px", color: "#16a34a", fontSize: 14, marginBottom: 18 }}>
          {success}
        </div>
      )}

      <div style={S.grid}>
        <div>
          <div style={S.panel}>
            <p style={S.panelTitle}>Content</p>

            <div style={S.row}>
              <label style={S.label}>Blog Title *</label>
              <input
                style={S.input}
                value={form.title}
                onChange={e => set("title", e.target.value)}
                placeholder="Enter blog title…"
                maxLength={180}
              />
              <div style={S.hint}>{form.title.length}/180 characters</div>
            </div>

            <div style={S.row}>
              <label style={S.label}>Slug</label>
              <input
                style={{ ...S.input, fontFamily: "monospace", fontSize: 13 }}
                value={form.slug}
                onChange={e => set("slug", slugify(e.target.value))}
                placeholder="auto-generated-slug"
              />
              <div style={S.hint}>URL: /blog/{form.slug || "your-slug"}</div>
            </div>

            <div style={S.row}>
              <label style={S.label}>Excerpt</label>
              <textarea
                style={{ ...S.textarea, minHeight: 80 }}
                value={form.excerpt}
                onChange={e => set("excerpt", e.target.value)}
                placeholder="Short summary of the blog post…"
                maxLength={320}
              />
              <div style={S.hint}>{form.excerpt.length}/320 characters</div>
            </div>

            <div style={S.row}>
              <label style={S.label}>Content *</label>
              <div style={{ border: "1.5px solid #e2e8f0", borderRadius: 9, overflow: "hidden" }}>
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={form.content}
                  onChange={v => set("content", v)}
                  modules={modules}
                  formats={QUILL_FORMATS}
                  style={{ minHeight: 400 }}
                />
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
                <span style={S.hint}>{words} words</span>
                <span style={S.hint}>{readMin} min read</span>
              </div>
            </div>
          </div>

          <div style={S.panel}>
            <p style={S.panelTitle}>SEO</p>

            <div style={S.row}>
              <label style={S.label}>Focus Keyword</label>
              <input
                style={S.input}
                value={form.focusKeyword}
                onChange={e => set("focusKeyword", e.target.value)}
                placeholder="Main keyword for this post"
              />
            </div>

            <div style={S.row}>
              <label style={S.label}>Meta Title</label>
              <input
                style={S.input}
                value={form.metaTitle}
                onChange={e => set("metaTitle", e.target.value)}
                placeholder="SEO title (50–70 chars recommended)"
                maxLength={70}
              />
              <div style={{ ...S.hint, color: form.metaTitle.length > 60 && form.metaTitle.length <= 70 ? "#16a34a" : form.metaTitle.length > 70 ? "#dc2626" : "#94a3b8" }}>
                {form.metaTitle.length}/70
              </div>
            </div>

            <div style={S.row}>
              <label style={S.label}>Meta Description</label>
              <textarea
                style={{ ...S.textarea, minHeight: 80 }}
                value={form.metaDescription}
                onChange={e => set("metaDescription", e.target.value)}
                placeholder="SEO description (120–160 chars recommended)"
                maxLength={170}
              />
              <div style={{ ...S.hint, color: form.metaDescription.length >= 120 && form.metaDescription.length <= 160 ? "#16a34a" : "#94a3b8" }}>
                {form.metaDescription.length}/170
              </div>
            </div>

            <div style={S.row}>
              <label style={S.label}>Canonical URL</label>
              <input
                style={S.input}
                value={form.canonicalUrl}
                onChange={e => set("canonicalUrl", e.target.value)}
                placeholder="https://example.com/blog/post-slug"
              />
            </div>

            <div style={S.row}>
              <label style={S.label}>Keywords (comma-separated)</label>
              <input
                style={S.input}
                value={form.keywords}
                onChange={e => set("keywords", e.target.value)}
                placeholder="resume, cv, job search"
              />
            </div>

            <p style={{ ...S.panelTitle, marginTop: 20 }}>Open Graph</p>

            <div style={S.row}>
              <label style={S.label}>OG Title</label>
              <input
                style={S.input}
                value={form.ogTitle}
                onChange={e => set("ogTitle", e.target.value)}
                placeholder="Defaults to meta title if empty"
                maxLength={95}
              />
            </div>

            <div style={S.row}>
              <label style={S.label}>OG Description</label>
              <textarea
                style={{ ...S.textarea, minHeight: 72 }}
                value={form.ogDescription}
                onChange={e => set("ogDescription", e.target.value)}
                placeholder="Defaults to meta description if empty"
                maxLength={200}
              />
            </div>

            <div style={S.row}>
              <label style={S.label}>OG Image URL</label>
              <input
                style={S.input}
                value={form.ogImage}
                onChange={e => set("ogImage", e.target.value)}
                placeholder="https://… (defaults to featured image)"
              />
            </div>

            <div style={S.row}>
              <label style={S.label}>Schema Type</label>
              <select style={S.select} value={form.schemaType} onChange={e => set("schemaType", e.target.value)}>
                {SCHEMA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div>
          <div style={S.panel}>
            <p style={S.panelTitle}>Publish</p>

            <div style={S.row}>
              <label style={S.label}>Status</label>
              <select style={S.select} value={form.status} onChange={e => set("status", e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div style={{ background: "#f8fafc", borderRadius: 10, padding: 14, marginTop: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: "#64748b" }}>SEO Score</span>
                <span style={{ fontWeight: 700, color: seoScore >= 70 ? "#16a34a" : seoScore >= 40 ? "#ca8a04" : "#dc2626" }}>
                  {seoScore}/100
                </span>
              </div>
              <div style={{ height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 3, transition: "width 0.3s ease",
                  width: `${seoScore}%`,
                  background: seoScore >= 70 ? "#16a34a" : seoScore >= 40 ? "#ca8a04" : "#ef4444"
                }} />
              </div>
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 10, fontSize: 12.5, color: "#64748b" }}>
              <span>📝 {words} words</span>
              <span>⏱ {readMin} min read</span>
            </div>
          </div>

          <div style={S.panel}>
            <p style={S.panelTitle}>Featured Image</p>

            <div
              style={{
                border: "2px dashed #e2e8f0", borderRadius: 10, padding: 20,
                textAlign: "center", cursor: "pointer", background: "#f8fafc",
                marginBottom: 14
              }}
              onClick={() => document.getElementById("featuredImageInput").click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleImageFile(e.dataTransfer.files[0]); }}
            >
              {imagePreview || existingImage?.url ? (
                <img
                  src={imagePreview || existingImage?.url}
                  alt="Preview"
                  style={{ maxWidth: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 8 }}
                />
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#cbd5e1" strokeWidth={1.5} style={{ margin: "0 auto 8px", display: "block" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>Click or drag to upload</div>
                  <div style={{ fontSize: 11.5, color: "#cbd5e1", marginTop: 4 }}>1200×630 recommended • Max 5MB</div>
                </>
              )}
            </div>

            <input
              id="featuredImageInput"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={e => handleImageFile(e.target.files[0])}
            />

            {(imagePreview || existingImage?.url) && (
              <div style={S.row}>
                <label style={S.label}>Alt Text</label>
                <input
                  style={S.input}
                  value={form.featuredImageAlt}
                  onChange={e => set("featuredImageAlt", e.target.value)}
                  placeholder="Describe the image"
                />
              </div>
            )}

            {imagePreview && (
              <button
                onClick={() => { setImagePreview(null); setForm(p => ({ ...p, featuredImage: null })); }}
                style={{ fontSize: 12.5, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                Remove new image
              </button>
            )}
          </div>

          <div style={S.panel}>
            <p style={S.panelTitle}>Taxonomy</p>

            <div style={S.row}>
              <label style={S.label}>Category *</label>
              <select style={S.select} value={form.category} onChange={e => set("category", e.target.value)}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={S.row}>
              <label style={S.label}>Tags (comma-separated)</label>
              <input
                style={S.input}
                value={form.tags}
                onChange={e => set("tags", e.target.value)}
                placeholder="resume tips, fresher, ats"
              />
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 400, width: "100%" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ textAlign: "center", fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 10px" }}>Delete Blog</h3>
            <p style={{ textAlign: "center", color: "#64748b", fontSize: 14, margin: "0 0 6px" }}>
              Are you sure you want to delete this blog?
            </p>
            <p style={{ textAlign: "center", color: "#dc2626", fontSize: 13, margin: "0 0 24px" }}>
              This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, padding: "10px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, cursor: "pointer", background: "#fff", color: "#374151" }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={saving} style={{ flex: 1, padding: "10px", background: "#dc2626", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", color: "#fff", fontWeight: 600 }}>
                {saving ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
