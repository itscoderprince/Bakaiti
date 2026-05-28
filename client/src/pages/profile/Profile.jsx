import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  CircleUser, 
  Settings2, 
  LogOut, 
  MessageSquare, 
  Heart, 
  MessageCircle, 
  Play, 
  ArrowLeft,
  Grid
} from "lucide-react";
import { logoutUserThunk } from "../../features/auth/store/auth.thunks.js";
import { getOptimizedMediaUrl } from "../../utils/cloudinary.js";
import EditProfileSheet from "../../features/auth/components/EditProfileSheet.jsx";
import ChangePasswordSheet from "../../features/auth/components/ChangePasswordSheet.jsx";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getPostsThunk } from "../../features/posts/store/post.thunks.js";

export default function Profile() {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user: currentUser } = useSelector((store) => store.auth);
  const { otherUsers } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.posts);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync posts on mount
  useEffect(() => {
    dispatch(getPostsThunk());
  }, [dispatch]);

  const isOwnProfile = !userId || userId === currentUser?._id;

  const profileUser = useMemo(() => {
    if (isOwnProfile) return currentUser;
    return otherUsers?.find((u) => u._id === userId) || null;
  }, [isOwnProfile, currentUser, otherUsers, userId]);

  const userPosts = useMemo(() => {
    if (!profileUser) return [];
    return posts.filter((p) => p.owner?._id === profileUser._id);
  }, [posts, profileUser]);

  const totalLikes = useMemo(() => {
    return userPosts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
  }, [userPosts]);

  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logoutUserThunk()).unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [dispatch, navigate]);

  const handleMessageUser = useCallback(() => {
    if (!profileUser) return;
    // Navigate to chats page and pass the selected contact ID
    navigate("/", { state: { selectContactId: profileUser._id } });
  }, [navigate, profileUser]);

  if (!profileUser) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6">
        <CircleUser className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-sm font-semibold">User not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-full flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Go Back</span>
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between px-6 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md border-b border-white/10 dark:border-zinc-850/20 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {!isOwnProfile && (
            <button
              onClick={() => navigate(-1)}
              className="p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors hover:bg-white/10 dark:hover:bg-zinc-900/30 cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h2 className="font-extrabold text-xl tracking-tight text-foreground">
            {isOwnProfile ? "My Profile" : `${profileUser.fullname}'s Profile`}
          </h2>
        </div>
      </header>

      {/* Profile Details Area */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="max-w-xl mx-auto px-4 py-8 space-y-8 pb-20">
          
          {/* Info Card */}
          <div className="bg-white/30 dark:bg-zinc-900/35 backdrop-blur-xl border border-white/15 dark:border-zinc-850/20 rounded-3xl p-6 md:p-8 flex flex-col items-center md:items-start md:flex-row gap-6 md:gap-8 shadow-xl">
            
            {/* Avatar */}
            <div className="relative shrink-0 select-none">
              {profileUser.profilePic ? (
                <img
                  src={getOptimizedMediaUrl(profileUser.profilePic, { width: 224, height: 224, gravity: "face" })}
                  alt={profileUser.fullname}
                  className="h-24 w-24 md:h-28 md:w-28 rounded-full border border-border/10 object-cover shadow-md"
                />
              ) : (
                <div className="h-24 w-24 md:h-28 md:w-28 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-md">
                  {profileUser.fullname?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* User Meta & Action */}
            <div className="flex-1 flex flex-col text-center md:text-left min-w-0 w-full space-y-4">
              <div>
                <h3 className="text-xl font-bold text-foreground truncate">
                  {profileUser.fullname}
                </h3>
                <span className="text-xs text-muted-foreground leading-none">
                  @{profileUser.username}
                </span>
                {profileUser.bio && (
                  <p className="text-xs text-muted-foreground/90 font-medium leading-relaxed mt-2.5 max-w-sm">
                    {profileUser.bio}
                  </p>
                )}
              </div>

              {/* Stats Counters */}
              <div className="flex items-center justify-center md:justify-start gap-8 py-1.5 border-y border-white/5">
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-base font-bold text-foreground">
                    {userPosts.length}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">
                    Posts
                  </span>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-base font-bold text-foreground">
                    {totalLikes}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">
                    Likes
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2.5 justify-center md:justify-start pt-1.5">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={() => setIsProfileOpen(true)}
                      className="px-4 h-9 rounded-full bg-primary hover:brightness-110 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-primary/10 transition-all duration-200 active:scale-[0.98] cursor-pointer"
                    >
                      <CircleUser className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="px-4 h-9 rounded-full bg-zinc-200/20 dark:bg-zinc-800/40 hover:bg-zinc-200/35 dark:hover:bg-zinc-800/60 text-foreground border border-white/5 text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 active:scale-[0.98] cursor-pointer"
                    >
                      <Settings2 className="h-4 w-4" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-4 h-9 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/10 text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 active:scale-[0.98] cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleMessageUser}
                    className="px-5 h-9 rounded-full bg-primary hover:brightness-110 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-primary/15 transition-all duration-200 active:scale-[0.98] cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Message</span>
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* User's Posts Feed Header */}
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Grid className="h-4.5 w-4.5 text-muted-foreground" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Posts Gallery
            </span>
          </div>

          {/* Posts Gallery Grid */}
          {userPosts.length === 0 ? (
            <div className="text-center py-12 p-6 bg-white/20 dark:bg-zinc-900/20 backdrop-blur-md rounded-3xl border border-white/10 dark:border-zinc-800/20">
              <p className="text-sm font-semibold text-foreground">No posts shared yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5 md:gap-3">
              {userPosts.map((post) => (
                <div
                  key={post._id}
                  onClick={() => navigate("/feed")}
                  className="relative aspect-square bg-zinc-950/60 rounded-xl md:rounded-2xl overflow-hidden border border-white/5 shadow-md cursor-pointer group flex items-center justify-center"
                >
                  {post.mediaType === "image" ? (
                    <img
                      src={getOptimizedMediaUrl(post.media, { width: 300, height: 300, crop: "fill" })}
                      alt="Thumbnail"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full relative">
                      <video
                        src={post.media}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        muted
                        playsInline
                      />
                      <div className="absolute top-2 right-2 h-5 w-5 bg-black/50 backdrop-blur-sm rounded-md flex items-center justify-center text-white border border-white/10 shadow">
                        <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 text-white transition-opacity duration-300 z-10">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4 fill-current text-red-500" />
                      <span className="text-xs font-bold">{post.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4 fill-current text-sky-400" />
                      <span className="text-xs font-bold">{post.comments?.length || 0}</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </ScrollArea>

      {/* Sheets triggered from Profile Details */}
      {isOwnProfile && (
        <>
          <EditProfileSheet open={isProfileOpen} onOpenChange={setIsProfileOpen} />
          <ChangePasswordSheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
        </>
      )}
    </div>
  );
}
