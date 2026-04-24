import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import requireProPlan from "../middleware/requireProPlan.js";
import { getApplication, listApplications, updateApplicationStatus } from "../controllers/applications.controller.js";

const router = Router();

router.get("/", authMiddleware, requireProPlan, listApplications);
router.get("/:id", authMiddleware, requireProPlan, getApplication);
router.patch("/:id/status", authMiddleware, requireProPlan, updateApplicationStatus);

export default router;
