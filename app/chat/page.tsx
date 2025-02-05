import React, { useState, useEffect, useRef } from 'react';

// Define message type
interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

const ChatComponent = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userMessage, setUserMessage] = useState<string>('');
  const [historyMessages, setHistoryMessages] = useState<any[]>([]); // To store history fetched from API
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom when new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get user email from local storage
  useEffect(() => {
    const storedEmail = localStorage.getItem('user_email');
    if (storedEmail) {
      setUserEmail(JSON.parse(storedEmail));
    }
  }, []);

  // Handle sending message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMessage.trim() || !userEmail) return;

    // Add user message to state
    const newMessage: Message = {
      id: messages.length + 1,
      text: userMessage,
      isBot: false,
    };
    setMessages((prev) => [...prev, newMessage]);
    setUserMessage('');
    setIsTyping(true);

    try {
      // Send user message to the backend API
      const response = await fetch('http://127.0.0.1:8000/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, message: userMessage }),
      });

      if (!response.ok) throw new Error(`Error fetching bot response: ${response.statusText}`);

      const data = await response.json();
      const botResponse: Message = {
        id: messages.length + 2,
        text: data.chatResponse || 'Bot is not responding.',
        isBot: true,
      };

      setMessages((prev) => [...prev, botResponse]);

      // Fetch chat history after message is sent
      const historyResponse = await fetch('http://127.0.0.1:8000/chat/history/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      if (!historyResponse.ok) throw new Error(`Error fetching history: ${historyResponse.statusText}`);

      const historyData = await historyResponse.json();
      const historyMessages = historyData.map((msg: any, index: number) => ({
        id: index + 1,
        userMessage: msg.user, // Assuming 'user' field has the user's message
        botMessage: msg.bot,   // Assuming 'bot' field has the bot's message
      }));

      setHistoryMessages(historyMessages);

    } catch (error) {
      console.error('Error:', error);
    }

    setIsTyping(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar for history */}
      <div
        className={`w-80 bg-gray-800 p-6 flex flex-col h-screen border-r border-gray-700 fixed transition-transform duration-300 ${
          isSidebarVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button onClick={() => setIsSidebarVisible(!isSidebarVisible)}>Toggle Sidebar</button>
        <h2 className="text-xl font-bold mb-4">Chat History</h2>
        <div className="flex-1 overflow-auto">
          {historyMessages.length === 0 ? (
            <div>No history available</div>
          ) : (
            historyMessages.map((msg) => (
              <div key={msg.id} className="bg-gray-700 p-3 rounded-lg mb-2">
                <div><strong>User:</strong> {msg.userMessage}</div>
                <div><strong>Bot:</strong> {msg.botMessage}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4 mb-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg ${msg.isBot ? 'bg-red-600' : 'bg-green-600'}`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        {isTyping && <div className="text-gray-500">Bot is typing...</div>}
        <form onSubmit={handleSendMessage} className="flex mt-4">
          <input
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 rounded bg-gray-800 text-white border border-gray-600"
          />
          <button
            type="submit"
            className="ml-3 bg-blue-500 p-2 rounded text-white"
            disabled={isTyping}
          >
            Send
          </button>
        </form>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatComponent;
