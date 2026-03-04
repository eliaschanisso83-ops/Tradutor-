import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import TranslationView from './components/TranslationView';
import TutorView from './components/TutorView';
import LearnView from './components/LearnView';
import TouristView from './components/TouristView';
import CommunityView from './components/CommunityView';
import PronunciationGameView from './components/PronunciationGameView';
import ProfileDialog from './components/ProfileDialog';
import PrivacyPolicy from './components/PrivacyPolicy';
import DataDeletion from './components/DataDeletion';
import { ViewState } from './types';
import { Globe } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { UserProvider, useUser } from './contexts/UserContext';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('translate');
  const [route, setRoute] = useState<string>('/');
  const { language, setLanguage } = useLanguage();
  const { user, setProfileOpen } = useUser();

  // Simple routing check
  useEffect(() => {
    const path = window.location.pathname;
    setRoute(path);
  }, []);

  if (route === '/privacy') {
    return <PrivacyPolicy />;
  }

  if (route === '/data-deletion') {
    return <DataDeletion />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'translate': return <TranslationView />;
      case 'tutor': return <TutorView />;
      case 'learn': return <LearnView />;
      case 'tourist': return <TouristView />;
      case 'community': return <CommunityView />;
      case 'game': return <PronunciationGameView />;
      default: return <TranslationView />;
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'pt' : 'en');
  };

  return (
    <div className="flex h-screen w-screen bg-gradient-animate relative overflow-hidden">
      <div className="bg-pattern" />
      
      <Navigation currentView={currentView} setView={setCurrentView} />
      <ProfileDialog />

      <main className="flex-1 relative h-full w-full flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden pt-safe-top px-6 py-4 flex items-center justify-between z-20 glass-dark text-white shadow-lg">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-afri-primary rounded-lg shadow-glow">
              <Globe size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">AfriLingo</h1>
          </div>
          
          <div className="flex items-center gap-3">
             {/* Mobile User Profile Button */}
             <button 
               onClick={() => setProfileOpen(true)}
               className="w-10 h-10 bg-afri-primary/20 border border-white/20 rounded-full flex items-center justify-center text-sm shadow-inner backdrop-blur-md transition-transform active:scale-90"
             >
               <span className="text-lg">{user?.avatar || '🦁'}</span>
             </button>
          </div>
        </div>

        {/* View Container */}
        <div className="flex-1 w-full relative overflow-y-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <UserProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </UserProvider>
  );
};

export default App;