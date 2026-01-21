import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ThumbsUp, ThumbsDown, Plus, CheckCircle2, Activity, Send, Loader2, User } from 'lucide-react';
import { SUPPORTED_LANGUAGES, AD_CONFIG } from '../constants';
import { supabase } from '../services/supabase';
import { useUser } from '../contexts/UserContext';
import AdBanner from './AdBanner';

type Tab = 'feed' | 'verify' | 'contribute';

interface FeedItem {
  id: string;
  user: string;
  avatar?: string;
  action: 'verified' | 'added';
  content: string;
  translation?: string; // Added translation field
  lang: string;
  time: string;
}

const MOCK_FEED: FeedItem[] = [
  { id: 'm1', user: 'Maria', avatar: '👩🏾', action: 'added', content: 'Maningue', translation: 'Very / A lot', lang: 'Changana', time: '2h' },
  { id: 'm2', user: 'Joao', avatar: '👨🏿', action: 'verified', content: 'Mwauka bwanji', translation: 'Good morning', lang: 'Nyanja', time: '4h' },
  { id: 'm3', user: 'Sarah', avatar: '🦁', action: 'added', content: 'Khanimambo', translation: 'Thank you', lang: 'Changana', time: '5h' },
  { id: 'm4', user: 'David', avatar: '🦓', action: 'added', content: 'Tatenda', translation: 'Thank you', lang: 'Shona', time: '1d' },
];

const CommunityView: React.FC = () => {
  const { t } = useLanguage();
  const { user, setProfileOpen } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  
  // Verify State
  const [verifyIndex, setVerifyIndex] = useState(0);
  const [verifyStreak, setVerifyStreak] = useState(0);

  // Contribute State
  const [newWord, setNewWord] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [selectedLang, setSelectedLang] = useState('changana');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000); // minutes

    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  // Fetch Feed from Supabase with Fallback
  useEffect(() => {
    const fetchFeed = async () => {
      setLoadingFeed(true);
      try {
        const { data, error } = await supabase
          .from('community_feed')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        if (data && data.length > 0) {
          const mappedFeed: FeedItem[] = data.map((item: any) => ({
            id: item.id,
            user: item.user_name || 'Anonymous',
            avatar: item.avatar || '👤',
            action: item.action_type,
            content: item.content,
            translation: item.translation, 
            lang: item.language,
            time: formatTime(item.created_at)
          }));
          setFeed(mappedFeed);
        } else {
          // If empty table, use mock
          setFeed(MOCK_FEED);
        }
      } catch (err) {
        console.warn('Supabase fetch failed, using mock data:', err);
        setFeed(MOCK_FEED);
      } finally {
        setLoadingFeed(false);
      }
    };

    fetchFeed();
    
    // Subscribe to realtime changes (only if connection works)
    try {
      const subscription = supabase
        .channel('public:community_feed')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_feed' }, (payload) => {
          const newItem = payload.new;
          const feedItem: FeedItem = {
             id: newItem.id,
             user: newItem.user_name || 'Anonymous',
             avatar: newItem.avatar || '👤',
             action: newItem.action_type,
             content: newItem.content,
             translation: newItem.translation,
             lang: newItem.language,
             time: 'Just now'
          };
          setFeed(prev => [feedItem, ...prev]);
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } catch (e) {
      console.log('Realtime subscription skipped');
    }
  }, []);

  const handleVote = (vote: boolean) => {
    if (vote) setVerifyStreak(prev => prev + 1);
    else setVerifyStreak(0);
    setVerifyIndex(prev => prev + 1);
  };

  const handleSubmit = async () => {
    if (!newWord || !newTranslation) return;
    
    setIsSubmitting(true);

    try {
      const langName = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.name || 'Unknown';
      const { error } = await supabase
        .from('community_feed')
        .insert([{
          user_name: user?.username || 'Anonymous',
          avatar: user?.avatar || '👤',
          action_type: 'added',
          content: newWord,
          language: langName,
          translation: newTranslation
        }]);

      if (error) throw error;

      setNewWord('');
      setNewTranslation('');
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setActiveTab('feed');
      }, 2000);

    } catch (err) {
      console.error("Error submitting:", err);
      // Simulate success for offline/demo feel
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setActiveTab('feed');
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'feed':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
             <AdBanner slotId={AD_CONFIG.SLOTS.COMMUNITY_FEED_1} className="mb-6" />
             {loadingFeed ? (
               <div className="flex flex-col items-center justify-center py-10">
                 <Loader2 size={32} className="text-afri-primary animate-spin mb-2" />
                 <p className="text-gray-400 text-sm">Loading community...</p>
               </div>
             ) : feed.length === 0 ? (
               <div className="text-center py-10 text-gray-400">
                 {t('community.feed.empty')}
               </div>
             ) : (
               feed.map((item, idx) => (
                 <React.Fragment key={item.id}>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-3">
                        <div className="mt-1 w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-lg shadow-sm">
                        {item.avatar || item.user.charAt(0)}
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
                    {/* Insert an Ad every 5 posts */}
                    {idx > 0 && idx % 5 === 0 && <AdBanner slotId={AD_CONFIG.SLOTS.COMMUNITY_FEED_2} className="my-2" />}
                 </React.Fragment>
               ))
             )}
          </div>
        );
      
      case 'verify':
        // Filter items that have translations to verify
        const verifyItems = feed.filter(f => f.translation && f.action === 'added');
        const currentItem = verifyItems.length > 0 ? verifyItems[verifyIndex % verifyItems.length] : null;

        return (
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
             <div className="bg-orange-100 text-orange-700 px-4 py-1 rounded-full text-sm font-bold mb-6">
                🔥 {t('community.verify.streak')}: {verifyStreak}
             </div>

             {currentItem ? (
               <div className="w-full bg-white rounded-[2rem] shadow-soft p-8 text-center relative border border-gray-100">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {currentItem.lang}
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 mb-2">
                     <span className="text-xs text-gray-400">Added by {currentItem.user} {currentItem.avatar}</span>
                  </div>

                  <h3 className="text-gray-400 text-sm font-bold uppercase mb-2">{t('community.verify.title')}</h3>
                  <p className="text-xl text-gray-800 mb-6 font-medium">"{currentItem.content}"</p>
                  <div className="w-full h-px bg-gray-100 mb-6"></div>
                  <p className="text-3xl font-extrabold text-afri-primary mb-8">{currentItem.translation}</p>

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
             ) : (
               <div className="w-full bg-white rounded-[2rem] shadow-soft p-12 text-center border border-gray-100">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    😴
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">All caught up!</h3>
                  <p className="text-gray-500">No new phrases to verify right now. Why not add one yourself?</p>
                  <button 
                     onClick={() => setActiveTab('contribute')}
                     className="mt-6 text-afri-primary font-bold hover:underline"
                  >
                    Go to Add New
                  </button>
               </div>
             )}
             <AdBanner slotId={AD_CONFIG.SLOTS.COMMUNITY_VERIFY} className="mt-8" />
          </div>
        );

      case 'contribute':
        return (
          <div className="bg-white rounded-[2rem] shadow-soft p-6 border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
            
            <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl">
               <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm border border-gray-100">
                 {user?.avatar}
               </div>
               <div className="flex-1">
                 <p className="text-xs text-gray-500 font-bold uppercase">Posting as</p>
                 <p className="font-bold text-gray-800">{user?.username}</p>
               </div>
               <button onClick={() => setProfileOpen(true)} className="text-xs font-bold text-afri-primary hover:underline">
                 Change
               </button>
            </div>

            {showSuccess ? (
               <div className="h-40 flex flex-col items-center justify-center text-center animate-in zoom-in">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">{t('community.contribute.success')}</h3>
               </div>
            ) : (
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
                disabled={!newWord || !newTranslation || isSubmitting}
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl mt-4 hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {t('community.contribute.submit')}
              </button>
            </div>
            )}
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
                   : 'text-gray-500 hover:text-gray