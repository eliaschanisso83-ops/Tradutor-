import React, { useState, useRef, useEffect } from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';
import { translateText, translateImage, translateAudio, generateSpeech } from '../services/geminiService';
import { Language } from '../types';

// Helper to decode base64 string
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to convert raw PCM data to AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const TranslationView: React.FC = () => {
  const [sourceLang, setSourceLang] = useState<Language>(SUPPORTED_LANGUAGES[1]); // English
  const [targetLang, setTargetLang] = useState<Language>(SUPPORTED_LANGUAGES[4]); // Changana
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<{ translated: string; pronunciation: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'text' | 'voice' | 'image'>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Text Translation Handler
  const handleTranslateText = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    const res = await translateText(inputText, sourceLang.name, targetLang.name);
    setResult(res);
    setLoading(false);
  };

  // Image Handler
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

  // Audio Recording Handler
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        setLoading(true);
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64String = (reader.result as string);
          const base64Audio = base64String.split(',')[1];
          
          const res = await translateAudio(base64Audio, mimeType, targetLang.name);
          setInputText(res.transcription);
          setResult({ translated: res.translation, pronunciation: '' });
          setLoading(false);
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone", err);
      alert("Could not access microphone.");
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
    const audioData = await generateSpeech(result.translated);
    
    if (audioData) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        const audioBuffer = await decodeAudioData(decode(audioData), audioContext);
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.onended = () => setIsPlaying(false);
        source.start(0);
      } catch (e) {
        console.error("Playback error:", e);
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>

      {/* Header / Language Selector */}
      <div className="bg-white/80 backdrop-blur-md p-4 shadow-sm z-10 sticky top-0 border-b border-gray-100">
        <div className="flex items-center justify-between gap-2 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <select 
              value={sourceLang.code}
              onChange={(e) => setSourceLang(SUPPORTED_LANGUAGES.find(l => l.code === e.target.value) || sourceLang)}
              className="w-full appearance-none bg-gray-100 p-3 rounded-xl font-medium text-gray-700 pr-8 focus:ring-2 focus:ring-afri-primary outline-none transition-all"
            >
              {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
          </div>

          <button 
            className="p-3 rounded-full hover:bg-orange-50 text-afri-primary transition-colors"
            onClick={() => {
              const temp = sourceLang;
              setSourceLang(targetLang);
              setTargetLang(temp);
            }}
          >
            ↔️
          </button>

          <div className="relative flex-1">
            <select 
              value={targetLang.code}
              onChange={(e) => setTargetLang(SUPPORTED_LANGUAGES.find(l => l.code === e.target.value) || targetLang)}
              className="w-full appearance-none bg-afri-primary text-white p-3 rounded-xl font-medium pr-8 focus:ring-2 focus:ring-orange-300 outline-none shadow-md transition-all"
            >
              {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/70">▼</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto max-w-2xl mx-auto w-full z-0 relative">
        
        {/* Mode Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
          {(['text', 'voice', 'image'] as const).map((m) => (
             <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${
                mode === m 
                  ? 'bg-afri-secondary text-white shadow-md transform scale-[1.02]' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {m === 'text' && '✍️ Text'}
              {m === 'voice' && '🎤 Voice'}
              {m === 'image' && '📷 Image'}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-3xl shadow-lg p-5 min-h-[220px] flex flex-col relative border border-gray-50 transition-all duration-300">
          
          {mode === 'text' && (
            <>
              <textarea
                className="w-full h-36 resize-none outline-none text-xl text-gray-800 placeholder-gray-300 bg-transparent"
                placeholder={`Type in ${sourceLang.name}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              {inputText && (
                <button 
                  onClick={() => setInputText('')}
                  className="absolute top-4 right-4 text-gray-300 hover:text-gray-500"
                >
                  ✕
                </button>
              )}
            </>
          )}

          {mode === 'voice' && (
            <div className="flex flex-col items-center justify-center h-48 gap-6">
               {isRecording ? (
                 <div className="relative">
                   {/* Waveform Animation Simulation */}
                   <div className="flex items-center justify-center gap-1 absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-10">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="w-1 bg-afri-primary rounded-full animate-bounce" style={{ height: `${Math.random() * 20 + 10}px`, animationDuration: `${Math.random() * 0.5 + 0.5}s` }}></div>
                      ))}
                   </div>
                   
                   <div className="w-24 h-24 bg-red-50 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping opacity-75"></div>
                   <button 
                    onClick={stopRecording}
                    className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white text-3xl shadow-xl relative z-10 hover:scale-105 transition-transform"
                   >
                     ⏹
                   </button>
                 </div>
               ) : (
                 <button 
                  onClick={startRecording}
                  className="w-20 h-20 bg-gradient-to-br from-afri-primary to-orange-600 rounded-full flex items-center justify-center text-white text-3xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                 >
                   🎤
                 </button>
               )}
               <p className={`text-sm font-medium ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                 {isRecording ? 'Listening...' : 'Tap to speak'}
               </p>
            </div>
          )}

          {mode === 'image' && (
            <div className="h-48 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-afri-primary hover:text-afri-primary transition-all relative group">
               <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="bg-gray-100 p-4 rounded-full mb-3 group-hover:bg-orange-100 transition-colors">
                <span className="text-4xl">📷</span>
              </div>
              <p className="font-medium">Take a photo or upload</p>
            </div>
          )}
          
          {/* Action Button for Text Mode */}
          {mode === 'text' && (
            <div className="absolute bottom-4 right-4 z-10">
               <button 
                onClick={handleTranslateText}
                disabled={!inputText || loading}
                className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2 transform active:scale-95 transition-all"
               >
                 {loading ? 'Translating...' : 'Translate'}
                 {!loading && <span>→</span>}
               </button>
            </div>
          )}
        </div>

        {/* Result Area */}
        {(result || loading) && (
          <div className="mt-6 animate-fade-in-up">
            {loading ? (
               <div className="bg-white rounded-3xl shadow-sm p-8 flex flex-col items-center justify-center text-center">
                 <div className="w-12 h-12 border-4 border-afri-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="text-gray-800 font-bold">Consulting the ancestors...</p>
                 <p className="text-gray-400 text-sm">Processing with Gemini AI</p>
               </div>
             ) : result ? (
               <div className="bg-gradient-to-br from-afri-secondary to-green-800 rounded-3xl shadow-xl p-6 text-white relative overflow-hidden">
                 {/* Decorative background circle */}
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
                 
                 <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-green-200">{targetLang.name}</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleCopy}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
                        title="Copy"
                      >
                        {copied ? '✓' : '📋'}
                      </button>
                      <button 
                        onClick={handleSpeak}
                        disabled={isPlaying}
                        className={`p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center ${isPlaying ? 'animate-pulse text-green-200' : ''}`}
                        title="Speak"
                      >
                         {isPlaying ? (
                           <div className="w-5 h-5 flex items-end justify-center gap-0.5">
                             <div className="w-1 bg-current h-2 animate-bounce"></div>
                             <div className="w-1 bg-current h-4 animate-bounce delay-75"></div>
                             <div className="w-1 bg-current h-3 animate-bounce delay-150"></div>
                           </div>
                         ) : '🔊'}
                      </button>
                    </div>
                 </div>
                 
                 <h3 className="text-3xl font-bold mb-3 leading-tight">{result.translated}</h3>
                 
                 {result.pronunciation && (
                   <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 inline-block mt-2">
                     <p className="text-green-100 italic text-sm">Pronunciation: "{result.pronunciation}"</p>
                   </div>
                 )}
               </div>
             ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationView;