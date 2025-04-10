"use client";

import { useState, useEffect } from "react";
import { Send, Plus, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import LoginForm from "@/components/login-form";
import ChatHistory from "@/components/chat-history";
import ChatMessages from "@/components/chat-messages";

export default function ChatApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set default sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message to the chat
    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Send the message to the API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      // Add the assistant's response to the chat
      setMessages([...newMessages, data]);

      // Update the chat in the chats array
      if (activeChatId) {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === activeChatId
              ? {
                  ...chat,
                  messages: [...newMessages, data],
                  lastUpdated: new Date().toISOString(),
                }
              : chat
          )
        );
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Oppsss something went wrong🥲");
      // Add error message to chat
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Oppsss something went wrong🥲" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load chats from localStorage on component mount
  useEffect(() => {
    if (isLoggedIn) {
      const savedChats = localStorage.getItem(`chats_${user.email}`);
      if (savedChats) {
        setChats(JSON.parse(savedChats));
      } else {
        // Create a default chat if none exists
        createNewChat();
      }
    }
  }, [isLoggedIn, user]);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (isLoggedIn && chats.length > 0) {
      localStorage.setItem(`chats_${user.email}`, JSON.stringify(chats));
    }
  }, [chats, isLoggedIn, user]);

  // Update chat messages when active chat changes
  useEffect(() => {
    if (activeChatId) {
      const activeChat = chats.find((chat) => chat.id === activeChatId);
      if (activeChat) {
        setMessages(activeChat.messages || []);
      }
    }
  }, [activeChatId, setMessages]);

  // Update chat messages in the chats array
  useEffect(() => {
    if (activeChatId && messages.length > 0) {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages, lastUpdated: new Date().toISOString() }
            : chat
        )
      );
    }
  }, [messages, activeChatId]);

  // Save sidebar state to localStorage
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem(`sidebar_state_${user?.email}`, isSidebarOpen);
    }
  }, [isSidebarOpen, isLoggedIn, user]);

  // Load sidebar state from localStorage
  useEffect(() => {
    if (isLoggedIn && user) {
      const savedState = localStorage.getItem(`sidebar_state_${user.email}`);
      if (savedState !== null) {
        setIsSidebarOpen(savedState === "true");
      }
    }
  }, [isLoggedIn, user]);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setMessages([]);
    setActiveChatId(null);
  };

  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    setChats((prevChats) => [newChat, ...prevChats]);
    setActiveChatId(newChat.id);
    setMessages([]);

    // Close sidebar on mobile after creating a new chat
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const deleteChat = (chatId) => {
    setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));

    if (activeChatId === chatId) {
      const remainingChats = chats.filter((chat) => chat.id !== chatId);
      if (remainingChats.length > 0) {
        setActiveChatId(remainingChats[0].id);
        setMessages(remainingChats[0].messages || []);
      } else {
        createNewChat();
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-100 ">
      {/* Sidebar with toggle button */}
      <div className="relative">
        {/* Sidebar */}
        <div
          className={`${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed z-10 w-64 md:w-56 lg:w-64 h-full bg-red-700 text-white transition-transform duration-300 ease-in-out`}
        >
          <div className="flex flex-col h-full">
            <div className="p-3 md:p-4 border-b border-gray-700">
              <button
                onClick={createNewChat}
                className="flex items-center justify-center w-full p-2 bg-red-700 rounded-md hover:bg-red-400"
              >
                <Plus size={16} className="mr-2" />
                New Chat
              </button>
            </div>
            <div className="flex-grow overflow-y-auto">
              <ChatHistory
                chats={chats}
                activeChatId={activeChatId}
                onSelectChat={(id) => {
                  setActiveChatId(id);
                  // Close sidebar on mobile after selecting a chat
                  if (window.innerWidth < 768) {
                    setIsSidebarOpen(false);
                  }
                }}
                onDeleteChat={deleteChat}
              />
            </div>
            <div className="p-3 md:p-4 border-t border-gray-700 text-white">
              <div className="flex items-center">
                <div className="flex-grow">
                  <div className="font-medium text-sm md:text-base">
                    {user.name}
                  </div>
                  <div className="text-xs md:text-sm">{user.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-white hover:text-white"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={toggleSidebar}
          className={`absolute top-4 md:top-1/2 md:-translate-y-1/2 z-20 bg-red-700 text-white p-2 rounded-r-xl transition-transform duration-300 ease-in-out ${
            isSidebarOpen
              ? "left-64 md:left-56 lg:left-64 -translate-x-0"
              : "left-0 translate-x-0"
          }`}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? (
            <ChevronLeft size={20} />
          ) : (
            <ChevronRight size={20} />
          )}
        </button>
      </div>

      {/* Main content */}
      <div
        className={`flex-grow flex flex-col h-full transition-all duration-300 ${
          isSidebarOpen ? "ml-0 md:ml-56 lg:ml-64" : "ml-0"
        } w-full`}
      >
        {/* Chat messages */}
        <div className="flex-grow ">
          <ChatMessages messages={messages} isLoading={isLoading} />
        </div>

        {/* Input area */}
        <div className="p-2 sm:p-3 md:p-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleSubmit} className="flex items-center">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-grow p-2 sm:p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm md:text-base"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`p-[13px] sm:p-[17.1px] text-white rounded-r-xl ${
                isLoading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-red-800 hover:bg-red-700"
              }`}
            >
              <Send size={16} className="sm:size-18" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
