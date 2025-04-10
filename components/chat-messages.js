"use client";

import { useRef, useEffect } from "react";
import { User, Bot } from "lucide-react";

export default function ChatMessages({ messages, isLoading }) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // If there are no messages, show a welcome message
  if (messages.length === 0) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">
            Welcome to Corvit AI
          </h2>
          <p className="text-gray-600">
            Start a conversation by typing a message below. Ask me anything
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex mb-4 ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`flex max-w-[80%] ${
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0 ${
                message.role === "user"
                  ? "bg-gray-800 ml-2"
                  : "bg-green-600 mr-2"
              }`}
            >
              {message.role === "user" ? (
                <User size={16} className="text-white" />
              ) : (
                <Bot size={16} className="text-white" />
              )}
            </div>

            <div
              className={`p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-red-800 text-white rounded-xl"
                  : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
              }`}
            >
              {message.content}
            </div>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex mb-4 justify-start">
          <div className="flex max-w-[80%] flex-row">
            <div className="flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0 bg-green-600 mr-2">
              <Bot size={16} className="text-white" />
            </div>
            <div className="p-3 rounded-lg bg-white text-gray-800 border border-gray-200 rounded-tl-none">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
