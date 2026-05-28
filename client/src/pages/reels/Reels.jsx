import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Heart, MessageSquare, Plus, Send, X, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { getPostsThunk, likePostThunk, commentPostThunk } from "../../features/posts/store/post.thunks.js";
import { getOptimizedMediaUrl } from "../../utils/cloudinary.js";
import CreatePostModal from "../../features/posts/components/CreatePostModal.jsx";

// Sub-component for individual Reel item to manage play/pause state independently
const ReelItem = memo(function ReelItem({ post, myUserId, onLike, onCommentSubmit, activeVideoId }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const isLiked = post.likes?.includes(myUserId);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const isActive = activeVideoId === post._id;

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {
        // Auto-play was prevented (browser rule). Set playing state accordingly
        setIsPlaying(false);
      });
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const handleVideoClick = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleMuteClick = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div
      data-post-id={post._id}
      className="relative w-full h-full snap-start bg-black flex items-center justify-center overflow-hidden"
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={getOptimizedMediaUrl(post.media)}
        loop
        playsInline
        muted={isMuted}
        onClick={handleVideoClick}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Floating play/pause visual indicator */}
      {!isPlaying && (
        <div 
          onClick={handleVideoClick}
          className="absolute inset-0 flex items-center justify-center bg-black/10 cursor-pointer"
        >
          <div className="h-16 w-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 border border-white/10 animate-ping duration-1000">
            <Play className="h-8 w-8 ml-1" />
          </div>
        </div>
      )}

      {/* Volume Control Overlay */}
      <button
        onClick={handleMuteClick}
        className="absolute top-4 right-4 h-9 w-9 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center border border-white/10 z-10 transition-colors hover:bg-black/60"
      >
        {isMuted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
      </button>

      {/* Left Overlay (Author Details + Caption) */}
      <div className="absolute bottom-5 left-4 right-16 text-left text-white z-10 space-y-2 pointer-events-none">
        <div
          onClick={() => navigate(`/profile/${post.owner?._id}`)}
          className="flex items-center gap-2 pointer-events-auto cursor-pointer hover:opacity-85"
        >
          {post.owner?.profilePic ? (
            <img
              src={getOptimizedMediaUrl(post.owner.profilePic, { width: 64, height: 64, gravity: "face" })}
              alt={post.owner.fullname}
              className="h-8 w-8 rounded-full border border-white/20 object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold border border-white/20">
              {post.owner?.fullname?.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-bold text-sm drop-shadow-sm">{post.owner?.fullname}</span>
          <span className="text-[10px] text-white/70 drop-shadow-sm">@{post.owner?.username}</span>
        </div>

        {post.caption && (
          <p className="text-xs text-white/95 drop-shadow-sm max-w-xs leading-normal pointer-events-auto">
            {post.caption}
          </p>
        )}
      </div>

      {/* Right Floating Control Sidebar (Liking & Comments) */}
      <div className="absolute bottom-6 right-4 flex flex-col items-center gap-5 z-10 text-white">
        {/* Like action */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onLike(post._id)}
            className={`h-11 w-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all cursor-pointer ${
              isLiked ? "text-red-500 bg-red-500/10 border-red-500/20" : "hover:bg-black/60"
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
          </button>
          <span className="text-[10px] font-bold mt-1 text-white/90 drop-shadow-sm">
            {post.likes?.length || 0}
          </span>
        </div>

        {/* Comment toggler */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => setShowComments(true)}
            className="h-11 w-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all hover:bg-black/60 cursor-pointer"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
          <span className="text-[10px] font-bold mt-1 text-white/90 drop-shadow-sm">
            {post.comments?.length || 0}
          </span>
        </div>
      </div>

      {/* Floating Comment Sheet overlay */}
      {showComments && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col z-20 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex h-12 shrink-0 items-center justify-between px-4 border-b border-white/5">
            <span className="text-sm font-semibold">Comments</span>
            <button
              onClick={() => setShowComments(false)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment._id} className="flex gap-2 text-left">
                  {comment.owner?.profilePic ? (
                    <img
                      src={getOptimizedMediaUrl(comment.owner.profilePic, { width: 56, height: 56, gravity: "face" })}
                      alt={comment.owner.fullname}
                      className="h-7 w-7 rounded-full object-cover mt-0.5"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold mt-0.5">
                      {comment.owner?.fullname?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 flex flex-col min-w-0">
                    <span className="text-[11px] font-bold text-white leading-none">
                      {comment.owner?.fullname || "User"}
                    </span>
                    <span className="text-xs text-zinc-300 mt-1">{comment.text}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                No comments yet. Start the conversation!
              </div>
            )}
          </div>

          {/* Comment Form input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!commentText.trim()) return;
              onCommentSubmit({ postId: post._id, text: commentText });
              setCommentText("");
            }}
            className="p-3 border-t border-white/5 flex gap-2"
          >
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 h-9 bg-zinc-900 border border-white/5 focus-visible:ring-1 focus-visible:ring-primary rounded-full px-4 text-xs text-white outline-none"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
                commentText.trim()
                  ? "bg-primary text-white cursor-pointer"
                  : "text-muted-foreground/30 bg-zinc-800 cursor-not-allowed"
              }`}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
});

export default function Reels() {
  const dispatch = useDispatch();
  const { posts, isPostsLoading } = useSelector((state) => state.posts);
  const { user: myUser } = useSelector((state) => state.auth);
  const containerRef = useRef(null);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(getPostsThunk());
  }, [dispatch]);

  // Filter video posts
  const videoPosts = posts.filter((p) => p.mediaType === "video");

  // Setup intersection observer to track which Reel is currently visible
  useEffect(() => {
    if (videoPosts.length === 0) return;

    const observerOptions = {
      root: containerRef.current,
      rootMargin: "0px",
      threshold: 0.6, // 60% of the video must be in viewport to count as active
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const postId = entry.target.getAttribute("data-post-id");
          setActiveVideoId(postId);
        }
      });
    }, observerOptions);

    const children = containerRef.current?.children;
    if (children) {
      Array.from(children).forEach((child) => observer.observe(child));
    }

    return () => {
      if (children) {
        Array.from(children).forEach((child) => observer.unobserve(child));
      }
    };
  }, [videoPosts.length]);

  const handleLike = useCallback((postId) => {
    dispatch(likePostThunk(postId));
  }, [dispatch]);

  const handleCommentSubmit = useCallback(({ postId, text }) => {
    dispatch(commentPostThunk({ postId, text }));
  }, [dispatch]);

  return (
    <div className="h-full flex flex-col md:max-w-md md:mx-auto bg-black relative">
      {/* Reels Header */}
      <header className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-between px-6 z-30 pointer-events-none">
        <h2 className="font-extrabold text-xl tracking-tight text-white drop-shadow-md select-none pointer-events-auto">
          Reels
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors pointer-events-auto cursor-pointer"
        >
          <Plus className="h-5 w-5" />
        </button>
      </header>

      {/* Snap video list wrapper */}
      {isPostsLoading && videoPosts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-white bg-black">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-primary border-t-transparent" />
          <p className="text-sm text-zinc-400 mt-4">Loading Reels...</p>
        </div>
      ) : videoPosts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 px-6 text-center bg-black">
          <p className="text-base font-semibold text-white">No Reels uploaded yet</p>
          <p className="text-xs text-zinc-500 mt-2">
            Upload your first video post to start the video feeds!
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-5 px-5 py-2 rounded-full bg-primary text-white font-semibold text-xs cursor-pointer"
          >
            Upload video Reel
          </button>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="flex-1 snap-y snap-mandatory overflow-y-scroll overflow-x-hidden h-full scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {videoPosts.map((post) => (
            <ReelItem
              key={post._id}
              post={post}
              myUserId={myUser?._id}
              onLike={handleLike}
              onCommentSubmit={handleCommentSubmit}
              activeVideoId={activeVideoId}
            />
          ))}
        </div>
      )}

      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
