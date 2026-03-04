import React from 'react';
import { Trash2, ArrowLeft, Mail, AlertTriangle } from 'lucide-react';

const DataDeletion: React.FC = () => {
  return (
    <div className="h-full w-full bg-afri-warm/20 text-gray-800 font-sans overflow-y-auto no-scrollbar">
      <div className="max-w-4xl mx-auto p-6 md:p-16">
        <header className="mb-12 bg-white p-10 rounded-[3rem] shadow-soft border border-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-heavy rotate-3">
                <Trash2 size={32} />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter leading-none">Data Deletion</h1>
                <p className="text-gray-400 font-bold text-sm mt-2 uppercase tracking-widest">Your right to be forgotten</p>
              </div>
            </div>
            <a href="/" className="inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-heavy hover:bg-afri-primary transition-all active:scale-95">
              <ArrowLeft size={18} /> 
              <span>Return to App</span>
            </a>
          </div>
        </header>

        <div className="space-y-8 pb-20">
          <section className="bg-white p-10 rounded-[3rem] shadow-soft border border-white">
            <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight flex items-center gap-3">
              <span className="w-8 h-8 bg-afri-warm rounded-lg flex items-center justify-center text-sm text-afri-primary font-black">01</span>
              How to Delete Your Data
            </h2>
            <p className="text-gray-600 font-medium leading-relaxed text-lg mb-6">
              At <strong className="text-afri-primary">AfriLingo AI</strong>, we value your privacy. You have the right to request the deletion of your user profile and associated data.
            </p>
            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
              <p className="text-gray-500 font-medium leading-relaxed">
                Because our app allows for anonymous usage (Guest Mode) as well as created profiles, we offer two ways to remove your data:
              </p>
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-8">
            <section className="bg-white p-10 rounded-[3rem] shadow-soft border border-white flex flex-col">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3 uppercase tracking-tight">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-soft">
                  <Mail size={20} />
                </div>
                Email Request
              </h3>
              <p className="text-gray-500 font-medium text-sm mb-8 leading-relaxed flex-grow">
                If you cannot access the app or want to ensure all server-side records are removed, please send us an email. We will process your request within 7 days.
              </p>
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <p className="font-black text-gray-400 text-[10px] uppercase tracking-widest mb-2">Email us at:</p>
                <a 
                  href="mailto:support@afrilingo.app?subject=Account Deletion Request&body=I would like to request the deletion of my account and data associated with AfriLingo AI." 
                  className="text-blue-600 font-black text-lg hover:underline break-all block"
                >
                  support@afrilingo.app
                </a>
                <p className="text-[10px] text-gray-400 mt-4 font-bold italic">
                  *Include your Username if known.
                </p>
              </div>
            </section>

            <section className="bg-white p-10 rounded-[3rem] shadow-soft border border-white flex flex-col">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3 uppercase tracking-tight">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 shadow-soft">
                  <AlertTriangle size={20} />
                </div>
                In-App Deletion
              </h3>
              <p className="text-gray-500 font-medium text-sm mb-8 leading-relaxed flex-grow">
                If you still have the app installed, you can delete your account instantly from your profile settings.
              </p>
              <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                <ol className="space-y-2 text-xs font-black text-orange-800 uppercase tracking-tight">
                  <li className="flex gap-2"><span className="opacity-50">01.</span> Open Settings</li>
                  <li className="flex gap-2"><span className="opacity-50">02.</span> Tap Profile</li>
                  <li className="flex gap-2"><span className="opacity-50">03.</span> Scroll to Bottom</li>
                  <li className="flex gap-2"><span className="opacity-50">04.</span> Tap Delete Account</li>
                </ol>
              </div>
            </section>
          </div>

          <section className="bg-white p-10 rounded-[3rem] shadow-soft border border-white">
            <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight flex items-center gap-3">
              <span className="w-8 h-8 bg-afri-warm rounded-lg flex items-center justify-center text-sm text-afri-primary font-black">02</span>
              Data That Will Be Deleted
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-soft mb-4">👤</div>
                <strong className="text-gray-900 block mb-1 text-sm uppercase tracking-tight">Identity</strong>
                <p className="text-gray-500 text-xs font-medium">Username and avatar preference.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-soft mb-4">📈</div>
                <strong className="text-gray-900 block mb-1 text-sm uppercase tracking-tight">Progress</strong>
                <p className="text-gray-500 text-xs font-medium">XP, streaks, and lesson levels.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-soft mb-4">🤝</div>
                <strong className="text-gray-900 block mb-1 text-sm uppercase tracking-tight">Social</strong>
                <p className="text-gray-500 text-xs font-medium">Community contributions anonymized.</p>
              </div>
            </div>
          </section>
        </div>
        
        <footer className="mt-12 pt-10 border-t border-gray-200 text-center text-gray-400 text-xs font-black uppercase tracking-widest pb-12">
          &copy; {new Date().getFullYear()} AfriLingo AI. Respecting your digital legacy.
        </footer>
      </div>
    </div>
  );
};

export default DataDeletion;