import { body } from "express-validator";
import { Router } from "express";
import { generateCoverLetter, generateResume, improveResume, scoreResume, tailorResume } from "../controllers/resume.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
import requireProPlan from "../middleware/requireProPlan.js";
import uploadResume from "../middleware/uploadResume.js";

const router = Router();

router.post(
  "/generate",
  [
    body("name").trim().isLength({ min: 2, max: 120 }).withMessage("name must be 2-120 characters"),
    body("contact").trim().isLength({ min: 5, max: 300 }).withMessage("contact is required"),
    body("summary").trim().isLength({ min: 20, max: 2000 }).withMessage("summary must be 20-2000 characters"),
    body("skills").notEmpty().withMessage("skills is required"),
    body("experience").notEmpty().withMessage("experience is required"),
    body("education").notEmpty().withMessage("education is required")
  ],
  generateResume
);

router.post("/improve", authMiddleware, uploadResume.single("resumeFile"), improveResume);

router.post(
  "/score",
  authMiddleware,
  [
    body("resumeText")
      .trim()
      .isLength({ min: 30, max: 50000 })
      .withMessage("resumeText must be 30-50000 characters"),
    body("jobDescriptionText")
      .trim()
      .isLength({ min: 30, max: 50000 })
      .withMessage("jobDescriptionText must be 30-50000 characters")
  ],
  scoreResume
);

router.post(
  "/tailor",
  authMiddleware,
  requireProPlan,
  [
    body("resumeText")
      .trim()
      .isLength({ min: 30, max: 50000 })
      .withMessage("resumeText must be 30-50000 characters"),
    body("jobDescriptionText")
      .trim()
      .isLength({ min: 30, max: 50000 })
      .withMessage("jobDescriptionText must be 30-50000 characters")
  ],
  tailorResume
);

router.post(
  "/cover-letter",
  authMiddleware,
  requireProPlan,
  [
    body("jobId").optional().isMongoId().withMessage("jobId must be a valid id"),
    body("role").optional().isString().withMessage("role must be a string"),
    body("company").optional().isString().withMessage("company must be a string"),
    body("jobDescriptionText").optional().isString().withMessage("jobDescriptionText must be a string")
  ],
  generateCoverLetter
);

export default router;
