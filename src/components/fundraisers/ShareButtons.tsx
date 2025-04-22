'use client';

import { useState } from 'react';

interface ShareButtonsProps {
  fundraiserId: string;
  title: string;
}

export default function ShareButtons({ fundraiserId, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopyLink = () => {
    const url = `${window.location.origin}/fundraisers/${fundraiserId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  const shareOnWhatsApp = () => {
    const url = `${window.location.origin}/fundraisers/${fundraiserId}`;
    const text = `Support this cause: ${title} ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Share this fundraiser
      </h3>
      <div className="flex space-x-4">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          onClick={handleCopyLink}
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          onClick={shareOnWhatsApp}
        >
          WhatsApp
        </button>
      </div>
    </div>
  );
} 