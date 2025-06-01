'use client'
import { Send, Bot, User, Loader2, Menu, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
 
//import { useToast } from "@/components/ui/use-toast";

interface Message{
  id: number;
  text: string;
  isBot: boolean;
}

interface HistoryMessage {
  user: string;
  bot: string;
}

export default function Index() {
 // const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      isBot: true,
    },
  ]);
  const [user_email, setUserEmail] = useState<string | null>(null);
  const [historyMessages, setHistoryMessages] = useState<HistoryMessage[]>([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  

  useEffect(() => {
    const storedEmail = localStorage.getItem("user_email");
    if (storedEmail) {
      setUserEmail(JSON.parse(storedEmail));
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleClearHistory = async () => {
    try {
      if (!user_email) return;
      
      const response = await fetch("https://mychatlinks-a65578949377.herokuapp.com/chat/clear-history/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user_email }),
      });

      if (!response.ok) {
        throw new Error('Failed to clear history');
      }

      setHistoryMessages([]);
       
    } catch (error) {
      console.error("Error clearing history:", error);
       
    }
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

    try {
      const response = await fetch("https://mychatlinks-a65578949377.herokuapp.com/chat/", {
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

      const historyResponse = await fetch("https://mychatlinks-a65578949377.herokuapp.com/chat/history/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user_email }),
      });

      if (!historyResponse.ok) {
        throw new Error(`Error fetching history: ${historyResponse.statusText}`);
      }

      const historyData = await historyResponse.json();
      setHistoryMessages(historyData.history);
    } catch (error) {
      console.error("Error:", error);
    }

    setIsTyping(false);
  };
  const deleteHistory = async () => {
    try {
      const deleteResponse = await fetch('https://mychatlinks-a65578949377.herokuapp.com/chat/delete_history/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user_email }),
      });

      if (!deleteResponse.ok) {
        throw new Error(`Error deleting history: ${deleteResponse.statusText}`);
      }

      setHistoryMessages([]);
      alert('Chat history deleted successfully');
    } catch (error) {
      console.error('Error:', error);
    }
  };
   
  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div
        className={`w-full md:w-72 lg:w-80 bg-gray-800 flex flex-col h-screen border-r border-gray-700 fixed transition-transform duration-300 z-30 ${
          isSidebarVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center space-x-3 p-4 md:p-6 mt-[60px] md:mt-[72px] border-b border-gray-700">
          <button onClick={() => setIsSidebarVisible(!isSidebarVisible)}>
            <Menu className="w-5 h-5 md:w-6 md:h-6 text-gray-400 hover:text-white transition-colors" />
          </button>
          <Bot className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          <h2 className="text-lg md:text-xl font-semibold">Chat History</h2>
        </div>

        {/* Sidebar Content */}
        <ScrollArea className="flex-1 px-3 md:px-4 py-4">
          <div className="space-y-2 md:space-y-3" id="historyList">
            {historyMessages.length > 0 ? (
              historyMessages.map((item, index) => (
                <div
                  key={index}
                  className="p-2 md:p-3 bg-gray-700/50 rounded-lg shadow-sm border border-gray-600/50 hover:border-gray-500/50 transition-colors"
                >
                  <p className="text-blue-400 font-medium text-xs md:text-sm">You: {item.user}</p>
                  <p className="text-green-400 text-xs md:text-sm mt-1">ChatLink: {item.bot}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center text-sm">No history available.</p>
            )}
          </div>
        </ScrollArea>

        {/* Clear History Button */}
        <div className="p-3 md:p-4 border-t border-gray-700">
          <Button
            variant="destructive"
            className="w-full text-sm md:text-base"
            onClick={deleteHistory}
            disabled={historyMessages.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear History
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarVisible ? "md:ml-72 lg:ml-80" : "ml-0"
        }`}
      >
        {/* Header */}
        <div className="h-[60px] md:h-[72px] p-3 md:p-4 bg-gray-800 border-b border-gray-700 fixed top-0 right-0 left-0 z-20 flex items-center">
          <div className="flex items-center space-x-2 md:space-x-3">
            <button
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="p-1.5 md:p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 md:w-6 md:h-6 text-gray-400 hover:text-white" />
            </button>
            <Bot className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            <div>
              <h1 className="text-lg md:text-xl font-bold">AI Assistant</h1>
              <p className="text-xs md:text-sm text-gray-400">Online | Ready to help</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-3 md:p-6 overflow-y-auto mt-[60px] md:mt-[72px] mb-[70px] md:mb-[80px]">
          <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
                >
                  <div className="flex items-start space-x-2 max-w-[85%] md:max-w-[80%]">
                    {message.isBot && (
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      </div>
                    )}
                    <div
                      className={`p-3 md:p-4 rounded-2xl ${
                        message.isBot
                          ? "bg-gray-700 text-white"
                          : "bg-primary text-primary-foreground"
                      } shadow-sm`}
                    >
                      <ReactMarkdown className="text-xs md:text-sm leading-relaxed prose prose-invert">
                        {message.text}
                      </ReactMarkdown>
                    </div>
                    {!message.isBot && (
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
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
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-primary animate-spin" />
                </div>
                <div className="p-3 md:p-4 rounded-2xl bg-gray-700 text-white">
                  <p className="text-xs md:text-sm">AI is typing...</p>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div
          className={`h-[70px] md:h-[80px] p-3 md:p-4 bg-gray-800 border-t border-gray-700 fixed bottom-0 right-0 left-0 z-20 ${
            isSidebarVisible ? "md:ml-72 lg:ml-80" : "ml-0"
          }`}
        >
          <form onSubmit={handleSendMessage} className="flex space-x-2 md:space-x-4 max-w-4xl mx-auto">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 p-2 md:p-3 text-sm md:text-base rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              placeholder="Type your message..."
            />
            <Button
              type="submit"
              size="icon"
              disabled={isTyping || !inputMessage.trim()}
              className="h-10 w-10 md:h-12 md:w-12"
            >
              <Send className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}