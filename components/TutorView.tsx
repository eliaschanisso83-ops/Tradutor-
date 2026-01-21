import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { chatWithTutor } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { RefreshCcw, Send } from 'lucide-react';

const TutorView: React.FC = () => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize or update the first message when language changes
  useEffect(() => {
    // If empty or language changed radically, reset (simplification)
    // Actually, preserving history but just starting fresh on lang change is better for UX
    // But for now, let's just make sure the Intro is correct if it's the first render
    if (messages.length === 0) {
      resetChat();
    }
  }, [language]);

  const resetChat = () => {
    setMessages([{
        id: '1',
        role: 'model',
        text: t('tutor.intro'),
        timestamp: new Date()
    }]);
  };

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

    // Pass the current interface language (pt or en) to the service
    const responseText = await chatWithTutor(
      history, 
      userMsg.text, 
      "African Languages (Mozambique/Zimbabwe context)", 
      language
    );

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const suggestions: string[] = t('tutor.suggested');

  return (
    <div className="flex flex-col h-full bg-gray-50 max-w-3xl mx-auto w-full shadow-lg relative">
      <div className="bg-white p-4 border-b flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-afri-secondary to-green-500 flex items-center justify-center text-white text-2xl shadow-md">
              🧙🏾‍♂️
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-lg">{t('tutor.title')}</h2>
            <p className="text-xs text-gray-500">{t('tutor.subtitle')}</p>
          </div>
        </div>
        <button 
          onClick={resetChat} 
          className="p-2 text-gray-400 hover:text-afri-primary bg-gray-50 hover:bg-orange-50 rounded-full transition-colors"
          title="Reiniciar conversa"
        >
          <RefreshCcw size={18} />
        </button>
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
              <p className="whitespace-pre-wrap leading-relaxed">
                {msg.text}
              </p>
              {msg.text.includes("Erro") && (
                 <button onClick={() => handleSend(messages[messages.length-2].text)} className="mt-2 text-xs underline text-red-500 font-bold block">
                   Tentar novamente
                 </button>
              )}
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
      {!isTyping && messages.length < 3 && (
        <div className="px-4 py-2 bg-[#f0f2f5] flex gap-2 overflow-x-auto no-scrollbar">
          {suggestions.map(topic => (
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

      {/* Added pb-28 for mobile bottom navigation clearance */}
      <div className="p-4 bg-white border-t pb-28 md:pb-4 transition-all">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('tutor.type_placeholder')}
            className="flex-1 bg-gray-100 border-transparent focus:bg-white border focus:border-afri-primary rounded-full px-5 py-3 focus:ring-0 outline-none transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 bg-afri-primary text-white rounded-full flex items-center justify-center hover:bg-afri-accent disabled:opacity-50 shadow-md hover:scale-105 transition-all"
          >
            <Send size={20} className={isTyping ? "opacity-0" : "ml-1"} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorView;