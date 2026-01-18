import React, { useState } from 'react';
import { MOCK_LESSONS } from '../constants';
import { Lesson } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const LearnView: React.FC = () => {
  const { t } = useLanguage();
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const startLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
  };

  const closeLesson = () => {
    setActiveLesson(null);
  };

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

        {/* Increased bottom padding to pb-32 for mobile dock clearance */}
        <div className="space-y-6 pb-32">
          {MOCK_LESSONS.map((lesson, index) => (
            <div 
              key={lesson.id} 
              onClick={() => startLesson(lesson)}
              className="bg-white rounded-3xl p-6 shadow-sm border-2 border-transparent hover:border-afri-primary transition-all cursor-pointer group relative overflow-hidden transform hover:-translate-y-1"
            >
              {/* Connector Line (visual only) */}
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

              {/* Decoration */}
              <div className="absolute -bottom-2 -right-2 text-8xl opacity-5 group-hover:opacity-10 transition-opacity rotate-12 select-none grayscale group-hover:grayscale-0">
                {index === 0 ? '👋' : index === 1 ? '🍎' : '👪'}
              </div>
            </div>
          ))}

          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-6 text-white text-center shadow-lg mt-8 transform hover:scale-[1.02] transition-transform cursor-pointer">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">🏆</div>
            <h3 className="text-xl font-bold mb-2">{t('learn.challenge_title')}</h3>
            <p className="text-gray-300 mb-4 text-sm">{t('learn.challenge_desc')}</p>
            <button className="bg-white text-gray-900 px-8 py-2.5 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg">
              {t('learn.view_details')}
            </button>
          </div>
        </div>
      </div>

      {/* Lesson Modal */}
      {activeLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeLesson}></div>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative z-10 shadow-2xl animate-blob">
            <button onClick={closeLesson} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                📝
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{activeLesson.title}</h3>
              <p className="text-gray-500 mb-6">{activeLesson.description}</p>
              
              <div className="space-y-3">
                <button className="w-full bg-afri-primary text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg">
                  {t('learn.start_lesson')} (+{activeLesson.xp} XP)
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                  {t('learn.view_phrases')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnView;