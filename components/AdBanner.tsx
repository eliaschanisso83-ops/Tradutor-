import React, { useEffect } from 'react';

interface AdBannerProps {
  slotId?: string; // The Ad Slot ID from Google AdSense Dashboard
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
}

// REPLACE THIS WITH YOUR REAL PUBLISHER ID
const PUBLISHER_ID = 'ca-pub-5925121782414544';
// Set this to false when you are ready to show real ads
const DEV_MODE = false; 

const AdBanner: React.FC<AdBannerProps> = ({ slotId = '1234567890', format = 'auto', className = '' }) => {
  useEffect(() => {
    if (DEV_MODE) return;
    try {
      const adsbygoogle = (window as any).adsbygoogle || [];
      // Prevent pushing if already pushed for this slot (basic check) usually adsense handles it, 
      // but catching errors is important.
      adsbygoogle.push({});
    } catch (e) {
      // Ignore adsense errors (often caused by ad blockers)
      console.debug('AdSense info:', e);
    }
  }, []);

  return (
    <div className={`w-full flex justify-center items-center my-4 overflow-hidden ${className}`}>
      {DEV_MODE ? (
        // Placeholder for Development/Demo purposes
        <div className="w-full h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 p-4">
           <span className="font-bold text-xs uppercase tracking-wider">Google Ad Space</span>
           <span className="text-[10px]">Slot ID: {slotId}</span>
        </div>
      ) : (
        // Real AdSense Code
        <ins
          className="adsbygoogle"
          style={{ display: 'block', minWidth: '300px' }}
          data-ad-client={PUBLISHER_ID}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      )}
    </div>
  );
};

export default AdBanner;