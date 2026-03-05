import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { X, Save, Loader2, Download, Shield, Trash2, AlertTriangle, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const AVATARS = ['🦁', '🐘', '🦒', '🦓', '🐆', '🌍', '🥁', '🌞', '💎', '🏺', '🥘', '🛖'];

const ProfileDialog: React.FC = () => {
  const { user, updateProfile, isProfileOpen, setProfileOpen } = useUser();
  const { t, language, setLanguage } = useLanguage();
  
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [selectedLang, setSelectedLang] = useState<'en' | 'pt'>('en');
  const [isSaving, setIsSaving] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user && isProfileOpen) {
      setUsername(user.username === 'Guest Explorer' ? '' : user.username);
      setSelectedAvatar(user.avatar);
      setSelectedLang(language);
      setShowDeleteConfirm(false);
    }
  }, [user, isProfileOpen, language]);

  // Listen for the PWA install event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleSave = async () => {
    if (!username.trim()) return;
    setIsSaving(true);
    await updateProfile(username, selectedAvatar);
    setLanguage(selectedLang); // Update global language
    setIsSaving(false);
    setProfileOpen(false);
  };

  const handleDeleteAccount = () => {
    localStorage.clear();
    window.location.reload();
  };

  if (!isProfileOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-xl" onClick={() => setProfileOpen(false)}></div>
      
      <div className="bg-white rounded-t-[2.5rem] md:rounded-[3rem] w-full max-w-md relative z-10 shadow-heavy overflow-hidden animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 flex flex-col max-h-[92vh] border border-white">
        <div className="p-6 md:p-8 overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center mb-6 md:mb-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-afri-primary rounded-xl flex items-center justify-center text-white shadow-glow rotate-3">
                <User size={18} className="md:w-5 md:h-5" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter leading-none">{t('profile.title')}</h2>
            </div>
            <button 
              onClick={() => setProfileOpen(false)} 
              className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 transition-all active:scale-90"
            >
              <X size={18} className="md:w-5 md:h-5" />
            </button>
          </div>

          {/* Avatar Selection */}
          <div className="flex flex-col items-center mb-8 md:mb-10">
            <div className="relative mb-4 md:mb-6">
              <div className="absolute inset-0 bg-afri-primary/10 rounded-full animate-pulse scale-110"></div>
              <div className="relative w-24 h-24 md:w-28 md:h-28 bg-afri-warm rounded-full flex items-center justify-center text-5xl md:text-6xl border-4 border-white shadow-heavy rotate-3">
                {selectedAvatar}
              </div>
            </div>
            
            <div className="grid grid-cols-6 gap-2 md:gap-3 p-3 md:p-4 bg-gray-50 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-inner">
              {AVATARS.map(av => (
                <button
                  key={av}
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-lg md:text-xl rounded-xl transition-all duration-300 ${
                    selectedAvatar === av 
                    ? 'bg-afri-primary text-white scale-110 shadow-glow rotate-6' 
                    : 'bg-white hover:bg-gray-100 text-gray-400 border border-gray-100'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {/* Username Input */}
            <div>
              <label className="block text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 md:mb-2 px-1">{t('profile.display_name')}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: João"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 outline-none focus:ring-4 focus:ring-afri-primary/10 focus:border-afri-primary transition-all font-bold text-gray-900 text-base md:text-lg shadow-inner"
              />
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 md:mb-2 px-1">{t('profile.app_language')}</label>
              <div className="flex gap-3 md:gap-4">
                <button 
                  onClick={() => setSelectedLang('pt')}
                  className={`flex-1 py-3 md:py-4 px-2 rounded-xl md:rounded-2xl border-2 flex items-center justify-center gap-2 md:gap-3 transition-all duration-300 ${
                    selectedLang === 'pt' 
                    ? 'border-afri-primary bg-afri-warm text-afri-primary font-black shadow-soft scale-[1.02]' 
                    : 'border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg md:text-xl">🇵🇹</span> 
                  <span className="text-[10px] md:text-sm uppercase tracking-widest">Português</span>
                </button>
                <button 
                  onClick={() => setSelectedLang('en')}
                  className={`flex-1 py-3 md:py-4 px-2 rounded-xl md:rounded-2xl border-2 flex items-center justify-center gap-2 md:gap-3 transition-all duration-300 ${
                    selectedLang === 'en' 
                    ? 'border-afri-primary bg-afri-warm text-afri-primary font-black shadow-soft scale-[1.02]' 
                    : 'border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg md:text-xl">🇺🇸</span> 
                  <span className="text-[10px] md:text-sm uppercase tracking-widest">English</span>
                </button>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={!username.trim() || isSaving}
              className="w-full bg-gray-900 text-white font-black py-4 md:py-5 rounded-xl md:rounded-2xl flex items-center justify-center gap-3 hover:bg-afri-primary transition-all disabled:opacity-50 shadow-heavy active:scale-95 text-base md:text-lg mt-2 md:mt-4"
            >
              {isSaving ? <Loader2 size={20} className="animate-spin md:w-6 md:h-6" /> : <Save size={20} className="md:w-6 md:h-6" />}
              <span>{t('profile.save')}</span>
            </button>
            
            {installPrompt && (
              <button
                onClick={handleInstallClick}
                className="w-full bg-afri-primary text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-afri-accent transition-all mt-2 shadow-glow active:scale-95 text-lg"
              >
                <Download size={24} />
                <span>Install App</span>
              </button>
            )}

            {/* Privacy & Danger Zone */}
            <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col gap-4">
               <a 
                 href="/privacy" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 hover:text-afri-primary uppercase tracking-widest transition-all py-2"
               >
                 <Shield size={14} />
                 {t('profile.privacy_policy')}
               </a>

               {/* Delete Account Section */}
               {!showDeleteConfirm ? (
                 <button 
                   onClick={() => setShowDeleteConfirm(true)}
                   className="flex items-center justify-center gap-2 text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-all"
                 >
                   <Trash2 size={14} />
                   {t('profile.delete_account')}
                 </button>
               ) : (
                 <div className="bg-red-50 p-6 rounded-3xl border border-red-100 text-center animate-in fade-in slide-in-from-bottom-2">
                   <div className="flex items-center justify-center gap-2 text-red-600 font-black text-xs uppercase tracking-widest mb-3">
                     <AlertTriangle size={18} />
                     Are you sure?
                   </div>
                   <p className="text-xs text-gray-600 font-medium mb-6 leading-tight">This will reset your progress and remove your profile from this device.</p>
                   <div className="flex gap-3">
                     <button 
                       onClick={() => setShowDeleteConfirm(false)}
                       className="flex-1 bg-white text-gray-900 py-3 rounded-xl text-xs font-black uppercase tracking-widest border border-gray-100 shadow-soft"
                     >
                       Cancel
                     </button>
                     <button 
                       onClick={handleDeleteAccount}
                       className="flex-1 bg-red-500 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 shadow-heavy"
                     >
                       Yes, Delete
                     </button>
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDialog;