import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getMatchedJob, getMatchedJobs, runMatches } from "../controllers/match.controller.js";

const router = Router();

router.get("/jobs", authMiddleware, getMatchedJobs);
router.post("/run", authMiddleware, runMatches);
router.get("/job/:jobId", authMiddleware, getMatchedJob);

export default router;
