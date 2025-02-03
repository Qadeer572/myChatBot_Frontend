"use client";

import { Send, Bot, User, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import Head from "next/head";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

interface ChatSession {
  id: string;
  timestamp: Date;
  preview: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      isBot: true,
    },
  ]);
  const [user_email, setuserEmail] = useState<any[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);

  useEffect(() => {
    const user_Email = localStorage.getItem("user_email");
    if (user_Email) setuserEmail(JSON.parse(user_Email));
  }, []);

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update chat sessions when messages change
  useEffect(() => {
    const botMessages = messages.filter(m => m.isBot);
    if (botMessages.length > 0) {
      const newSessions = botMessages.map(msg => ({
        id: msg.id.toString(),
        timestamp: new Date(),
        preview: msg.text.substring(0, 50) + (msg.text.length > 50 ? "..." : "")
      }));
      setChatSessions(newSessions);
    }
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
      const response = await fetch("http://127.0.0.1:8000/chat/history/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user_email }),
      });

      const data = await response.json();
      const history = data.history;

      const historyMessages = history.map((msg: string, index: number) => ({
        id: index + 1,
        text: msg,
        isBot: false,
      }));

      setMessages((prev) => [...historyMessages, ...prev]);
    } catch (error) {
      console.error("Error fetching History:", error);
    }

    setIsTyping(false);
  };

  return (
    <div>
      <Head>
        <title>AI Assistant - ChatLink</title>
      </Head>
      <div className="flex min-h-screen bg-gray-900 text-white">
        {/* Enhanced Sidebar */}
        <div className="w-80 bg-gray-800 p-6 flex flex-col h-screen border-r border-gray-700">
          <div className="flex items-center space-x-3 mb-6">
            <Bot className="w-8 h-8 text-primary" />
            <h2 className="text-xl font-bold">Chat History</h2>
          </div>
          
          <ScrollArea className="flex-1 -mx-2">
            <div className="space-y-2 pr-4">
              {chatSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setActiveSession(session.id)}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-200 hover:bg-gray-700 ${
                    activeSession === session.id ? 'bg-gray-700 ring-2 ring-primary' : ''
                  }`}
                >
                  <p className="font-medium text-sm text-gray-300">
                    {new Date(session.timestamp).toLocaleString()}
                  </p>
                  <p className="text-sm mt-1 line-clamp-2">{session.preview}</p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 bg-gray-700 text-gray-100">
            <div className="flex items-center space-x-3">
              <Bot className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold">AI Assistant</h1>
                <p className="text-sm opacity-80">Online | Ready to help</p>
              </div>
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
                    <div className="flex items-start space-x-2 max-w-[80%]">
                      {message.isBot && (
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div
                        className={`p-4 rounded-2xl ${
                          message.isBot
                            ? 'bg-gray-700 text-white'
                            : 'bg-primary text-primary-foreground'
                        } shadow-sm`}
                      >
                        <ReactMarkdown className="text-sm leading-relaxed">{message.text}</ReactMarkdown>
                      </div>
                      {!message.isBot && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-primary-foreground" />
                        </div>
                      )}
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

          {/* Message Input */}
          <div className="p-4 bg-gray-800 border-t border-gray-700">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-4 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-700 text-white"
              />
              <button
                type="submit"
                className="px-6 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all duration-200 flex items-center justify-center space-x-2 hover:shadow-lg active:scale-95"
                disabled={!inputMessage.trim()}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}