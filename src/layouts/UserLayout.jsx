import React from 'react';
import { Outlet } from 'react-router-dom';
import { Search, Bell, ChevronDown } from 'lucide-react';

// Corrected import path based on your exact folder structure
import UserSidebar from '../components/sidebar/UserSidebar.jsx'; 

export default function UserLayout() {
  return (
    <div className="flex h-screen bg-[#EEF2F6] overflow-hidden font-sans selection:bg-[#6C5CE7] selection:text-white">
      
      {/* 1. Left Navigation: Our Animated Sidebar */}
      <UserSidebar />

      {/* 2. Main Right-Side Content Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* ================= TOP HEADER ================= */}
        <header className="h-[88px] flex items-center justify-between px-8 bg-[#EEF2F6]/80 backdrop-blur-md z-10 sticky top-0">
          
          {/* Left: Page Title / Search */}
          <div className="flex items-center gap-6 flex-1">
            <h1 className="text-2xl font-bold text-gray-800 hidden sm:block">
              Dashboard
            </h1>
            
            {/* Search Bar */}
            <div className="relative max-w-md w-full ml-4 hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search halls, bookings..."
                className="w-full pl-11 pr-4 py-2.5 bg-white border-transparent focus:bg-white focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/20 rounded-[1rem] text-sm transition-all shadow-sm outline-none"
              />
            </div>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Notifications */}
            <button className="relative p-2.5 bg-white rounded-xl text-gray-500 hover:text-[#6C5CE7] hover:shadow-md transition-all shadow-sm">
              <Bell size={20} />
              {/* Notification Dot */}
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>

            {/* User Profile Dropdown Toggle */}
            <button className="flex items-center gap-3 p-1.5 pr-3 bg-white rounded-[1.25rem] hover:shadow-md transition-all shadow-sm border border-gray-100/50">
              <img 
                src="https://ui-avatars.com/api/?name=User+Name&background=6C5CE7&color=fff" 
                alt="Profile" 
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-800 leading-tight">Mohammad S.</p>
                <p className="text-xs text-gray-500 font-medium">User</p>
              </div>
              <ChevronDown size={16} className="text-gray-400 hidden sm:block ml-1" />
            </button>
            
          </div>
        </header>

        {/* ================= MAIN SCROLLABLE CONTENT ================= */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 pb-20 scroll-smooth">
          <div className="max-w-7xl mx-auto h-full">
            {/* Nested routes render here */}
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}