import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import uploadResume from "../middleware/uploadResume.js";
import { extractProfile, getProfile, updateProfile } from "../controllers/profile.controller.js";

const router = Router();

router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, updateProfile);
router.post("/extract", authMiddleware, uploadResume.single("resumeFile"), extractProfile);

export default router;
