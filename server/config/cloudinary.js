
import "dotenv/config";

import { v2 as cloudinary } from "cloudinary";
import { Readable } from "node:stream";

// ==========================================
// CLOUDINARY CONFIGURATION
// ==========================================

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// ==========================================
// CHECK CLOUDINARY CONFIGURATION
// ==========================================

const isCloudinaryConfigured = Boolean(
  cloudName && apiKey && apiSecret
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  console.log("Cloudinary configuration loaded.");
} else {
  console.warn(
    "Cloudinary is not configured. Check Cloudinary credentials in .env."
  );
}

// ==========================================
// VALIDATE CLOUDINARY CONFIGURATION
// ==========================================

const checkCloudinaryConfig = () => {
  if (!isCloudinaryConfigured) {
    throw new Error(
      "Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to your .env file."
    );
  }
};

// ==========================================
// UPLOAD FILE TO CLOUDINARY
// ==========================================

/**
 * Upload a file to Cloudinary.
 *
 * Supported input:
 * 1. Local file path (string)
 * 2. Multer file object with buffer
 * 3. Multer file object with path
 *
 * @param {string|object} file
 * @param {object} options
 * @returns {Promise<object>}
 */

const uploadToCloudinary = async (file, options = {}) => {
  checkCloudinaryConfig();

  if (!file) {
    throw new Error("File is required for Cloudinary upload.");
  }

  const uploadOptions = {
    folder: "carespace",
    resource_type: "image",
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    ...options,
  };

  try {
    // Upload a Multer buffer
    if (Buffer.isBuffer(file.buffer)) {
      return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else if (!result) {
              reject(new Error("Cloudinary returned no upload result."));
            } else {
              resolve(result);
            }
          }
        );

        Readable.from(file.buffer).pipe(uploadStream);
      });
    }

    // Upload a local file path or data URI
    const filePath =
      typeof file === "string" ? file : file.path;

    if (typeof filePath === "string" && filePath.trim()) {
      return await cloudinary.uploader.upload(
        filePath,
        uploadOptions
      );
    }

    throw new Error(
      "Invalid file. Provide a file path or a Multer file with a buffer."
    );

  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);
    throw error;
  }
};

// ==========================================
// DELETE FILE FROM CLOUDINARY
// ==========================================

/**
 * Delete a file using its Cloudinary public ID.
 *
 * @param {string} publicId
 * @param {string} resourceType
 * @returns {Promise<object>}
 */

const deleteFromCloudinary = async (
  publicId,
  resourceType = "image"
) => {
  checkCloudinaryConfig();

  if (!publicId || typeof publicId !== "string") {
    throw new Error("A valid Cloudinary public ID is required.");
  }

  const allowedResourceTypes = ["image", "video", "raw"];

  if (!allowedResourceTypes.includes(resourceType)) {
    throw new Error("Invalid Cloudinary resource type.");
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });

    return result;

  } catch (error) {
    console.error("Cloudinary deletion failed:", error.message);
    throw error;
  }
};

// ==========================================
// GENERATE OPTIMIZED IMAGE URL
// ==========================================

/**
 * Generate an optimized Cloudinary image URL.
 *
 * @param {string} publicId
 * @param {object} transformations
 * @returns {string}
 */

const getOptimizedImageUrl = (publicId, transformations = {}) => {
  checkCloudinaryConfig();

  if (!publicId) {
    throw new Error("Cloudinary public ID is required.");
  }

  return cloudinary.url(publicId, {
    secure: true,
    fetch_format: "auto",
    quality: "auto",
    ...transformations,
  });
};

// ==========================================
// EXPORTS
// ==========================================

export {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary,
  deleteFromCloudinary,
  getOptimizedImageUrl,
};

export default cloudinary;
