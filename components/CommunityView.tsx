import React from 'react';

const CommunityView: React.FC = () => {
  return (
    <div className="h-full bg-gray-50 overflow-y-auto p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          🤝
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Join the Community</h2>
        <p className="text-gray-500 mb-8">
          Help preserve African languages! Contribute translations, verify phrases, or record pronunciations.
        </p>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm text-left border-l-4 border-green-500">
            <h4 className="font-bold text-gray-800">Verify Translations</h4>
            <p className="text-sm text-gray-500">Help us check if the AI got the Ndau greeting correct.</p>
            <button className="mt-2 text-green-600 text-sm font-bold uppercase">Start Review</button>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm text-left border-l-4 border-blue-500">
            <h4 className="font-bold text-gray-800">Add Vocabulary</h4>
            <p className="text-sm text-gray-500">Add local slang from Maputo to our dictionary.</p>
            <button className="mt-2 text-blue-600 text-sm font-bold uppercase">Contribute</button>
          </div>
        </div>

        <button className="mt-8 bg-gray-800 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-900 transition-colors">
          Sign In to Contribute
        </button>
      </div>
    </div>
  );
};

export default CommunityView;