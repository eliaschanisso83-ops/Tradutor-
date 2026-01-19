import React from 'react';
import { Trash2, ArrowLeft, Mail, AlertTriangle } from 'lucide-react';

const DataDeletion: React.FC = () => {
  return (
    <div className="h-full w-full bg-white text-gray-800 font-sans overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6 md:p-12">
        <header className="mb-8 border-b pb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <Trash2 size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Data Deletion Request</h1>
          </div>
          <a href="/" className="inline-flex items-center gap-2 mt-2 text-orange-600 font-bold hover:underline">
            <ArrowLeft size={16} /> Return to App
          </a>
        </header>

        <div className="space-y-8 text-sm md:text-base leading-relaxed pb-12">
          
          <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">How to Delete Your Data</h2>
            <p className="mb-4">
              At <strong>AfriLingo AI</strong>, we value your privacy. You have the right to request the deletion of your user profile and associated data.
            </p>
            <p className="mb-4">
              Because our app allows for anonymous usage (Guest Mode) as well as created profiles, we offer two ways to remove your data:
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Mail size={20} className="text-blue-600" />
              Option 1: Request via Email (Recommended)
            </h3>
            <p className="mb-4 text-gray-600">
              If you cannot access the app or want to ensure all server-side records are removed, please send us an email. We will process your request within 7 days.
            </p>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="font-bold text-gray-800 mb-2">Please email us at:</p>
              <a 
                href="mailto:support@afrilingo.app?subject=Account Deletion Request&body=I would like to request the deletion of my account and data associated with AfriLingo AI." 
                className="text-blue-600 font-bold text-lg hover:underline break-all"
              >
                support@afrilingo.app
              </a>
              <p className="text-xs text-gray-500 mt-2">
                *Please include your Username or User ID if known to speed up the process.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <AlertTriangle size={20} className="text-orange-600" />
              Option 2: In-App Deletion
            </h3>
            <p className="mb-4 text-gray-600">
              If you still have the app installed, you can delete your account instantly:
            </p>
            <ol className="list-decimal pl-5 space-y-2 font-medium text-gray-700">
              <li>Open the <strong>AfriLingo AI</strong> app.</li>
              <li>Tap on your <strong>Profile Avatar</strong> (top right or in the menu).</li>
              <li>Scroll down to the bottom of the Edit Profile screen.</li>
              <li>Tap the red <strong>"Delete Account"</strong> button.</li>
              <li>Confirm the action.</li>
            </ol>
            <p className="text-sm text-gray-500 mt-2 italic">
              Note: This will immediately remove your profile from your device and disassociate your identity from our database.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Data That Will Be Deleted</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Your public username and avatar.</li>
              <li>Your learning progress (XP, streaks, level).</li>
              <li>Association with any community contributions (comments/translations will remain but will be anonymized).</li>
            </ul>
          </section>

        </div>
        
        <footer className="mt-12 pt-6 border-t text-center text-gray-400 text-xs pb-8">
          &copy; {new Date().getFullYear()} AfriLingo AI. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default DataDeletion;