import React, { useState, useEffect } from 'react';
import { TOURIST_PHRASES_DATA, SUPPORTED_LANGUAGES } from '../constants';
import { translateText } from '../services/geminiService';
import { Language, TouristPhrase } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const TouristView: React.FC = () => {
  const { t, language } = useLanguage();
  const [targetLang, setTargetLang] = useState<Language>(SUPPORTED_LANGUAGES.find(l => l.code === 'swahili') || SUPPORTED_LANGUAGES[5]);
  const [phrases, setPhrases] = useState<TouristPhrase[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loadingPhrase, setLoadingPhrase] = useState<string | null>(null);

  // Load phrases based on interface language
  useEffect(() => {
    const currentPhrases = TOURIST_PHRASES_DATA[language] || TOURIST_PHRASES_DATA['en'];
    setPhrases(currentPhrases);
    // Set first category expanded by default
    setExpandedCategory(currentPhrases[0].category);
  }, [language]);

  const getTranslation = async (text: string) => {
    // Check cache first
    const key = `${text}-${targetLang.code}`;
    if (translations[key]) return;

    setLoadingPhrase(text);
    // Source language matches interface language (e.g. Portuguese -> Swahili)
    const sourceLangName = language === 'pt' ? 'Portuguese' : 'English';
    const result = await translateText(text, sourceLangName, targetLang.name);
    setTranslations(prev => ({ ...prev, [key]: result.translated }));
    setLoadingPhrase(null);
  };

  return (
    <div className="bg-afri-warm/20 p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-afri-primary rounded-2xl flex items-center justify-center text-3xl shadow-glow rotate-3">
              🧭
            </div>
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter leading-none">{t('tourist.title')}</h2>
              <p className="text-gray-500 font-bold text-lg tracking-tight">{t('tourist.subtitle')}</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-soft border border-white">
            <div className="flex items-center gap-3 text-gray-400 font-black text-[10px] uppercase tracking-widest">
              <span className="w-2 h-2 bg-afri-primary rounded-full animate-pulse"></span>
              {t('tourist.translating_to')}
            </div>
            <div className="flex-1 relative">
              <select 
                value={targetLang.code}
                onChange={(e) => {
                  setTargetLang(SUPPORTED_LANGUAGES.find(l => l.code === e.target.value) || targetLang);
                  setTranslations({}); // Clear cache on language change
                }}
                className="w-full bg-gray-50 px-6 py-4 rounded-2xl font-black text-gray-900 text-lg outline-none cursor-pointer appearance-none border border-gray-100 shadow-inner pr-12 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_1.5rem_center] bg-no-repeat"
              >
                {/* Filter out current app language from target options */}
                {SUPPORTED_LANGUAGES.filter(l => l.code !== language).map(l => (
                  <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <div className="space-y-6 pb-40">
          {phrases.map((category) => (
            <div key={category.category} className="bg-white rounded-[2.5rem] overflow-hidden shadow-soft border border-white transition-all duration-500">
              <button 
                onClick={() => setExpandedCategory(expandedCategory === category.category ? null : category.category)}
                className={`w-full px-8 py-6 flex justify-between items-center transition-all duration-300 ${
                  expandedCategory === category.category ? 'bg-afri-primary text-white shadow-lg' : 'bg-white text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-colors ${
                    expandedCategory === category.category ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    {category.category === 'General' ? '🌍' : category.category === 'Dining' ? '🥘' : category.category === 'Transport' ? '🚕' : '🛍️'}
                  </div>
                  <h3 className="font-black text-xl tracking-tight">{category.category}</h3>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                  expandedCategory === category.category ? 'bg-white/20 rotate-180' : 'bg-gray-100'
                }`}>
                  <span className="text-xs">▼</span>
                </div>
              </button>
              
              {expandedCategory === category.category && (
                <div className="p-4 space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
                  {category.phrases.map((phrase, idx) => {
                    const cacheKey = `${phrase.original}-${targetLang.code}`;
                    const translation = translations[cacheKey];

                    return (
                      <div key={idx} className="p-6 rounded-3xl transition-all duration-300 group hover:bg-afri-warm/50 border border-transparent hover:border-afri-primary/10">
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <p className="font-bold text-gray-500 text-sm uppercase tracking-widest">{phrase.original}</p>
                          <button 
                            className="w-10 h-10 bg-white rounded-xl shadow-soft flex items-center justify-center text-afri-primary hover:bg-afri-primary hover:text-white transition-all active:scale-90 border border-gray-100"
                            onClick={() => {
                                // Speak logic (using generic web speech for demo)
                                const u = new SpeechSynthesisUtterance(translation || phrase.original);
                                speechSynthesis.speak(u);
                            }}
                          >
                            🔊
                          </button>
                        </div>
                        
                        {translation ? (
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-afri-primary rounded-full"></div>
                            <p className="text-gray-900 font-black text-2xl tracking-tighter">{translation}</p>
                          </div>
                        ) : loadingPhrase === phrase.original ? (
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="h-8 w-48 bg-gray-100 animate-pulse rounded-xl"></div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => getTranslation(phrase.original)}
                            className="flex items-center gap-2 text-afri-primary font-black text-sm group/btn"
                          >
                            <span className="underline decoration-afri-primary/30 underline-offset-4 group-hover/btn:decoration-afri-primary transition-all">
                              {t('tourist.tap_translate')}
                            </span>
                            <span className="text-xs opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all">→</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TouristView;