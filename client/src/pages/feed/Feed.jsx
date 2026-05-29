import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Heart, MessageCircle, Plus, Send, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { getPostsThunk, likePostThunk, commentPostThunk } from "../../features/posts/store/post.thunks.js";
import { getOptimizedMediaUrl } from "../../utils/cloudinary.js";
import CreatePostModal from "../../features/posts/components/CreatePostModal.jsx";
import { ScrollArea } from "@/components/ui/scroll-area";

// ─────────────────────────────────────────────────────────────────────────────
// PostCard — memoized so sibling cards never re-render on unrelated state changes
// ─────────────────────────────────────────────────────────────────────────────
const PostCard = memo(({ post, myUserId, onLike, onComment, navigate }) => {
  const [commentText, setCommentText] = useState("");
  const [commentOpen, setCommentOpen] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);
  const commentInputRef = useRef(null);

  const isLiked = post.likes?.includes(myUserId);

  // Focus the comment input whenever the section opens
  useEffect(() => {
    if (commentOpen && commentInputRef.current) {
      // Small delay so CSS transition has started before focus
      const t = setTimeout(() => commentInputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [commentOpen]);

  const handleLike = useCallback(() => {
    // Trigger pulse animation
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 400);
    onLike(post._id);
  }, [onLike, post._id]);

  const handleToggleComments = useCallback(() => {
    if (!commentOpen) {
      setCommentOpen(true);
    } else {
      commentInputRef.current?.focus();
    }
  }, [commentOpen]);

  const handleCommentSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!commentText.trim()) return;
      onComment(post._id, commentText);
      setCommentText("");
    },
    [commentText, onComment, post._id]
  );

  return (
    <article className="bg-white/30 dark:bg-zinc-900/35 backdrop-blur-xl border border-white/15 dark:border-zinc-850/20 rounded-3xl overflow-hidden shadow-xl">
      {/* Card Header */}
      <div
        onClick={() => navigate(`/profile/${post.owner?._id}`)}
        className="flex items-center gap-3 p-4 cursor-pointer hover:opacity-85 transition-opacity"
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

      {/* Media */}
      <div className="w-full relative aspect-square bg-zinc-950/60 overflow-hidden flex items-center justify-center">
        {post.mediaType === "image" ? (
          <img
            src={getOptimizedMediaUrl(post.media, { width: 600, crop: "limit" })}
            alt="Post media"
            className="w-full h-full object-contain"
            loading="lazy"
          />
        ) : (
          <video
            src={post.media}
            className="w-full h-full object-contain"
            controls
            preload="metadata"
          />
        )}
      </div>

      {/* Action bar */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-4">
          {/* Like button — instant optimistic + animation */}
          <button
            onClick={handleLike}
            aria-label={isLiked ? "Unlike post" : "Like post"}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer select-none ${
              isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-400"
            }`}
          >
            <Heart
              className={`h-5 w-5 transition-transform duration-150 ${
                isLiked ? "fill-current" : ""
              } ${likeAnim ? "scale-130" : "scale-100"}`}
              style={{ transform: likeAnim ? "scale(1.35)" : "scale(1)" }}
            />
            <span className="text-xs font-bold tabular-nums">
              {post.likes?.length || 0}
            </span>
          </button>

          {/* Comment toggle button */}
          <button
            onClick={handleToggleComments}
            aria-label="Toggle comments"
            className={`flex items-center gap-1.5 cursor-pointer select-none transition-colors ${
              commentOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageCircle className={`h-5 w-5 transition-all duration-200 ${commentOpen ? "fill-primary/20" : ""}`} />
            <span className="text-xs font-bold tabular-nums">
              {post.comments?.length || 0}
            </span>
          </button>
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

        {/* Comments section — smooth slide-in/out via CSS grid trick */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            display: "grid",
            gridTemplateRows: commentOpen ? "1fr" : "0fr",
          }}
        >
          <div className="min-h-0">
            <div className="border-t border-white/5 pt-3.5 space-y-3">
              {/* Existing comments list */}
              {post.comments && post.comments.length > 0 && (
                <div className="max-h-36 overflow-y-auto space-y-2.5 pr-1 scroll-smooth">
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

              {/* Comment input */}
              <form
                onSubmit={handleCommentSubmit}
                className="flex items-center gap-2"
              >
                <input
                  ref={commentInputRef}
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 h-9 bg-zinc-200/20 dark:bg-zinc-900/60 border border-white/5 focus-visible:ring-1 focus-visible:ring-primary rounded-full px-3.5 text-xs text-foreground outline-none transition-all duration-200"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                    commentText.trim()
                      ? "bg-primary text-white cursor-pointer hover:brightness-110 active:scale-95"
                      : "text-muted-foreground/30 bg-zinc-200/10 dark:bg-zinc-800/10 cursor-not-allowed"
                  }`}
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
});
PostCard.displayName = "PostCard";

const PostCardSkeleton = () => (
  <div className="bg-white/5 dark:bg-zinc-900/20 border border-white/5 dark:border-zinc-850/20 rounded-3xl overflow-hidden animate-pulse shadow-sm p-4 space-y-4">
    {/* Header Skeleton */}
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-full bg-zinc-800/60 dark:bg-zinc-800/40" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3 bg-zinc-800/60 dark:bg-zinc-800/40 rounded-full w-24" />
        <div className="h-2 bg-zinc-800/40 dark:bg-zinc-800/20 rounded-full w-16" />
      </div>
    </div>
    {/* Media Box Skeleton */}
    <div className="w-full aspect-square bg-zinc-800/60 dark:bg-zinc-800/40 rounded-2xl animate-pulse" />
    {/* Actions Skeleton */}
    <div className="flex gap-4 pt-1">
      <div className="h-4 bg-zinc-800/60 dark:bg-zinc-800/40 rounded-full w-12" />
      <div className="h-4 bg-zinc-800/60 dark:bg-zinc-800/40 rounded-full w-12" />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Feed page
// ─────────────────────────────────────────────────────────────────────────────
export default function Feed() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { posts, isPostsLoading } = useSelector((state) => state.posts);
  const { user: myUser } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Only fetches if posts aren't already cached (see post.thunks.js condition guard)
  useEffect(() => {
    dispatch(getPostsThunk());
  }, [dispatch]);

  const handleLike = useCallback(
    (postId) => {
      dispatch(likePostThunk({ postId, userId: myUser?._id }));
    },
    [dispatch, myUser?._id]
  );

  const handleCommentSubmit = useCallback(
    (postId, text) => {
      dispatch(commentPostThunk({ postId, text }));
    },
    [dispatch]
  );

  return (
    <div className="h-full flex flex-col relative bg-transparent">
      {/* Feed Header */}
      <header className="flex h-16 shrink-0 items-center justify-between px-6 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md border-b border-white/10 dark:border-zinc-850/20 sticky top-0 z-20">
        <h2 className="font-extrabold text-xl tracking-tight text-foreground">Explore Feed</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(getPostsThunk({ force: true }))}
            title="Refresh Feed"
            className="h-9 w-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-white/10 dark:hover:bg-zinc-900/30 hover:text-foreground cursor-pointer transition-colors"
          >
            <RefreshCw className={`h-4.5 w-4.5 ${isPostsLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-9 px-3.5 rounded-full bg-primary hover:brightness-110 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Post</span>
          </button>
        </div>
      </header>

      {/* Main Feed List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="max-w-xl mx-auto px-4 py-8 space-y-8 pb-16">
          {isPostsLoading && posts.length === 0 ? (
            <div className="space-y-8">
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 p-6 bg-white/20 dark:bg-zinc-900/20 backdrop-blur-md rounded-3xl border border-white/10 dark:border-zinc-800/20">
              <p className="text-base font-semibold text-foreground">No posts yet</p>
              <p className="text-sm text-muted-foreground mt-1.5">
                Be the first to share a moment with the community!
              </p>
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
