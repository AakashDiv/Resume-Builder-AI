import multer from "multer";
import ApiError from "../utils/ApiError.js";

const storage = multer.memoryStorage();

function imageFileFilter(_req, file, callback) {
  if (!file.mimetype?.startsWith("image/")) {
    return callback(new ApiError(400, "Only image uploads are supported"));
  }

  return callback(null, true);
}

const uploadBlogImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

export default uploadBlogImage;
