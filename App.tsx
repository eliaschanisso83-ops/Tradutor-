import React, { useState } from 'react';
import Navigation from './components/Navigation';
import TranslationView from './components/TranslationView';
import TutorView from './components/TutorView';
import LearnView from './components/LearnView';
import TouristView from './components/TouristView';
import CommunityView from './components/CommunityView';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('translate');

  const renderView = () => {
    switch (currentView) {
      case 'translate':
        return <TranslationView />;
      case 'tutor':
        return <TutorView />;
      case 'learn':
        return <LearnView />;
      case 'tourist':
        return <TouristView />;
      case 'community':
        return <CommunityView />;
      default:
        return <TranslationView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Sidebar / Bottom Nav */}
      <Navigation currentView={currentView} setView={setCurrentView} />

      {/* Main Content Area */}
      <main className="flex-1 relative h-full w-full pb-20 md:pb-0 overflow-hidden">
        {/* Top Header (Mobile only, Desktop header is in sidebar) */}
        <div className="md:hidden p-4 bg-white border-b flex items-center justify-between sticky top-0 z-20">
          <h1 className="text-xl font-bold text-afri-primary flex items-center gap-2">
            🦁 AfriLingo
          </h1>
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
            JS
          </div>
        </div>

        {renderView()}
      </main>
    </div>
  );
};

export default App;