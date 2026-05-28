/**
 * Optimizes a Cloudinary URL by injecting auto-format, auto-quality, and optional sizing/cropping parameters.
 * If the URL is not a Cloudinary URL (e.g. local base64 fallback or other domains), it returns the original URL.
 * 
 * @param {string} url - The original image/video URL.
 * @param {Object} options - Transformation options (e.g. width, height, crop, gravity).
 * @returns {string} The optimized Cloudinary URL or original URL.
 */
export const getOptimizedMediaUrl = (url, options = {}) => {
  if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com")) {
    return url;
  }

  // Base transformations: f_auto (auto format like WebP/AVIF), q_auto (auto quality compression)
  const transforms = ["f_auto", "q_auto"];

  if (options.width) {
    transforms.push(`w_${options.width}`);
  }
  if (options.height) {
    transforms.push(`h_${options.height}`);
  }
  if (options.crop) {
    transforms.push(`c_${options.crop}`);
  } else if (options.width || options.height) {
    // Default crop to fill if width/height is provided
    transforms.push("c_fill");
  }
  if (options.gravity) {
    transforms.push(`g_${options.gravity}`);
  }

  const transformString = transforms.join(",");

  // Cloudinary URLs contain '/upload/'
  // Replace '/upload/' with '/upload/<transforms>/'
  return url.replace("/upload/", `/upload/${transformString}/`);
};
