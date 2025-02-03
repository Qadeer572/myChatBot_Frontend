"use client";

import { Send, Bot, User, Loader2, Menu } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      isBot: true,
    },
  ]);
  const [user_email, setUserEmail] = useState<string | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem("user_email");
    if (storedEmail) {
      setUserEmail(JSON.parse(storedEmail));
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !user_email) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      isBot: false,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/chat/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: user_email, message: inputMessage }),
        });

        if (!response.ok) {
          throw new Error(`Error fetching bot response: ${response.statusText}`);
        }

        const data = await response.json();
        const botResponse: Message = {
          id: messages.length + 2,
          text: data.chatResponse || "I couldn't process your request.",
          isBot: true,
        };
        setMessages((prev) => [...prev, botResponse]);
      } catch (error) {
        console.error("Error:", error);
      }
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -200 }}
        animate={{ x: isSidebarVisible ? 0 : -200 }}
        transition={{ duration: 0.3 }}
        className={`w-64 bg-gray-800 p-4 flex flex-col ${isSidebarVisible ? "block" : "hidden"}`}
      >
        <h2 className="text-xl font-bold mb-4">Chat History</h2>
        <ScrollArea className="flex-1 overflow-y-auto">
          {/* Chat history messages */}
        </ScrollArea>
      </motion.div>

      {/* Main Chat Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarVisible ? "ml-64" : "ml-0 mx-auto max-w-2xl"}`}
      >
        <div className="p-4 bg-gray-700 flex items-center justify-between">
          <button onClick={() => setIsSidebarVisible(!isSidebarVisible)}>
            <Menu className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-2xl font-bold">AI Assistant</h1>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className="p-3 rounded-lg max-w-xs text-sm shadow-md bg-gray-700">
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="flex items-center space-x-2"
              >
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                <span className="text-sm text-gray-400">AI is typing...</span>
              </motion.div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-800 flex items-center justify-center">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 text-white max-w-2xl"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="ml-2 p-2 bg-blue-600 text-white rounded"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
