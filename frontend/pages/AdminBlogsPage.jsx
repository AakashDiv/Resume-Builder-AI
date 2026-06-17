import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { deleteAdminBlog, fetchAdminBlogs } from "../services/blogApi.js";

export default function AdminBlogsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ items: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [deletingId, setDeletingId] = useState("");

  const page = Number(searchParams.get("page") || 1);
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";

  async function loadBlogs() {
    setLoading(true);
    setError("");
    try {
      const result = await fetchAdminBlogs({ page, q, status, limit: 10 });
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load blogs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBlogs();
  }, [page, q, status]);

  function setFilter(next) {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    if (!("page" in next)) params.set("page", "1");
    setSearchParams(params);
  }

  async function handleDelete(blog) {
    if (!window.confirm(`Delete "${blog.title}"? This also removes its Cloudinary featured image.`)) return;
    setDeletingId(blog._id);
    try {
      await deleteAdminBlog(blog._id);
      await loadBlogs();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to delete blog.");
    } finally {
      setDeletingId("");
    }
  }

  function submitSearch(event) {
    event.preventDefault();
    setFilter({ q: query.trim(), page: "1" });
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Content Engine</p>
          <h1 className="mt-2 text-2xl font-bold">Blog Management</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Create SEO articles, publish drafts, and manage revenue-focused content.</p>
        </div>
        <Link to="/app/admin/blogs/create" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Create Blog
        </Link>
      </div>

      <form onSubmit={submitSearch} className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title, content, tags..."
          className="min-h-11 flex-1 rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-brand-500 dark:border-slate-700"
        />
        <select
          value={status}
          onChange={(event) => setFilter({ status: event.target.value, page: "1" })}
          className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-brand-500 dark:border-slate-700"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white" type="submit">
          Search
        </button>
      </form>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <p className="text-sm text-slate-500">Loading blogs...</p>
        ) : !data.items?.length ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">No blog posts found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                  <th className="pb-3 pr-4 font-semibold">Title</th>
                  <th className="pb-3 pr-4 font-semibold">Category</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 pr-4 font-semibold">Views</th>
                  <th className="pb-3 pr-4 font-semibold">Updated</th>
                  <th className="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((blog) => (
                  <tr key={blog._id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-4 pr-4">
                      <div className="font-semibold">{blog.title}</div>
                      <div className="mt-1 text-xs text-slate-500">/{blog.slug}</div>
                    </td>
                    <td className="py-4 pr-4">{blog.category}</td>
                    <td className="py-4 pr-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${blog.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4">{blog.viewCount || 0}</td>
                    <td className="py-4 pr-4 text-slate-500">{blog.updatedAt ? new Date(blog.updatedAt).toLocaleDateString() : "-"}</td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-2">
                        {blog.status === "published" ? (
                          <Link to={`/blog/${blog.slug}`} target="_blank" className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold">
                            View
                          </Link>
                        ) : null}
                        <Link to={`/app/admin/blogs/edit/${blog._id}`} className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white">
                          Edit
                        </Link>
                        <button
                          type="button"
                          disabled={deletingId === blog._id}
                          onClick={() => handleDelete(blog)}
                          className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {data.pages > 1 ? (
        <div className="flex items-center justify-center gap-3">
          <button disabled={page <= 1} onClick={() => setFilter({ page: String(page - 1) })} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50">
            Previous
          </button>
          <span className="text-sm text-slate-500">Page {data.page} of {data.pages}</span>
          <button disabled={page >= data.pages} onClick={() => setFilter({ page: String(page + 1) })} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50">
            Next
          </button>
        </div>
      ) : null}
    </section>
  );
}
