import {
  useState,
  useEffect,
  useRef,
  useMemo,
  memo,
  useCallback,
} from "react";
import { useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSocket } from "../../features/shocket/store/shocket.slice.js";
import { getOptimizedMediaUrl } from "../../utils/cloudinary.js";
import { readAndCompressFile } from "../../utils/imageCompressor.js";
import toast from "react-hot-toast";
import {
  Search,
  PhoneCall,
  Video,
  Plus,
  SendHorizontal,
  EllipsisVertical,
  X,
  ChevronLeft,
  MessageSquareCode,
  Check,
  CheckCheck,
  Palette,
  FileText,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

const wallpaperOptions = [
  {
    id: "default",
    name: "Default Glow",
    class: "bg-transparent",
    preview: "bg-neutral-800 border border-white/20",
  },
  {
    id: "solid-dark",
    name: "Charcoal",
    class: "!bg-zinc-950",
    preview: "bg-zinc-950",
  },
  {
    id: "solid-navy",
    name: "Navy Blue",
    class: "!bg-slate-900",
    preview: "bg-slate-900",
  },
  {
    id: "solid-plum",
    name: "Deep Plum",
    class: "!bg-purple-950/60",
    preview: "bg-purple-950",
  },
  {
    id: "grad-royal",
    name: "Royal Sky",
    class: "!bg-gradient-to-b !from-blue-950/40 !via-zinc-950 !to-black",
    preview: "bg-gradient-to-br from-blue-950 to-black",
  },
  {
    id: "grad-emerald",
    name: "Forest Mint",
    class: "!bg-gradient-to-b !from-emerald-950/30 !via-neutral-950 !to-black",
    preview: "bg-gradient-to-br from-emerald-950 to-black",
  },
  {
    id: "grad-sunset",
    name: "Sunset Velvet",
    class: "!bg-gradient-to-b !from-rose-950/30 !via-zinc-950 !to-black",
    preview: "bg-gradient-to-br from-rose-950 to-black",
  },
  {
    id: "grad-ocean",
    name: "Ocean Breeze",
    class: "!bg-gradient-to-b !from-cyan-950/30 !via-slate-950 !to-black",
    preview: "bg-gradient-to-br from-cyan-950 to-black",
  },
];

/**
 * Formats user's lastSeen timestamp into a polished "last seen" string.
 */
const getLastSeenText = (timestamp) => {
  if (!timestamp) return "Offline";
  try {
    const date = new Date(timestamp);
    const options = { month: "short", day: "numeric" };
    const timeOptions = { hour: "2-digit", minute: "2-digit" };

    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return `last seen today at ${date.toLocaleTimeString([], timeOptions)}`;
    }

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `last seen yesterday at ${date.toLocaleTimeString([], timeOptions)}`;
    }

    return `last seen ${date.toLocaleDateString([], options)} at ${date.toLocaleTimeString([], timeOptions)}`;
  } catch (err) {
    return "Offline";
  }
};

// ─── CRIT-2: Hoisted regex constants ─────────────────────────────────────────
// Compiling a Unicode-property regex (/\p{...}/u) is expensive.
// Previously these were created inside getEmojiOnlyCount() on every call
// (= once per message per render). Hoisting them to module scope means they
// are compiled exactly once at import time, regardless of message count.

const EMOJI_STRIP_ZWJ_RE = /[\s\uFE0F\u200D]/g;
const EMOJI_STRIP_MODIFIER_RE = /[\uD83C][\uDFFB-\uDFFF]/g;
const EMOJI_ONLY_RE = /^\p{Extended_Pictographic}+$/u;
const EMOJI_GLYPH_RE = /\p{Extended_Pictographic}/gu;

/**
 * Returns the emoji count if the string contains ONLY emojis (≤ 3), else 0.
 */
const getEmojiOnlyCount = (text) => {
  if (!text) return 0;
  const emojiStr = text
    .replace(EMOJI_STRIP_ZWJ_RE, "")
    .replace(EMOJI_STRIP_MODIFIER_RE, "");
  if (!emojiStr) return 0;
  if (!EMOJI_ONLY_RE.test(emojiStr)) return 0;
  const glyphs = emojiStr.match(EMOJI_GLYPH_RE);
  return glyphs ? glyphs.length : 0;
};

// ─── CRIT-2: Extracted MessageBubble ─────────────────────────────────────────
// Wrapping the bubble in React.memo means React skips re-rendering it unless
// its own props actually changed (e.g. status: "delivered" → "read").
// Previously, every keystroke in the input caused ALL N bubbles to re-render
// because the inline .map() inside MessageContainer re-ran on every state change.

const MessageBubble = memo(({ messageObj, myUserId }) => {
  const isMe = messageObj.senderId === myUserId;

  // toLocaleTimeString is a slow Date API — memoize since createdAt is immutable
  const timeString = useMemo(
    () =>
      messageObj.createdAt
        ? new Date(messageObj.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
    [messageObj.createdAt],
  );

  // message text is also immutable once sent
  const emojiCount = useMemo(
    () => getEmojiOnlyCount(messageObj.message),
    [messageObj.message],
  );
  const isEmojiOnly = emojiCount > 0 && emojiCount <= 3 && !messageObj.fileUrl;

  return (
    <div
      className={`flex w-full ${
        isMe ? "justify-end" : "justify-start"
      } animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out`}
    >
      <div
        className={`flex flex-col max-w-[85%] md:max-w-[70%] space-y-1 ${
          isMe ? "items-end" : "items-start"
        }`}
      >
        {isEmojiOnly ? (
          <div className="relative bg-transparent border-transparent select-all leading-none">
            <p
              className={`whitespace-pre-wrap wrap-break-words select-all leading-none ${
                emojiCount === 1
                  ? "text-[42px] p-2"
                  : emojiCount === 2
                    ? "text-[34px] p-1.5"
                    : "text-[28px] p-1"
              }`}
            >
              {messageObj.message}
            </p>
            <div className="flex justify-end items-center gap-1 pr-1 pt-1 opacity-80">
              <span className="text-[9px] text-muted-foreground">
                {timeString}
              </span>
              {isMe && (
                <span className="flex shrink-0">
                  {(messageObj.status === "sent" || !messageObj.status) && (
                    <Check className="h-3.5 w-3.5 text-muted-foreground/80" />
                  )}
                  {messageObj.status === "delivered" && (
                    <CheckCheck className="h-3.5 w-3.5 text-muted-foreground/80" />
                  )}
                  {messageObj.status === "read" && (
                    <CheckCheck className="h-3.5 w-3.5 text-sky-500" />
                  )}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div
            className={`px-3.5 pt-2 shadow-sm relative min-w-[90px] backdrop-blur-sm transition-all duration-200 ${
              messageObj.message ? "pb-1.5" : "pb-5.5"
            } ${
              isMe
                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-sm shadow-md hover:shadow-lg"
                : "bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/40 dark:border-zinc-800/30 text-foreground rounded-2xl rounded-tl-sm hover:shadow-md"
            }`}
          >
            {/* Render file attachments if present */}
            {messageObj.fileUrl && (
              <div className="mb-2 max-w-full">
                {messageObj.fileType === "image" ? (
                  <div className="rounded-xl overflow-hidden border border-white/5 shadow-inner">
                    <img
                      src={messageObj.fileUrl}
                      alt="shared image"
                      className="w-full h-auto object-cover max-h-[250px] cursor-pointer hover:brightness-105 transition-all"
                      onClick={() => window.open(messageObj.fileUrl, "_blank")}
                    />
                  </div>
                ) : messageObj.fileType === "video" ? (
                  <div className="rounded-xl overflow-hidden border border-white/5">
                    <video
                      src={messageObj.fileUrl}
                      controls
                      className="w-full h-auto max-h-[250px]"
                    />
                  </div>
                ) : (
                  <div
                    className={`flex items-center gap-2.5 p-3 rounded-xl border ${
                      isMe
                        ? "bg-black/35 border-white/10 text-white"
                        : "bg-muted/50 border-border text-foreground"
                    }`}
                  >
                    <FileText className="h-7 w-7 text-primary shrink-0" />
                    <div className="min-w-0 text-left">
                      <p className="text-xs font-semibold truncate max-w-[150px] sm:max-w-[190px]">
                        {messageObj.fileName || "Document"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {messageObj.fileSize || "Unknown Size"}
                      </p>
                    </div>
                    <a
                      href={messageObj.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors ml-auto shrink-0"
                      download
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {messageObj.message && (
              <div className="whitespace-pre-wrap wrap-break-words leading-[20px] pb-3.5 pr-8">
                {messageObj.message}
              </div>
            )}
            <div
              className={`absolute bottom-1 right-2 flex items-center gap-1 text-[9.5px] select-none ${
                isMe ? "text-white/70" : "text-muted-foreground/60"
              }`}
            >
              <span>{timeString}</span>
              {isMe && (
                <span className="flex shrink-0">
                  {(messageObj.status === "sent" || !messageObj.status) && (
                    <Check className="h-3.5 w-3.5 text-white/85" />
                  )}
                  {messageObj.status === "delivered" && (
                    <CheckCheck className="h-3.5 w-3.5 text-white/85" />
                  )}
                  {messageObj.status === "read" && (
                    <CheckCheck className="h-3.5 w-3.5 text-cyan-300" />
                  )}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────

const MessageContainer = ({
  contact,
  messages = [],
  onSendMessage,
  isLoading,
  onBack,
  isLoadingMore,
  hasMore,
  onLoadMore,
}) => {
  const { user: myUser } = useSelector((state) => state.auth);
  const { onlineUsers, typingUsers } = useSelector((state) => state.shocket);
  const { messageUploadProgress, sendingMessage } = useSelector((state) => state.messages);
  const [inputText, setInputText] = useState("");
  
  // File upload state variables
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState("");
  const [selectedFileType, setSelectedFileType] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedFileSize, setSelectedFileSize] = useState("");
  const fileInputRef = useRef(null);
  const isOnline = onlineUsers?.includes(contact?._id);
  const isTyping = !!typingUsers?.[contact?._id];
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [wallpaper, setWallpaper] = useState(
    localStorage.getItem("chat_wallpaper") || "default",
  );
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isLocalTyping, setIsLocalTyping] = useState(false);
  // showEmojiPicker state removed — emoji picker package uninstalled
  const lastContactIdRef = useRef(null);
  const shouldScrollInstantRef = useRef(false);
  const scrollAreaRef = useRef(null);
  const previousScrollHeightRef = useRef(0);
  const isPrependRef = useRef(false);

  // MIN-1: Sync showSearch to a ref so scrollToBottom can always read the
  // latest value without needing it as a useCallback dependency.
  // (Avoids the stale-closure problem with the old direct capture in a
  // non-memoized inner function.)
  const showSearchRef = useRef(showSearch);
  useEffect(() => {
    showSearchRef.current = showSearch;
  }, [showSearch]);

  // MIN-1: Side-effect (mutating refs) moved from render body into a useEffect.
  // Running side-effects directly in render is a React anti-pattern that can
  // cause issues with concurrent features and Strict Mode double-invocation.
  useEffect(() => {
    if (contact?._id && contact._id !== lastContactIdRef.current) {
      lastContactIdRef.current = contact._id;
      shouldScrollInstantRef.current = true;
    }
  }, [contact?._id]);

  // MED-1: Use requestAnimationFrame instead of setTimeout(30ms).
  // rAF fires after the browser has painted, so the scroll target is always
  // at the true bottom — no more scroll-position jumps.
  // useCallback with [] makes the reference stable (reads showSearch via ref).
  const scrollToBottom = useCallback((behavior = "smooth") => {
    if (showSearchRef.current) return;
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
    });
  }, []);

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
    if (!viewport) return;

    const handleScroll = () => {
      if (viewport.scrollTop < 50 && hasMore && !isLoadingMore && !isLoading) {
        previousScrollHeightRef.current = viewport.scrollHeight;
        isPrependRef.current = true;
        onLoadMore();
      }
    };

    viewport.addEventListener("scroll", handleScroll);
    return () => {
      viewport.removeEventListener("scroll", handleScroll);
    };
  }, [hasMore, isLoadingMore, isLoading, onLoadMore]);

  useEffect(() => {
    if (isLoading) return;

    const viewport = scrollAreaRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
    if (viewport && isPrependRef.current) {
      const heightDifference = viewport.scrollHeight - previousScrollHeightRef.current;
      viewport.scrollTop = heightDifference;
      isPrependRef.current = false;
      return;
    }

    if (shouldScrollInstantRef.current) {
      scrollToBottom("auto");
      shouldScrollInstantRef.current = false;
    } else {
      scrollToBottom("smooth");
    }
  }, [messages, isLoading, isTyping, scrollToBottom]);

  // Reset search state when switching contacts
  useEffect(() => {
    setShowSearch(false);
    setSearchQuery("");
  }, [contact?._id]);

  // Join/leave chat socket events to track active chats for real-time status ticks
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !contact?._id) return;

    socket.emit("joinChat", { activeChatId: contact._id });

    return () => {
      socket.emit("leaveChat");
    };
  }, [contact?._id]);

  // Stop typing indicator on contact change or unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      const socket = getSocket();
      if (socket && contact?._id && isLocalTyping) {
        socket.emit("stopTyping", contact._id);
        setIsLocalTyping(false);
      }
    };
  }, [contact?._id, isLocalTyping]);

  // MED-6: useCallback prevents a new function reference on every render,
  // avoiding unnecessary prop churn on the <Input> element.
  const handleInputChange = useCallback(
    (e) => {
      setInputText(e.target.value);

      const socket = getSocket();
      if (!socket || !contact?._id) return;

      if (!isLocalTyping) {
        setIsLocalTyping(true);
        socket.emit("typing", contact._id);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", contact._id);
        setIsLocalTyping(false);
      }, 2000);
    },
    [contact?._id, isLocalTyping],
  );

  // Handle file select action
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Enforce 12MB file upload limit
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > 12) {
      toast.error("File is too large. Please select a file under 12MB.");
      return;
    }

    const type = file.type.split("/")[0];
    setSelectedFileName(file.name);
    setSelectedFileSize(
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`
    );

    if (type === "image") {
      setSelectedFileType("image");
      // Silently compress images client-side before sending in chat
      try {
        const { base64 } = await readAndCompressFile(file, {
          maxWidth: 1080,
          maxHeight: 1080,
          quality: 0.82,
        });
        setSelectedFile(base64);
        setSelectedFilePreview(base64);
      } catch (err) {
        console.error("Compression error:", err);
        const reader = new FileReader();
        reader.onload = () => {
          setSelectedFile(reader.result);
          setSelectedFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setSelectedFileType(type === "video" ? "video" : "document");
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedFile(reader.result);
        setSelectedFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearSelectedFile = () => {
    setSelectedFile(null);
    setSelectedFilePreview("");
    setSelectedFileType("");
    setSelectedFileName("");
    setSelectedFileSize("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Form submit handler
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      
      const hasText = !!inputText.trim();
      const hasFile = !!selectedFile;
      if (!hasText && !hasFile) return;

      // Stop typing indicator on send
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      const socket = getSocket();
      if (socket && contact?._id && isLocalTyping) {
        socket.emit("stopTyping", contact._id);
        setIsLocalTyping(false);
      }

      // Construct a mock sendingMessage for upload progress indicator display
      const tempMessage = {
        _id: "temp-" + Date.now(),
        senderId: myUser?._id,
        receiverId: contact?._id,
        message: inputText,
        fileUrl: selectedFileType === "image" ? selectedFilePreview : null, // render local image preview
        fileType: selectedFileType,
        fileName: selectedFileName,
        fileSize: selectedFileSize,
        status: "sending",
        createdAt: new Date().toISOString(),
      };

      onSendMessage(
        {
          message: inputText,
          file: selectedFile,
          fileType: selectedFileType,
          fileName: selectedFileName,
          fileSize: selectedFileSize,
        },
        tempMessage
      );

      setInputText("");
      handleClearSelectedFile();
    },
    [
      inputText,
      selectedFile,
      selectedFileType,
      selectedFileName,
      selectedFileSize,
      selectedFilePreview,
      contact?._id,
      myUser?._id,
      isLocalTyping,
      onSendMessage,
    ],
  );

  // Filter messages based on search query
  const filteredMessages = useMemo(() => {
    if (!Array.isArray(messages)) return [];
    if (!searchQuery.trim()) return messages;
    return messages.filter((m) =>
      m.message?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [messages, searchQuery]);

  // MED-2: Memoize wallpaper class — avoids array.find() on every render.
  // Previously this ran inline in JSX, firing on every keystroke.
  const wallpaperClass = useMemo(
    () =>
      wallpaperOptions.find((o) => o.id === wallpaper)?.class ??
      "bg-transparent",
    [wallpaper],
  );

  // CRIT-2: Memoize the full rendered message list.
  // Combined with MessageBubble being React.memo, this means:
  // 1. The .map() itself only runs when filteredMessages or myUser._id changes.
  // 2. Individual MessageBubble instances only re-render when their own props change
  //    (e.g. status: "delivered" → "read"), not when inputText changes.
  const renderedMessages = useMemo(
    () =>
      filteredMessages.map((messageObj) => (
        <MessageBubble
          key={messageObj._id}
          messageObj={messageObj}
          myUserId={myUser?._id}
        />
      )),
    [filteredMessages, myUser?._id],
  );

  if (!contact) {
    return (
      <div className="hidden md:flex flex-1 flex-col items-center justify-start pt-20 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl border-l md:border border-white/20 dark:border-zinc-800/30 md:rounded-2xl md:shadow-lg p-8 text-center h-full relative overflow-hidden">
        <div className="max-w-md space-y-6 relative z-10 p-8 rounded-3xl border border-white/25 dark:border-zinc-800/30 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl shadow-xl transition-all duration-300 hover:shadow-2xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-primary/80 text-white shadow-lg shadow-primary/20 mb-6 animate-bounce">
            <MessageSquareCode className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 font-extrabold">Vaanix</span>
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Select a contact from the sidebar list to start chatting.
              Experience lightning-fast, real-time message sync with visual
              status checks.
            </p>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
              Secure Real-Time Connected
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-1 flex-col h-full bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl border-l md:border border-white/20 dark:border-zinc-800/30 md:rounded-2xl md:shadow-lg overflow-hidden relative ${
        contact ? "flex" : "hidden md:flex"
      }`}
    >
      {/* Chat Header */}
      <header className="flex flex-col shrink-0 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border-b border-white/10 dark:border-zinc-850/20 sticky top-0 z-20 transition-all duration-300">
        <div className="flex h-16 items-center justify-between px-3 md:px-6">
          <div className="flex items-center gap-3 min-w-0">
            {onBack && (
              <button
                onClick={onBack}
                className="md:hidden p-1 mr-1 rounded-full hover:bg-muted text-muted-foreground transition-colors shrink-0"
                aria-label="Back to contacts"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            {/* Contact Details Avatar */}
            <div className="relative shrink-0">
              {contact.profilePic ? (
                <img
                  src={getOptimizedMediaUrl(contact.profilePic, { width: 72, height: 72, gravity: "face" })}
                  alt={contact.name}
                  className="flex h-9 w-9 object-cover items-center justify-center rounded-full shadow-sm"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-semibold shadow-sm bg-gradient-to-tr from-primary to-primary/80">
                  {contact.name
                    ? contact.name
                        .trim()
                        .split(/\s+/)
                        .map((n) => n[0])
                        .filter(Boolean)
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "U"}
                </div>
              )}
              {isOnline && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background dark:border-zinc-950 bg-green-500" />
              )}
            </div>

            <div className="flex flex-col text-left min-w-0">
              <span className="font-semibold text-sm leading-tight truncate">
                {contact.name}
              </span>
              <span className="text-[11px] text-muted-foreground leading-tight truncate">
                {isTyping ? (
                  <span className="text-primary font-semibold animate-pulse">
                    typing...
                  </span>
                ) : isOnline ? (
                  <span className="text-primary font-medium">Online</span>
                ) : (
                  getLastSeenText(contact?.lastSeen)
                )}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <IconButton
              icon={Search}
              className={`h-9 w-9 transition-colors duration-200 ${
                showSearch
                  ? "text-primary hover:text-primary/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              iconClassName="h-5 w-5"
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) setSearchQuery("");
              }}
            />
            <IconButton
              icon={PhoneCall}
              className="h-9 w-9 text-muted-foreground hover:text-foreground transition-colors duration-200"
              iconClassName="h-5 w-5"
            />
            <IconButton
              icon={Video}
              className="h-9 w-9 text-muted-foreground hover:text-foreground transition-colors duration-200"
              iconClassName="h-5 w-5"
            />
            <DropdownMenu>
              <DropdownMenuTrigger
                className="h-9 w-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 cursor-pointer"
                render={<button aria-label="More options" />}
              >
                <EllipsisVertical className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer gap-2">
                    <Palette className="h-4 w-4" />
                    <span>Theme</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent side="left" className="w-48 p-3">
                    <div className="grid grid-cols-4 gap-2">
                      {wallpaperOptions.map((option) => (
                        <button
                          key={option.id}
                          title={option.name}
                          onClick={() => {
                            setWallpaper(option.id);
                            localStorage.setItem("chat_wallpaper", option.id);
                          }}
                          className={`w-9 h-9 rounded-full cursor-pointer relative transition-all duration-200 border-2 ${
                            option.preview
                          } ${
                            wallpaper === option.id
                              ? "border-primary scale-110 shadow-md"
                              : "border-white/10 hover:border-white/30"
                          }`}
                        >
                          {wallpaper === option.id && (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                              <Check className="h-4 w-4 text-white" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* WhatsApp-style In-chat Search Bar */}
        {showSearch && (
          <div className="px-2 md:px-4 pb-3 pt-1 animate-in slide-in-from-top-2 duration-200">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="pl-9 pr-9 bg-muted/60 border-transparent focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary rounded-full h-9 transition-all duration-200"
              />
              {searchQuery && (
                <IconButton
                  icon={X}
                  className="absolute right-1 h-7 w-7 rounded-full hover:bg-muted"
                  iconClassName="h-4 w-4"
                  onClick={() => setSearchQuery("")}
                />
              )}
            </div>
          </div>
        )}
      </header>

      {/* Messages Area — MED-2: wallpaperClass is memoized (no inline find()) */}
      <ScrollArea
        ref={scrollAreaRef}
        className={`flex-1 min-h-0 transition-colors duration-300 ${wallpaperClass}`}
      >
        <div className="px-3 py-4 md:p-6 space-y-4">
          {isLoading ? (
            <div className="flex justify-center mt-12">
              <div className="h-9 w-9 animate-spin rounded-full border-3 border-primary border-t-transparent" />
            </div>
          ) : filteredMessages.length === 0 && searchQuery ? (
            <div className="text-center text-muted-foreground text-sm mt-10 bg-background/40 backdrop-blur-sm rounded-xl p-4 max-w-xs mx-auto border border-border/20">
              No messages found for &quot;{searchQuery}&quot;
            </div>
          ) : (
            <>
              {isLoadingMore && (
                <div className="flex justify-center py-2 animate-in fade-in duration-200">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}
              {renderedMessages}

              {/* Uploading Progress Bubble */}
              {sendingMessage && sendingMessage.receiverId === contact._id && (
                <div className="flex w-full justify-end animate-in fade-in duration-200">
                  <div className="flex flex-col max-w-[85%] md:max-w-[70%] space-y-1 items-end">
                    <div className="px-3.5 py-3 text-[14.5px] bg-gradient-to-br from-blue-700 to-blue-800 text-white rounded-2xl rounded-tr-sm min-w-[200px] shadow-md border border-white/5">
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className="h-4 w-4 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[12px] text-cyan-200 font-semibold tracking-wide">
                          Uploading: {messageUploadProgress}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-black/45 h-1.5 rounded-full overflow-hidden mb-2">
                        <div
                          className="bg-cyan-300 h-full transition-all duration-300"
                          style={{ width: `${messageUploadProgress}%` }}
                        />
                      </div>
                      
                      {sendingMessage.fileName && (
                        <p className="text-[11px] text-white/80 truncate max-w-[180px]">
                          {sendingMessage.fileName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Typing Animation Bubble */}
          {isTyping && !searchQuery && (
            <div className="flex w-full justify-start animate-in fade-in duration-200">
              <div className="flex flex-col items-start space-y-1">
                <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/40 dark:border-zinc-800/30 shadow-sm backdrop-blur-sm flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Floating Input Panel Container */}
      <footer className="relative sm:px-3 pb-3 pt-1 bg-transparent shrink-0">
        
        {/* Selected attachment preview panel */}
        {selectedFile && (
          <div className="mb-2 p-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/40 rounded-2xl max-w-lg mx-auto flex items-center justify-between gap-3 shadow-lg animate-in slide-in-from-bottom-2 duration-200 relative z-10">
            <div className="flex items-center gap-3 min-w-0">
              {selectedFileType === "image" ? (
                <img
                  src={selectedFilePreview}
                  alt="Selected preview"
                  className="h-12 w-12 rounded-xl object-cover border border-white/10"
                />
              ) : selectedFileType === "video" ? (
                <div className="h-12 w-12 rounded-xl bg-zinc-950 flex items-center justify-center border border-white/10">
                  <Video className="h-5 w-5 text-primary" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
              )}
              <div className="min-w-0 text-left">
                <p className="text-xs font-semibold text-foreground truncate max-w-[180px] sm:max-w-[280px]">
                  {selectedFileName}
                </p>
                <p className="text-[10px] text-muted-foreground">{selectedFileSize}</p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleClearSelectedFile}
              className="p-1 rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 md:gap-3 w-full max-w-5xl mx-auto p-1 z-10"
        >
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
          />

          <IconButton
            type="button"
            icon={Plus}
            onClick={() => fileInputRef.current?.click()}
            className="h-11 w-11 shrink-0 text-muted-foreground hover:text-foreground transition-colors duration-200"
            iconClassName="h-6 w-6"
          />

          <Input
            value={inputText}
            onChange={handleInputChange}
            placeholder={selectedFile ? "Add a caption..." : "Type a message"}
            className="flex-1 bg-zinc-200/30! dark:bg-zinc-900/70! border-zinc-300/30! dark:border-zinc-800/40 focus-visible:ring-1 focus-visible:ring-primary/50 rounded-full h-11 px-4 transition-all duration-200"
          />

          <IconButton
            type="submit"
            icon={SendHorizontal}
            disabled={!inputText.trim() && !selectedFile}
            className={`h-11 w-11 shrink-0 rounded-full transition-all duration-200 ${
              inputText.trim() || selectedFile
                ? "bg-primary text-white shadow-md cursor-pointer hover:brightness-110 active:scale-95"
                : "bg-zinc-200/20 dark:bg-zinc-800/20 text-muted-foreground/30 cursor-not-allowed"
            }`}
            iconClassName="h-5.5 w-5.5 ml-0.5"
          />
        </form>
      </footer>
    </div>
  );
};

export default memo(MessageContainer);
