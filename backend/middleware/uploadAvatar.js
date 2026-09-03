import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, or WEBP images are allowed"), false);
  }
};

export const uploadAvatarImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
}).single("avatar");