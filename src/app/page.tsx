'use client';

import { useState } from 'react';
import { WebsiteGenerator } from '@/components/WebsiteGenerator';
import { WebsitePreview } from '@/components/WebsitePreview';

export default function Home() {
  const [generatedWebsite, setGeneratedWebsite] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleWebsiteGenerated = (html: string) => {
    setGeneratedWebsite(html);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  const handleHtmlUpdate = (newHtml: string) => {
    setGeneratedWebsite(newHtml);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Modern background with depth */}
      <div className="absolute inset-0">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-gray-800/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-gray-700/20 via-transparent to-transparent"></div>
        
        {/* Subtle floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float opacity-40"></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-white/8 rounded-full blur-2xl animate-float opacity-30" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl">
          <WebsiteGenerator onWebsiteGenerated={handleWebsiteGenerated} />
        </div>
      </div>

      {/* Fullscreen preview */}
      {isPreviewOpen && generatedWebsite && (
        <WebsitePreview
          html={generatedWebsite}
          onClose={handleClosePreview}
          onHtmlUpdate={handleHtmlUpdate}
        />
      )}
    </div>
  );
}
