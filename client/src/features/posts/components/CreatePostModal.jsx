import { useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Image, UploadCloud } from "lucide-react";
import { createPostThunk } from "../store/post.thunks.js";
import { readAndCompressFile } from "../../../utils/imageCompressor.js";
import ImageAdjuster from "../../../components/ImageAdjuster.jsx";

export default function CreatePostModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { isUploadingPost, postUploadProgress } = useSelector((state) => state.posts);
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [preview, setPreview] = useState("");
  const [compressing, setCompressing] = useState(false);
  const [adjustSrc, setAdjustSrc] = useState("");
  const [showAdjuster, setShowAdjuster] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  /**
   * Handles file selection.
   * Videos are processed directly; images trigger the visual adjuster.
   */
  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");
    const rawType = file.type.split("/")[0];

    if (rawType !== "image" && rawType !== "video") {
      setError("Please select a valid image or video file.");
      return;
    }

    if (rawType === "video") {
      // For video: enforce a reasonable limit (50MB) since we can't compress in-browser
      if (file.size > 50 * 1024 * 1024) {
        setError("Video must be under 50MB.");
        return;
      }

      setCompressing(true);
      try {
        const { base64, mediaType: detectedType } = await readAndCompressFile(file);
        setMediaType(detectedType);
        setMedia(base64);
        setPreview(base64);
      } catch (err) {
        console.error("Video loading error:", err);
        setError("Could not read the video file.");
      } finally {
        setCompressing(false);
      }
    } else {
      // It's an image: read it as data URL and open the visual adjuster
      const reader = new FileReader();
      reader.onload = () => {
        setAdjustSrc(reader.result);
        setShowAdjuster(true);
      };
      reader.onerror = () => {
        setError("Could not read the image file.");
      };
      reader.readAsDataURL(file);
    }

    // Reset file input so the same file can be re-selected after clearing
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleCropComplete = useCallback((croppedBase64) => {
    setMediaType("image");
    setMedia(croppedBase64);
    setPreview(croppedBase64);
    setShowAdjuster(false);
    setAdjustSrc("");
  }, []);

  const handleClearMedia = useCallback((e) => {
    e.stopPropagation();
    setPreview("");
    setMedia("");
    setError("");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!media) {
      setError("Please choose a photo or video to upload.");
      return;
    }

    try {
      await dispatch(createPostThunk({ media, mediaType, caption })).unwrap();
      // Reset & close on success
      setCaption("");
      setMedia("");
      setPreview("");
      setError("");
      onClose();
    } catch (err) {
      setError(err || "Failed to create post.");
    }
  };

  const isBusy = isUploadingPost || compressing;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="w-full max-w-lg bg-zinc-900/90 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <header className="flex h-14 items-center justify-between px-6 border-b border-white/5 shrink-0">
          <h3 className="font-semibold text-white">Create New Post</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 min-h-0">

          {/* Error (only non-size errors like "invalid type") */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
              <span>{error}</span>
            </div>
          )}

          {/* Media Picker / Preview */}
          <div
            onClick={() => !isBusy && fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed bg-zinc-950/40 aspect-video flex flex-col items-center justify-center overflow-hidden group transition-all duration-300 ${
              preview
                ? "border-transparent"
                : "border-zinc-800 hover:border-primary/50 cursor-pointer"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="hidden"
            />

            {/* Compression loading overlay */}
            {compressing && (
              <div className="absolute inset-0 bg-zinc-950/80 flex flex-col items-center justify-center z-10 gap-3">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-zinc-400 font-medium">Optimizing image...</p>
              </div>
            )}

            {preview ? (
              <>
                {mediaType === "image" ? (
                  <img src={preview} alt="Post preview" className="w-full h-full object-contain" />
                ) : (
                  <video src={preview} className="w-full h-full object-contain" controls />
                )}
                <button
                  type="button"
                  onClick={handleClearMedia}
                  className="absolute top-3 right-3 h-8 w-8 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center shadow-lg transition-colors border border-white/10 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="text-center p-4 select-none">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors mb-3">
                  <Image className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-zinc-300">Choose photo or video</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Any size — images auto-optimized on upload
                </p>
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              rows={3}
              maxLength={300}
              className="w-full bg-zinc-950/60 border border-white/5 focus-visible:ring-1 focus-visible:ring-primary rounded-xl p-3 text-sm text-white resize-none outline-none transition-all duration-200"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isBusy || !media}
            className={`w-full h-11 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
              isBusy || !media
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-primary hover:brightness-110 text-white active:scale-[0.98] cursor-pointer"
            }`}
          >
            {isUploadingPost ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Uploading... {postUploadProgress}%</span>
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4" />
                <span>Upload Post</span>
              </>
            )}
          </button>
        </form>

        {showAdjuster && (
          <ImageAdjuster
            imageSrc={adjustSrc}
            mode="rect"
            initialAspectRatio="1:1"
            onCrop={handleCropComplete}
            onClose={() => {
              setShowAdjuster(false);
              setAdjustSrc("");
            }}
          />
        )}
      </div>
    </div>
  );
}
