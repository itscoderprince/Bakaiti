import { useState, useEffect, useRef, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Search,
  Phone,
  Video,
  Paperclip,
  Send,
  Smile,
  MoreVertical,
  X,
} from "lucide-react";

const MessageContainer = ({ contact, messages, onSendMessage }) => {
  const [inputText, setInputText] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when messages or contact changes
  const scrollToBottom = () => {
    if (!showSearch) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, contact?.typing]);

  // Reset search state when switching contacts
  useEffect(() => {
    setShowSearch(false);
    setSearchQuery("");
  }, [contact?.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText("");
  };

  // Filter messages based on search query
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    return messages.filter((m) =>
      m.text.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [messages, searchQuery]);

  if (!contact) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-muted/10 p-8 text-center h-full">
        <div className="max-w-md space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <Send className="h-8 w-8 rotate-45" />
          </div>
          <h3 className="text-xl font-semibold">No Conversation Selected</h3>
          <p className="text-sm text-muted-foreground">
            Select a contact from the sidebar list to start chatting and viewing
            your message history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col h-full bg-background overflow-hidden relative">
      {/* Chat Header (No bottom border as requested) */}
      <header className="flex flex-col shrink-0 bg-background z-10">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <SidebarTrigger className="md:hidden -ml-1 mr-1 text-muted-foreground" />

            {/* Contact Details */}
            <div className="relative shrink-0">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-semibold shadow-sm ${contact.avatarBg}`}
              >
                {contact.avatarText}
              </div>
              {contact.status === "online" && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
              )}
            </div>

            <div className="flex flex-col text-left min-w-0">
              <span className="font-semibold text-sm leading-tight truncate">
                {contact.name}
              </span>
              <span className="text-[11px] text-muted-foreground leading-tight truncate">
                {contact.typing ? (
                  <span className="text-emerald-500 font-medium">
                    typing...
                  </span>
                ) : (
                  contact.lastSeen
                )}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <IconButton
              icon={Search}
              className={`h-9 w-9 ${showSearch ? "text-primary bg-primary/10" : ""}`}
              iconClassName="h-4.5 w-4.5"
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) setSearchQuery("");
              }}
            />
            <IconButton
              icon={Phone}
              className="h-9 w-9"
              iconClassName="h-4.5 w-4.5"
            />
            <IconButton
              icon={Video}
              className="h-9 w-9"
              iconClassName="h-4.5 w-4.5"
            />
            <IconButton
              icon={MoreVertical}
              className="h-9 w-9 hidden sm:inline-flex"
              iconClassName="h-4.5 w-4.5"
            />
          </div>
        </div>

        {/* WhatsApp-style In-chat Search Bar */}
        {showSearch && (
          <div className="px-4 pb-3 pt-1 animate-in slide-in-from-top-2">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="pl-9 pr-9 bg-muted/50 border-transparent focus-visible:ring-1 rounded-full h-9"
              />
              {searchQuery && (
                <IconButton
                  icon={X}
                  className="absolute right-1 h-7 w-7 rounded-full"
                  iconClassName="h-4 w-4"
                  onClick={() => setSearchQuery("")}
                />
              )}
            </div>
          </div>
        )}
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#efeae2] dark:bg-[#0b141a] scrollbar-thin">
        {filteredMessages.length === 0 && searchQuery ? (
          <div className="text-center text-muted-foreground text-sm mt-10">
            No messages found for "{searchQuery}"
          </div>
        ) : (
          filteredMessages.map((message) => {
            const isMe = message.sender === "me";
            return (
              <div
                key={message.id}
                className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex flex-col max-w-[70%] space-y-1 ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`rounded-xl px-3 py-2 text-[15px] shadow-sm relative ${
                      isMe
                        ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-tr-none"
                        : "bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap wrap-break-words leading-snug">
                      {message.text}
                    </p>
                    <div className="flex justify-end mt-1">
                      <span className="text-[10px] text-muted-foreground/80 opacity-70">
                        {message.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing Animation Bubble */}
        {contact.typing && !searchQuery && (
          <div className="flex w-full justify-start animate-fade-in">
            <div className="flex flex-col items-start space-y-1">
              <div className="rounded-xl rounded-tl-none px-4 py-3 bg-white dark:bg-[#202c33] shadow-sm flex items-center gap-1">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <footer className="p-3 bg-[#f0f2f5] dark:bg-[#202c33] shrink-0">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 max-w-5xl mx-auto"
        >
          <IconButton
            type="button"
            icon={Smile}
            className="h-10 w-10 shrink-0 rounded-full"
            iconClassName="h-6 w-6"
          />

          <IconButton
            type="button"
            icon={Paperclip}
            className="h-10 w-10 shrink-0 rounded-full"
            iconClassName="h-5 w-5"
          />

          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message"
            className="flex-1 bg-white dark:bg-[#2a3942] border-transparent rounded-full h-10 px-4 focus-visible:ring-1 focus-visible:ring-emerald-500 shadow-sm"
          />

          <IconButton
            type="submit"
            icon={Send}
            variant="default"
            disabled={!inputText.trim()}
            className="h-10 w-10 shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-sm rounded-full"
            iconClassName="h-4.5 w-4.5 ml-0.5"
          />
        </form>
      </footer>
    </div>
  );
};

export default MessageContainer;
