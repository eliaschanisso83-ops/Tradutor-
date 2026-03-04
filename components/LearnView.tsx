import React, { useState, useEffect } from 'react';
import { MOCK_LESSONS_DATA, AD_CONFIG, SUPPORTED_LANGUAGES } from '../constants';
import { Lesson, Language } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { generateQuiz, QuizQuestion } from '../services/geminiService';
import AdBanner from './AdBanner';
import { Loader2, CheckCircle, XCircle, Trophy, ArrowRight, BookOpen } from 'lucide-react';

type LearnMode = 'list' | 'loading' | 'quiz' | 'completed';

const LearnView: React.FC = () => {
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<LearnMode>('list');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  
  // Target Language for Learning
  const [targetLessonLang, setTargetLessonLang] = useState<Language>(
    SUPPORTED_LANGUAGES.find(l => l.code === 'changana') || SUPPORTED_LANGUAGES[4]
  );
  
  // Quiz State
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  // Update lessons when language changes
  useEffect(() => {
    const currentLessons = MOCK_LESSONS_DATA[language] || MOCK_LESSONS_DATA['en'];
    setLessons(currentLessons);
  }, [language]);

  const startLesson = async (lesson: Lesson) => {
    setActiveLesson(lesson);
    setMode('loading');
    
    // Generate quiz questions passing the interface language and selected target language
    const qs = await generateQuiz(lesson.title, targetLessonLang.name, language);
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
      <div className="h-full flex flex-col items-center justify-center bg-afri-warm/30 p-8 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-afri-primary/20 rounded-full animate-ping scale-150"></div>
          <div className="relative w-20 h-20 bg-afri-primary rounded-3xl flex items-center justify-center shadow-glow rotate-6">
            <Loader2 size={40} className="text-white animate-spin" />
          </div>
        </div>
        <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
          {language === 'pt' ? 'Criando Lição...' : 'Creating Lesson...'}
        </h3>
        <p className="text-gray-500 font-medium max-w-xs mx-auto">
           {language === 'pt' 
             ? `A IA está preparando perguntas de ${targetLessonLang.name} sobre "${activeLesson?.title}".` 
             : `AI is preparing ${targetLessonLang.name} questions for "${activeLesson?.title}".`}
        </p>
      </div>
    );
  }

  // 2. Quiz State
  if (mode === 'quiz' && activeLesson) {
    const currentQ = questions[currentQIndex];
    const isCorrect = selectedOption === currentQ.correctIndex;

    return (
      <div className="h-full flex flex-col bg-white overflow-hidden md:rounded-t-[3rem] shadow-heavy border-x border-gray-100 max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="w-full h-3 bg-gray-100">
          <div 
            className="h-full bg-gradient-to-r from-afri-primary to-afri-accent transition-all duration-700 ease-out shadow-glow" 
            style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col w-full no-scrollbar">
           <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-afri-warm rounded-xl flex items-center justify-center text-xl shadow-inner border border-afri-primary/10">
                  {targetLessonLang.flag}
                </div>
                <div>
                  <p className="text-[10px] font-black text-afri-primary uppercase tracking-widest leading-none mb-1">
                    {activeLesson.title}
                  </p>
                  <p className="text-sm font-bold text-gray-900 leading-none">{targetLessonLang.name}</p>
                </div>
              </div>
              <button 
                onClick={reset} 
                className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 transition-all active:scale-90"
              >
                <span className="text-2xl leading-none">×</span>
              </button>
           </div>
           
           <div className="mb-10">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 block">Question {currentQIndex + 1} of {questions.length}</span>
             <h2 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight tracking-tighter">
               {currentQ.question}
             </h2>
           </div>

           <div className="space-y-4 flex-1">
             {currentQ.options.map((opt, idx) => {
               let btnClass = "w-full p-6 rounded-[2rem] border-2 text-left font-bold transition-all relative flex items-center gap-4 group ";
               
               if (isAnswered) {
                 if (idx === currentQ.correctIndex) {
                    btnClass += "bg-green-50 border-green-500 text-green-700 shadow-md"; // Correct
                 } else if (idx === selectedOption) {
                    btnClass += "bg-red-50 border-red-500 text-red-500 shadow-md"; // Wrong
                 } else {
                    btnClass += "bg-gray-50 border-gray-100 text-gray-400 opacity-50"; // Others
                 }
               } else {
                 btnClass += selectedOption === idx 
                   ? "border-afri-primary bg-afri-warm text-afri-primary shadow-lg -translate-y-1"
                   : "border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200 text-gray-700 hover:-translate-y-0.5 shadow-soft";
               }

               return (
                 <button 
                   key={idx} 
                   onClick={() => handleAnswer(idx)}
                   disabled={isAnswered}
                   className={btnClass}
                 >
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-colors ${
                     isAnswered 
                       ? (idx === currentQ.correctIndex ? 'bg-green-500 text-white' : idx === selectedOption ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400')
                       : (selectedOption === idx ? 'bg-afri-primary text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600')
                   }`}>
                     {String.fromCharCode(65 + idx)}
                   </div>
                   <span className="flex-1 text-lg tracking-tight">{opt}</span>
                   {isAnswered && idx === currentQ.correctIndex && (
                     <CheckCircle size={24} className="text-green-600" />
                   )}
                   {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                     <XCircle size={24} className="text-red-500" />
                   )}
                 </button>
               );
             })}
           </div>
        </div>

        {/* Bottom Feedback Sheet */}
        <div className={`p-8 border-t backdrop-blur-xl transition-colors duration-500 ${
          isAnswered 
            ? (isCorrect ? 'bg-green-50/90 border-green-200' : 'bg-red-50/90 border-red-200') 
            : 'bg-white/90 border-gray-100'
        }`}>
           <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              {isAnswered ? (
                <div className="flex-1 text-center md:text-left">
                   <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                       {isCorrect ? <CheckCircle size={24}/> : <XCircle size={24}/>}
                     </div>
                     <span className={`text-xl font-black uppercase tracking-widest ${isCorrect ? 'text-green-700' : 'text-red-600'}`}>
                       {isCorrect ? (language === 'pt' ? 'Excelente!' : 'Excellent!') : (language === 'pt' ? 'Ops! Quase lá' : 'Oops! Almost')}
                     </span>
                   </div>
                   <p className="text-gray-600 font-medium leading-tight">{currentQ.explanation}</p>
                </div>
              ) : (
                <div className="flex-1 hidden md:block">
                  <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Select an answer to continue</p>
                </div>
              )}

              <button 
                onClick={isAnswered ? nextQuestion : undefined}
                disabled={!isAnswered}
                className={`px-12 py-5 rounded-2xl font-black text-white shadow-heavy transition-all active:scale-95 flex items-center justify-center gap-3 w-full md:w-auto ${
                  isAnswered 
                    ? (isCorrect ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600') 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>{isAnswered ? (language === 'pt' ? 'Continuar' : 'Continue') : (language === 'pt' ? 'Verificar' : 'Check')}</span>
                <ArrowRight size={22} className={isAnswered ? "animate-bounce-x" : ""} />
              </button>
           </div>
        </div>
      </div>
    );
  }

  // 3. Completed State
  if (mode === 'completed' && activeLesson) {
     return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-afri-warm to-orange-100 p-8 text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-pulse scale-150"></div>
          <div className="relative w-40 h-40 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-5xl flex items-center justify-center text-white shadow-heavy mb-6 animate-float rotate-6 border-4 border-white">
            <Trophy size={80} />
          </div>
        </div>
        
        <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-3 tracking-tighter">
          {language === 'pt' ? 'Lição Completa!' : 'Lesson Complete!'}
        </h2>
        <p className="text-gray-500 font-bold text-xl mb-12 tracking-tight">
          {language === 'pt' ? 'Você dominou a lição' : 'You mastered the lesson'} <span className="text-afri-primary">"{activeLesson.title}"</span>
        </p>
        
        <div className="grid grid-cols-2 gap-6 w-full max-w-md mb-12">
           <div className="bg-white p-8 rounded-[2.5rem] shadow-heavy border border-white">
             <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">{language === 'pt' ? 'Acertos' : 'Score'}</p>
             <p className="text-4xl font-black text-green-600 tracking-tighter">{score}/{questions.length}</p>
           </div>
           <div className="bg-white p-8 rounded-[2.5rem] shadow-heavy border border-white">
             <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">{language === 'pt' ? 'XP Ganho' : 'XP Earned'}</p>
             <p className="text-4xl font-black text-afri-primary tracking-tighter">+{activeLesson.xp}</p>
           </div>
        </div>

        <button 
          onClick={reset}
          className="bg-gray-900 text-white px-12 py-5 rounded-2xl font-black text-lg shadow-heavy hover:bg-afri-primary hover:scale-105 transition-all active:scale-95"
        >
          {language === 'pt' ? 'Voltar ao Menu' : 'Back to Menu'}
        </button>
      </div>
    );
  }

  // 4. List View (Default)
  return (
    <div className="h-full bg-afri-warm/20 overflow-y-auto p-4 md:p-10 relative no-scrollbar">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Stats */}
        <header className="mb-12 flex flex-col md:flex-row gap-6 md:items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-soft border border-white">
          <div className="flex items-center gap-5">
             <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90 text-gray-100" viewBox="0 0 36 36">
                  <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path className="text-afri-primary" strokeDasharray="70, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <div className="absolute flex flex-col items-center leading-none">
                  <span className="text-lg font-black text-gray-900">5</span>
                  <span className="text-[8px] font-black text-gray-400 uppercase">{t('nav.days')}</span>
                </div>
             </div>
             <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('learn.streak')}</p>
               <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t('learn.fire')} 🔥</h2>
             </div>
          </div>

          {/* Target Language Selector for Learn Mode */}
          <div className="flex items-center gap-4 bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100 shadow-inner">
             <div className="w-10 h-10 bg-afri-primary/10 rounded-xl flex items-center justify-center text-afri-primary">
               <BookOpen size={22} />
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">{language === 'pt' ? 'Aprender' : 'Learning'}</span>
                <select 
                  value={targetLessonLang.code}
                  onChange={(e) => setTargetLessonLang(SUPPORTED_LANGUAGES.find(l => l.code === e.target.value) || targetLessonLang)}
                  className="bg-transparent font-black text-gray-900 text-lg outline-none cursor-pointer appearance-none pr-6 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_center] bg-no-repeat"
                >
                  {SUPPORTED_LANGUAGES.filter(l => l.code !== language).map(l => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
             </div>
          </div>
        </header>

        <div className="mb-8 px-2 flex items-center justify-between">
          <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{t('learn.current_path')}</h3>
          <span className="text-xs font-bold text-afri-primary bg-afri-warm px-3 py-1 rounded-full border border-afri-primary/10">Level 12</span>
        </div>

        <div className="space-y-8 pb-40">
          {lessons.map((lesson, index) => (
            <div 
              key={lesson.id} 
              onClick={() => startLesson(lesson)}
              className="bg-white rounded-[2.5rem] p-8 shadow-soft border-2 border-transparent hover:border-afri-primary transition-all cursor-pointer group relative overflow-hidden hover:shadow-heavy hover:-translate-y-1"
            >
               {index !== lessons.length - 1 && (
                <div className="absolute left-1/2 bottom-0 w-1 h-12 bg-gray-100 translate-y-full z-0"></div>
              )}

              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border ${
                  lesson.level === 'Beginner' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                }`}>
                  {lesson.level}
                </span>
                <div className="flex items-center gap-1.5 text-afri-primary font-black text-sm">
                  <span>+{lesson.xp}</span>
                  <Trophy size={14} />
                </div>
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight relative z-10 group-hover:text-afri-primary transition-colors">{lesson.title}</h3>
              <p className="text-gray-500 font-medium mb-8 relative z-10 text-base leading-tight max-w-lg">{lesson.description}</p>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner p-0.5">
                  <div className="bg-gradient-to-r from-afri-primary to-afri-accent h-full rounded-full w-1/3 shadow-sm"></div>
                </div>
                <span className="text-xs font-black text-gray-400">33%</span>
              </div>

              <div className="absolute -bottom-6 -right-6 text-[10rem] opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 rotate-12 select-none grayscale group-hover:grayscale-0 group-hover:scale-110">
                {index === 0 ? '👋' : index === 1 ? '🍎' : '👪'}
              </div>
              
              <div className="mt-8 flex justify-end relative z-10">
                <button className="bg-gray-900 text-white px-8 py-3 rounded-2xl text-sm font-black shadow-heavy active:scale-95 transition-all group-hover:bg-afri-primary flex items-center gap-2">
                  <span>{t('learn.start_lesson')}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}

          <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white text-center shadow-heavy mt-12 relative overflow-hidden group">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner border border-white/10 group-hover:scale-110 transition-transform">🏆</div>
            <h3 className="text-2xl font-black mb-3 tracking-tight">{t('learn.challenge_title')}</h3>
            <p className="text-gray-400 font-medium mb-8 text-base max-w-md mx-auto">{t('learn.challenge_desc')}</p>
            <button className="bg-afri-primary text-white px-10 py-4 rounded-2xl font-black text-sm shadow-glow hover:scale-105 transition-all active:scale-95">
              Unlock Challenge
            </button>
          </div>
          
          <div className="mt-10">
            <AdBanner slotId={AD_CONFIG.SLOTS.LEARN_FEED} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnView;