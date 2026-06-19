import { Router } from "express";
import superAdminMiddleware from "../middleware/superAdminMiddleware.js";
import uploadBlogImage from "../middleware/uploadBlogImage.js";
import {
  createBlogForAdmin,
  deleteBlogForAdmin,
  getBlogForAdmin,
  listBlogsForAdmin,
  updateBlogForAdmin,
  uploadBlogContentImage
} from "../controllers/blog.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import Blog from "../models/Blog.js";

const router = Router();
router.use(superAdminMiddleware);

router.get("/stats", asyncHandler(async (_req, res) => {
  const [totalBlogs, publishedBlogs, draftBlogs, viewsAgg] = await Promise.all([
    Blog.countDocuments(),
    Blog.countDocuments({ status: "published" }),
    Blog.countDocuments({ status: "draft" }),
    Blog.aggregate([{ $group: { _id: null, total: { $sum: "$viewCount" } } }])
  ]);
  res.json({
    totalBlogs,
    publishedBlogs,
    draftBlogs,
    totalViews: viewsAgg[0]?.total || 0
  });
}));

router.get("/categories", asyncHandler(async (_req, res) => {
  const categories = await Blog.distinct("category");
  res.json({ categories: categories.filter(Boolean).sort() });
}));

router.get("/media", asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(60, Math.max(1, Number(req.query.limit || 24)));
  const skip = (page - 1) * limit;
  const q = req.query.q ? String(req.query.q).trim() : "";

  const matchFilter = { "featuredImage.url": { $ne: "" } };
  if (q) matchFilter.title = new RegExp(q, "i");

  const [blogs, total] = await Promise.all([
    Blog.find(matchFilter)
      .select("title slug featuredImage createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Blog.countDocuments(matchFilter)
  ]);

  const media = blogs
    .filter(b => b.featuredImage?.url)
    .map(b => ({
      id: String(b._id),
      blogId: String(b._id),
      blogTitle: b.title,
      blogSlug: b.slug,
      url: b.featuredImage.url,
      publicId: b.featuredImage.publicId,
      alt: b.featuredImage.alt || "",
      width: b.featuredImage.width || 0,
      height: b.featuredImage.height || 0,
      createdAt: b.createdAt
    }));

  res.json({ media, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
}));

// content-image must be declared before /:id
router.post("/blogs/content-image", uploadBlogImage.single("image"), uploadBlogContentImage);
router.get("/blogs", listBlogsForAdmin);
router.get("/blogs/:id", getBlogForAdmin);
router.post("/blogs", uploadBlogImage.single("featuredImage"), createBlogForAdmin);
router.patch("/blogs/:id", uploadBlogImage.single("featuredImage"), updateBlogForAdmin);
router.delete("/blogs/:id", deleteBlogForAdmin);

export default router;
