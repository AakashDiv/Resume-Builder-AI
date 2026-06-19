import { Readable } from "stream";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import Blog from "../models/Blog.js";
import ApiError from "../utils/ApiError.js";
import cloudinary, { ensureCloudinaryConfigured } from "../config/cloudinary.js";
import { env } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_BLOG_UPLOAD_DIR = path.resolve(__dirname, "..", "tmp", "blog-uploads");
const PUBLIC_FIELDS = "-__v";
const DEFAULT_LIMIT = 9;
const MAX_LIMIT = 30;

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return normalizeList(parsed);
    } catch (_error) {
      return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
  }

  return [];
}

function normalizePayload(payload = {}) {
  return {
    title: String(payload.title || "").trim(),
    slug: String(payload.slug || "").trim(),
    excerpt: String(payload.excerpt || "").trim(),
    content: String(payload.content || "").trim(),
    category: String(payload.category || "").trim(),
    tags: normalizeList(payload.tags),
    metaTitle: String(payload.metaTitle || "").trim(),
    metaDescription: String(payload.metaDescription || "").trim(),
    keywords: normalizeList(payload.keywords),
    canonicalUrl: String(payload.canonicalUrl || "").trim(),
    focusKeyword: String(payload.focusKeyword || "").trim(),
    ogTitle: String(payload.ogTitle || "").trim(),
    ogDescription: String(payload.ogDescription || "").trim(),
    ogImage: String(payload.ogImage || "").trim(),
    schemaType: String(payload.schemaType || "Article").trim() || "Article",
    status: payload.status === "published" ? "published" : "draft",
    featuredImageAlt: String(payload.featuredImageAlt || payload.imageAlt || "").trim()
  };
}

function readingTimeFor(content) {
  const words = String(content || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function buildExcerpt(content) {
  return String(content || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
}

async function uniqueSlug(title, preferredSlug = "", ignoreId = null) {
  const base = slugify(preferredSlug || title);
  if (!base) {
    throw new ApiError(400, "A valid title is required to generate a slug");
  }

  let candidate = base;
  let suffix = 2;

  while (await Blog.exists({ slug: candidate, ...(ignoreId ? { _id: { $ne: ignoreId } } : {}) })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function uploadBuffer(buffer, options) {
  ensureCloudinaryConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });

    Readable.from(buffer).pipe(stream);
  });
}

function hasCloudinaryConfig() {
  return Boolean(env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret);
}

function extensionForMime(mimetype = "") {
  if (mimetype.includes("png")) return "png";
  if (mimetype.includes("webp")) return "webp";
  if (mimetype.includes("gif")) return "gif";
  return "jpg";
}

async function saveLocalImage(file, alt = "", width = 1200, height = 630) {
  await fs.mkdir(LOCAL_BLOG_UPLOAD_DIR, { recursive: true });
  const extension = extensionForMime(file.mimetype);
  const filename = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const diskPath = path.join(LOCAL_BLOG_UPLOAD_DIR, filename);
  await fs.writeFile(diskPath, file.buffer);

  return {
    url: `${env.backendPublicUrl.replace(/\/$/, "")}/uploads/blog/${filename}`,
    publicId: `local:${filename}`,
    alt,
    width,
    height
  };
}

export async function uploadFeaturedImage(file, alt = "") {
  if (!file) return null;

  if (!hasCloudinaryConfig()) {
    return saveLocalImage(file, alt, 1200, 630);
  }

  const result = await uploadBuffer(file.buffer, {
    folder: "nighthire/blog/featured",
    resource_type: "image",
    transformation: [
      { width: 1200, height: 630, crop: "fill", gravity: "auto", quality: "auto", fetch_format: "webp" }
    ]
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    alt,
    width: result.width || 1200,
    height: result.height || 630
  };
}

export async function uploadContentImage(file, alt = "") {
  if (!file) {
    throw new ApiError(400, "Image file is required");
  }

  if (!hasCloudinaryConfig()) {
    return saveLocalImage(file, alt, 800, 0);
  }

  const result = await uploadBuffer(file.buffer, {
    folder: "nighthire/blog/content",
    resource_type: "image",
    transformation: [{ width: 800, crop: "limit", quality: "auto", fetch_format: "webp" }]
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    alt,
    width: result.width || 800,
    height: result.height || 0
  };
}

export async function deleteCloudinaryImage(publicId) {
  if (!publicId) return;
  if (publicId.startsWith("local:")) {
    const filename = publicId.replace("local:", "");
    const diskPath = path.resolve(LOCAL_BLOG_UPLOAD_DIR, filename);
    if (!diskPath.startsWith(LOCAL_BLOG_UPLOAD_DIR)) return;
    await fs.rm(diskPath, { force: true });
    return;
  }

  ensureCloudinaryConfigured();
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

function validateBlog(payload, featuredImage) {
  if (!payload.title) throw new ApiError(400, "Title is required");
  if (!payload.content) throw new ApiError(400, "Content is required");
  if (!payload.category) throw new ApiError(400, "Category is required");
  if (payload.status === "published" && !featuredImage?.url) {
    throw new ApiError(400, "Featured image is required for published blogs");
  }
}

export async function createBlog(payload, file, user) {
  const data = normalizePayload(payload);
  const featuredImage = await uploadFeaturedImage(file, data.featuredImageAlt);

  validateBlog(data, featuredImage);

  const slug = await uniqueSlug(data.title, data.slug);
  const publishedAt = data.status === "published" ? new Date() : null;

  const blog = await Blog.create({
    ...data,
    slug,
    excerpt: data.excerpt || buildExcerpt(data.content),
    featuredImage: featuredImage || {},
    author: {
      name: user?.name || "NightHire.ai Editorial Team",
      userId: user?._id || null
    },
    readingTime: readingTimeFor(data.content),
    publishedAt
  });

  return blog;
}

export async function updateBlog(blogId, payload, file, user) {
  const blog = await Blog.findById(blogId);
  if (!blog) throw new ApiError(404, "Blog not found");

  const data = normalizePayload({ ...blog.toObject(), ...payload });
  let featuredImage = blog.featuredImage || {};

  if (file) {
    const nextImage = await uploadFeaturedImage(file, data.featuredImageAlt || blog.featuredImage?.alt);
    if (blog.featuredImage?.publicId) {
      await deleteCloudinaryImage(blog.featuredImage.publicId).catch((error) => {
        console.warn("[cloudinary] Failed to delete previous blog image:", error.message || error);
      });
    }
    featuredImage = nextImage;
  } else if (data.featuredImageAlt && featuredImage?.url) {
    featuredImage = { ...featuredImage, alt: data.featuredImageAlt };
  }

  validateBlog(data, featuredImage);

  const nextSlug = payload.slug || payload.title ? await uniqueSlug(data.title, data.slug, blog._id) : blog.slug;
  const wasPublished = blog.status === "published";
  const willPublish = data.status === "published";

  blog.set({
    ...data,
    slug: nextSlug,
    excerpt: data.excerpt || buildExcerpt(data.content),
    featuredImage,
    readingTime: readingTimeFor(data.content),
    publishedAt: willPublish ? blog.publishedAt || new Date() : null,
    author: blog.author?.userId
      ? blog.author
      : { name: user?.name || blog.author?.name || "NightHire.ai Editorial Team", userId: user?._id || null }
  });

  if (!wasPublished && willPublish) {
    blog.publishedAt = new Date();
  }

  await blog.save();
  return blog;
}

export async function deleteBlog(blogId) {
  const blog = await Blog.findById(blogId);
  if (!blog) throw new ApiError(404, "Blog not found");

  if (blog.featuredImage?.publicId) {
    await deleteCloudinaryImage(blog.featuredImage.publicId).catch((error) => {
      console.warn("[cloudinary] Failed to delete blog image:", error.message || error);
    });
  }

  await blog.deleteOne();
  return { deleted: true };
}

function pageOptions(query) {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit || DEFAULT_LIMIT)));
  return { page, limit, skip: (page - 1) * limit };
}

function publicFilter(query = {}) {
  const filter = { status: "published" };
  if (query.category) filter.category = new RegExp(`^${String(query.category).trim()}$`, "i");
  if (query.tag) filter.tags = String(query.tag).trim();
  if (query.q) filter.$text = { $search: String(query.q).trim() };
  return filter;
}

export async function listPublishedBlogs(query = {}) {
  const { page, limit, skip } = pageOptions(query);
  const filter = publicFilter(query);
  const [items, total, categories] = await Promise.all([
    Blog.find(filter).select(PUBLIC_FIELDS).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit),
    Blog.countDocuments(filter),
    Blog.distinct("category", { status: "published" })
  ]);

  return {
    items,
    categories: categories.sort(),
    page,
    limit,
    total,
    pages: Math.max(1, Math.ceil(total / limit))
  };
}

export async function listAdminBlogs(query = {}) {
  const { page, limit, skip } = pageOptions(query);
  const filter = {};
  if (query.status && ["draft", "published"].includes(query.status)) filter.status = query.status;
  if (query.category) filter.category = new RegExp(`^${String(query.category).trim()}$`, "i");
  if (query.fromDate) filter.createdAt = { ...filter.createdAt, $gte: new Date(query.fromDate) };
  if (query.toDate) filter.createdAt = { ...filter.createdAt, $lte: new Date(query.toDate) };
  if (query.q) filter.$text = { $search: String(query.q).trim() };

  const [items, total] = await Promise.all([
    Blog.find(filter).select(PUBLIC_FIELDS).sort({ updatedAt: -1 }).skip(skip).limit(limit),
    Blog.countDocuments(filter)
  ]);

  return {
    items,
    page,
    limit,
    total,
    pages: Math.max(1, Math.ceil(total / limit))
  };
}

export async function getPublishedBlogBySlug(slug, incrementView = true) {
  const blog = await Blog.findOne({ slug, status: "published" }).select(PUBLIC_FIELDS);
  if (!blog) throw new ApiError(404, "Blog not found");

  if (incrementView) {
    await Blog.updateOne({ _id: blog._id }, { $inc: { viewCount: 1 } });
    blog.viewCount += 1;
  }

  const [relatedBlogs, previousBlog, nextBlog] = await Promise.all([
    Blog.find({
      _id: { $ne: blog._id },
      status: "published",
      $or: [{ category: blog.category }, { tags: { $in: blog.tags || [] } }]
    })
      .select("title slug excerpt featuredImage category tags readingTime publishedAt")
      .sort({ publishedAt: -1 })
      .limit(3),
    Blog.findOne({ status: "published", publishedAt: { $lt: blog.publishedAt || blog.createdAt } })
      .select("title slug")
      .sort({ publishedAt: -1 }),
    Blog.findOne({ status: "published", publishedAt: { $gt: blog.publishedAt || blog.createdAt } })
      .select("title slug")
      .sort({ publishedAt: 1 })
  ]);

  return { blog, relatedBlogs, previousBlog, nextBlog };
}

export async function getAdminBlog(blogId) {
  const blog = await Blog.findById(blogId).select(PUBLIC_FIELDS);
  if (!blog) throw new ApiError(404, "Blog not found");
  return blog;
}

export async function blogsForSitemap() {
  return Blog.find({ status: "published" }).select("slug updatedAt publishedAt").sort({ publishedAt: -1 }).limit(5000);
}

export function absoluteBlogUrl(slug) {
  return `${env.clientBaseUrl.replace(/\/$/, "")}/blog/${slug}`;
}
