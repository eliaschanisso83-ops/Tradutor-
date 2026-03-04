import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, RoleplayScenario } from '../types';
import { chatWithTutor } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { RefreshCcw, Send, ArrowLeft, MessageCircle, GraduationCap } from 'lucide-react';

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
      <div className="h-full bg-afri-warm/30 overflow-y-auto p-4 md:p-10 no-scrollbar">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-afri-primary rounded-2xl flex items-center justify-center text-white shadow-glow">
                <GraduationCap size={28} />
              </div>
              <span className="text-xs font-black text-afri-primary uppercase tracking-[0.3em]">AI Learning</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-3">{t('tutor.title')}</h2>
            <p className="text-gray-500 font-medium text-lg tracking-tight">
              {language === 'pt' ? 'Pratique conversação em tempo real com seu tutor pessoal.' : 'Practice real-time conversation with your personal AI tutor.'}
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Chat Option */}
            <div 
              onClick={() => startChat()}
              className="md:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-soft border-2 border-transparent hover:border-afri-primary cursor-pointer transition-all group flex items-center gap-6 hover:shadow-heavy hover:-translate-y-1"
            >
               <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-inner">
                 <MessageCircle size={40} />
               </div>
               <div className="flex-1">
                 <div className="flex items-center gap-2 mb-1">
                   <h3 className="text-2xl font-black text-gray-900 tracking-tight">{language === 'pt' ? 'Chat Livre' : 'Free Chat'}</h3>
                   <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Recomendado</span>
                 </div>
                 <p className="text-gray-500 font-medium leading-tight">{language === 'pt' ? 'Converse sobre qualquer assunto com o Tutor e receba correções instantâneas.' : 'Talk about anything with your AI Tutor and get instant corrections.'}</p>
               </div>
               <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-afri-primary group-hover:text-white transition-all">
                 <Send size={20} />
               </div>
            </div>

            <div className="md:col-span-2 mt-8 mb-4">
              <h3 className="text-gray-400 font-black uppercase text-xs tracking-[0.3em] ml-2">{language === 'pt' ? 'Cenários de Roleplay' : 'Roleplay Scenarios'}</h3>
            </div>
            
            {scenarios.map(sc => (
              <div 
                key={sc.id}
                onClick={() => startChat(sc)}
                className="bg-white p-8 rounded-[2.5rem] shadow-soft border-2 border-transparent hover:border-afri-primary cursor-pointer transition-all group relative overflow-hidden flex flex-col hover:shadow-heavy hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-6 relative z-10">
                   <div className="w-16 h-16 bg-afri-warm text-4xl flex items-center justify-center rounded-2xl shadow-inner border border-afri-primary/5 group-hover:scale-110 transition-transform">
                     {sc.emoji}
                   </div>
                   <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                     sc.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                     sc.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                     'bg-red-100 text-red-700'
                   }`}>
                     {sc.difficulty}
                   </span>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight relative z-10">{sc.title}</h3>
                <p className="text-gray-500 font-medium text-sm leading-relaxed relative z-10 flex-1">{sc.description}</p>
                
                <div className="mt-6 flex items-center text-afri-primary font-black text-xs uppercase tracking-widest gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 relative z-10">
                  <span>Praticar Agora</span>
                  <Send size={14} />
                </div>

                <div className="absolute right-0 bottom-0 opacity-[0.03] text-9xl transform translate-x-6 translate-y-6 rotate-12 group-hover:scale-125 group-hover:opacity-[0.07] transition-all duration-700">
                  {sc.emoji}
                </div>
              </div>
            ))}
          </div>
          <div className="h-32"></div>
        </div>
      </div>
    );
  }

  // --- RENDER CHAT MODE ---
  return (
    <div className="flex flex-col h-full bg-white max-w-4xl mx-auto w-full shadow-heavy relative md:rounded-t-[3rem] overflow-hidden border-x border-gray-100">
      <div className="bg-white/80 backdrop-blur-xl p-4 border-b flex items-center justify-between z-20 shadow-sm sticky top-0">
        <div className="flex items-center gap-4">
          <button onClick={handleBackToMenu} className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-600 transition-all active:scale-90">
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-afri-primary to-afri-accent flex items-center justify-center text-white text-2xl shadow-glow rotate-3">
                {activeScenario ? activeScenario.emoji : '🧙🏾‍♂️'}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>
            </div>
            <div>
              <h2 className="font-black text-gray-900 text-base md:text-lg tracking-tight leading-none">
                {activeScenario ? activeScenario.title : t('tutor.title')}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-[10px] font-black text-afri-primary uppercase tracking-widest">
                  {activeScenario ? 'Scenario Mode' : 'Online Tutor'}
                </p>
              </div>
            </div>
          </div>
        </div>
        <button 
          onClick={() => startChat(activeScenario || undefined)} 
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-afri-primary bg-gray-50 hover:bg-afri-warm rounded-xl transition-all active:rotate-180 duration-500"
          title="Reiniciar"
        >
          <RefreshCcw size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50 no-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
          >
            <div
              className={`max-w-[85%] p-5 rounded-[2rem] shadow-soft relative border ${
                msg.role === 'user'
                  ? 'bg-gray-900 text-white rounded-br-none border-gray-800'
                  : 'bg-white text-gray-900 rounded-bl-none border-gray-100'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed text-base font-medium tracking-tight">
                {msg.text}
              </p>
              <div className={`text-[9px] font-bold uppercase tracking-widest mt-2 opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.role === 'user' ? 'You' : 'Tutor'}
              </div>
              {msg.text.includes("Erro") && (
                 <button onClick={() => handleSend(messages[messages.length-2].text)} className="mt-3 text-xs font-black text-red-500 uppercase tracking-widest flex items-center gap-1 hover:underline">
                   <RefreshCcw size={12} /> Tentar novamente
                 </button>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-white p-5 rounded-[2rem] rounded-bl-none shadow-soft border border-gray-100 flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 bg-afri-primary rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-afri-primary rounded-full animate-bounce delay-150"></span>
              <span className="w-1.5 h-1.5 bg-afri-primary rounded-full animate-bounce delay-300"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t pb-32 md:pb-8 transition-all backdrop-blur-xl bg-white/90">
        <div className="flex gap-3 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={activeScenario ? (language === 'pt' ? 'Responda ao personagem...' : 'Reply to the character...') : t('tutor.type_placeholder')}
              className="w-full bg-gray-50 border-gray-100 focus:bg-white border-2 focus:border-afri-primary rounded-2xl px-6 py-4 focus:ring-0 outline-none transition-all font-medium text-gray-900 placeholder-gray-300"
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-afri-primary disabled:opacity-50 shadow-heavy hover:scale-105 transition-all active:scale-95 group"
          >
            <Send size={22} className={`${isTyping ? "opacity-0" : "group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorView;