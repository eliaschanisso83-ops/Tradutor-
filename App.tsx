import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import TranslationView from './components/TranslationView';
import TutorView from './components/TutorView';
import LearnView from './components/LearnView';
import TouristView from './components/TouristView';
import CommunityView from './components/CommunityView';
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
      default: return <TranslationView />;
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'pt' : 'en');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-animate">
      
      <Navigation currentView={currentView} setView={setCurrentView} />
      <ProfileDialog />

      <main className="flex-1 relative h-full w-full overflow-hidden flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden pt-safe-top px-6 py-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2 text-afri-primary">
            <Globe size={24} />
            <h1 className="text-xl font-extrabold tracking-tight text-gray-800">AfriLingo</h1>
          </div>
          
          <div className="flex items-center gap-3">
             {/* Mobile User Profile Button */}
             <button 
               onClick={() => setProfileOpen(true)}
               className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-sm shadow-sm border border-white"
             >
               {user?.avatar || '🦁'}
             </button>
          </div>
        </div>

        {/* View Container - Removed overflow-y-auto here so individual views control their scrolling */}
        <div className="flex-1 w-full h-full relative">
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