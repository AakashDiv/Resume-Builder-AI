import { Router } from "express";
import { adminLogin, verifyAdmin } from "../controllers/adminAuth.controller.js";
import superAdminMiddleware from "../middleware/superAdminMiddleware.js";

const router = Router();

router.post("/login", adminLogin);
router.get("/verify", superAdminMiddleware, verifyAdmin);

export default router;
