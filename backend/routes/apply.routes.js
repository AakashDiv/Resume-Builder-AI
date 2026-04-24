import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import requireProPlan from "../middleware/requireProPlan.js";
import { enableAutoApply, manualApply, queueStatus } from "../controllers/apply.controller.js";

const router = Router();

router.post("/enable", authMiddleware, requireProPlan, enableAutoApply);
router.post("/manual/:jobId", authMiddleware, requireProPlan, manualApply);
router.get("/queue-status", authMiddleware, requireProPlan, queueStatus);

export default router;
