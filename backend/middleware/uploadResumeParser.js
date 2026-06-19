import multer from "multer";
import ApiError from "../utils/ApiError.js";

const allowedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword"
];

const uploadResumeParser = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = (file.originalname.split(".").pop() || "").toLowerCase();
    if (!["pdf", "doc", "docx"].includes(ext) || !allowedMimeTypes.includes(file.mimetype)) {
      cb(new ApiError(400, "Only PDF, DOC, or DOCX files are allowed (max 10MB)"));
      return;
    }
    cb(null, true);
  }
});

export default uploadResumeParser;
