import React, { useEffect, useRef } from 'react';
import { AD_CONFIG } from '../constants';

interface AdBannerProps {
  slotId?: string; // The Ad Slot ID from Google AdSense Dashboard
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ slotId, format = 'auto', className = '' }) => {
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // If ads are disabled globally or slotId is missing, do nothing
    if (!AD_CONFIG.ENABLED || !slotId) return;
    
    // Prevent double initialization in React Strict Mode
    if (initialized.current) return;
    
    // Check if the ad element exists and doesn't have the "data-ad-status" attribute (which AdSense adds)
    if (adRef.current && !adRef.current.getAttribute('data-ad-status')) {
      try {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
        initialized.current = true;
      } catch (e) {
        console.debug('AdSense error:', e);
      }
    }
  }, [slotId]);

  if (!AD_CONFIG.ENABLED) {
    // Development Placeholder
    return (
      <div className={`w-full flex justify-center items-center my-4 overflow-hidden ${className}`}>
        <div className="w-full h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 p-4">
           <span className="font-bold text-xs uppercase tracking-wider">Ad Space Reserved</span>
           <span className="text-[10px]">Slot ID: {slotId || 'Missing'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full flex justify-center items-center my-4 overflow-hidden min-h-[100px] ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '300px', width: '100%' }}
        data-ad-client={AD_CONFIG.PUBLISHER_ID}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;