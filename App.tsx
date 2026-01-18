import React, { useState } from 'react';
import Navigation from './components/Navigation';
import TranslationView from './components/TranslationView';
import TutorView from './components/TutorView';
import LearnView from './components/LearnView';
import TouristView from './components/TouristView';
import CommunityView from './components/CommunityView';
import ProfileDialog from './components/ProfileDialog';
import { ViewState } from './types';
import { Globe } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { UserProvider, useUser } from './contexts/UserContext';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('translate');
  const { language, setLanguage } = useLanguage();
  const { user, setProfileOpen } = useUser();

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

            <button 
              onClick={toggleLanguage}
              className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm border border-gray-200"
            >
              {language === 'en' ? '🇺🇸' : '🇵🇹'}
            </button>
          </div>
        </div>

        {/* Desktop Language Toggle */}
        <div className="hidden md:block absolute top-6 right-8 z-50">
           <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span>{language === 'en' ? '🇺🇸 English' : '🇵🇹 Português'}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
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