import React, { useState } from 'react';
import { MOCK_LESSONS, AD_CONFIG, SUPPORTED_LANGUAGES } from '../constants';
import { Lesson } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { generateQuiz, QuizQuestion } from '../services/geminiService';
import AdBanner from './AdBanner';
import { Loader2, CheckCircle, XCircle, Trophy, ArrowRight, BookOpen } from 'lucide-react';

type LearnMode = 'list' | 'loading' | 'quiz' | 'completed';

const LearnView: React.FC = () => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<LearnMode>('list');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  
  // Quiz State
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const startLesson = async (lesson: Lesson) => {
    setActiveLesson(lesson);
    setMode('loading');
    
    // Generate quiz questions
    const qs = await generateQuiz(lesson.title, "Changana"); // Defaulting language for demo
    setQuestions(qs);
    setCurrentQIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedOption(null);
    setMode('quiz');
  };

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === questions[currentQIndex].correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedOption(null);
    } else {
      setMode('completed');
    }
  };

  const reset = () => {
    setMode('list');
    setActiveLesson(null);
  };

  // 1. Loading State
  if (mode === 'loading') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
        <Loader2 size={48} className="text-afri-primary animate-spin mb-4" />
        <h3 className="text-xl font-bold text-gray-800">Criando Lição...</h3>
        <p className="text-gray-500">A IA está preparando perguntas personalizadas para "{activeLesson?.title}".</p>
      </div>
    );
  }

  // 2. Quiz State
  if (mode === 'quiz' && activeLesson) {
    const currentQ = questions[currentQIndex];
    const isCorrect = selectedOption === currentQ.correctIndex;

    return (
      <div className="h-full flex flex-col bg-white overflow-hidden">
        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-100">
          <div 
            className="h-full bg-afri-primary transition-all duration-500" 
            style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col max-w-2xl mx-auto w-full">
           <div className="flex justify-between items-center mb-6">
              <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">{activeLesson.title}</span>
              <button onClick={reset} className="text-gray-400 hover:text-gray-600 font-bold text-xl">×</button>
           </div>

           <h2 className="text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
             {currentQ.question}
           </h2>

           <div className="space-y-3 flex-1">
             {currentQ.options.map((opt, idx) => {
               let btnClass = "w-full p-4 rounded-xl border-2 text-left font-bold transition-all relative ";
               
               if (isAnswered) {
                 if (idx === currentQ.correctIndex) {
                    btnClass += "bg-green-100 border-green-500 text-green-700"; // Correct
                 } else if (idx === selectedOption) {
                    btnClass += "bg-red-50 border-red-500 text-red-500"; // Wrong
                 } else {
                    btnClass += "bg-gray-50 border-gray-100 text-gray-400 opacity-50"; // Others
                 }
               } else {
                 btnClass += selectedOption === idx 
                   ? "border-afri-primary bg-orange-50 text-afri-primary"
                   : "border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700";
               }

               return (
                 <button 
                   key={idx} 
                   onClick={() => handleAnswer(idx)}
                   disabled={isAnswered}
                   className={btnClass}
                 >
                   {opt}
                   {isAnswered && idx === currentQ.correctIndex && (
                     <CheckCircle size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600" />
                   )}
                   {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                     <XCircle size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" />
                   )}
                 </button>
               );
             })}
           </div>
        </div>

        {/* Bottom Feedback Sheet */}
        <div className={`p-6 border-t ${isAnswered ? (isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100') : 'bg-white border-gray-100'}`}>
           <div className="max-w-2xl mx-auto flex items-center justify-between">
              {isAnswered ? (
                <div className="flex-1">
                   <div className="flex items-center gap-2 mb-1">
                     {isCorrect 
                       ? <span className="text-green-700 font-bold flex items-center gap-2"><CheckCircle size={20}/> Correto!</span>
                       : <span className="text-red-600 font-bold flex items-center gap-2"><XCircle size={20}/> Incorreto</span>
                     }
                   </div>
                   <p className="text-sm text-gray-600">{currentQ.explanation}</p>
                </div>
              ) : (
                <button 
                  disabled 
                  className="bg-gray-200 text-gray-400 px-8 py-3 rounded-xl font-bold w-full md:w-auto"
                >
                  Verificar
                </button>
              )}

              {isAnswered && (
                <button 
                  onClick={nextQuestion}
                  className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center gap-2 ${isCorrect ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'}`}
                >
                  Continuar <ArrowRight size={20} />
                </button>
              )}
           </div>
        </div>
      </div>
    );
  }

  // 3. Completed State
  if (mode === 'completed' && activeLesson) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 p-8 text-center relative overflow-hidden">
        {/* Confetti Background Effect (CSS only simplification) */}
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
           <div className="absolute top-10 left-10 text-4xl animate-bounce">🎉</div>
           <div className="absolute top-20 right-20 text-4xl animate-pulse">⭐</div>
           <div className="absolute bottom-10 left-1/3 text-4xl animate-spin">✨</div>
        </div>

        <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center text-white shadow-glow mb-6 animate-float">
          <Trophy size={64} />
        </div>
        
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Lição Completa!</h2>
        <p className="text-gray-600 mb-8 text-lg">Você praticou "{activeLesson.title}"</p>
        
        <div className="bg-white p-6 rounded-3xl shadow-soft w-full max-w-sm mb-8 flex justify-around">
           <div>
             <p className="text-gray-400 text-xs font-bold uppercase">Acertos</p>
             <p className="text-2xl font-bold text-green-600">{score}/{questions.length}</p>
           </div>
           <div className="w-px bg-gray-100"></div>
           <div>
             <p className="text-gray-400 text-xs font-bold uppercase">XP Ganho</p>
             <p className="text-2xl font-bold text-orange-500">+{activeLesson.xp}</p>
           </div>
        </div>

        <button 
          onClick={reset}
          className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 transition-transform"
        >
          Voltar ao Menu
        </button>
      </div>
    );
  }

  // 4. List View (Default)
  return (
    <div className="h-full bg-gray-50 overflow-y-auto p-4 md:p-8 relative">
      <div className="max-w-2xl mx-auto">
        
        {/* Header Stats */}
        <header className="mb-8 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
             <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90 text-gray-200" viewBox="0 0 36 36">
                  <path className="text-gray-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path className="text-orange-500" strokeDasharray="70, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
                <span className="absolute text-xs font-bold text-gray-700">5 {t('nav.days')}</span>
             </div>
             <div>
               <p className="text-xs text-gray-400 font-bold uppercase">{t('learn.streak')}</p>
               <h2 className="text-lg font-bold text-gray-800">{t('learn.fire')} 🔥</h2>
             </div>
          </div>
          <div className="bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-200 flex items-center gap-2">
            <span>💎</span> <span className="font-bold text-yellow-700">450 XP</span>
          </div>
        </header>

        <h3 className="text-xl font-bold text-gray-800 mb-4 px-2">{t('learn.current_path')}</h3>

        <div className="space-y-6 pb-32">
          {MOCK_LESSONS.map((lesson, index) => (
            <div 
              key={lesson.id} 
              onClick={() => startLesson(lesson)}
              className="bg-white rounded-3xl p-6 shadow-sm border-2 border-transparent hover:border-afri-primary transition-all cursor-pointer group relative overflow-hidden transform hover:-translate-y-1"
            >
              {index !== MOCK_LESSONS.length - 1 && (
                <div className="absolute left-1/2 bottom-0 w-0.5 h-10 bg-gray-200 translate-y-full z-0"></div>
              )}

              <div className="flex justify-between items-start mb-3 relative z-10">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
                  lesson.level === 'Beginner' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {lesson.level}
                </span>
                <span className="text-sm font-bold text-gray-400 group-hover:text-afri-primary transition-colors">+{lesson.xp} XP</span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2 relative z-10 group-hover:text-afri-primary transition-colors">{lesson.title}</h3>
              <p className="text-gray-500 mb-5 relative z-10 text-sm">{lesson.description}</p>
              
              <div className="w-full bg-gray-100 rounded-full h-3 relative z-10 overflow-hidden">
                <div className="bg-afri-primary h-full rounded-full w-1/3 shadow-sm"></div>
              </div>

              <div className="absolute -bottom-2 -right-2 text-8xl opacity-5 group-hover:opacity-10 transition-opacity rotate-12 select-none grayscale group-hover:grayscale-0">
                {index === 0 ? '👋' : index === 1 ? '🍎' : '👪'}
              </div>
              
              {/* Overlay Start Button for clarity */}
              <div className="mt-4 flex justify-end relative z-10">
                <button className="bg-afri-primary text-white px-4 py-2 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  Iniciar
                </button>
              </div>
            </div>
          ))}

          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-6 text-white text-center shadow-lg mt-8">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">🏆</div>
            <h3 className="text-xl font-bold mb-2">{t('learn.challenge_title')}</h3>
            <p className="text-gray-300 mb-4 text-sm">{t('learn.challenge_desc')}</p>
          </div>
          
          <AdBanner slotId={AD_CONFIG.SLOTS.LEARN_FEED} />
        </div>
      </div>
    </div>
  );
};

export default LearnView;