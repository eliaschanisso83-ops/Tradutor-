import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const CommunityView: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="h-full bg-gray-50 overflow-y-auto p-4 md:p-8 flex flex-col items-center pb-32">
      <div className="max-w-md w-full text-center my-auto">
        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          🤝
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('community.title')}</h2>
        <p className="text-gray-500 mb-8">
          {t('community.desc')}
        </p>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm text-left border-l-4 border-green-500">
            <h4 className="font-bold text-gray-800">{t('community.verify_title')}</h4>
            <p className="text-sm text-gray-500">{t('community.verify_desc')}</p>
            <button className="mt-2 text-green-600 text-sm font-bold uppercase">{t('community.btn_review')}</button>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm text-left border-l-4 border-blue-500">
            <h4 className="font-bold text-gray-800">{t('community.vocab_title')}</h4>
            <p className="text-sm text-gray-500">{t('community.vocab_desc')}</p>
            <button className="mt-2 text-blue-600 text-sm font-bold uppercase">{t('community.btn_contribute')}</button>
          </div>
        </div>

        <button className="mt-8 bg-gray-800 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-900 transition-colors">
          {t('community.sign_in')}
        </button>
      </div>
    </div>
  );
};

export default CommunityView;