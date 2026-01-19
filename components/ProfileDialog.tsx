import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { X, Save, Loader2, Download, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const AVATARS = ['🦁', '🐘', '🦒', '🦓', '🐆', '🌍', '🥁', '🌞', '💎', '🏺', '🥘', '🛖'];

const ProfileDialog: React.FC = () => {
  const { user, updateProfile, isProfileOpen, setProfileOpen } = useUser();
  const { t } = useLanguage();
  
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    if (user && isProfileOpen) {
      setUsername(user.username === 'Guest Explorer' ? '' : user.username);
      setSelectedAvatar(user.avatar);
    }
  }, [user, isProfileOpen]);

  // Listen for the PWA install event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    // Show the install prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  if (!isProfileOpen) return null;

  const handleSave = async () => {
    if (!username.trim()) return;
    setIsSaving(true);
    await updateProfile(username, selectedAvatar);
    setIsSaving(false);
    setProfileOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setProfileOpen(false)}></div>
      
      <div className="bg-white rounded-3xl w-full max-w-sm relative z-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Edit Profile</h2>
            <button onClick={() => setProfileOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-5xl mb-4 border-4 border-white shadow-lg">
              {selectedAvatar}
            </div>
            <p className="text-sm text-gray-500 font-medium">Choose an avatar</p>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {AVATARS.map(av => (
                <button
                  key={av}
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-10 h-10 flex items-center justify-center text-xl rounded-full transition-all ${
                    selectedAvatar === av ? 'bg-afri-primary text-white scale-110 shadow-md' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Display Name</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-afri-primary/20 focus:border-afri-primary transition-all font-bold text-gray-800"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={!username.trim() || isSaving}
              className="w-full bg-afri-primary text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-afri-accent transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              Save Profile
            </button>
            
            {/* Install App Button - Only shows if browser supports it and hasn't been installed yet */}
            {installPrompt && (
              <button
                onClick={handleInstallClick}
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors mt-2 shadow-lg"
              >
                <Download size={20} />
                Install App
              </button>
            )}

            {/* Privacy Policy Link - External Browser */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center">
               <a 
                 href="/privacy" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-afri-primary font-medium transition-colors"
               >
                 <Shield size={12} />
                 {t('profile.privacy_policy')}
               </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDialog;