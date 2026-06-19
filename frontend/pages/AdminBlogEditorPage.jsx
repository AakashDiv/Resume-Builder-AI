import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createAdminBlog, fetchAdminBlog, updateAdminBlog, uploadBlogContentImage } from "../services/blogApi.js";

const EMPTY_FORM = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "",
  tags: "",
  metaTitle: "",
  metaDescription: "",
  keywords: "",
  canonicalUrl: "",
  featuredImageAlt: "",
  status: "draft",
  featuredImage: null
};

export default function AdminBlogEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [existingImage, setExistingImage] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingContentImage, setUploadingContentImage] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!isEditing) return;

    let active = true;
    setLoading(true);
    fetchAdminBlog(id)
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
          metaTitle: blog.metaTitle || "",
          metaDescription: blog.metaDescription || "",
          keywords: (blog.keywords || []).join(", "),
          canonicalUrl: blog.canonicalUrl || "",
          featuredImageAlt: blog.featuredImage?.alt || "",
          status: blog.status || "draft",
          featuredImage: null
        });
      })
      .catch((err) => setError(err?.response?.data?.message || "Unable to load blog."))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, isEditing]);

  const seoScore = useMemo(() => {
    let score = 0;
    if (form.title.length >= 30 && form.title.length <= 70) score += 20;
    if (form.metaDescription.length >= 120 && form.metaDescription.length <= 160) score += 25;
    if (form.excerpt.length >= 80) score += 15;
    if (form.category) score += 10;
    if (toList(form.tags).length >= 2) score += 10;
    if (form.content.split(/\s+/).length >= 600) score += 20;
    return score;
  }, [form]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(status) {
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        status,
        tags: toList(form.tags),
        keywords: toList(form.keywords)
      };
      const result = isEditing ? await updateAdminBlog(id, payload) : await createAdminBlog(payload);
      navigate(`/app/admin/blogs/edit/${result.blog._id}`, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save blog.");
    } finally {
      setSaving(false);
    }
  }

  async function handleContentImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const alt = window.prompt("Alt text for this content image:", form.title || "") || "";
    setUploadingContentImage(true);
    setError("");

    try {
      const { image } = await uploadBlogContentImage(file, alt);
      const imageHtml = `\n\n<img src="${image.url}" alt="${image.alt || alt}" width="${image.width || 800}" loading="lazy" />\n\n`;
      setForm((prev) => ({ ...prev, content: `${prev.content}${imageHtml}` }));
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to upload content image.");
    } finally {
      setUploadingContentImage(false);
      event.target.value = "";
    }
  }

  if (loading) {
    return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">Loading editor...</section>;
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <Link to="/app/admin/blogs" className="text-sm font-semibold text-brand-600">Back to blogs</Link>
          <h1 className="mt-2 text-2xl font-bold">{isEditing ? "Edit Blog" : "Create Blog"}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Draft, optimize, preview, and publish content for organic search growth.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setPreview((value) => !value)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">
            {preview ? "Editor" : "Preview"}
          </button>
          <button type="button" disabled={saving} onClick={() => submit("draft")} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50">
            Save Draft
          </button>
          <button type="button" disabled={saving} onClick={() => submit("published")} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            Publish
          </button>
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {preview ? (
        <Preview form={form} existingImage={existingImage} />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Field label="Title">
              <input value={form.title} onChange={(event) => updateField("title", event.target.value)} className="admin-input" />
            </Field>
            <Field label="Slug">
              <input value={form.slug} onChange={(event) => updateField("slug", event.target.value)} placeholder="auto-generated if empty" className="admin-input" />
            </Field>
            <Field label="Excerpt">
              <textarea value={form.excerpt} onChange={(event) => updateField("excerpt", event.target.value)} rows={3} className="admin-input" />
            </Field>
            <Field label="Content">
              <textarea value={form.content} onChange={(event) => updateField("content", event.target.value)} rows={18} className="admin-input font-mono text-sm" placeholder="Write HTML or simple markdown-style paragraphs. Use ## headings for quick structure." />
            </Field>
            <div className="rounded-2xl border border-dashed border-slate-300 p-4">
              <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Content Image
                <input type="file" accept="image/*" onChange={handleContentImageUpload} disabled={uploadingContentImage} className="mt-3 block w-full text-sm" />
              </label>
              <p className="mt-2 text-xs text-slate-500">
                {uploadingContentImage ? "Uploading optimized image..." : "Uploads an 800px WebP image and inserts it into the article."}
              </p>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Publishing</h2>
              <div className="mt-4 space-y-4">
                <Field label="Category">
                  <input value={form.category} onChange={(event) => updateField("category", event.target.value)} className="admin-input" />
                </Field>
                <Field label="Tags">
                  <input value={form.tags} onChange={(event) => updateField("tags", event.target.value)} placeholder="resume, ats, fresher" className="admin-input" />
                </Field>
                <Field label="Featured Image">
                  <input type="file" accept="image/*" onChange={(event) => updateField("featuredImage", event.target.files?.[0] || null)} className="block w-full text-sm" />
                </Field>
                <Field label="Image Alt Text">
                  <input value={form.featuredImageAlt} onChange={(event) => updateField("featuredImageAlt", event.target.value)} className="admin-input" />
                </Field>
                {existingImage?.url ? <img src={existingImage.url} alt={existingImage.alt || "Featured"} className="aspect-[1200/630] w-full rounded-xl object-cover" /> : null}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">SEO</h2>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                  <p className="text-xs font-bold text-slate-500">SEO readiness</p>
                  <p className="mt-1 text-3xl font-black">{seoScore}%</p>
                </div>
                <Field label={`Meta Title (${form.metaTitle.length}/70)`}>
                  <input value={form.metaTitle} onChange={(event) => updateField("metaTitle", event.target.value)} className="admin-input" />
                </Field>
                <Field label={`Meta Description (${form.metaDescription.length}/160)`}>
                  <textarea value={form.metaDescription} onChange={(event) => updateField("metaDescription", event.target.value)} rows={3} className="admin-input" />
                </Field>
                <Field label="Keywords">
                  <input value={form.keywords} onChange={(event) => updateField("keywords", event.target.value)} className="admin-input" />
                </Field>
                <Field label="Canonical URL">
                  <input value={form.canonicalUrl} onChange={(event) => updateField("canonicalUrl", event.target.value)} className="admin-input" />
                </Field>
              </div>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Preview({ form, existingImage }) {
  const imageUrl = form.featuredImage ? URL.createObjectURL(form.featuredImage) : existingImage?.url;

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-950 shadow-sm">
      {imageUrl ? <img src={imageUrl} alt={form.featuredImageAlt || form.title} className="aspect-[1200/630] w-full rounded-2xl object-cover" /> : null}
      <p className="mt-6 text-xs font-black uppercase text-cyan-700">{form.category || "Category"}</p>
      <h1 className="mt-3 text-4xl font-black">{form.title || "Blog title"}</h1>
      <p className="mt-4 text-slate-600">{form.excerpt || "Blog excerpt will appear here."}</p>
      <div className="blog-article mt-8 whitespace-pre-wrap">{form.content || "Article content preview."}</div>
    </article>
  );
}

function toList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
