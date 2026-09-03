import cloudinary from "../config/cloudinary.js";

/**
 * Uploads an in-memory file buffer (from multer's memoryStorage) to Cloudinary.
 */
export const uploadBufferToCloudinary = (buffer, { folder, publicId, isPdf }) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: isPdf ? "raw" : "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};