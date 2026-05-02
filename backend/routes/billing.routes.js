import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { activateTestFreePlan, activateTestProPlan, createCheckoutSession } from "../controllers/billing.controller.js";

const router = Router();

router.post("/create-checkout-session", authMiddleware, createCheckoutSession);
router.post("/test-pro", authMiddleware, activateTestProPlan);
router.post("/test-free", authMiddleware, activateTestFreePlan);

export default router;
