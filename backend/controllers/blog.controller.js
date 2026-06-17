import asyncHandler from "../utils/asyncHandler.js";
import {
  absoluteBlogUrl,
  blogsForSitemap,
  createBlog,
  deleteBlog,
  getAdminBlog,
  getPublishedBlogBySlug,
  listAdminBlogs,
  listPublishedBlogs,
  updateBlog,
  uploadContentImage
} from "../services/blog.service.js";
import { env } from "../config/env.js";

export const listBlogs = asyncHandler(async (req, res) => {
  const result = await listPublishedBlogs(req.query);
  res.status(200).json(result);
});

export const searchBlogs = asyncHandler(async (req, res) => {
  const result = await listPublishedBlogs({ ...req.query, q: req.query.q });
  res.status(200).json(result);
});

export const listBlogsByCategory = asyncHandler(async (req, res) => {
  const result = await listPublishedBlogs({ ...req.query, category: req.params.category });
  res.status(200).json(result);
});

export const getBlogBySlug = asyncHandler(async (req, res) => {
  const result = await getPublishedBlogBySlug(req.params.slug);
  res.status(200).json(result);
});

export const listBlogsForAdmin = asyncHandler(async (req, res) => {
  const result = await listAdminBlogs(req.query);
  res.status(200).json(result);
});

export const getBlogForAdmin = asyncHandler(async (req, res) => {
  const blog = await getAdminBlog(req.params.id);
  res.status(200).json({ blog });
});

export const createBlogForAdmin = asyncHandler(async (req, res) => {
  const blog = await createBlog(req.body, req.file, req.user);
  res.status(201).json({ blog });
});

export const updateBlogForAdmin = asyncHandler(async (req, res) => {
  const blog = await updateBlog(req.params.id, req.body, req.file, req.user);
  res.status(200).json({ blog });
});

export const deleteBlogForAdmin = asyncHandler(async (req, res) => {
  const result = await deleteBlog(req.params.id);
  res.status(200).json(result);
});

export const uploadBlogContentImage = asyncHandler(async (req, res) => {
  const image = await uploadContentImage(req.file, req.body.alt);
  res.status(201).json({ image });
});

export const blogSitemap = asyncHandler(async (_req, res) => {
  const baseUrl = env.clientBaseUrl.replace(/\/$/, "");
  const blogs = await blogsForSitemap();
  const staticPages = ["", "/blog", "/templates", "/pricing", "/builder", "/privacy-policy", "/terms", "/about", "/contact"];
  const urls = [
    ...staticPages.map((path) => ({
      loc: `${baseUrl}${path}`,
      lastmod: new Date().toISOString()
    })),
    ...blogs.map((blog) => ({
      loc: absoluteBlogUrl(blog.slug),
      lastmod: (blog.updatedAt || blog.publishedAt || new Date()).toISOString()
    }))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url.loc}</loc><lastmod>${url.lastmod}</lastmod></url>`).join("\n")}
</urlset>`;

  res.type("application/xml").send(xml);
});

export const robotsTxt = asyncHandler(async (_req, res) => {
  const baseUrl = env.clientBaseUrl.replace(/\/$/, "");
  res
    .type("text/plain")
    .send(`User-agent: *
Allow: /

Sitemap: ${baseUrl}/api/blogs/sitemap.xml
`);
});
