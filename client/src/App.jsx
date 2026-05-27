import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuthThunk } from "./features/auth/store/auth.thunks.js";
import { updateUserPresence } from "./features/auth/store/auth.slice.js";
import { connectSocket, disconnectSocket, setOnlineUsers, getSocket, setTyping } from "./features/shocket/store/shocket.slice.js";
import { Outlet } from "react-router-dom";

const App = () => {
  const dispatch = useDispatch();
  const { isCheckingAuth, user } = useSelector((state) => state.auth);
  const { isConnected } = useSelector((state) => state.shocket);

  useEffect(() => {
    dispatch(checkAuthThunk());
  }, [dispatch]);

  // Connect or disconnect socket based on authentication state
  useEffect(() => {
    if (user?._id) {
      dispatch(connectSocket({ userId: user._id }));
    } else {
      dispatch(disconnectSocket());
    }

    return () => {
      dispatch(disconnectSocket());
    };
  }, [user, dispatch]);

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

  if (isCheckingAuth) {
    return null;
  }

  return <Outlet />;
};

export default App;
