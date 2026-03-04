import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="h-full w-full bg-afri-warm/20 text-gray-800 font-sans overflow-y-auto no-scrollbar">
      <div className="max-w-4xl mx-auto p-6 md:p-16">
        <header className="mb-12 bg-white p-10 rounded-[3rem] shadow-soft border border-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-afri-primary/5 rounded-full -mr-16 -mt-16"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-afri-primary rounded-2xl flex items-center justify-center text-white shadow-glow rotate-3">
                <Shield size={32} />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter leading-none">Privacy Policy</h1>
                <p className="text-gray-400 font-bold text-sm mt-2 uppercase tracking-widest">Last updated: February 2024</p>
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
            <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight flex items-center gap-3">
              <span className="w-8 h-8 bg-afri-warm rounded-lg flex items-center justify-center text-sm text-afri-primary font-black">01</span>
              Introduction
            </h2>
            <p className="text-gray-600 font-medium leading-relaxed text-lg">
              Welcome to <strong className="text-afri-primary">AfriLingo AI</strong> ("we," "our," or "us"). We are committed to protecting your privacy. 
              This Privacy Policy explains how our application collects, uses, and discloses information when you use our services.
            </p>
          </section>

          <section className="bg-white p-10 rounded-[3rem] shadow-soft border border-white">
            <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight flex items-center gap-3">
              <span className="w-8 h-8 bg-afri-warm rounded-lg flex items-center justify-center text-sm text-afri-primary font-black">02</span>
              Data We Collect & Permissions
            </h2>
            <p className="mb-6 text-gray-600 font-medium text-lg">To provide our translation and tutoring services, we require specific permissions on your device:</p>
            <ul className="space-y-4">
              <li className="flex gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-soft shrink-0">🎙️</div>
                <div>
                  <strong className="text-gray-900 block mb-1">Microphone (Audio Recording)</strong>
                  <p className="text-gray-500 text-sm font-medium">Used solely to capture your voice for speech-to-text translation and pronunciation practice. Audio data is processed by AI and is not permanently stored.</p>
                </div>
              </li>
              <li className="flex gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-soft shrink-0">📷</div>
                <div>
                  <strong className="text-gray-900 block mb-1">Camera (Images)</strong>
                  <p className="text-gray-500 text-sm font-medium">Used to capture images of text for visual translation. Images are processed temporarily to extract text and are not shared with third parties.</p>
                </div>
              </li>
            </ul>
          </section>

          <section className="bg-white p-10 rounded-[3rem] shadow-soft border border-white">
            <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight flex items-center gap-3">
              <span className="w-8 h-8 bg-afri-warm rounded-lg flex items-center justify-center text-sm text-afri-primary font-black">03</span>
              Third-Party Services
            </h2>
            <p className="mb-6 text-gray-600 font-medium text-lg">We utilize trusted third-party services to operate our app:</p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-soft">🤖</div>
                <strong className="text-gray-900 block mb-2">Google Gemini</strong>
                <p className="text-gray-500 text-xs font-medium">AI processing for translations and chat.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-soft">⚡</div>
                <strong className="text-gray-900 block mb-2">Supabase</strong>
                <p className="text-gray-500 text-xs font-medium">Secure storage for user profiles and feed.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-soft">📢</div>
                <strong className="text-gray-900 block mb-2">Google AdSense</strong>
                <p className="text-gray-500 text-xs font-medium">Serving relevant educational ads.</p>
              </div>
            </div>
          </section>

          <section className="bg-white p-10 rounded-[3rem] shadow-soft border border-white">
            <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight flex items-center gap-3">
              <span className="w-8 h-8 bg-afri-warm rounded-lg flex items-center justify-center text-sm text-afri-primary font-black">04</span>
              User Account Data
            </h2>
            <p className="text-gray-600 font-medium leading-relaxed text-lg">
              If you choose to create a profile, we store your chosen username and avatar preference. You can modify this information at any time within the app settings. 
              Contributions to the "Community Club" (translations/phrases) are public and associated with your username.
            </p>
          </section>

          <section className="bg-white p-10 rounded-[3rem] shadow-soft border border-white">
            <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight flex items-center gap-3">
              <span className="w-8 h-8 bg-afri-warm rounded-lg flex items-center justify-center text-sm text-afri-primary font-black">05</span>
              Children's Privacy
            </h2>
            <p className="text-gray-600 font-medium leading-relaxed text-lg">
              Our services are educational and safe for general audiences. We do not knowingly collect personally identifiable information from children under 13 without parental consent.
            </p>
          </section>

          <section className="bg-white p-10 rounded-[3rem] shadow-soft border border-white">
            <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight flex items-center gap-3">
              <span className="w-8 h-8 bg-afri-warm rounded-lg flex items-center justify-center text-sm text-afri-primary font-black">06</span>
              Contact Us
            </h2>
            <p className="text-gray-600 font-medium leading-relaxed text-lg">
              If you have any questions about this Privacy Policy, please contact us at:<br />
              <strong className="text-afri-primary">support@afrilingo.app</strong>
            </p>
          </section>
        </div>
        
        <footer className="mt-12 pt-10 border-t border-gray-200 text-center text-gray-400 text-xs font-black uppercase tracking-widest pb-12">
          &copy; {new Date().getFullYear()} AfriLingo AI. Crafted with pride in Africa.
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;