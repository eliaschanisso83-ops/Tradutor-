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
    <div className="h-full bg-afri-subtle overflow-y-auto p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{t('tourist.title')} 🧭</h2>
          <p className="text-gray-600 mb-4">{t('tourist.subtitle')}</p>
          
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <span className="text-gray-500 text-sm font-medium">{t('tourist.translating_to')}</span>
            <select 
              value={targetLang.code}
              onChange={(e) => {
                setTargetLang(SUPPORTED_LANGUAGES.find(l => l.code === e.target.value) || targetLang);
                setTranslations({}); // Clear cache on language change
              }}
              className="bg-transparent font-bold text-afri-primary outline-none cursor-pointer"
            >
              {/* Filter out current app language from target options */}
              {SUPPORTED_LANGUAGES.filter(l => l.code !== language).map(l => (
                <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
              ))}
            </select>
          </div>
        </header>

        <div className="space-y-4">
          {phrases.map((category) => (
            <div key={category.category} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <button 
                onClick={() => setExpandedCategory(expandedCategory === category.category ? null : category.category)}
                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <h3 className="font-bold text-lg text-gray-800">{category.category}</h3>
                <span className={`transform transition-transform ${expandedCategory === category.category ? 'rotate-180' : ''}`}>▼</span>
              </button>
              
              {expandedCategory === category.category && (
                <div className="p-2">
                  {category.phrases.map((phrase, idx) => {
                    const cacheKey = `${phrase.original}-${targetLang.code}`;
                    const translation = translations[cacheKey];

                    return (
                      <div key={idx} className="p-3 border-b last:border-0 border-gray-100 hover:bg-orange-50 rounded-lg transition-colors group">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium text-gray-800">{phrase.original}</p>
                          <button 
                            className="text-afri-primary opacity-0 group-hover:opacity-100 transition-opacity"
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
                          <p className="text-afri-secondary font-bold text-lg">{translation}</p>
                        ) : loadingPhrase === phrase.original ? (
                          <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
                        ) : (
                          <button 
                            onClick={() => getTranslation(phrase.original)}
                            className="text-sm text-afri-primary underline decoration-dotted font-medium"
                          >
                            {t('tourist.tap_translate')}
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
        
        {/* Spacer for Mobile Dock */}
        <div className="h-28 md:h-0"></div>
      </div>
    </div>
  );
};

export default TouristView;