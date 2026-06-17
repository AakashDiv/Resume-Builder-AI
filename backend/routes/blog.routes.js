import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import requireAdmin from "../middleware/requireAdmin.js";
import uploadBlogImage from "../middleware/uploadBlogImage.js";
import {
  blogSitemap,
  createBlogForAdmin,
  deleteBlogForAdmin,
  getBlogBySlug,
  getBlogForAdmin,
  listBlogs,
  listBlogsByCategory,
  listBlogsForAdmin,
  robotsTxt,
  searchBlogs,
  updateBlogForAdmin,
  uploadBlogContentImage
} from "../controllers/blog.controller.js";

const router = Router();
const adminOnly = [authMiddleware, requireAdmin];

router.get("/sitemap.xml", blogSitemap);
router.get("/robots.txt", robotsTxt);
router.get("/search", searchBlogs);
router.get("/category/:category", listBlogsByCategory);
router.get("/admin", adminOnly, listBlogsForAdmin);
router.get("/admin/:id", adminOnly, getBlogForAdmin);
router.post("/admin", adminOnly, uploadBlogImage.single("featuredImage"), createBlogForAdmin);
router.post("/admin/content-image", adminOnly, uploadBlogImage.single("image"), uploadBlogContentImage);
router.patch("/admin/:id", adminOnly, uploadBlogImage.single("featuredImage"), updateBlogForAdmin);
router.delete("/admin/:id", adminOnly, deleteBlogForAdmin);
router.get("/", listBlogs);
router.get("/:slug", getBlogBySlug);

export default router;
