import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { activateTestAdminRole, activateTestFreePlan, activateTestProPlan, createCheckoutSession } from "../controllers/billing.controller.js";

const router = Router();

router.post("/create-checkout-session", authMiddleware, createCheckoutSession);
router.post("/test-pro", authMiddleware, activateTestProPlan);
router.post("/test-free", authMiddleware, activateTestFreePlan);
router.post("/test-admin", authMiddleware, activateTestAdminRole);

export default router;
