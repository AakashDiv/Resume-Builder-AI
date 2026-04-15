import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createCheckoutSession } from "../controllers/billing.controller.js";

const router = Router();

router.post("/create-checkout-session", authMiddleware, createCheckoutSession);

export default router;
