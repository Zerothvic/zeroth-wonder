import cloudinary from "../config/cloudinary.js";

export function uploadBufferToCloudinary(buffer, folder = "zeroth-wonder", resourceType = "image") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}