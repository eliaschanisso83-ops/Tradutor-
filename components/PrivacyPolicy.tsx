import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="h-full w-full bg-white text-gray-800 font-sans overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6 md:p-12">
        <header className="mb-8 border-b pb-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="text-orange-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-gray-500">Last updated: February 2024</p>
          <a href="/" className="inline-flex items-center gap-2 mt-4 text-orange-600 font-bold hover:underline">
            <ArrowLeft size={16} /> Return to App
          </a>
        </header>

        <div className="space-y-6 text-sm md:text-base leading-relaxed pb-12">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">1. Introduction</h2>
            <p>
              Welcome to <strong>AfriLingo AI</strong> ("we," "our," or "us"). We are committed to protecting your privacy. 
              This Privacy Policy explains how our application collects, uses, and discloses information when you use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">2. Data We Collect & Permissions</h2>
            <p className="mb-2">To provide our translation and tutoring services, we require specific permissions on your device:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Microphone (Audio Recording):</strong> Used solely to capture your voice for speech-to-text translation and pronunciation practice. Audio data is sent to our AI processor and is not permanently stored on our servers.</li>
              <li><strong>Camera (Images):</strong> Used to capture images of text for visual translation. Images are processed temporarily to extract text and are not shared with third parties for other purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">3. Third-Party Services</h2>
            <p className="mb-2">We utilize trusted third-party services to operate our app:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Google Gemini API:</strong> We use Google's Generative AI to process translations, generate chat responses, and analyze images/audio. Data sent to the AI is for processing purposes only.</li>
              <li><strong>Supabase:</strong> We use Supabase to store user profiles (username, avatar) and community contributions.</li>
              <li><strong>Google AdSense:</strong> We display advertisements provided by Google. Google may use cookies or unique device identifiers to serve ads based on your visits to this and other apps/websites.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">4. User Account Data</h2>
            <p>
              If you choose to create a profile, we store your chosen username and avatar preference. You can modify this information at any time within the app settings. 
              Contributions to the "Community Club" (translations/phrases) are public and associated with your username.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">5. Children's Privacy</h2>
            <p>
              Our services are educational and safe for general audiences. We do not knowingly collect personally identifiable information from children under 13 without parental consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:<br />
              <strong>support@afrilingo.app</strong>
            </p>
          </section>
        </div>
        
        <footer className="mt-12 pt-6 border-t text-center text-gray-400 text-xs pb-8">
          &copy; {new Date().getFullYear()} AfriLingo AI. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;