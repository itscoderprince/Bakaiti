import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { logoutUserThunk } from "../../features/auth/store/auth.thunks.js";
import ChangePasswordSheet from "../../features/auth/components/ChangePasswordSheet.jsx";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInput,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Settings2,
  LogOut,
  Moon,
  Sun,
  ChevronsUpDown,
  CircleUser,
} from "lucide-react";
import { useSelector } from "react-redux";

const UserSidebar = ({
  activeContactId,
  setActiveContactId,
  searchQuery,
  setSearchQuery,
  theme,
  toggleTheme,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { otherUsers, user: currentUser } = useSelector((store) => store.auth);
  const { onlineUsers } = useSelector((store) => store.shocket);
  const { lastMessageTimes } = useSelector((store) => store.messages);

  // 1. Filter contacts based on the search query input
  const filteredUsers =
    otherUsers?.filter(
      (user) =>
        user.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  // 2. Sort filtered contacts so that users with the most recent message exchange appear at the top.
  // Fallback to their creation date (registration date) so list order is consistent.
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const timeA = lastMessageTimes[a._id] || a.createdAt || 0;
    const timeB = lastMessageTimes[b._id] || b.createdAt || 0;
    return new Date(timeB) - new Date(timeA);
  });

  const handleLogout = async () => {
    try {
      await dispatch(logoutUserThunk()).unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <Sidebar
        className={`border-r border-sidebar-border bg-sidebar transition-all duration-200 w-full! md:w-88! ${
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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground opacity-70 transition-colors group-focus-within:text-emerald-500" />
          <SidebarInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts..."
            className="pl-9 bg-background/50 border-input h-9 rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all duration-200"
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
                        className={`w-full flex items-center justify-between p-3 h-14 rounded-xl transition-all duration-250 border ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border/50 shadow-md translate-x-1"
                            : "hover:bg-sidebar-accent/40 border-transparent hover:border-sidebar-border/20 text-foreground/80 hover:text-foreground hover:translate-x-0.5"
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
                              <div className="flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-bold shadow-md bg-gradient-to-tr from-emerald-500 to-teal-600">
                                {initials}
                              </div>
                            )}
                            {/* Online presence status indicator */}
                            {onlineUsers?.includes(user._id) && (
                              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-sidebar shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                            )}
                          </div>

                          {/* Contact Text Information */}
                          <div className="flex flex-col text-left min-w-0 w-full">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-sm truncate tracking-tight">
                                {user.fullname}
                              </span>
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
      <SidebarFooter className="p-2 border-t border-sidebar-border bg-sidebar-accent/10">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-sidebar-border/30 hover:bg-sidebar-accent/50 transition-all duration-200 shadow-sm"
                render={
                  <button className="flex items-center justify-between w-full cursor-pointer" />
                }
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    {currentUser?.profilePic ? (
                      <img
                        src={currentUser.profilePic}
                        alt={currentUser.fullname}
                        className="flex h-8 w-8 object-cover items-center justify-center rounded-full shadow-sm"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-900 text-white text-[10px] font-bold">
                        {currentUser?.fullname
                          ? currentUser.fullname
                              .trim()
                              .split(/\s+/)
                              .map((n) => n[0])
                              .filter(Boolean)
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()
                          : currentUser?.username
                              ?.substring(0, 2)
                              .toUpperCase() || "U"}
                      </div>
                    )}
                    {/* Assume the current user is always online */}
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-sidebar bg-emerald-500" />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="font-medium text-xs truncate">
                      {currentUser?.fullname || "User"}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      @{currentUser?.username || "user"}
                    </span>
                  </div>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground opacity-60 shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer gap-2">
                    <CircleUser className="h-4 w-4" />
                    Profile Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsSettingsOpen(true)}
                    className="cursor-pointer gap-2"
                  >
                    <Settings2 className="h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={toggleTheme}
                    className="cursor-pointer gap-2"
                  >
                    {theme === "light" ? (
                      <>
                        <Moon className="h-4 w-4" />
                        Dark Mode
                      </>
                    ) : (
                      <>
                        <Sun className="h-4 w-4" />
                        Light Mode
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      </Sidebar>
      <ChangePasswordSheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
};

export default UserSidebar;
