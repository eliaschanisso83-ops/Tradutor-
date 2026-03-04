import React, { useState, useRef, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, AD_CONFIG } from '../constants';
import { translateText, translateImage, translateAudio, generateSpeech } from '../services/geminiService';
import { Language } from '../types';
import { Mic, StopCircle, Image as ImageIcon, Sparkles, Copy, Check, Volume2, ArrowRightLeft, X, Loader2, AlertTriangle, RefreshCw, Lightbulb, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import AdBanner from './AdBanner';

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Robust Audio decoding
async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

const TranslationView: React.FC = () => {
  const { t, language } = useLanguage();
  const [sourceLang, setSourceLang] = useState<Language>(SUPPORTED_LANGUAGES[1]); // English
  const [targetLang, setTargetLang] = useState<Language>(SUPPORTED_LANGUAGES[4]); // Changana
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<{ translated: string; pronunciation: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'text' | 'voice' | 'image'>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const handleTranslateText = async () => {
    const trimmedInput = inputText.trim();
    if (!trimmedInput) return;
    
    setLoading(true);
    setResult(null); // Clear previous
    const res = await translateText(trimmedInput, sourceLang.name, targetLang.name);
    setResult(res);
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      const resText = await translateImage(base64String, file.type, targetLang.name);
      setResult({ translated: resText, pronunciation: '' });
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let mimeType = '';
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else {
        mimeType = ''; 
      }
      
      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => { 
        if (event.data.size > 0) audioChunksRef.current.push(event.data); 
      };
      
      mediaRecorder.onstop = async () => {
        const finalMimeType = mediaRecorder.mimeType || mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: finalMimeType });
        
        setLoading(true);
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64String = (reader.result as string);
          if (base64String.includes(',')) {
            const base64Audio = base64String.split(',')[1];
            const res = await translateAudio(base64Audio, finalMimeType, targetLang.name);
            setInputText(res.transcription);
            setResult({ translated: res.translation, pronunciation: '' });
          } else {
             setResult({ translated: "Erro na gravação do áudio.", pronunciation: "" });
          }
          setLoading(false);
        };
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) { 
      console.error("Mic Error:", err);
      alert("Erro ao acessar microfone. Verifique permissões."); 
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleCopy = () => {
    if (result?.translated) {
      navigator.clipboard.writeText(result.translated);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSpeak = async () => {
    if (!result?.translated || isPlaying) return;
    setIsPlaying(true);
    
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass(); 
      if (audioContext.state === 'suspended') await audioContext.resume();

      const audioData = await generateSpeech(result.translated);
      if (audioData) {
        const audioBuffer = await decodeAudioData(decode(audioData), audioContext);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.onended = () => setIsPlaying(false);
        source.start(0);
      } else {
        setIsPlaying(false);
      }
    } catch (e) {
      console.error("Playback error", e);
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative p-4 max-w-4xl mx-auto md:p-8 overflow-y-auto no-scrollbar">
      
      {/* Page Header */}
      <div className="mb-8 hidden md:block">
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">
          {language === 'pt' ? 'Tradutor Inteligente' : 'Smart Translator'}
        </h2>
        <p className="text-gray-500 font-medium tracking-tight">
          {language === 'pt' ? 'Traduza texto, voz e imagens instantaneamente.' : 'Translate text, voice and images instantly.'}
        </p>
      </div>

      {/* Language Header */}
      <div className="flex items-center justify-between gap-3 mb-8 z-10">
        <div className="flex-1 bg-white shadow-soft rounded-3xl p-3 flex items-center gap-3 cursor-pointer transition-all hover:shadow-heavy hover:-translate-y-1 border border-gray-100">
           <div className="w-12 h-12 rounded-2xl bg-afri-warm flex items-center justify-center text-3xl shadow-inner border border-afri-primary/5">
             {sourceLang.flag}
           </div>
           <div className="flex-1 min-w-0">
             <p className="text-[10px] font-bold text-afri-primary uppercase tracking-widest mb-0.5">From</p>
             <select 
               value={sourceLang.code}
               onChange={(e) => setSourceLang(SUPPORTED_LANGUAGES.find(l => l.code === e.target.value) || sourceLang)}
               className="bg-transparent font-black text-gray-900 text-sm md:text-lg outline-none w-full appearance-none cursor-pointer leading-none"
             >
               {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
             </select>
           </div>
        </div>

        <button 
          className="w-12 h-12 flex items-center justify-center bg-gray-900 shadow-heavy rounded-2xl text-white hover:bg-afri-primary hover:rotate-180 transition-all duration-500 group active:scale-90"
          onClick={() => {
            const temp = sourceLang;
            setSourceLang(targetLang);
            setTargetLang(temp);
          }}
        >
          <ArrowRightLeft size={20} className="group-hover:scale-110 transition-transform" />
        </button>

        <div className="flex-1 bg-afri-primary shadow-glow rounded-3xl p-3 flex items-center gap-3 cursor-pointer transition-all hover:shadow-heavy hover:-translate-y-1 border border-afri-primary/20">
           <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-3xl shadow-inner backdrop-blur-sm border border-white/10">
             {targetLang.flag}
           </div>
           <div className="flex-1 min-w-0">
             <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-0.5">To</p>
             <select 
               value={targetLang.code}
               onChange={(e) => setTargetLang(SUPPORTED_LANGUAGES.find(l => l.code === e.target.value) || targetLang)}
               className="bg-transparent font-black text-white text-sm md:text-lg outline-none w-full appearance-none cursor-pointer leading-none"
             >
               {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
             </select>
           </div>
        </div>
      </div>

      {/* Main Input Card */}
      <div className="bg-white rounded-[2.5rem] shadow-heavy overflow-hidden flex flex-col relative transition-all duration-500 border border-white group">
        
        <div className="p-8 relative min-h-[220px]">
          {mode === 'text' && (
            <>
              <textarea
                className="w-full h-full min-h-[140px] resize-none outline-none text-2xl md:text-3xl font-bold text-gray-900 placeholder-gray-200 bg-transparent leading-tight tracking-tighter"
                placeholder={t('translate.placeholder')}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              {inputText && (
                <button onClick={() => setInputText('')} className="absolute top-6 right-6 p-2.5 bg-gray-100 rounded-2xl text-gray-400 hover:bg-afri-primary hover:text-white transition-all">
                  <X size={18} />
                </button>
              )}
            </>
          )}

          {mode === 'voice' && (
             <div className="flex flex-col items-center justify-center h-56 py-8">
                {isRecording ? (
                  <div className="relative">
                    <span className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-75 scale-150"></span>
                    <button 
                      onClick={stopRecording}
                      className="relative w-28 h-28 bg-red-500 rounded-full flex items-center justify-center text-white shadow-heavy hover:scale-105 transition-all"
                    >
                      <StopCircle size={56} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={startRecording}
                    className="w-28 h-28 bg-gradient-to-tr from-afri-primary to-afri-accent rounded-full flex items-center justify-center text-white shadow-glow hover:scale-110 transition-all duration-500 group"
                  >
                    <Mic size={48} className="group-hover:scale-110 transition-transform" />
                  </button>
                )}
                <p className="mt-8 text-gray-400 font-black tracking-widest text-xs uppercase animate-pulse">
                  {isRecording ? t('translate.listening') : t('translate.record')}
                </p>
             </div>
          )}

          {mode === 'image' && (
            <div className="h-56 border-2 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center text-gray-400 hover:bg-afri-warm hover:border-afri-primary/30 transition-all relative group cursor-pointer">
               <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
               <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-white group-hover:text-afri-primary group-hover:shadow-soft transition-all">
                 <ImageIcon size={40} />
               </div>
               <p className="font-black text-gray-500 tracking-tight">{t('translate.scan')}</p>
               <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
            </div>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="px-8 py-5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between backdrop-blur-md">
           <div className="flex gap-3">
             {(['text', 'voice', 'image'] as const).map((m) => (
               <button
                 key={m}
                 onClick={() => setMode(m)}
                 className={`p-4 rounded-2xl transition-all relative group ${
                   mode === m 
                     ? 'bg-white shadow-soft text-afri-primary scale-110' 
                     : 'text-gray-400 hover:bg-white/50 hover:text-gray-600'
                 }`}
               >
                 {m === 'text' && <Sparkles size={22} />}
                 {m === 'voice' && <Mic size={22} />}
                 {m === 'image' && <ImageIcon size={22} />}
                 {mode === m && (
                   <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-afri-primary rounded-full" />
                 )}
               </button>
             ))}
           </div>
           
           {mode === 'text' && (
             <button 
               onClick={handleTranslateText}
               disabled={!inputText || loading}
               className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-heavy hover:bg-afri-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all active:scale-95 group"
             >
               {loading ? (
                 <Loader2 size={20} className="animate-spin" />
               ) : (
                 <>
                   <span>{t('translate.translate_btn')}</span>
                   <ArrowRightLeft size={18} className="group-hover:translate-x-1 transition-transform" />
                 </>
               )}
             </button>
           )}
        </div>
      </div>

      {/* Result Card */}
      {(result || loading) && (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
           {loading ? (
             <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center shadow-heavy h-64 border border-white">
               <div className="relative mb-6">
                 <div className="absolute inset-0 bg-afri-primary/20 rounded-full animate-ping"></div>
                 <div className="relative w-16 h-16 bg-afri-primary rounded-full flex items-center justify-center shadow-glow">
                   <Loader2 size={32} className="text-white animate-spin" />
                 </div>
               </div>
               <p className="text-gray-900 font-black text-xl tracking-tight">{t('translate.thinking')}</p>
               <p className="text-gray-400 text-sm mt-2 font-medium">Gemini AI is processing your request...</p>
             </div>
           ) : result ? (
             <div className={`bg-afri-secondary text-white rounded-[2.5rem] p-10 shadow-heavy relative overflow-hidden group transition-all border-4 border-white/20 ${result.error ? 'bg-afri-accent' : ''}`}>
               
               {/* Decorative Pattern */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

               {result.error && (
                 <div className="absolute top-6 right-6 text-white/30">
                    <AlertTriangle size={32} />
                 </div>
               )}

               <div className="flex justify-between items-center mb-8 relative z-10">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-2xl shadow-inner border border-white/10">
                     {targetLang.flag}
                   </div>
                   <span className="text-sm font-black tracking-widest uppercase text-white/80">
                     {result.error ? 'Aviso' : targetLang.name}
                   </span>
                 </div>
                 
                 <div className="flex gap-3">
                   {!result.error && (
                     <>
                       <button 
                         onClick={handleSpeak} 
                         disabled={isPlaying} 
                         className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-all active:scale-90 border border-white/10"
                       >
                         {isPlaying ? <Loader2 size={22} className="animate-spin" /> : <Volume2 size={22} />}
                       </button>
                       <button 
                         onClick={handleCopy} 
                         className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-all active:scale-90 border border-white/10"
                       >
                         {copied ? <Check size={22} /> : <Copy size={22} />}
                       </button>
                     </>
                   )}
                 </div>
               </div>

               {result.error ? (
                  <div className="text-center py-6">
                    <p className="text-2xl font-black mb-4 tracking-tight">{result.error}</p>
                    <button 
                      onClick={handleTranslateText} 
                      className="bg-white text-afri-accent px-8 py-3 rounded-2xl text-sm font-black flex items-center gap-3 mx-auto hover:bg-gray-100 transition-all shadow-lg active:scale-95"
                    >
                      <RefreshCw size={18} /> Tentar Novamente
                    </button>
                  </div>
               ) : (
                 <>
                   <p className="text-3xl md:text-5xl font-black leading-[1.1] tracking-tighter relative z-10 break-words mb-8">
                     {result.translated}
                   </p>
                   
                   {result.pronunciation && (
                     <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                         <div className="flex items-center gap-2 mb-2">
                           <Volume2 size={14} className="text-white/50" />
                           <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">{t('translate.pronunciation')}</p>
                         </div>
                         <p className="font-mono text-white text-xl italic tracking-wide bg-white/5 p-4 rounded-2xl border border-white/5">
                           {result.pronunciation}
                         </p>
                     </div>
                   )}
                 </>
               )}
             </div>
           ) : null}
        </div>
      )}

      {/* Cultural Fact Card */}
      {!result && !loading && (
        <div className="mt-10 bg-gradient-to-br from-afri-warm to-orange-100/50 rounded-[2.5rem] p-10 border border-orange-200/50 shadow-soft animate-in fade-in slide-in-from-bottom-10 duration-1000 relative overflow-hidden group">
           <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
             <Globe size={200} />
           </div>
           
           <div className="flex items-center gap-3 mb-6 text-afri-tertiary font-black text-xs uppercase tracking-[0.2em] relative z-10">
             <div className="w-8 h-8 bg-afri-primary rounded-lg flex items-center justify-center text-white shadow-glow">
               <Lightbulb size={18} />
             </div>
             {language === 'pt' ? 'Sabedoria Africana' : 'African Wisdom'}
           </div>
           
           <p className="text-2xl md:text-3xl text-gray-900 font-black italic mb-4 leading-tight tracking-tighter relative z-10">
             "Kuwa na subira ni kuwa na heri."
           </p>
           <div className="flex items-center gap-3 relative z-10">
             <div className="h-px w-8 bg-afri-primary/30"></div>
             <p className="text-gray-600 font-bold text-base">
               (Swahili) <span className="text-afri-primary">{language === 'pt' ? 'Ter paciência é uma bênção.' : 'To have patience is to be blessed.'}</span>
             </p>
           </div>
        </div>
      )}
      
      {/* Banner Ad Area */}
      <div className="mt-10 mb-20">
        <AdBanner slotId={AD_CONFIG.SLOTS.HOME_BANNER} />
      </div>
      
      {/* Spacer for Floating Dock */}
      <div className="h-28 md:h-0"></div>
    </div>
  );
};

export default TranslationView;