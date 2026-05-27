import { useMemo, memo } from "react";
import { useSelector } from "react-redux";
import { Search } from "lucide-react";
import UserAccountFooter from "../../features/auth/components/UserAccountFooter.jsx";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInput,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";

const UserSidebar = ({
  activeContactId,
  setActiveContactId,
  searchQuery,
  setSearchQuery,
  theme,
  toggleTheme,
}) => {
  const { otherUsers } = useSelector((store) => store.auth);
  const { onlineUsers } = useSelector((store) => store.shocket);
  const { lastMessageTimes } = useSelector((store) => store.messages);

  // 1. Filter and sort contacts based on search query and message history (memoized)
  const sortedUsers = useMemo(() => {
    const filtered =
      otherUsers?.filter(
        (user) =>
          user.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username?.toLowerCase().includes(searchQuery.toLowerCase()),
      ) || [];

    return [...filtered].sort((a, b) => {
      const timeA = lastMessageTimes[a._id] || a.createdAt || 0;
      const timeB = lastMessageTimes[b._id] || b.createdAt || 0;
      return new Date(timeB) - new Date(timeA);
    });
  }, [otherUsers, searchQuery, lastMessageTimes]);

  return (
    <>
      <Sidebar
        className={`border-r md:border border-sidebar-border bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl transition-all duration-300 w-full! md:w-88! md:rounded-2xl md:shadow-lg ${
          activeContactId ? "hidden md:flex" : "flex"
        }`}
        collapsible="none"
      >
        {/* Sidebar Header */}
        <SidebarHeader className="p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg shadow-sm overflow-hidden bg-transparent">
                <img
                  src="/logo.webp"
                  alt="backChodi Logo"
                  className="h-full w-full object-contain mix-blend-multiply dark:mix-blend-screen"
                />
              </div>
              <span className="font-semibold text-lg tracking-tight">
                BackChodi
              </span>
            </div>
          </div>

          {/* Search Form */}
          <div className="relative mt-1 group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground opacity-70 transition-colors group-focus-within:text-primary" />
            <SidebarInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="pl-9 bg-background/50 border-input h-9 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
            />
          </div>
        </SidebarHeader>

        {/* Sidebar Content */}
        <SidebarContent className="px-2 pt-1 pb-4">
          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Conversations
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sortedUsers.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No contacts found
                  </div>
                ) : (
                  sortedUsers.map((user) => {
                    const isActive = user._id === activeContactId;

                    // Extract initials for avatar
                    const initials = user.fullname
                      ? user.fullname
                          .trim()
                          .split(/\s+/)
                          .map((n) => n[0])
                          .filter(Boolean)
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()
                      : user.username?.substring(0, 2).toUpperCase() || "U";

                    return (
                      <SidebarMenuItem key={user._id} className="mb-1 px-1">
                        <SidebarMenuButton
                          onClick={() => setActiveContactId(user._id)}
                          isActive={isActive}
                          className={`w-full flex items-center justify-between p-3 h-14 rounded-xl transition-all duration-200 border border-transparent ${
                            isActive
                              ? "bg-white/15 dark:bg-white/10 text-foreground"
                              : "hover:bg-white/8 dark:hover:bg-white/5 text-foreground/80 hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-3 w-full min-w-0">
                            {/* Avatar with Profile Pic or Initials */}
                            <div className="relative shrink-0">
                              {user.profilePic ? (
                                <img
                                  src={user.profilePic}
                                  alt={user.fullname}
                                  className="flex h-9 w-9 object-cover items-center justify-center rounded-full shadow-md border border-border/10"
                                />
                              ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-bold shadow-md bg-gradient-to-tr from-primary to-primary/80">
                                  {initials}
                                </div>
                              )}
                              {/* Online presence status indicator */}
                              {onlineUsers?.includes(user._id) && (
                                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-zinc-900" />
                              )}
                            </div>

                            {/* Contact Text Information */}
                            <div className="flex flex-col text-left min-w-0 w-full">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-sm truncate tracking-tight">
                                  {user.fullname}
                                </span>
                                {user.unreadCount > 0 && (
                                  <span className="shrink-0 flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-white text-[10px] font-bold leading-none select-none animate-in scale-in duration-200">
                                    {user.unreadCount > 99 ? "99+" : user.unreadCount}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-muted-foreground/80 truncate mt-0.5">
                                @{user.username}
                              </span>
                            </div>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Sidebar Footer */}
        <UserAccountFooter theme={theme} toggleTheme={toggleTheme} />
      </Sidebar>
    </>
  );
};

export default memo(UserSidebar);
