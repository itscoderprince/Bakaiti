import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import UserSidebar from "./UserSidebar";
import MessageContainer from "./MessageContainer";

const INITIAL_CONTACTS = [
  {
    id: 1,
    name: "Sarah Connor",
    username: "sarah_c",
    avatarBg: "bg-blue-500",
    avatarText: "SC",
    status: "online",
    lastSeen: "Active now",
    typing: false,
    unread: 2,
  },
  {
    id: 2,
    name: "Alex Rivera",
    username: "alex_r",
    avatarBg: "bg-emerald-500",
    avatarText: "AR",
    status: "online",
    lastSeen: "Active now",
    typing: false,
    unread: 0,
  },
  {
    id: 3,
    name: "David Chen",
    username: "david_c",
    avatarBg: "bg-orange-500",
    avatarText: "DC",
    status: "offline",
    lastSeen: "Last seen 2h ago",
    typing: false,
    unread: 0,
  },
  {
    id: 4,
    name: "Emily Watson",
    username: "emily_w",
    avatarBg: "bg-purple-500",
    avatarText: "EW",
    status: "online",
    lastSeen: "Active now",
    typing: false,
    unread: 0,
  },
  {
    id: 5,
    name: "Michael Scott",
    username: "scott_m",
    avatarBg: "bg-rose-500",
    avatarText: "MS",
    status: "offline",
    lastSeen: "Last seen 1d ago",
    typing: false,
    unread: 0,
  },
];

const INITIAL_MESSAGES = {
  1: [
    { id: 1, text: "Hey! Did you review the latest UI design for the app?", sender: "them", timestamp: "10:30 AM" },
    { id: 2, text: "Yes, I just took a look. It looks incredibly sleek and professional!", sender: "me", timestamp: "10:32 AM" },
    { id: 3, text: "Awesome! I used the new shadcn sidebar components to structure it. Let me know if we need to adjust any spacing.", sender: "them", timestamp: "10:33 AM" },
    { id: 4, text: "The layout is perfect. I love the clean typography and responsive design.", sender: "me", timestamp: "10:35 AM" },
  ],
  2: [
    { id: 1, text: "Hey there! Are we still on for the sync meeting today?", sender: "them", timestamp: "9:15 AM" },
    { id: 2, text: "Yep, absolutely. 2:00 PM works for me. I will prepare the demo slides.", sender: "me", timestamp: "9:20 AM" },
    { id: 3, text: "Perfect, see you then!", sender: "them", timestamp: "9:21 AM" },
  ],
  3: [
    { id: 1, text: "Hi, could you take a look at the pull request for the login page when you have a moment?", sender: "them", timestamp: "Yesterday" },
    { id: 2, text: "Sure thing, I'll review it right after this debug session.", sender: "me", timestamp: "Yesterday" },
  ],
  4: [
    { id: 1, text: "Let me know when you're free to catch up. I have some exciting updates about the product roadmap!", sender: "them", timestamp: "Wednesday" },
  ],
  5: [
    { id: 1, text: "Did you hear about the Dundies this year?", sender: "them", timestamp: "May 15" },
    { id: 2, text: "Haha yes Michael, can't wait.", sender: "me", timestamp: "May 15" },
  ],
};

const BOT_REPLIES = {
  1: [
    "That sounds fantastic! Let's schedule a call to finalize the launch items.",
    "Got it. I'll make those final adjustments to the custom theme variables.",
    "Do you want me to write some tests for the sidebar state toggling as well?",
  ],
  2: [
    "Perfect! I will send over the calendar invite with the meeting link.",
    "Thanks for confirming. See you at 2:00 PM!",
  ],
  3: [
    "Awesome, thank you. Let me know if you run into any build issues.",
    "No rush! I appreciate the review.",
  ],
  4: [
    "Excellent, I look forward to catching up soon. Let's do it tomorrow morning.",
    "Perfect, thanks! Have a great afternoon.",
  ],
  5: [
    "Great! Remember: 'You miss 100% of the shots you don't take. - Wayne Gretzky' - Michael Scott",
    "I declare bankruptcy... of bugs in our code!",
  ],
};

const Home = () => {
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [activeContactId, setActiveContactId] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState("light");

  // Keep track of reply counts to rotate bot replies
  const [replyIndices, setReplyIndices] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

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

  // Clear unread count when switching active chat
  useEffect(() => {
    setContacts((prev) =>
      prev.map((c) => (c.id === activeContactId ? { ...c, unread: 0 } : c))
    );
  }, [activeContactId]);

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    const timeString = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMessage = {
      id: Date.now(),
      text,
      sender: "me",
      timestamp: timeString,
    };

    // Add message to conversation
    setMessages((prev) => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMessage],
    }));

    // Trigger auto-reply simulation
    simulateBotReply();
  };

  const simulateBotReply = () => {
    const currentContactId = activeContactId;

    // Set contact as typing
    setContacts((prev) =>
      prev.map((c) => (c.id === currentContactId ? { ...c, typing: true } : c))
    );

    // 1. Typing animation delay
    setTimeout(() => {
      // Rotate through mock responses for this contact
      const replies = BOT_REPLIES[currentContactId] || ["Received!"];
      const replyIndex = replyIndices[currentContactId] || 0;
      const botResponseText = replies[replyIndex % replies.length];

      const timeString = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const botMessage = {
        id: Date.now() + 1,
        text: botResponseText,
        sender: "them",
        timestamp: timeString,
      };

      // Append bot response and clear typing status
      setMessages((prev) => ({
        ...prev,
        [currentContactId]: [...(prev[currentContactId] || []), botMessage],
      }));

      setContacts((prev) =>
        prev.map((c) =>
          c.id === currentContactId ? { ...c, typing: false } : c
        )
      );

      // Increment response pointer
      setReplyIndices((prev) => ({
        ...prev,
        [currentContactId]: replyIndex + 1,
      }));
    }, 1800); // 1.8 seconds feels natural
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeContact = contacts.find((c) => c.id === activeContactId);
  const activeMessages = messages[activeContactId] || [];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
        <UserSidebar
          contacts={filteredContacts}
          activeContactId={activeContactId}
          setActiveContactId={setActiveContactId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <MessageContainer
          contact={activeContact}
          messages={activeMessages}
          onSendMessage={handleSendMessage}
        />
      </div>
    </SidebarProvider>
  );
};

export default Home;
