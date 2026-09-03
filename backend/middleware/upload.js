import multer from "multer";

// Files land in memory as a Buffer — we upload that buffer to Cloudinary
// ourselves in the controller, rather than relying on an unmaintained
// multer-storage-cloudinary package.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, WEBP, or PDF files are allowed"), false);
  }
};

export const uploadKycDocument = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
}).fields([
  { name: "frontId", maxCount: 1 },
  { name: "backId", maxCount: 1 },
  { name: "selfie", maxCount: 1 },
]);