import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuthThunk } from "./features/auth/store/auth.thunks.js";
import { getOtherUsersThunk } from "./features/auth/store/auth.thunks.js";
import { updateUserPresence } from "./features/auth/store/auth.slice.js";
import { connectSocket, disconnectSocket, setOnlineUsers, getSocket, setTyping } from "./features/shocket/store/shocket.slice.js";
import { Outlet } from "react-router-dom";

// Minimal skeleton shown only during the initial auth hydration check
// so users see the app background immediately instead of a blank screen.
const AuthCheckingSkeleton = () => (
  <div className="h-dvh w-screen flex flex-col items-center justify-between bg-zinc-950 text-white p-8 relative overflow-hidden select-none">
    {/* Ambient glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

    <div /> {/* Spacer */}

    {/* Center content */}
    <div className="flex flex-col items-center gap-6 relative z-10">
      {/* Animated Logo */}
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 animate-pulse mb-2">
        <svg viewBox="0 0 24 24" className="h-9 w-9 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Progress Indicator */}
      <div className="w-48 bg-zinc-900 h-1 rounded-full overflow-hidden relative">
        <div className="absolute top-0 bottom-0 left-0 bg-blue-500 rounded-full animate-[loading_1.5s_infinite_ease-in-out]" />
      </div>
      
      {/* Application Name */}
      <h1 className="font-extrabold text-2xl tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-indigo-500">
        VAANIX
      </h1>
    </div>

    {/* Bottom security footer */}
    <div className="flex flex-col items-center gap-1.5 mt-auto opacity-60">
      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>End-to-end encrypted</span>
      </div>
      <span className="text-[10px] text-zinc-500">Vaanix Chat Messenger</span>
    </div>
  </div>
);

const App = () => {
  const dispatch = useDispatch();
  const { isCheckingAuth, user } = useSelector((state) => state.auth);
  const { isConnected } = useSelector((state) => state.shocket);

  // Step 1: Verify session on mount
  useEffect(() => {
    dispatch(checkAuthThunk());
  }, [dispatch]);

  // Step 2: Once authenticated, prefetch contacts + connect socket in parallel
  // Previously getOtherUsersThunk was only dispatched inside Home.jsx,
  // adding 3+ render cycles of delay. Now it fires immediately after auth.
  useEffect(() => {
    if (user?._id) {
      dispatch(getOtherUsersThunk());
      dispatch(connectSocket({ userId: user._id }));
    } else {
      dispatch(disconnectSocket());
    }

    return () => {
      dispatch(disconnectSocket());
    };
  }, [user?._id, dispatch]);

  // Listen for online users, typing, and last seen updates from backend socket
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleOnlineUsers = (users) => {
      dispatch(setOnlineUsers(users));
    };

    const handleTyping = (userId) => {
      dispatch(setTyping({ userId, isTyping: true }));
    };

    const handleStopTyping = (userId) => {
      dispatch(setTyping({ userId, isTyping: false }));
    };

    const handleLastSeenUpdate = ({ userId, lastSeen }) => {
      dispatch(updateUserPresence({ userId, lastSeen }));
    };

    socket.on("getOnlineUsers", handleOnlineUsers);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    socket.on("userLastSeenUpdate", handleLastSeenUpdate);

    return () => {
      socket.off("getOnlineUsers", handleOnlineUsers);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("userLastSeenUpdate", handleLastSeenUpdate);
    };
  }, [isConnected, dispatch]);

  // Show a minimal branded skeleton (not blank) during auth hydration
  if (isCheckingAuth) {
    return <AuthCheckingSkeleton />;
  }

  return <Outlet />;
};

export default App;

