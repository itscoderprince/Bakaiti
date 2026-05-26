import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import UserSidebar from "./UserSidebar";
import MessageContainer from "./MessageContainer";
import { useDispatch, useSelector } from "react-redux";
import { getOtherUsersThunk } from "../../features/auth/store/auth.thunks";
import { useGetMessages } from "../../features/messages/hooks/useGetMessages";
import { useSendMessage } from "../../features/messages/hooks/useSendMessage";
import { useListenMessages } from "../../features/messages/hooks/useListenMessages";

// Removed dummy contacts as we now fetch real users from the backend.

const Home = () => {
  const dispatch = useDispatch();
  const { otherUsers } = useSelector((state) => state.auth);

  const [activeContactId, setActiveContactId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState("light");

  // Fetch messages using our custom hook
  const { messages, isMessagesLoading } = useGetMessages(activeContactId);
  const { sendMessage } = useSendMessage();
  
  // Listen for real-time messages via socket.io
  useListenMessages(activeContactId);

  useEffect(() => {
    dispatch(getOtherUsersThunk());
  }, [dispatch]);



  // Handle dark mode side effects
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Unread clearing logic is skipped for now since real unread logic isn't implemented
  // useEffect(() => { ... }, [activeContactId]);

  const handleSendMessage = async (text) => {
    if (!text.trim() || !activeContactId) return;
    await sendMessage(activeContactId, { message: text });
  };

  const activeContact = otherUsers?.find((c) => c._id === activeContactId);
  const contactProps = activeContact ? { ...activeContact, name: activeContact.fullname } : null;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
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
          onBack={() => setActiveContactId(null)}
        />
      </div>
    </SidebarProvider>
  );
};

export default Home;
