/**
 * Client-side image compression using the Canvas API.
 * Resizes and re-encodes images to reduce file size before uploading to the server.
 * Silently handles any format — PNG, JPEG, HEIC preview, WebP, etc.
 *
 * This eliminates the need for size-limit warnings; any image the user picks
 * is transparently reduced to an acceptable size before upload.
 */

/**
 * Compresses a base64 image string using canvas re-encoding.
 *
 * @param {string} base64Str   - Input base64 data URL (data:image/...;base64,...)
 * @param {object} [opts]
 * @param {number} [opts.maxWidth=1080]     - Max pixel width of output image
 * @param {number} [opts.maxHeight=1080]    - Max pixel height of output image
 * @param {number} [opts.quality=0.82]      - JPEG quality (0-1). 0.82 ≈ ~80% size reduction
 * @param {string} [opts.outputFormat]      - Output MIME type. Defaults to image/jpeg for photos
 * @returns {Promise<string>} Compressed base64 data URL
 */
export const compressImage = (base64Str, opts = {}) => {
  const {
    maxWidth = 1080,
    maxHeight = 1080,
    quality = 0.82,
    outputFormat = "image/jpeg",
  } = opts;

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      // Calculate the scaled dimensions while preserving aspect ratio
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      // Draw with white background for PNG→JPEG conversion (avoids black bg)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL(outputFormat, quality));
    };

    img.onerror = () => {
      // If compression fails, fall back to original so upload still works
      console.warn("[compressImage] Failed to load image — using original.");
      resolve(base64Str);
    };

    img.src = base64Str;
  });
};

/**
 * Reads a File object and returns a compressed base64 data URL.
 * Automatically skips compression for video files.
 *
 * @param {File} file - The File from an <input type="file">
 * @param {object} [opts] - Options passed to compressImage
 * @returns {Promise<{ base64: string, mediaType: 'image'|'video' }>}
 */
export const readAndCompressFile = async (file, opts = {}) => {
  const mediaType = file.type.startsWith("video") ? "video" : "image";

  // Read raw base64
  const raw = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  if (mediaType === "video") {
    return { base64: raw, mediaType };
  }

  // Compress the image
  const compressed = await compressImage(raw, opts);
  return { base64: compressed, mediaType };
};
