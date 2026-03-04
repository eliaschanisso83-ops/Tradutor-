import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { SUPPORTED_LANGUAGES, PRONUNCIATION_GAME_DATA } from '../constants';
import { Language } from '../types';
import { Mic, Play, RefreshCw, CheckCircle, XCircle, Trophy } from 'lucide-react';

type GameState = 'selection' | 'playing' | 'result';

const PronunciationGameView: React.FC = () => {
  const { language } = useLanguage();
  const [gameState, setGameState] = useState<GameState>('selection');
  const [selectedLang, setSelectedLang] = useState<Language | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState(0);
  const [transcript, setTranscript] = useState('');

  const recognitionRef = useRef<any>(null);
  const checkRef = useRef<any>(null);

  useEffect(() => {
    checkRef.current = checkPronunciation;
  });

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const result = event.results[0][0].transcript.toLowerCase();
        setTranscript(result);
        if (checkRef.current) checkRef.current(result);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startGame = (lang: Language) => {
    setSelectedLang(lang);
    setGameState('playing');
    setCurrentWordIndex(0);
    setScore(0);
    setFeedback(null);
    setTranscript('');
  };

  const checkPronunciation = (spoken: string) => {
    if (!selectedLang) return;
    const words = PRONUNCIATION_GAME_DATA[selectedLang.code] || [];
    const target = words[currentWordIndex].word.toLowerCase();
    
    // Simple check: if the target word is contained in the spoken text
    // (Speech recognition for African languages can be tricky, so we're a bit lenient)
    if (spoken.includes(target) || target.includes(spoken)) {
      setFeedback('correct');
      setScore(prev => prev + 1);
      setTimeout(() => {
        nextWord();
      }, 1500);
    } else {
      setFeedback('incorrect');
    }
  };

  const nextWord = () => {
    if (!selectedLang) return;
    const words = PRONUNCIATION_GAME_DATA[selectedLang.code] || [];
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setFeedback(null);
      setTranscript('');
    } else {
      setGameState('result');
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setFeedback(null);
      recognitionRef.current.lang = selectedLang?.code === 'pt' ? 'pt-PT' : 'en-US'; // Fallback lang for recognition
      recognitionRef.current.start();
      setIsListening(true);
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  };

  const renderSelection = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-afri-primary rounded-3xl flex items-center justify-center text-white shadow-glow mb-6 rotate-3">
        <Play size={40} fill="currentColor" />
      </div>
      <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">
        {language === 'pt' ? 'Jogo de Pronúncia' : 'Pronunciation Game'}
      </h2>
      <p className="text-gray-500 font-medium mb-10 max-w-sm">
        {language === 'pt' 
          ? 'Escolha uma língua e pratique sua fala pronunciando as palavras corretamente.' 
          : 'Choose a language and practice your speaking by pronouncing words correctly.'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {SUPPORTED_LANGUAGES.filter(l => PRONUNCIATION_GAME_DATA[l.code]).map(lang => (
          <button
            key={lang.code}
            onClick={() => startGame(lang)}
            className="bg-white p-6 rounded-[2rem] shadow-soft border-2 border-transparent hover:border-afri-primary transition-all flex items-center gap-4 group hover:shadow-heavy"
          >
            <div className="text-4xl group-hover:scale-110 transition-transform">{lang.flag}</div>
            <div className="text-left">
              <h3 className="font-black text-gray-900 text-lg">{lang.name}</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                {PRONUNCIATION_GAME_DATA[lang.code].length} {language === 'pt' ? 'Palavras' : 'Words'}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderPlaying = () => {
    if (!selectedLang) return null;
    const words = PRONUNCIATION_GAME_DATA[selectedLang.code] || [];
    const currentWord = words[currentWordIndex];

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-500">
        <div className="mb-8 flex items-center gap-4">
          <div className="px-4 py-2 bg-gray-100 rounded-full text-xs font-black text-gray-500 uppercase tracking-widest">
            {language === 'pt' ? 'Palavra' : 'Word'} {currentWordIndex + 1} / {words.length}
          </div>
          <div className="px-4 py-2 bg-afri-primary/10 rounded-full text-xs font-black text-afri-primary uppercase tracking-widest">
            Score: {score}
          </div>
        </div>

        <div className="bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-heavy border border-white relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-afri-primary/5 rounded-full -mr-16 -mt-16"></div>
          
          <h3 className="text-5xl md:text-7xl font-black text-gray-900 mb-4 tracking-tighter">
            {currentWord.word}
          </h3>
          <p className="text-xl text-gray-400 font-medium italic mb-8">
            {currentWord.translation}
          </p>

          <div className="flex flex-col items-center gap-6">
            <button
              onClick={startListening}
              disabled={isListening || feedback === 'correct'}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-glow relative ${
                isListening 
                  ? 'bg-red-500 text-white scale-110' 
                  : feedback === 'correct'
                    ? 'bg-green-500 text-white'
                    : 'bg-afri-primary text-white hover:scale-105'
              }`}
            >
              {isListening && (
                <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></span>
              )}
              {isListening ? <Mic size={40} /> : <Mic size={40} />}
            </button>
            
            <p className={`font-black uppercase tracking-[0.2em] text-sm transition-colors ${
              isListening ? 'text-red-500 animate-pulse' : 'text-gray-400'
            }`}>
              {isListening 
                ? (language === 'pt' ? 'Ouvindo...' : 'Listening...') 
                : (language === 'pt' ? 'Clique para falar' : 'Click to speak')}
            </p>
          </div>
        </div>

        {feedback && (
          <div className={`flex items-center gap-3 p-6 rounded-3xl animate-in slide-in-from-bottom-4 duration-500 ${
            feedback === 'correct' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {feedback === 'correct' ? (
              <>
                <CheckCircle size={24} />
                <span className="font-black uppercase tracking-widest text-sm">
                  {language === 'pt' ? 'Pronúncia Correta!' : 'Correct Pronunciation!'}
                </span>
              </>
            ) : (
              <>
                <XCircle size={24} />
                <span className="font-black uppercase tracking-widest text-sm">
                  {language === 'pt' ? 'Pronúncia Errada' : 'Wrong Pronunciation'}
                </span>
                <button 
                  onClick={startListening}
                  className="ml-4 bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-800 transition-colors"
                >
                  {language === 'pt' ? 'Tentar de novo' : 'Try again'}
                </button>
              </>
            )}
          </div>
        )}

        {transcript && (
          <p className="mt-6 text-gray-400 font-medium italic">
            "{transcript}"
          </p>
        )}
      </div>
    );
  };

  const renderResult = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center text-white shadow-glow mb-8 animate-bounce">
        <Trophy size={48} />
      </div>
      <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter">
        {language === 'pt' ? 'Jogo Concluído!' : 'Game Completed!'}
      </h2>
      <p className="text-gray-500 font-medium mb-10">
        {language === 'pt' 
          ? `Parabéns! Você acertou ${score} de ${PRONUNCIATION_GAME_DATA[selectedLang?.code || ''].length} palavras.` 
          : `Congratulations! You got ${score} out of ${PRONUNCIATION_GAME_DATA[selectedLang?.code || ''].length} words correct.`}
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => setGameState('selection')}
          className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-heavy hover:bg-afri-primary transition-all active:scale-95 flex items-center gap-3"
        >
          <RefreshCw size={18} />
          {language === 'pt' ? 'Jogar Novamente' : 'Play Again'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-afri-warm/20 overflow-y-auto p-4 md:p-10 no-scrollbar">
      <div className="max-w-4xl mx-auto">
        {gameState === 'selection' && renderSelection()}
        {gameState === 'playing' && renderPlaying()}
        {gameState === 'result' && renderResult()}
      </div>
    </div>
  );
};

export default PronunciationGameView;
