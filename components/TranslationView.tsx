import React, { useState, useRef, useEffect } from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';
import { translateText, translateImage, translateAudio } from '../services/geminiService';
import { Language } from '../types';

const TranslationView: React.FC = () => {
  const [sourceLang, setSourceLang] = useState<Language>(SUPPORTED_LANGUAGES[1]); // English
  const [targetLang, setTargetLang] = useState<Language>(SUPPORTED_LANGUAGES[4]); // Changana
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<{ translated: string; pronunciation: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'text' | 'voice' | 'image'>('text');
  const [isRecording, setIsRecording] = useState(false);
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
        // Detect the actual MIME type used by the browser
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        setLoading(true);
        // Convert Blob to Base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64String = (reader.result as string);
          // Split to get just the base64 data, handling different data URI formats
          const base64Audio = base64String.split(',')[1];
          
          const res = await translateAudio(base64Audio, mimeType, targetLang.name);
          setInputText(res.transcription); // Show what was heard
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

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header / Language Selector */}
      <div className="bg-white p-4 shadow-sm z-10 sticky top-0">
        <div className="flex items-center justify-between gap-2 max-w-2xl mx-auto">
          <select 
            value={sourceLang.code}
            onChange={(e) => setSourceLang(SUPPORTED_LANGUAGES.find(l => l.code === e.target.value) || sourceLang)}
            className="flex-1 bg-gray-100 p-2 rounded-lg font-medium text-gray-700"
          >
            {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
          </select>

          <button 
            className="p-2 text-gray-400"
            onClick={() => {
              const temp = sourceLang;
              setSourceLang(targetLang);
              setTargetLang(temp);
            }}
          >
            ↔️
          </button>

          <select 
            value={targetLang.code}
            onChange={(e) => setTargetLang(SUPPORTED_LANGUAGES.find(l => l.code === e.target.value) || targetLang)}
            className="flex-1 bg-afri-primary text-white p-2 rounded-lg font-medium"
          >
            {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto max-w-2xl mx-auto w-full">
        
        {/* Mode Tabs */}
        <div className="flex gap-2 mb-4 bg-white p-1 rounded-xl shadow-sm">
          {(['text', 'voice', 'image'] as const).map((m) => (
             <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                mode === m ? 'bg-afri-secondary text-white shadow' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {m === 'text' && '✍️ Text'}
              {m === 'voice' && '🎤 Voice'}
              {m === 'image' && '📷 Image'}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-2xl shadow-sm p-4 min-h-[200px] flex flex-col relative">
          
          {mode === 'text' && (
            <textarea
              className="w-full h-32 resize-none outline-none text-lg text-gray-800 placeholder-gray-300"
              placeholder={`Type in ${sourceLang.name}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          )}

          {mode === 'voice' && (
            <div className="flex flex-col items-center justify-center h-48 gap-4">
               {isRecording ? (
                 <div className="animate-pulse relative">
                   <div className="w-20 h-20 bg-red-100 rounded-full absolute top-0 left-0 animate-ping"></div>
                   <button 
                    onClick={stopRecording}
                    className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white text-3xl shadow-lg relative z-10"
                   >
                     ⏹
                   </button>
                   <p className="text-center mt-4 text-red-500 font-medium">Recording...</p>
                 </div>
               ) : (
                 <button 
                  onClick={startRecording}
                  className="w-20 h-20 bg-afri-primary rounded-full flex items-center justify-center text-white text-3xl shadow-lg hover:scale-105 transition-transform"
                 >
                   🎤
                 </button>
               )}
               <p className="text-gray-400 text-sm">{isRecording ? 'Tap to stop' : 'Tap to speak'}</p>
            </div>
          )}

          {mode === 'image' && (
            <div className="h-48 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors relative">
               <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <span className="text-4xl mb-2">📷</span>
              <p>Take a photo or upload</p>
            </div>
          )}
          
          {/* Action Button for Text Mode */}
          {mode === 'text' && (
            <div className="absolute bottom-4 right-4">
               <button 
                onClick={handleTranslateText}
                disabled={!inputText || loading}
                className="bg-afri-primary text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:bg-afri-accent disabled:opacity-50 flex items-center gap-2"
               >
                 {loading ? 'Translating...' : 'Translate'}
               </button>
            </div>
          )}
        </div>

        {/* Result Area */}
        {(result || loading) && (
          <div className="mt-4 bg-white rounded-2xl shadow-sm p-6 border-l-4 border-afri-secondary">
             {loading ? (
               <div className="flex items-center gap-3 text-gray-500">
                 <div className="w-5 h-5 border-2 border-afri-secondary border-t-transparent rounded-full animate-spin"></div>
                 Processing with AI...
               </div>
             ) : result ? (
               <div className="animate-fade-in">
                 <p className="text-sm text-afri-secondary font-bold mb-1 uppercase tracking-wider">{targetLang.name}</p>
                 <h3 className="text-2xl font-medium text-gray-800 mb-2">{result.translated}</h3>
                 {result.pronunciation && (
                   <p className="text-gray-500 italic">"{result.pronunciation}"</p>
                 )}
                 <div className="mt-4 flex gap-3">
                   <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">🔊</button>
                   <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">📋</button>
                 </div>
               </div>
             ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationView;