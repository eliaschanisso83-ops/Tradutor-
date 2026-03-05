import React from 'react';
import { ViewState } from '../types';
import { MessageCircle, GraduationCap, Languages, Map, Users, Globe, Mic } from 'lucide-react';
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
    { id: 'game', label: t('nav.game'), icon: Mic },
  ];

  return (
    <>
      {/* Mobile Floating Dock */}
      <nav className="fixed bottom-4 left-2 right-2 h-16 glass rounded-2xl shadow-heavy flex items-center justify-around px-1 z-50 md:hidden animate-in slide-in-from-bottom-10 duration-500 border border-white/40">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`flex flex-col items-center justify-center w-11 h-11 rounded-xl transition-all duration-300 relative ${
                isActive 
                  ? 'text-white -translate-y-4 bg-afri-primary shadow-glow scale-110 ring-2 ring-white' 
                  : 'text-gray-400 hover:text-afri-primary'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <span className="absolute -bottom-5 text-[9px] font-bold text-afri-primary tracking-tight animate-in fade-in slide-in-from-top-2 duration-300 whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-72 h-screen glass border-r border-white/40 relative z-50 overflow-hidden">
        {/* Sidebar Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        
        <div className="p-8 h-full flex flex-col relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="p-2.5 bg-gradient-to-br from-afri-primary to-afri-accent rounded-2xl shadow-glow rotate-3">
              <Globe size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-gray-900 leading-none">AfriLingo</h1>
              <p className="text-[10px] font-bold text-afri-primary uppercase tracking-widest mt-1">AI Language Hub</p>
            </div>
          </div>
          
          <div className="space-y-3 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id as ViewState)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                    isActive 
                      ? 'bg-gray-900 text-white shadow-heavy' 
                      : 'text-gray-500 hover:bg-white/50 hover:text-afri-primary'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-afri-primary" />
                  )}
                  <Icon size={22} className={isActive ? 'text-afri-primary' : 'text-gray-400 group-hover:text-afri-primary transition-colors'} />
                  <span className="font-bold text-base tracking-tight">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto">
                      <div className="w-1.5 h-1.5 bg-afri-primary rounded-full animate-pulse" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* User Profile Button Desktop */}
          <div className="mt-auto pt-6 border-t border-gray-100/50">
            <button 
              onClick={() => setProfileOpen(true)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/40 hover:bg-white shadow-sm transition-all border border-white/50 group"
            >
              <div className="w-12 h-12 bg-gradient-to-tr from-afri-warm to-white rounded-xl flex items-center justify-center text-2xl shadow-inner border border-afri-primary/10 group-hover:scale-105 transition-transform">
                {user?.avatar || '🦁'}
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900 truncate">{user?.username}</p>
                <p className="text-[10px] font-bold text-afri-primary uppercase tracking-wider">Account Settings</p>
              </div>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
