import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ThumbsUp, ThumbsDown, Plus, CheckCircle2, User, Activity, Send } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../constants';

type Tab = 'feed' | 'verify' | 'contribute';

interface FeedItem {
  id: string;
  user: string;
  action: 'verified' | 'added';
  content: string;
  lang: string;
  time: string;
}

interface VerifyItem {
  id: string;
  original: string;
  translated: string;
  lang: string;
}

const MOCK_FEED: FeedItem[] = [
  { id: '1', user: 'Maria S.', action: 'verified', content: 'Maningue Nice', lang: 'Changana', time: '2m' },
  { id: '2', user: 'Joao P.', action: 'added', content: 'Bom dia (Mwauka bwanji)', lang: 'Sena', time: '15m' },
  { id: '3', user: 'Sarah K.', action: 'verified', content: 'Asante Sana', lang: 'Swahili', time: '1h' },
];

const MOCK_VERIFY: VerifyItem[] = [
  { id: '1', original: 'How are you?', translated: 'Oambe?', lang: 'Ndau' },
  { id: '2', original: 'Thank you', translated: 'Kanimambo', lang: 'Changana' },
  { id: '3', original: 'Water', translated: 'Madji', lang: 'Sena' },
];

const CommunityView: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [feed, setFeed] = useState<FeedItem[]>(MOCK_FEED);
  
  // Verify State
  const [verifyIndex, setVerifyIndex] = useState(0);
  const [verifyStreak, setVerifyStreak] = useState(0);

  // Contribute State
  const [newWord, setNewWord] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [selectedLang, setSelectedLang] = useState('changana');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleVote = (vote: boolean) => {
    // Simulate API call and move to next
    if (vote) setVerifyStreak(prev => prev + 1);
    else setVerifyStreak(0);

    // Add to feed locally
    const newItem: FeedItem = {
      id: Date.now().toString(),
      user: 'You',
      action: 'verified',
      content: MOCK_VERIFY[verifyIndex % MOCK_VERIFY.length].translated,
      lang: MOCK_VERIFY[verifyIndex % MOCK_VERIFY.length].lang,
      time: 'Now'
    };
    setFeed([newItem, ...feed]);
    setVerifyIndex(prev => prev + 1);
  };

  const handleSubmit = () => {
    if (!newWord || !newTranslation) return;
    
    // Add to feed locally
    const newItem: FeedItem = {
      id: Date.now().toString(),
      user: 'You',
      action: 'added',
      content: newWord,
      lang: SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.name || 'Unknown',
      time: 'Now'
    };
    setFeed([newItem, ...feed]);
    
    // Reset form
    setNewWord('');
    setNewTranslation('');
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setActiveTab('feed');
    }, 2000);
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'feed':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
             {feed.map((item) => (
               <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-3">
                  <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${item.action === 'verified' ? 'bg-green-500' : 'bg-afri-primary'}`}>
                    {item.user.charAt(0)}
                  </div>
                  <div>
                    <p className="text-gray-800 text-sm">
                      <span className="font-bold">{item.user}</span> {item.action === 'verified' ? t('community.feed.verified') : t('community.feed.added')}
                    </p>
                    <p className="font-bold text-gray-900 mt-1">"{item.content}"</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-gray-100 rounded-full font-medium">{item.lang}</span>
                      <span>• {item.time}</span>
                    </div>
                  </div>
               </div>
             ))}
          </div>
        );
      
      case 'verify':
        const currentItem = MOCK_VERIFY[verifyIndex % MOCK_VERIFY.length];
        return (
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
             <div className="bg-orange-100 text-orange-700 px-4 py-1 rounded-full text-sm font-bold mb-6">
                🔥 {t('community.verify.streak')}: {verifyStreak}
             </div>

             <div className="w-full bg-white rounded-[2rem] shadow-soft p-8 text-center relative border border-gray-100">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {currentItem.lang}
                </div>
                
                <h3 className="text-gray-400 text-sm font-bold uppercase mb-2">{t('community.verify.title')}</h3>
                <p className="text-xl text-gray-800 mb-6 font-medium">"{currentItem.original}"</p>
                <div className="w-full h-px bg-gray-100 mb-6"></div>
                <p className="text-3xl font-extrabold text-afri-primary mb-8">{currentItem.translated}</p>

                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => handleVote(false)}
                    className="flex-1 py-4 bg-red-50 text-red-500 rounded-2xl font-bold flex flex-col items-center hover:bg-red-100 transition-colors"
                  >
                    <ThumbsDown size={24} className="mb-1" />
                    {t('community.verify.no')}
                  </button>
                  <button 
                    onClick={() => handleVote(true)}
                    className="flex-1 py-4 bg-green-50 text-green-600 rounded-2xl font-bold flex flex-col items-center hover:bg-green-100 transition-colors"
                  >
                    <ThumbsUp size={24} className="mb-1" />
                    {t('community.verify.yes')}
                  </button>
                </div>
             </div>
          </div>
        );

      case 'contribute':
        if (showSuccess) {
           return (
             <div className="h-64 flex flex-col items-center justify-center text-center animate-in zoom-in">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">{t('community.contribute.success')}</h3>
             </div>
           );
        }
        return (
          <div className="bg-white rounded-[2rem] shadow-soft p-6 border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-gray-800 mb-6">{t('community.contribute.title')}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t('community.contribute.word_label')}</label>
                <input 
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-afri-primary focus:ring-1 focus:ring-afri-primary transition-all"
                  placeholder="e.g. Maningue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t('community.contribute.lang_label')}</label>
                <select 
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-afri-primary focus:ring-1 focus:ring-afri-primary transition-all appearance-none"
                >
                  {SUPPORTED_LANGUAGES.filter(l => l.code !== 'en' && l.code !== 'pt').map(l => (
                    <option key={l.code} value={l.code}>{l.name} {l.flag}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t('community.contribute.trans_label')}</label>
                <input 
                  value={newTranslation}
                  onChange={(e) => setNewTranslation(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-afri-primary focus:ring-1 focus:ring-afri-primary transition-all"
                  placeholder="e.g. Very/A lot"
                />
              </div>

              <button 
                onClick={handleSubmit}
                disabled={!newWord || !newTranslation}
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl mt-4 hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Send size={18} />
                {t('community.contribute.submit')}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-afri-subtle overflow-y-auto relative">
      <div className="max-w-xl mx-auto p-4 md:p-8 pb-32">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-gray-800">{t('community.title')} 🌍</h2>
          <p className="text-gray-500 text-sm mt-1">{t('community.desc')}</p>
        </div>

        {/* Custom Tabs */}
        <div className="flex p-1 bg-gray-200/50 rounded-2xl mb-8 backdrop-blur-sm">
           {[
             { id: 'feed', icon: Activity, label: t('community.tabs.feed') },
             { id: 'verify', icon: CheckCircle2, label: t('community.tabs.verify') },
             { id: 'contribute', icon: Plus, label: t('community.tabs.contribute') }
           ].map((tab) => {
             const Icon = tab.icon;
             const isActive = activeTab === tab.id;
             return (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as Tab)}
                 className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                   isActive 
                   ? 'bg-white text-afri-primary shadow-sm scale-[1.02]' 
                   : 'text-gray-500 hover:text-gray-700'
                 }`}
               >
                 <Icon size={16} />
                 <span className="hidden sm:inline">{tab.label}</span>
               </button>
             );
           })}
        </div>

        {/* Main Content Area */}
        <div className="min-h-[300px]">
          {renderContent()}
        </div>

      </div>
    </div>
  );
};

export default CommunityView;