import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { activateTestProPlan, createCheckoutSession } from "../controllers/billing.controller.js";

const router = Router();

router.post("/create-checkout-session", authMiddleware, createCheckoutSession);
router.post("/test-pro", authMiddleware, activateTestProPlan);

export default router;
