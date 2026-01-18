import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { chatWithTutor } from '../services/geminiService';

const SUGGESTED_TOPICS = [
  "👋 Greetings",
  "🍎 Market",
  "🚌 Travel",
  "👪 Family",
  "😂 Slang"
];

const TutorView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: 'Mwauka bwanji! (Good morning!) I am your AfriLingo tutor. Which language would you like to practice today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await chatWithTutor(history, userMsg.text, "African Languages");

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 max-w-3xl mx-auto w-full shadow-lg relative">
      <div className="bg-white p-4 border-b flex items-center gap-4 z-10 shadow-sm">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-afri-secondary to-green-500 flex items-center justify-center text-white text-2xl shadow-md">
            🧙🏾‍♂️
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
        </div>
        <div>
          <h2 className="font-bold text-gray-800 text-lg">AfriLingo Tutor</h2>
          <p className="text-xs text-gray-500">Always here to help you learn.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#f0f2f5]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl shadow-sm relative ${
                msg.role === 'user'
                  ? 'bg-afri-primary text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              <p className={`text-[10px] mt-2 text-right ${msg.role === 'user' ? 'text-orange-100' : 'text-gray-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex gap-2 items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Topics (only show if not typing) */}
      {!isTyping && (
        <div className="px-4 py-2 bg-[#f0f2f5] flex gap-2 overflow-x-auto no-scrollbar">
          {SUGGESTED_TOPICS.map(topic => (
            <button
              key={topic}
              onClick={() => handleSend(topic)}
              className="whitespace-nowrap bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs font-bold text-gray-600 hover:bg-afri-primary hover:text-white transition-colors shadow-sm"
            >
              {topic}
            </button>
          ))}
        </div>
      )}

      <div className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 border-transparent focus:bg-white border focus:border-afri-primary rounded-full px-5 py-3 focus:ring-0 outline-none transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 bg-afri-primary text-white rounded-full flex items-center justify-center hover:bg-afri-accent disabled:opacity-50 shadow-md hover:scale-105 transition-all"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorView;