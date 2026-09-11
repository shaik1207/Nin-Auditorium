import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Bell, ShieldCheck } from 'lucide-react';
import api from '../services/api'; 
import SupervisorSidebar from '../components/sidebar/SupervisorSidebar';

export default function SupervisorLayout() {
  const location = useLocation();
  const [supervisorName, setSupervisorName] = useState('Loading...');

  // ==========================================
  // AUTHENTICATION & PROFILE FETCH
  // ==========================================
  const token = localStorage.getItem('aurora_token');

  useEffect(() => {
    // If no token, they shouldn't be here
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        const firstName = response.data.fullName?.split(' ')[0] || 'Supervisor';
        setSupervisorName(firstName);
      } catch (error) {
        console.error("Failed to fetch supervisor profile");
        setSupervisorName('Supervisor');
      }
    };
    fetchProfile();
  }, [token]);

  // Prevent rendering if not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Fire global event to open the imported SupervisorSidebar on mobile
  const handleMobileMenuToggle = () => {
    window.dispatchEvent(new Event('toggle-supervisor-sidebar'));
  };

  return (
    // FIXED: Changed min-h-screen to h-screen to strictly lock the viewport height
    <div className="h-screen w-full bg-[#F4F7FB] flex font-sans overflow-hidden">
      
      {/* ==================== IMPORTED SIDEBAR ==================== */}
      <SupervisorSidebar />

      {/* ==================== MAIN CONTENT AREA ==================== */}
      {/* FIXED: Changed min-h-screen to h-full to perfectly fit inside the parent without overflowing */}
      <div className="flex-1 flex flex-col h-full relative z-10">
        
        {/* TOP HEADER */}
        <header className="h-[80px] lg:h-[88px] bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 shrink-0 z-30">
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleMobileMenuToggle}
              className="lg:hidden p-2 -ml-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors active:scale-95"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-900 hidden sm:block">Team Overview</h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            {/* System Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
              <ShieldCheck size={14} className="text-[#10B981]" />
              <span className="text-xs font-bold text-[#10B981]">Secure</span>
            </div>

            {/* Notification Bell */}
            <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors active:scale-95">
              <Bell size={18} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Profile Pill */}
            <div className="flex items-center gap-3 pl-1 pr-4 py-1 bg-white border border-gray-100 rounded-full shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[#10B981] font-bold text-sm">
                {supervisorName.charAt(0)}
              </div>
              <span className="text-sm font-bold text-gray-700 hidden sm:block">{supervisorName}</span>
            </div>
          </div>
        </header>

        {/* DYNAMIC PAGE CONTENT (Outlet) */}
        {/* Keeps overflow-y-auto so ONLY this inner container scrolls if the page gets too long */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 w-full relative z-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto h-full"
          >
            <Outlet />
          </motion.div>
        </main>

      </div>
    </div>
  );
}