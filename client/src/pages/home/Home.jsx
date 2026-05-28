import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import UserSidebar from "./UserSidebar";
import MessageContainer from "./MessageContainer";
import { useDispatch, useSelector } from "react-redux";
import { getOtherUsersThunk } from "../../features/auth/store/auth.thunks";
import { resetUnreadCount } from "../../features/auth/store/auth.slice";
import { useGetMessages } from "../../features/messages/hooks/useGetMessages";
import { useSendMessage } from "../../features/messages/hooks/useSendMessage";
import { useListenMessages } from "../../features/messages/hooks/useListenMessages";

// Removed dummy contacts as we now fetch real users from the backend.

const Home = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { otherUsers } = useSelector((state) => state.auth);

  const [activeContactId, setActiveContactId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState("dark");

  // Sync selected contact from routing state (e.g. redirected from Profile page)
  useEffect(() => {
    if (location.state?.selectContactId) {
      setActiveContactId(location.state.selectContactId);
      // Clean history state atomically to avoid selection loop on reload/back
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Fetch messages using our custom hook
  const {
    messages,
    isMessagesLoading,
    isLoadingMore,
    hasMore,
    loadMoreMessages,
  } = useGetMessages(activeContactId);
  const { sendMessage } = useSendMessage();
  
  // Listen for real-time messages via socket.io
  useListenMessages(activeContactId);

  useEffect(() => {
    dispatch(getOtherUsersThunk());
  }, [dispatch]);

  // Reset unread count when switching to a contact
  useEffect(() => {
    if (activeContactId) {
      dispatch(resetUnreadCount({ contactId: activeContactId }));
    }
  }, [activeContactId, dispatch]);

  const handleSendMessage = useCallback(async (text) => {
    if (!text.trim() || !activeContactId) return;
    await sendMessage(activeContactId, { message: text });
  }, [activeContactId, sendMessage]);

  const activeContact = useMemo(() => {
    return otherUsers?.find((c) => c._id === activeContactId) || null;
  }, [otherUsers, activeContactId]);

  const contactProps = useMemo(() => {
    if (!activeContact) return null;
    return { ...activeContact, name: activeContact.fullname };
  }, [activeContact]);

  // Handle dark mode side effects
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const handleBack = useCallback(() => {
    setActiveContactId(null);
  }, []);

  return (
    <SidebarProvider className="h-full w-full overflow-hidden bg-transparent">
      <div className="flex h-full w-full overflow-hidden p-0 md:p-3 md:gap-3 relative z-10 text-foreground">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl animate-pulse pointer-events-none" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl animate-pulse pointer-events-none" style={{ animationDuration: "12s" }} />

        <UserSidebar
          activeContactId={activeContactId}
          setActiveContactId={setActiveContactId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <MessageContainer
          contact={contactProps}
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isMessagesLoading}
          onBack={handleBack}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          onLoadMore={loadMoreMessages}
        />
      </div>
    </SidebarProvider>
  );
};

export default Home;
