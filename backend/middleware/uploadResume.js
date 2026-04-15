import multer from "multer";
import ApiError from "../utils/ApiError.js";

const allowedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword"
];

const storage = multer.memoryStorage();

const uploadResume = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    const extension = (file.originalname.split(".").pop() || "").toLowerCase();
    const validExtension = ["pdf", "doc", "docx"].includes(extension);
    const validMimeType = allowedMimeTypes.includes(file.mimetype);

    if (!validExtension || !validMimeType) {
      cb(new ApiError(400, "Only PDF or DOCX files are allowed"));
      return;
    }

    cb(null, true);
  }
});

export default uploadResume;
