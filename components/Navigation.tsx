import React from 'react';
import { ViewState } from '../types';
import { MessageCircle, GraduationCap, Languages, Map, Users, Globe } from 'lucide-react';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'translate', label: 'Translate', icon: Languages },
    { id: 'learn', label: 'Learn', icon: GraduationCap },
    { id: 'tutor', label: 'Tutor', icon: MessageCircle },
    { id: 'tourist', label: 'Tourist', icon: Map },
    { id: 'community', label: 'Club', icon: Users },
  ];

  return (
    <>
      {/* Mobile Floating Dock */}
      <nav className="fixed bottom-6 left-4 right-4 h-20 glass rounded-3xl shadow-soft flex items-center justify-around px-2 z-50 md:hidden animate-in slide-in-from-bottom-10 duration-500">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 relative ${
                isActive ? 'text-afri-primary -translate-y-4 bg-white shadow-lg scale-110 ring-4 ring-white' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <span className="absolute -bottom-6 text-[10px] font-bold text-gray-600 tracking-wide opacity-0 animate-in fade-in duration-300 fill-mode-forwards">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-72 h-screen glass border-r border-gray-100 relative z-50">
        <div className="p-8">
          <div className="flex items-center gap-3 text-afri-primary mb-10">
            <div className="p-2 bg-orange-100 rounded-xl">
              <Globe size={28} />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-800">AfriLingo</h1>
          </div>
          
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id as ViewState)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-afri-primary text-white shadow-lg shadow-orange-200' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={22} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-afri-primary'} />
                  <span className="font-semibold text-lg">{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="mt-auto p-8">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
            <p className="text-sm text-gray-300 font-medium mb-1">Weekly Goal</p>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold">4/7</span>
              <span className="text-sm text-gray-400 mb-1">days</span>
            </div>
            <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-afri-primary w-[60%] h-full rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;