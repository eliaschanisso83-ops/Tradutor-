import React from 'react';
import { ViewState } from '../types';
import { MessageCircle, GraduationCap, Languages, Map, Users, Globe, UserCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const { t } = useLanguage();
  const { user, setProfileOpen } = useUser();

  const navItems = [
    { id: 'translate', label: t('nav.translate'), icon: Languages },
    { id: 'learn', label: t('nav.learn'), icon: GraduationCap },
    { id: 'tutor', label: t('nav.tutor'), icon: MessageCircle },
    { id: 'tourist', label: t('nav.tourist'), icon: Map },
    { id: 'community', label: t('nav.community'), icon: Users },
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
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center gap-3 text-afri-primary mb-10">
            <div className="p-2 bg-orange-100 rounded-xl">
              <Globe size={28} />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-800">AfriLingo</h1>
          </div>
          
          <div className="space-y-2 flex-1">
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

          {/* User Profile Button Desktop */}
          <div className="mt-auto pt-6 border-t border-gray-100">
            <button 
              onClick={() => setProfileOpen(true)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-lg shadow-inner">
                {user?.avatar || '🦁'}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-800 truncate w-32">{user?.username}</p>
                <p className="text-xs text-gray-500">View Profile</p>
              </div>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
