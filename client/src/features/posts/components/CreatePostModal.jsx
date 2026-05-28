import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Image, Video, Film, AlertCircle } from "lucide-react";
import { createPostThunk } from "../store/post.thunks.js";

export default function CreatePostModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { isUploadingPost } = useSelector((state) => state.posts);
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");
    const fileType = file.type.split("/")[0]; // 'image' or 'video'
    if (fileType !== "image" && fileType !== "video") {
      setError("Please select a valid image or video file.");
      return;
    }

    // Limit size to 10MB to avoid large DB payloads for base64
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    setMediaType(fileType);

    const reader = new FileReader();
    reader.onloadend = () => {
      setMedia(reader.result);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!media) {
      setError("Please choose a photo or video to upload.");
      return;
    }

    try {
      await dispatch(
        createPostThunk({
          media,
          mediaType,
          caption,
        })
      ).unwrap();
      
      // Reset & Close
      setCaption("");
      setMedia("");
      setPreview("");
      onClose();
    } catch (err) {
      setError(err || "Failed to create post.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="w-full max-w-lg bg-zinc-900/90 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <header className="flex h-14 items-center justify-between px-6 border-b border-white/5 shrink-0">
          <h3 className="font-semibold text-white">Create New Post</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Media Picker / Preview */}
          <div 
            onClick={() => !isUploadingPost && fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 aspect-video flex flex-col items-center justify-center cursor-pointer overflow-hidden group transition-all duration-300 ${
              preview ? "border-transparent!" : ""
            }`}
          >
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="hidden"
            />

            {preview ? (
              mediaType === "image" ? (
                <img 
                  src={preview} 
                  alt="Post preview" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <video 
                  src={preview} 
                  className="w-full h-full object-contain"
                  controls
                />
              )
            ) : (
              <div className="text-center p-4">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors mb-3">
                  <Image className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-zinc-300">Choose photo or video</p>
                <p className="text-xs text-zinc-500 mt-1">Supports PNG, JPG, MP4 up to 10MB</p>
              </div>
            )}

            {preview && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreview("");
                  setMedia("");
                }}
                className="absolute top-3 right-3 h-8 w-8 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center shadow-lg transition-colors border border-white/10"
              >
                <X className="h-4 w-4" />
              </button>
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

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isUploadingPost || !media}
            className={`w-full h-11 rounded-xl font-semibold flex items-center justify-center transition-all duration-200 ${
              isUploadingPost || !media
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-primary hover:brightness-110 text-white active:scale-[0.98] cursor-pointer"
            }`}
          >
            {isUploadingPost ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Upload Post"
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
