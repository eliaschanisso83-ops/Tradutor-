import React from 'react';
import { ViewState } from '../types';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems: { id: ViewState; label: string; icon: string }[] = [
    { id: 'translate', label: 'Translate', icon: '🗣️' },
    { id: 'learn', label: 'Learn', icon: '🎓' },
    { id: 'tutor', label: 'Tutor AI', icon: '🤖' },
    { id: 'tourist', label: 'Tourist', icon: '🌍' },
    { id: 'community', label: 'Community', icon: '🤝' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 pb-safe z-50 md:relative md:w-64 md:h-screen md:border-r md:border-t-0 md:flex md:flex-col md:justify-start">
      <div className="md:p-6 md:mb-6 hidden md:block">
        <h1 className="text-2xl font-bold text-afri-primary flex items-center gap-2">
          <span>🦁</span> AfriLingo
        </h1>
      </div>
      
      <div className="flex justify-around items-center h-16 md:flex-col md:h-auto md:items-start md:space-y-2 md:px-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex flex-col md:flex-row md:w-full md:px-4 md:py-3 md:rounded-xl items-center md:gap-3 justify-center w-full h-full transition-colors ${
              currentView === item.id
                ? 'text-afri-primary md:bg-orange-50 font-semibold'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="text-xl md:text-lg">{item.icon}</span>
            <span className="text-[10px] md:text-base mt-1 md:mt-0">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;