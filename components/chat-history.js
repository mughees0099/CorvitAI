"use client";

import { MessageSquare, Trash2 } from "lucide-react";

export default function ChatHistory({
  chats,
  activeChatId,
  onSelectChat,
  onDeleteChat,
}) {
  // Format the chat title based on the first message or use default
  const getChatTitle = (chat) => {
    if (chat.messages && chat.messages.length > 0) {
      const firstUserMessage = chat.messages.find((msg) => msg.role === "user");
      if (firstUserMessage) {
        // Truncate long messages
        const content = firstUserMessage.content;
        return content.length > 25 ? content.substring(0, 25) + "..." : content;
      }
    }
    return chat.title || "New Chat";
  };

  // Format the date to a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="py-2">
      {chats.length === 0 ? (
        <div className="text-center text-white py-4">No chat history</div>
      ) : (
        chats.map((chat) => (
          <div
            key={chat.id}
            className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-red-600 ${
              activeChatId === chat.id ? "bg-red-700" : ""
            }`}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className="flex items-center flex-grow overflow-hidden">
              <MessageSquare size={16} className="mr-2 flex-shrink-0" />
              <div className="truncate">{getChatTitle(chat)}</div>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-white mr-2">
                {formatDate(chat.lastUpdated)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="text-white hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
