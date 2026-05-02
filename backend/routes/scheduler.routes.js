import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import requireProPlan from "../middleware/requireProPlan.js";
import { disableScheduler, enableScheduler, getSchedulerStatus, runDigestNow, runSchedulerNow } from "../controllers/scheduler.controller.js";

const router = Router();

router.get("/status", authMiddleware, getSchedulerStatus);
router.post("/enable", authMiddleware, requireProPlan, enableScheduler);
router.post("/disable", authMiddleware, requireProPlan, disableScheduler);
router.post("/run-now", authMiddleware, requireProPlan, runSchedulerNow);
router.post("/digest-now", authMiddleware, requireProPlan, runDigestNow);

export default router;
