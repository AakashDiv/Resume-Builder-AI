import { Router } from "express";
import { body } from "express-validator";
import { runScraper } from "../controllers/scraper.controller.js";

const router = Router();

router.post(
  "/run",
  [
    body("role").optional().isString().withMessage("role must be a string"),
    body("location").optional().isString().withMessage("location must be a string"),
    body("platforms").optional().isArray().withMessage("platforms must be an array"),
    body("timeFilter").optional().isString().withMessage("timeFilter must be a string")
  ],
  runScraper
);

export default router;
