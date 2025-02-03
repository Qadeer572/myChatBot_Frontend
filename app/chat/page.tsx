"use client";

import { Send, Bot, User, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import Head from "next/head";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      isBot: true,
    },
  ]);
  const [user_email, setUserEmail] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([
    { id: "1", title: "Previous Chat 1", timestamp: new Date() },
    { id: "2", title: "Previous Chat 2", timestamp: new Date() },
  ]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  useEffect(() => {
    const user_Email = localStorage.getItem("user_email");
    if (user_Email) setUserEmail(JSON.parse(user_Email));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      isBot: false,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user_email, message: inputMessage }),
      });

      const data = await response.json();

      const botResponse: Message = {
        id: messages.length + 2,
        text: data.chatResponse || "I couldn't process your request.",
        isBot: true,
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error fetching bot response:", error);
    }

    try {
      const historyResponse = await fetch("http://127.0.0.1:8000/chat/history/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user_email }),
      });

      const data = await historyResponse.json();
      const history = data.history;

      const historyMessages = history.map((msg: string, index: number) => ({
        id: index + 1,
        text: msg,
        isBot: false,
      }));

      setMessages((prev) => [...historyMessages, ...prev]); // Display history first
    } catch (error) {
      console.error("Error fetching history:", error);
    }

    setIsTyping(false);
  };

  return (
    <div>
      <Head>
        <title>AI Assistant - ChatLink</title>
      </Head>
      <div className="flex min-h-screen bg-gray-900 text-white p-4 md:p-6 relative">
        <div className="flex flex-col w-full max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700 relative pb-20">
          {/* Chat Header */}
          <div className="p-6 bg-gray-700 text-gray-100">
            <div className="flex items-center space-x-3">
              <Bot className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold">AI Assistant</h1>
                <p className="text-sm opacity-80">Online | Ready to help</p>
              </div>
            </div>
          </div>

          {/* Sidebar for message history */}
          <div className="absolute top-0 left-0 bottom-0 w-1/4 bg-gray-700 p-4 overflow-y-auto">
            <h2 className="text-xl font-bold text-white">Message History</h2>
            <div className="space-y-4 mt-4">
              {chatHistory.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`w-full text-left p-3 rounded-lg mb-2 hover:bg-accent transition-colors ${
                    activeChatId === chat.id ? 'bg-accent' : ''
                  }`}
                >
                  <p className="font-medium truncate">{chat.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {chat.timestamp.toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-800" style={{ minHeight: "500px" }}>
            <div className="space-y-6">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[70%] rounded-lg p-3 ${message.isBot ? 'bg-gray-700' : 'bg-primary'} text-white`}>
                      <ReactMarkdown>{message.text}</ReactMarkdown>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-700 text-white">
                    <p className="text-sm">AI is typing...</p>
                  </div>
                </motion.div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input (Fixed at Bottom) */}
          <form onSubmit={handleSendMessage} className="fixed bottom-0 left-0 w-full p-4 bg-gray-800 border-t border-gray-700">
            <div className="flex justify-center">
              <Input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full max-w-4xl p-4 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-700 text-white"
              />
              <Button
                type="submit"
                className="px-6 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all duration-200 flex items-center justify-center space-x-2 hover:shadow-lg active:scale-95"
                disabled={!inputMessage.trim()}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
