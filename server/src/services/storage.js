import cloudinary from "../config/cloudinary.js";

/**
 * Uploads an in-memory image buffer (from multer) to Cloudinary and
 * returns the public URL. Used for admin-uploaded product thumbnails,
 * and later reusable by the workers for generated assets too.
 */
export function uploadBufferToCloudinary(buffer, folder = "zeroth-wonder") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}