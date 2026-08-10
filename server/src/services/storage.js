import cloudinary from "../config/cloudinary.js";

/**
 * Uploads a buffer to Cloudinary. Returns both the public URL (for display/
 * download) and the publicId + resourceType (required later to delete the
 * file — Cloudinary can't delete something by URL alone).
 */
export function uploadBufferToCloudinary(buffer, folder = "zeroth-wonder", resourceType = "image") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (err, result) => {
        if (err) return reject(err);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
        });
      }
    );
    stream.end(buffer);
  });
}

export function deleteFromCloudinary(publicId, resourceType = "image") {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}