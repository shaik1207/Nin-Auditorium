import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

export default function CookieConsent() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Re-check logic every second in case they just logged in
    const checkConsent = setInterval(() => {
      const hasAccepted = localStorage.getItem('aurora_cookies_accepted');
      const isLoggedIn = localStorage.getItem('aurora_token');
      
      // Only show if they are logged in AND haven't accepted yet
      if (isLoggedIn && !hasAccepted) {
        setShowPopup(true);
        clearInterval(checkConsent); // Stop checking once shown
      }
    }, 1000);

    return () => clearInterval(checkConsent);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('aurora_cookies_accepted', 'true');
    setShowPopup(false);
  };

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 w-full sm:bottom-6 sm:left-6 sm:w-[400px] z-[9999] p-4 sm:p-0"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 flex flex-col gap-4 relative overflow-hidden">
            <button onClick={() => setShowPopup(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors">
              <X size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-full flex items-center justify-center shrink-0">
                <Cookie size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">We value your privacy</h3>
            </div>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              We use cookies to enhance your browsing experience, serve personalized content, and maintain your secure 15-day login session.
            </p>
            <div className="flex gap-3 mt-2">
              <button onClick={() => setShowPopup(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-200 transition-colors">
                Decline
              </button>
              <button onClick={handleAccept} className="flex-1 py-2.5 bg-[#8B5CF6] text-white font-bold rounded-xl text-sm hover:bg-[#7C3AED] transition-colors shadow-md">
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}