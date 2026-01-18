import React, { useState } from 'react';
import Navigation from './components/Navigation';
import TranslationView from './components/TranslationView';
import TutorView from './components/TutorView';
import LearnView from './components/LearnView';
import TouristView from './components/TouristView';
import CommunityView from './components/CommunityView';
import { ViewState } from './types';
import { Globe } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('translate');

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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-animate">
      
      <Navigation currentView={currentView} setView={setCurrentView} />

      <main className="flex-1 relative h-full w-full overflow-hidden flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden pt-safe-top px-6 py-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2 text-afri-primary">
            <Globe size={24} />
            <h1 className="text-xl font-extrabold tracking-tight text-gray-800">AfriLingo</h1>
          </div>
          <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-afri-primary font-bold shadow-sm border border-orange-200">
            JS
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;