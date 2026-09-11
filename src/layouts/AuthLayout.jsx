import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#EEF2F6] relative flex items-center justify-center p-4 sm:p-8 font-sans z-0 selection:bg-[#6C5CE7] selection:text-white">
      
      {/* Global Website Grid Pattern Background */}
      <div 
        className="absolute inset-0 z-[-1] opacity-[0.35] pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} 
      />

      {/* Optional: Subtle top-left button to return to a landing page/home */}
      {/* <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10">
        <Link 
          to="/" 
          className="flex items-center text-sm font-medium text-gray-500 hover:text-[#6C5CE7] bg-white/50 hover:bg-white backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50 shadow-sm transition-all"
        >
          <ArrowLeft size={16} className="mr-2" />
          <span className="hidden sm:inline">Back to website</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </div> */}

      {/* The actual page content (your Login or Signup card) renders here */}
      <div className="w-full flex justify-center z-10">
        <Outlet />
      </div>

    </div>
  );
}