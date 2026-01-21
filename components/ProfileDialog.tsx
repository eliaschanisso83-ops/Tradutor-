import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { X, Save, Loader2, Download, Shield, Trash2, AlertTriangle, Globe } from 'lucide-react';
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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setProfileOpen(false)}></div>
      
      <div className="bg-white rounded-3xl w-full max-w-sm relative z-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">{t('profile.title')}</h2>
            <button onClick={() => setProfileOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
              <X size={18} />
            </button>
          </div>

          {/* Avatar Selection */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-5xl mb-4 border-4 border-white shadow-lg">
              {selectedAvatar}
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {AVATARS.map(av => (
                <button
                  key={av}
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-10 h-10 flex items-center justify-center text-xl rounded-full transition-all ${
                    selectedAvatar === av ? 'bg-afri-primary text-white scale-110 shadow-md ring-2 ring-offset-2 ring-afri-primary' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('profile.display_name')}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: João"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-afri-primary/20 focus:border-afri-primary transition-all font-bold text-gray-800"
              />
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t('profile.app_language')}</label>
              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedLang('pt')}
                  className={`flex-1 py-3 px-2 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                    selectedLang === 'pt' 
                    ? 'border-afri-primary bg-orange-50 text-afri-primary font-bold shadow-sm' 
                    : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">🇵🇹</span> Português
                </button>
                <button 
                  onClick={() => setSelectedLang('en')}
                  className={`flex-1 py-3 px-2 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                    selectedLang === 'en' 
                    ? 'border-afri-primary bg-orange-50 text-afri-primary font-bold shadow-sm' 
                    : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">🇺🇸</span> English
                </button>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={!username.trim() || isSaving}
              className="w-full bg-afri-primary text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-afri-accent transition-colors disabled:opacity-50 shadow-lg active:scale-95"
            >
              {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {t('profile.save')}
            </button>
            
            {installPrompt && (
              <button
                onClick={handleInstallClick}
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors mt-2 shadow-lg"
              >
                <Download size={20} />
                Install App
              </button>
            )}

            {/* Privacy & Danger Zone */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
               <a 
                 href="/privacy" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-afri-primary font-medium transition-colors py-2"
               >
                 <Shield size={12} />
                 {t('profile.privacy_policy')}
               </a>

               {/* Delete Account Section */}
               {!showDeleteConfirm ? (
                 <button 
                   onClick={() => setShowDeleteConfirm(true)}
                   className="flex items-center justify-center gap-1.5 text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
                 >
                   <Trash2 size={12} />
                   {t('profile.delete_account')}
                 </button>
               ) : (
                 <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-center animate-in fade-in">
                   <div className="flex items-center justify-center gap-2 text-red-600 font-bold text-xs mb-2">
                     <AlertTriangle size={14} />
                     Are you sure?
                   </div>
                   <p className="text-[10px] text-gray-600 mb-2">This will reset your progress and remove your profile from this device.</p>
                   <div className="flex gap-2">
                     <button 
                       onClick={() => setShowDeleteConfirm(false)}
                       className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg text-xs font-bold"
                     >
                       Cancel
                     </button>
                     <button 
                       onClick={handleDeleteAccount}
                       className="flex-1 bg-red-500 text-white py-2 rounded-lg text-xs font-bold hover:bg-red-600"
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