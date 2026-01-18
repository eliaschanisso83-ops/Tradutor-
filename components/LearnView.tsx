import React from 'react';
import { MOCK_LESSONS } from '../constants';

const LearnView: React.FC = () => {
  return (
    <div className="h-full bg-gray-50 overflow-y-auto p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">My Learning</h2>
            <p className="text-gray-500">Keep up the streak! 🔥 5 Days</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-yellow-100 flex items-center gap-2">
            <span>💎</span> <span className="font-bold text-yellow-600">450 XP</span>
          </div>
        </header>

        <div className="space-y-6">
          {MOCK_LESSONS.map((lesson) => (
            <div 
              key={lesson.id} 
              className="bg-white rounded-2xl p-6 shadow-sm border-2 border-transparent hover:border-afri-primary transition-colors cursor-pointer group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-2 relative z-10">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                  lesson.level === 'Beginner' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {lesson.level}
                </span>
                <span className="text-sm font-bold text-gray-400">+{lesson.xp} XP</span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-1 relative z-10">{lesson.title}</h3>
              <p className="text-gray-500 mb-4 relative z-10">{lesson.description}</p>
              
              <div className="w-full bg-gray-100 rounded-full h-2 relative z-10">
                <div className="bg-afri-primary h-2 rounded-full w-1/3"></div>
              </div>

              {/* Decoration */}
              <div className="absolute -bottom-4 -right-4 text-9xl opacity-5 group-hover:opacity-10 transition-opacity rotate-12 select-none">
                📚
              </div>
            </div>
          ))}

          <div className="bg-gradient-to-r from-afri-dark to-gray-800 rounded-2xl p-6 text-white text-center shadow-lg mt-8">
            <h3 className="text-xl font-bold mb-2">Weekly Challenge 🏆</h3>
            <p className="text-gray-300 mb-4">Complete 3 conversation modules to unlock the "Polyglot" badge.</p>
            <button className="bg-white text-afri-dark px-6 py-2 rounded-full font-bold hover:bg-gray-100">
              Start Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnView;