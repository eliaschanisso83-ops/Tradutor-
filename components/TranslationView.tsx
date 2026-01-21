import React, { useState, useRef, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, AD_CONFIG } from '../constants';
import { translateText, translateImage, translateAudio, generateSpeech } from '../services/geminiService';
import { Language } from '../types';
import { Mic, StopCircle, Image as ImageIcon, Sparkles, Copy, Check, Volume2, ArrowRightLeft, X, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
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
  const { t } = useLanguage();
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
      
      {/* Language Header */}
      <div className="flex items-center justify-between gap-4 mb-6 z-10">
        <div className="flex-1 bg-white shadow-soft rounded-2xl p-2 flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.02]">
           <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-2xl shadow-sm">
             {sourceLang.flag}
           </div>
           <select 
             value={sourceLang.code}
             onChange={(e) => setSourceLang(SUPPORTED_LANGUAGES.find(l => l.code === e.target.value) || sourceLang)}
             className="bg-transparent font-bold text-gray-700 text-sm md:text-base outline-none w-full appearance-none cursor-pointer"
           >
             {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
           </select>
        </div>

        <button 
          className="w-12 h-12 flex items-center justify-center bg-white shadow-soft rounded-full text-gray-400 hover:text-afri-primary hover:rotate-180 transition-all duration-300"
          onClick={() => {
            const temp = sourceLang;
            setSourceLang(targetLang);
            setTargetLang(temp);
          }}
        >
          <ArrowRightLeft size={20} />
        </button>

        <div className="flex-1 bg-afri-primary shadow-glow rounded-2xl p-2 flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.02]">
           <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-2xl shadow-inner backdrop-blur-sm">
             {targetLang.flag}
           </div>
           <select 
             value={targetLang.code}
             onChange={(e) => setTargetLang(SUPPORTED_LANGUAGES.find(l => l.code === e.target.value) || targetLang)}
             className="bg-transparent font-bold text-white text-sm md:text-base outline-none w-full appearance-none cursor-pointer"
           >
             {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
           </select>
        </div>
      </div>

      {/* Main Input Card */}
      <div className="bg-white rounded-[2rem] shadow-soft overflow-hidden flex flex-col relative transition-all duration-500 border border-white/50">
        
        <div className="p-6 relative min-h-[180px]">
          {mode === 'text' && (
            <>
              <textarea
                className="w-full h-full resize-none outline-none text-2xl font-medium text-gray-800 placeholder-gray-300 bg-transparent leading-relaxed"
                placeholder={t('translate.placeholder')}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              {inputText && (
                <button onClick={() => setInputText('')} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200">
                  <X size={16} />
                </button>
              )}
            </>
          )}

          {mode === 'voice' && (
             <div className="flex flex-col items-center justify-center h-48 py-8">
                {isRecording ? (
                  <div className="relative">
                    <span className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-75"></span>
                    <button 
                      onClick={stopRecording}
                      className="relative w-24 h-24 bg-red-500 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 transition-all"
                    >
                      <StopCircle size={48} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={startRecording}
                    className="w-24 h-24 bg-gradient-to-tr from-afri-primary to-orange-400 rounded-full flex items-center justify-center text-white shadow-glow hover:scale-110 transition-all duration-300"
                  >
                    <Mic size={40} />
                  </button>
                )}
                <p className="mt-6 text-gray-400 font-medium tracking-wide text-sm uppercase">
                  {isRecording ? t('translate.listening') : t('translate.record')}
                </p>
             </div>
          )}

          {mode === 'image' && (
            <div className="h-48 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-afri-primary/50 transition-all relative group cursor-pointer">
               <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
               <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                 <ImageIcon size={32} />
               </div>
               <p className="font-semibold text-gray-500">{t('translate.scan')}</p>
            </div>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
           <div className="flex gap-2">
             {(['text', 'voice', 'image'] as const).map((m) => (
               <button
                 key={m}
                 onClick={() => setMode(m)}
                 className={`p-3 rounded-xl transition-all ${mode === m ? 'bg-white shadow-md text-afri-primary' : 'text-gray-400 hover:bg-gray-100'}`}
               >
                 {m === 'text' && <Sparkles size={20} />}
                 {m === 'voice' && <Mic size={20} />}
                 {m === 'image' && <ImageIcon size={20} />}
               </button>
             ))}
           </div>
           
           {mode === 'text' && (
             <button 
               onClick={handleTranslateText}
               disabled={!inputText || loading}
               className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all active:scale-95"
             >
               {loading ? <Loader2 size={18} className="animate-spin" /> : <span>{t('translate.translate_btn')}</span>}
             </button>
           )}
        </div>
      </div>

      {/* Result Card */}
      {(result || loading) && (
        <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {loading ? (
             <div className="bg-white/80 backdrop-blur rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-soft h-48">
               <Loader2 size={40} className="text-afri-primary animate-spin mb-4" />
               <p className="text-gray-800 font-bold text-lg">{t('translate.thinking')}</p>
             </div>
           ) : result ? (
             <div className={`bg-afri-secondary text-white rounded-[2rem] p-8 shadow-xl relative overflow-hidden group transition-colors ${result.error ? 'bg-orange-500' : ''}`}>
               
               {result.error && (
                 <div className="absolute top-4 right-4 text-white/50">
                    <AlertTriangle size={24} />
                 </div>
               )}

               <div className="flex justify-between items-start mb-6 relative z-10">
                 <span className="px-3 py-1 bg-white/20 rounded-lg text-xs font-bold tracking-widest uppercase backdrop-blur-sm border border-white/10">
                   {result.error ? 'Aviso' : targetLang.name}
                 </span>
                 <div className="flex gap-2">
                   {!result.error && (
                     <>
                       <button onClick={handleSpeak} disabled={isPlaying} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all active:scale-90">
                         {isPlaying ? <Loader2 size={20} className="animate-spin" /> : <Volume2 size={20} />}
                       </button>
                       <button onClick={handleCopy} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all active:scale-90">
                         {copied ? <Check size={20} /> : <Copy size={20} />}
                       </button>
                     </>
                   )}
                 </div>
               </div>

               {result.error ? (
                  <div className="text-center py-4">
                    <p className="text-xl font-bold mb-2">{result.error}</p>
                    <button 
                      onClick={handleTranslateText} 
                      className="mt-4 bg-white text-orange-600 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 mx-auto hover:bg-gray-100"
                    >
                      <RefreshCw size={16} /> Tentar Novamente
                    </button>
                  </div>
               ) : (
                 <>
                  <p className="text-2xl md:text-3xl font-bold leading-relaxed tracking-tight relative z-10 break-words">
                    {result.translated}
                  </p>
                  
                  {result.pronunciation && (
                    <div className="mt-6 pt-4 border-t border-white/10 relative z-10">
                        <p className="text-green-200 text-sm font-medium mb-1">{t('translate.pronunciation')}</p>
                        <p className="font-mono text-green-50 text-lg italic tracking-wide">{result.pronunciation}</p>
                    </div>
                  )}
                 </>
               )}
             </div>
           ) : null}
        </div>
      )}
      
      {/* Banner Ad Area */}
      <AdBanner slotId={AD_CONFIG.SLOTS.HOME_BANNER} />
      
      {/* Spacer for Floating Dock */}
      <div className="h-28 md:h-0"></div>
    </div>
  );
};

export default TranslationView;