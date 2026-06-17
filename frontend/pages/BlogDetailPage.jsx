import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { fetchBlogBySlug } from "../services/blogApi.js";

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    fetchBlogBySlug(slug)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || "Unable to load article.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const blog = data?.blog;
  const canonical = useMemo(() => (blog ? `${window.location.origin}/blog/${blog.slug}` : ""), [blog]);
  const html = useMemo(() => (blog ? buildArticleHtml(blog.content) : ""), [blog]);

  if (loading) {
    return <div className="min-h-screen bg-[#f7f8f4] p-8 text-slate-700">Loading article...</div>;
  }

  if (error || !blog) {
    return <div className="min-h-screen bg-[#f7f8f4] p-8 text-rose-700">{error || "Article not found."}</div>;
  }

  const description = blog.metaDescription || blog.excerpt;
  const title = blog.metaTitle || blog.title;
  const published = blog.publishedAt || blog.createdAt;
  const canonicalUrl = blog.canonicalUrl || canonical;
  const ogImage = blog.ogImage || blog.featuredImage?.url;

  return (
    <article className="bg-[#f7f8f4] text-slate-950">
      <Seo
        title={blog.ogTitle || title}
        description={blog.ogDescription || description}
        canonical={canonicalUrl}
        image={ogImage}
        type="article"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": blog.schemaType || "BlogPosting",
            headline: blog.title,
            description,
            image: ogImage ? [ogImage] : undefined,
            datePublished: published,
            dateModified: blog.updatedAt,
            keywords: (blog.keywords || []).join(", "),
            author: { "@type": "Organization", name: blog.author?.name || "NightHire.ai" },
            publisher: { "@type": "Organization", name: "NightHire.ai", logo: { "@type": "ImageObject", url: `${window.location.origin}/logo.png` } },
            mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl }
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: window.location.origin },
              { "@type": "ListItem", position: 2, name: "Blog", item: `${window.location.origin}/blog` },
              { "@type": "ListItem", position: 3, name: blog.title, item: canonicalUrl }
            ]
          }
        ]}
      />

      <header className="mx-auto max-w-4xl px-5 py-12 md:py-16">
        <Link to="/blog" className="text-sm font-bold text-cyan-700">Blog</Link>
        <p className="mt-5 text-xs font-black uppercase text-cyan-700">{blog.category}</p>
        <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">{blog.title}</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">{blog.excerpt}</p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold text-slate-500">
          <span>{blog.author?.name || "NightHire.ai Editorial Team"}</span>
          <span>{new Date(published).toLocaleDateString()}</span>
          <span>{blog.readingTime} min read</span>
        </div>
      </header>

      {blog.featuredImage?.url ? (
        <div className="mx-auto max-w-5xl px-5">
          <img
            src={blog.featuredImage.url}
            alt={blog.featuredImage.alt || blog.title}
            width="1200"
            height="630"
            className="aspect-[1200/630] w-full rounded-2xl object-cover shadow-sm"
          />
        </div>
      ) : null}

      <main className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <CtaBlock title="Create ATS-Friendly Resume" button="Build Resume Free" />
          <div className="blog-article mt-8" dangerouslySetInnerHTML={{ __html: html }} />
          <CtaBlock title="Build a stronger resume in minutes" button="Use Resume Builder" />
          <div className="mt-8 flex flex-wrap gap-2">
            {(blog.tags || []).map((tag) => (
              <Link key={tag} to={`/blog?tag=${encodeURIComponent(tag)}`} className="rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-700">
                {tag}
              </Link>
            ))}
          </div>
          <CtaBlock title="Ready to apply with confidence?" button="Build Resume Free" />
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-black uppercase text-slate-500">Related Guides</h2>
            <div className="mt-4 space-y-4">
              {(data.relatedBlogs || []).map((item) => (
                <Link key={item._id} to={`/blog/${item.slug}`} className="block text-sm font-bold leading-6 text-slate-900 hover:text-cyan-700">
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-cyan-100 bg-white p-5">
            <h2 className="text-lg font-black">Turn advice into a resume.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Use NightHire.ai to build, preview, and export an ATS-friendly resume.</p>
            <Link to="/builder" className="mt-4 inline-flex rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">
              Open Builder
            </Link>
          </div>
        </aside>
      </main>

      <nav className="mx-auto flex max-w-4xl justify-between gap-4 px-5 pb-16">
        {data.previousBlog ? <Link to={`/blog/${data.previousBlog.slug}`} className="font-bold text-cyan-700">Previous: {data.previousBlog.title}</Link> : <span />}
        {data.nextBlog ? <Link to={`/blog/${data.nextBlog.slug}`} className="font-bold text-cyan-700">Next: {data.nextBlog.title}</Link> : <span />}
      </nav>
    </article>
  );
}

function CtaBlock({ title, button }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Use professional templates, live preview, and ATS-focused content to move faster.</p>
      <Link to="/builder" className="mt-4 inline-flex rounded-xl bg-orange-600 px-4 py-3 text-sm font-black text-white">
        {button}
      </Link>
    </section>
  );
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildArticleHtml(content) {
  const raw = String(content || "").trim();
  if (/<(p|h2|h3|ul|ol|img|blockquote|figure|table|div|section)\b/i.test(raw)) {
    return raw.replace(/<img /g, '<img loading="lazy" ');
  }

  return raw
    .split(/\n{2,}/)
    .map((block) => {
      const text = escapeHtml(block.trim());
      if (!text) return "";
      if (text.startsWith("### ")) return `<h3>${text.slice(4)}</h3>`;
      if (text.startsWith("## ")) return `<h2>${text.slice(3)}</h2>`;
      return `<p>${text.replace(/\n/g, "<br />")}</p>`;
    })
    .join("");
}
