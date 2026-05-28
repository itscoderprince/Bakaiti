import { memo } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { MessageSquareCode, Home, Film, CircleUser } from "lucide-react";

const NAV_ITEMS = [
  {
    to: "/feed",
    label: "Feed",
    icon: Home,
  },
  {
    to: "/",
    label: "Chats",
    icon: MessageSquareCode,
  },
  {
    to: "/reels",
    label: "Reels",
    icon: Film,
  },
  {
    to: "/profile",
    label: "Profile",
    icon: CircleUser,
  },
];

function NavigationLayout() {

  return (
    <div className="h-dvh w-screen flex flex-col md:flex-row overflow-hidden bg-radial from-slate-50 via-zinc-100 to-neutral-200 dark:bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] dark:from-slate-900 dark:via-neutral-950 dark:to-black">
      {/* Ambient background glows */}
      <div
        className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl animate-pulse pointer-events-none"
        style={{ animationDuration: "8s" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl animate-pulse pointer-events-none"
        style={{ animationDuration: "12s" }}
      />

      {/* Desktop Left Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 h-full bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl border-r border-white/20 dark:border-zinc-800/30 p-4 shrink-0 relative z-20">
        <div className="flex items-center gap-3 px-2 py-4 mb-6">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white shadow-md shadow-primary/20">
            <MessageSquareCode className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            BackChodi
          </span>
        </div>

        <nav className="flex-1 space-y-1.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/10 dark:hover:bg-zinc-900/30"
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main View Container */}
      <main className="flex-1 min-w-0 h-full overflow-hidden relative z-10 pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Dock Navigation Bar */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/60 dark:bg-zinc-950/70 backdrop-blur-3xl border-t border-white/10 dark:border-zinc-900/40 shadow-lg flex-row items-center justify-around z-30 px-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-300 ${
                isActive
                  ? "text-primary scale-110"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="text-[10px] font-bold mt-0.5">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default memo(NavigationLayout);
