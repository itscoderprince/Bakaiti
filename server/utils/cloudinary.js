import { v2 as cloudinary } from "cloudinary";
import { config } from "../config/env.js";

// Check if Cloudinary credentials are fully provided
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("☁️ Cloudinary SDK configured successfully.");
} else {
  console.warn(
    "⚠️ Cloudinary credentials are not configured in environment variables. Falling back to local Base64 storage."
  );
}

/**
 * Uploads a base64 string to Cloudinary.
 * If credentials are not configured or upload fails, it returns the base64 string directly as fallback.
 *
 * @param {string} base64Data - Base64 data string (e.g. data:image/png;base64,...)
 * @param {string} resourceType - Cloudinary resource type (e.g. 'image', 'video', 'raw', 'auto')
 * @returns {Promise<string>} Secure URL from Cloudinary, or the original base64 fallback.
 */
export const uploadToCloudinary = async (base64Data, resourceType = "auto", options = {}) => {
  if (!base64Data) return "";

  // If not configured, or if the string is already a URL, return it directly
  if (!isCloudinaryConfigured || base64Data.startsWith("http")) {
    return base64Data;
  }

  try {
    const uploadOptions = {
      resource_type: resourceType,
      ...options,
    };

    // Apply default transformations for auto-format and auto-quality if not provided
    if (!uploadOptions.transformation) {
      uploadOptions.transformation = [
        { quality: "auto" },
        { fetch_format: "auto" }
      ];
    }

    const response = await cloudinary.uploader.upload(base64Data, uploadOptions);
    return response.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
    // Fall back to original Base64 string so the upload doesn't block the user
    return base64Data;
  }
};

/**
 * Uploads multiple base64 strings to Cloudinary concurrently.
 *
 * @param {string[]} base64Array - Array of Base64 strings.
 * @param {string} resourceType - Cloudinary resource type.
 * @returns {Promise<string[]>} Array of secure URLs.
 */
export const uploadMultipleToCloudinary = async (base64Array, resourceType = "auto") => {
  if (!base64Array || !Array.isArray(base64Array)) return [];
  return Promise.all(base64Array.map((data) => uploadToCloudinary(data, resourceType)));
};
