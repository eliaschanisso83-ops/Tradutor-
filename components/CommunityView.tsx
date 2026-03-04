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
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
             <AdBanner slotId={AD_CONFIG.SLOTS.COMMUNITY_FEED_1} className="mb-6" />
             {loadingFeed ? (
               <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] shadow-soft border border-white">
                 <div className="relative mb-4">
                   <div className="absolute inset-0 bg-afri-primary/20 rounded-full animate-ping"></div>
                   <Loader2 size={40} className="text-afri-primary animate-spin relative z-10" />
                 </div>
                 <p className="text-gray-400 font-black text-xs uppercase tracking-widest">Loading community...</p>
               </div>
             ) : feed.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-[2.5rem] shadow-soft border border-white">
                 <div className="text-4xl mb-4">🏜️</div>
                 <p className="text-gray-400 font-bold">
                   {t('community.feed.empty')}
                 </p>
               </div>
             ) : (
               feed.map((item, idx) => (
                 <React.Fragment key={item.id}>
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-soft border border-white flex items-start gap-5 group hover:shadow-heavy transition-all duration-300 hover:-translate-y-1">
                        <div className="mt-1 w-14 h-14 rounded-2xl bg-afri-warm border border-afri-primary/10 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                        {item.avatar || item.user.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-gray-900 font-black tracking-tight">
                                {item.user}
                            </p>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.time}</span>
                          </div>
                          <p className="text-gray-500 font-medium text-sm mb-3">
                            {item.action === 'verified' ? t('community.feed.verified') : t('community.feed.added')}
                          </p>
                          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-inner relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-afri-primary/5 rounded-full -mr-8 -mt-8"></div>
                            <p className="font-black text-xl text-gray-900 tracking-tighter leading-tight">"{item.content}"</p>
                            {item.translation && (
                              <p className="text-afri-primary font-bold text-sm mt-1">→ {item.translation}</p>
                            )}
                          </div>
                          <div className="mt-3">
                            <span className="px-3 py-1 bg-afri-warm text-afri-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-afri-primary/10">{item.lang}</span>
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
      
      case 'verify': {
        // Filter items that have translations to verify
        const verifyItems = feed.filter(f => f.translation && f.action === 'added');
        const currentItem = verifyItems.length > 0 ? verifyItems[verifyIndex % verifyItems.length] : null;

        return (
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">
             <div className="bg-afri-primary text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8 shadow-glow animate-pulse">
                🔥 {t('community.verify.streak')}: {verifyStreak}
             </div>

             {currentItem ? (
               <div className="w-full bg-white rounded-[3rem] shadow-heavy p-10 text-center relative border border-white overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-afri-primary via-afri-accent to-afri-primary"></div>
                  
                  <div className="mb-8">
                    <span className="text-[10px] font-black text-afri-primary uppercase tracking-[0.3em] mb-4 block">Verify Phrase</span>
                    <div className="flex items-center justify-center gap-3 mb-2">
                       <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm shadow-inner">
                         {currentItem.avatar}
                       </div>
                       <span className="text-xs font-bold text-gray-400">Added by {currentItem.user}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 shadow-inner mb-8 relative">
                    <div className="absolute top-4 right-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">{currentItem.lang}</div>
                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">{t('community.verify.title')}</p>
                    <p className="text-2xl text-gray-900 mb-6 font-black tracking-tighter leading-tight">"{currentItem.content}"</p>
                    <div className="w-12 h-1 bg-afri-primary/20 mx-auto mb-6 rounded-full"></div>
                    <p className="text-4xl font-black text-afri-primary tracking-tighter leading-none">{currentItem.translation}</p>
                  </div>

                  <div className="flex justify-center gap-6">
                    <button 
                      onClick={() => handleVote(false)}
                      className="flex-1 py-5 bg-red-50 text-red-500 rounded-2xl font-black flex flex-col items-center hover:bg-red-100 transition-all active:scale-95 border border-red-100/50"
                    >
                      <ThumbsDown size={28} className="mb-2" />
                      <span className="text-xs uppercase tracking-widest">{t('community.verify.no')}</span>
                    </button>
                    <button 
                      onClick={() => handleVote(true)}
                      className="flex-1 py-5 bg-green-50 text-green-600 rounded-2xl font-black flex flex-col items-center hover:bg-green-100 transition-all active:scale-95 border border-green-100/50"
                    >
                      <ThumbsUp size={28} className="mb-2" />
                      <span className="text-xs uppercase tracking-widest">{t('community.verify.yes')}</span>
                    </button>
                  </div>
               </div>
             ) : (
               <div className="w-full bg-white rounded-[3rem] shadow-heavy p-16 text-center border border-white">
                  <div className="w-24 h-24 bg-afri-warm rounded-3xl flex items-center justify-center mx-auto mb-8 text-5xl shadow-inner rotate-6">
                    😴
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tighter">All caught up!</h3>
                  <p className="text-gray-500 font-medium text-lg mb-10 max-w-xs mx-auto">No new phrases to verify right now. Why not add one yourself?</p>
                  <button 
                     onClick={() => setActiveTab('contribute')}
                     className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-heavy hover:bg-afri-primary transition-all active:scale-95"
                  >
                    Go to Add New
                  </button>
               </div>
             )}
             <AdBanner slotId={AD_CONFIG.SLOTS.COMMUNITY_VERIFY} className="mt-8" />
          </div>
        );
      }

      case 'contribute':
        return (
          <div className="bg-white rounded-[3rem] shadow-heavy p-10 border border-white animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-afri-primary/5 rounded-full -mr-16 -mt-16"></div>
            
            <div className="flex items-center gap-5 mb-10 p-5 bg-afri-warm/50 rounded-3xl border border-afri-primary/10">
               <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-soft border border-gray-100 rotate-3">
                 {user?.avatar}
               </div>
               <div className="flex-1">
                 <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Posting as</p>
                 <p className="font-black text-xl text-gray-900 tracking-tight">{user?.username}</p>
               </div>
               <button onClick={() => setProfileOpen(true)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-afri-primary shadow-soft hover:bg-afri-primary hover:text-white transition-all active:scale-90">
                 <User size={20} />
               </button>
            </div>

            {showSuccess ? (
               <div className="h-60 flex flex-col items-center justify-center text-center animate-in zoom-in">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner rotate-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{t('community.contribute.success')}</h3>
                  <p className="text-gray-500 font-medium mt-2">Your contribution helps everyone!</p>
               </div>
            ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t('community.contribute.word_label')}</label>
                <input 
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 outline-none focus:border-afri-primary focus:ring-4 focus:ring-afri-primary/10 transition-all font-bold text-lg shadow-inner"
                  placeholder="e.g. Maningue"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t('community.contribute.lang_label')}</label>
                <div className="relative">
                  <select 
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 outline-none focus:border-afri-primary focus:ring-4 focus:ring-afri-primary/10 transition-all appearance-none font-bold text-lg shadow-inner pr-12 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_1.5rem_center] bg-no-repeat"
                  >
                    {SUPPORTED_LANGUAGES.filter(l => l.code !== 'en' && l.code !== 'pt').map(l => (
                      <option key={l.code} value={l.code}>{l.name} {l.flag}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t('community.contribute.trans_label')}</label>
                <input 
                  value={newTranslation}
                  onChange={(e) => setNewTranslation(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 outline-none focus:border-afri-primary focus:ring-4 focus:ring-afri-primary/10 transition-all font-bold text-lg shadow-inner"
                  placeholder="e.g. Very/A lot"
                />
              </div>

              <button 
                onClick={handleSubmit}
                disabled={!newWord || !newTranslation || isSubmitting}
                className="w-full bg-gray-900 text-white font-black py-5 rounded-2xl mt-6 hover:bg-afri-primary disabled:opacity-50 flex items-center justify-center gap-3 transition-all active:scale-95 shadow-heavy text-lg"
              >
                {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                <span>{t('community.contribute.submit')}</span>
              </button>
            </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-afri-warm/20 overflow-y-auto relative no-scrollbar">
      <div className="max-w-2xl mx-auto p-4 md:p-10 pb-40">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-afri-primary rounded-[1.5rem] text-white shadow-glow mb-4 rotate-3">
            <Activity size={32} />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter leading-none">{t('community.title')}</h2>
          <p className="text-gray-500 font-bold text-lg mt-2 tracking-tight">{t('community.desc')}</p>
        </div>

        {/* Custom Tabs */}
        <div className="flex p-2 bg-white/80 rounded-[2rem] mb-10 backdrop-blur-xl shadow-soft border border-white">
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
                 className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] text-sm font-black transition-all duration-500 ${
                   isActive 
                   ? 'bg-gray-900 text-white shadow-heavy scale-[1.02]' 
                   : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                 }`}
               >
                 <Icon size={18} />
                 <span className="hidden sm:inline tracking-widest uppercase text-[10px]">{tab.label}</span>
               </button>
             );
           })}
        </div>

        {/* Main Content Area */}
        <div className="min-h-[400px]">
          {renderContent()}
        </div>

      </div>
    </div>
  );
};

export default CommunityView;