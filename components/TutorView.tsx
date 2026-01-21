import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, RoleplayScenario } from '../types';
import { chatWithTutor } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { RefreshCcw, Send, Store, Bus, Users, ArrowLeft, MessageCircle } from 'lucide-react';

const TutorView: React.FC = () => {
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<'menu' | 'chat'>('menu');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeScenario, setActiveScenario] = useState<RoleplayScenario | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Define Scenarios (Localized)
  const scenarios: RoleplayScenario[] = language === 'pt' ? [
    {
      id: 'market',
      title: 'No Mercado',
      emoji: '🛒',
      description: 'Negocie preços de frutas e vegetais com um vendedor no Mercado do Zimpeto.',
      aiPersona: 'You are a friendly but tough market vendor at Zimpeto Market in Maputo. You sell fresh vegetables. You speak mostly in Changana (or the user target language) but explain in Portuguese if the user is confused. Try to bargain with the user.',
      difficulty: 'Easy'
    },
    {
      id: 'transport',
      title: 'Pegando Chapa',
      emoji: '🚐',
      description: 'Pergunte o destino, o preço e peça para parar.',
      aiPersona: 'You are a busy "Cobrador" (conductor) of a Chapa (minibus) in Mozambique. You speak fast and use local slang. You need to know where the passenger (user) is going and collect the money.',
      difficulty: 'Medium'
    },
    {
      id: 'family',
      title: 'Jantar em Família',
      emoji: '🥘',
      description: 'Converse sobre a comida e apresente-se aos anciãos.',
      aiPersona: 'You are an elder family member hosting a dinner. You are polite, traditional, and asking the user about their life, job, and family in a respectful way.',
      difficulty: 'Hard'
    }
  ] : [
    {
      id: 'market',
      title: 'At the Market',
      emoji: '🛒',
      description: 'Bargain prices for fruits and vegetables with a local vendor.',
      aiPersona: 'You are a friendly but tough market vendor in Maputo. You sell fresh vegetables. You speak mostly in the target language but explain in English if the user is confused.',
      difficulty: 'Easy'
    },
    {
      id: 'transport',
      title: 'Taking the Bus',
      emoji: '🚐',
      description: 'Ask for destination, fare, and where to stop.',
      aiPersona: 'You are a busy bus conductor. You speak fast and use local slang. You need to know where the passenger (user) is going.',
      difficulty: 'Medium'
    },
    {
      id: 'family',
      title: 'Family Dinner',
      emoji: '🥘',
      description: 'Talk about the food and introduce yourself to elders.',
      aiPersona: 'You are an elder family member hosting a dinner. You are polite, traditional, and asking the user about their life.',
      difficulty: 'Hard'
    }
  ];

  const startChat = (scenario?: RoleplayScenario) => {
    setActiveScenario(scenario || null);
    setMode('chat');
    
    const initialText = scenario 
      ? (language === 'pt' 
          ? `[Cenário: ${scenario.title}] Começou! ${scenario.aiPersona.includes('market') ? 'Olá freguês! O que vai levar hoje?' : 'Bom dia!'}` 
          : `[Scenario: ${scenario.title}] Started! ${scenario.aiPersona.includes('market') ? 'Hello customer! What do you need?' : 'Good morning!'}`)
      : t('tutor.intro');

    setMessages([{
      id: '1',
      role: 'model',
      text: initialText,
      timestamp: new Date()
    }]);
  };

  const handleBackToMenu = () => {
    setMode('menu');
    setMessages([]);
    setActiveScenario(null);
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

    // Pass custom persona if in scenario mode
    const systemInstruction = activeScenario?.aiPersona;

    const responseText = await chatWithTutor(
      history, 
      userMsg.text, 
      "African Languages (Mozambique context)", 
      language,
      systemInstruction
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

  // --- RENDER MENU MODE ---
  if (mode === 'menu') {
    return (
      <div className="h-full bg-gray-50 overflow-y-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <header className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{t('tutor.title')}</h2>
            <p className="text-gray-600">{language === 'pt' ? 'Escolha como quer praticar hoje:' : 'Choose how you want to practice today:'}</p>
          </header>

          <div className="grid gap-4">
            {/* Free Chat Option */}
            <div 
              onClick={() => startChat()}
              className="bg-white p-6 rounded-3xl shadow-sm border-2 border-transparent hover:border-afri-primary cursor-pointer transition-all group flex items-center gap-4"
            >
               <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                 <MessageCircle size={32} />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-gray-800">{language === 'pt' ? 'Chat Livre' : 'Free Chat'}</h3>
                 <p className="text-gray-500 text-sm">{language === 'pt' ? 'Converse sobre qualquer assunto com o Tutor.' : 'Talk about anything with your AI Tutor.'}</p>
               </div>
            </div>

            <h3 className="text-gray-400 font-bold uppercase text-xs tracking-widest mt-4 ml-2">{language === 'pt' ? 'Cenários de Roleplay' : 'Roleplay Scenarios'}</h3>
            
            {scenarios.map(sc => (
              <div 
                key={sc.id}
                onClick={() => startChat(sc)}
                className="bg-white p-6 rounded-3xl shadow-sm border-2 border-transparent hover:border-afri-primary cursor-pointer transition-all group relative overflow-hidden"
              >
                <div className="flex items-start justify-between relative z-10">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-orange-50 text-3xl flex items-center justify-center rounded-2xl shadow-inner">
                        {sc.emoji}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{sc.title}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          sc.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                          sc.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {sc.difficulty}
                        </span>
                      </div>
                   </div>
                </div>
                <p className="text-gray-500 text-sm mt-3 relative z-10">{sc.description}</p>
                <div className="absolute right-0 bottom-0 opacity-5 text-8xl transform translate-x-4 translate-y-4 rotate-12 group-hover:scale-110 transition-transform">
                  {sc.emoji}
                </div>
              </div>
            ))}
          </div>
          <div className="h-24"></div>
        </div>
      </div>
    );
  }

  // --- RENDER CHAT MODE ---
  return (
    <div className="flex flex-col h-full bg-gray-50 max-w-3xl mx-auto w-full shadow-lg relative">
      <div className="bg-white p-3 border-b flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={handleBackToMenu} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-afri-secondary to-green-500 flex items-center justify-center text-white text-xl shadow-md">
                {activeScenario ? activeScenario.emoji : '🧙🏾‍♂️'}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-sm md:text-base">
                {activeScenario ? activeScenario.title : t('tutor.title')}
              </h2>
              {activeScenario && <p className="text-[10px] font-bold text-afri-primary bg-orange-50 px-2 py-0.5 rounded-full inline-block">Roleplay Mode</p>}
            </div>
          </div>
        </div>
        <button 
          onClick={() => startChat(activeScenario || undefined)} 
          className="p-2 text-gray-400 hover:text-afri-primary bg-gray-50 hover:bg-orange-50 rounded-full transition-colors"
          title="Reiniciar"
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
              <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                {msg.text}
              </p>
              {msg.text.includes("Erro") && (
                 <button onClick={() => handleSend(messages[messages.length-2].text)} className="mt-2 text-xs underline text-red-500 font-bold block">
                   Tentar novamente
                 </button>
              )}
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

      {/* Input Area */}
      <div className="p-4 bg-white border-t pb-28 md:pb-4 transition-all">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={activeScenario ? (language === 'pt' ? 'Responda ao personagem...' : 'Reply to the character...') : t('tutor.type_placeholder')}
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