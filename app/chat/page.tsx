import { Send, Bot, User, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import Head from "next/head";

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
  const [user_email, setuserEmail] = useState<any[]>([]);

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

          {/* Bot History (Outside the Chatbox) */}
          <div className="flex flex-col space-y-6 px-6 py-4 bg-gray-700 border-b border-gray-600">
            <h2 className="text-lg font-bold text-white">Chat History</h2>
            <div className="space-y-2">
              {messages.filter((message) => message.isBot).map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start space-x-2 max-w-[80%]"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-700 text-white shadow-sm">
                    <ReactMarkdown className="text-sm leading-relaxed">{message.text}</ReactMarkdown>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chat Messages (Inside the Chatbox) */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-800" style={{ minHeight: "500px" }}>
            <div className="space-y-6">
              {/* New Messages (User Messages on Right) */}
              <AnimatePresence>
                {messages.filter((message) => !message.isBot).map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-end"
                  >
                    <div className="flex items-start space-x-2 max-w-[80%]">
                      <div
                        className={`p-4 rounded-2xl ${
                          message.isBot
                            ? "bg-gray-700 text-white"
                            : "bg-primary text-primary-foreground"
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

          {/* Message Input (Fixed at Bottom) */}
          <form onSubmit={handleSendMessage} className="fixed bottom-0 left-0 w-full p-4 bg-gray-800 border-t border-gray-700">
            <div className="flex justify-center">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full max-w-4xl p-4 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-700 text-white"
              />
              <button
                type="submit"
                className="px-6 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all duration-200 flex items-center justify-center space-x-2 hover:shadow-lg active:scale-95"
                disabled={!inputMessage.trim()}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
