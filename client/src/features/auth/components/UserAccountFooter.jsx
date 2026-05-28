import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUserThunk } from "../store/auth.thunks.js";
import ChangePasswordSheet from "./ChangePasswordSheet.jsx";
import EditProfileSheet from "./EditProfileSheet.jsx";
import { getOptimizedMediaUrl } from "../../../utils/cloudinary.js";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
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
  Settings2,
  LogOut,
  Moon,
  Sun,
  ChevronsUpDown,
  CircleUser,
} from "lucide-react";

const UserAccountFooter = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user: currentUser } = useSelector((store) => store.auth);

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
      <SidebarFooter className="border-t border-sidebar-border bg-white/20 dark:bg-black/10 p-2 shrink-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-white/20 dark:border-zinc-800/30 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md hover:bg-white/45 dark:hover:bg-zinc-900/45 hover:scale-[1.01] transition-all duration-200 shadow-sm"
                render={
                  <button className="flex items-center justify-between w-full cursor-pointer" />
                }
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    {currentUser?.profilePic ? (
                      <img
                        src={getOptimizedMediaUrl(currentUser.profilePic, { width: 64, height: 64, gravity: "face" })}
                        alt={currentUser.fullname}
                        className="flex h-8 w-8 object-cover items-center justify-center rounded-full shadow-sm border border-border/10"
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
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-zinc-950 bg-green-500" />
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
                  <DropdownMenuItem
                    onClick={() => setIsProfileOpen(true)}
                    className="cursor-pointer gap-2"
                  >
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
      <ChangePasswordSheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <EditProfileSheet open={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </>
  );
};

export default UserAccountFooter;
