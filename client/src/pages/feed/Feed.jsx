import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Heart, MessageCircle, Plus, Send, RefreshCw } from "lucide-react";
import { getPostsThunk, likePostThunk, commentPostThunk } from "../../features/posts/store/post.thunks.js";
import { getOptimizedMediaUrl } from "../../utils/cloudinary.js";
import CreatePostModal from "../../features/posts/components/CreatePostModal.jsx";
import { ScrollArea } from "@/components/ui/scroll-area";

// Memoized Post Card Component to prevent sister cards from re-rendering
// when typing comments or toggling likes in other cards.
const PostCard = memo(({ post, myUserId, onLike, onComment, navigate }) => {
  const [commentText, setCommentText] = useState("");
  const isLiked = post.likes?.includes(myUserId);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post._id, commentText);
    setCommentText("");
  };

  return (
    <article className="bg-white/30 dark:bg-zinc-900/35 backdrop-blur-xl border border-white/15 dark:border-zinc-850/20 rounded-3xl overflow-hidden shadow-xl">
      {/* Card Header (Owner Details) */}
      <div
        onClick={() => navigate(`/profile/${post.owner?._id}`)}
        className="flex items-center gap-3 p-4 cursor-pointer hover:opacity-85"
      >
        {post.owner?.profilePic ? (
          <img
            src={getOptimizedMediaUrl(post.owner.profilePic, { width: 72, height: 72, gravity: "face" })}
            alt={post.owner.fullname}
            className="h-9 w-9 rounded-full object-cover shadow-sm"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
            {post.owner?.fullname?.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col text-left min-w-0">
          <span className="font-bold text-sm leading-tight text-foreground">
            {post.owner?.fullname || "Unknown User"}
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5 leading-none">
            @{post.owner?.username || "unknown"}
          </span>
        </div>
      </div>

      {/* Media Content */}
      <div className="w-full relative aspect-square bg-zinc-950/60 overflow-hidden flex items-center justify-center">
        {post.mediaType === "image" ? (
          <img
            src={getOptimizedMediaUrl(post.media, { width: 600, crop: "limit" })}
            alt="Post media"
            className="w-full h-full object-contain"
          />
        ) : (
          <video
            src={post.media}
            className="w-full h-full object-contain"
            controls
          />
        )}
      </div>

      {/* Action Bar (Like/Comment Counts) */}
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onLike(post._id)}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              isLiked
                ? "text-red-500 hover:text-red-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
            <span className="text-xs font-bold">{post.likes?.length || 0}</span>
          </button>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs font-bold">{post.comments?.length || 0}</span>
          </div>
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="text-sm text-foreground text-left leading-relaxed">
            <span className="font-bold mr-2 text-foreground">
              {post.owner?.fullname}
            </span>
            {post.caption}
          </p>
        )}

        {/* Comments Area */}
        <div className="border-t border-white/5 pt-3.5 space-y-3">
          {post.comments && post.comments.length > 0 && (
            <div className="max-h-36 overflow-y-auto space-y-2.5 pr-1">
              {post.comments.map((comment) => (
                <div key={comment._id} className="text-left text-xs leading-normal">
                  <span className="font-bold text-foreground mr-1.5">
                    {comment.owner?.fullname || "User"}
                  </span>
                  <span className="text-muted-foreground">{comment.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Comment Input form */}
          <form
            onSubmit={handleCommentSubmit}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 h-9 bg-zinc-200/20! dark:bg-zinc-900/60! border border-white/5! focus-visible:ring-1 focus-visible:ring-primary rounded-full px-3.5 text-xs text-foreground outline-none transition-all duration-200"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                commentText.trim()
                  ? "bg-primary text-white cursor-pointer"
                  : "text-muted-foreground/30 bg-zinc-200/10 dark:bg-zinc-800/10 cursor-not-allowed"
              }`}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </article>
  );
});
PostCard.displayName = "PostCard";

export default function Feed() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { posts, isPostsLoading } = useSelector((state) => state.posts);
  const { user: myUser } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(getPostsThunk());
  }, [dispatch]);

  const handleLike = useCallback((postId) => {
    dispatch(likePostThunk(postId));
  }, [dispatch]);

  const handleCommentSubmit = useCallback((postId, text) => {
    dispatch(commentPostThunk({ postId, text }));
  }, [dispatch]);

  return (
    <div className="h-full flex flex-col relative bg-transparent">
      {/* Feed Header */}
      <header className="flex h-16 shrink-0 items-center justify-between px-6 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md border-b border-white/10 dark:border-zinc-850/20 sticky top-0 z-20">
        <h2 className="font-extrabold text-xl tracking-tight text-foreground">Explore Feed</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(getPostsThunk())}
            title="Refresh Feed"
            className="h-10 w-10 flex items-center justify-center rounded-full text-muted-foreground hover:bg-white/10 dark:hover:bg-zinc-900/30 hover:text-foreground cursor-pointer transition-colors"
          >
            <RefreshCw className={`h-5 w-5 ${isPostsLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-4 rounded-full bg-primary hover:brightness-110 text-white font-semibold flex items-center gap-2 shadow-lg shadow-primary/15 transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Post</span>
          </button>
        </div>
      </header>

      {/* Main Feed List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="max-w-xl mx-auto px-4 py-8 space-y-8 pb-16">
          {isPostsLoading && posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-9 w-9 animate-spin rounded-full border-3 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground mt-4 font-medium">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 p-6 bg-white/20 dark:bg-zinc-900/20 backdrop-blur-md rounded-3xl border border-white/10 dark:border-zinc-800/20">
              <p className="text-base font-semibold text-foreground">No posts yet</p>
              <p className="text-sm text-muted-foreground mt-1.5">Be the first to share a moment with the community!</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-sm transition-all duration-200 cursor-pointer"
              >
                Upload Photo/Video
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                myUserId={myUser?._id}
                onLike={handleLike}
                onComment={handleCommentSubmit}
                navigate={navigate}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
