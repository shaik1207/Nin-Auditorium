import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, 
  ShieldCheck, 
  User, 
  Users,
  X
} from 'lucide-react';

export default function SupervisorSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar automatically when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileOpen]);

  // ==========================================
  // LISTEN TO NAVBAR HAMBURGER CLICK
  // ==========================================
  useEffect(() => {
    // This listens to the event fired by your Supervisor Navbar
    const handleToggle = () => setIsMobileOpen(true);
    window.addEventListener('toggle-supervisor-sidebar', handleToggle);
    
    // Cleanup listener on unmount
    return () => window.removeEventListener('toggle-supervisor-sidebar', handleToggle);
  }, []);

  // Supervisor specific navigation links
  const navItems = [
    { id: 'Dashboard', icon: LayoutGrid, path: '/supervisor/dashboard' },
    { id: 'Approvals', icon: ShieldCheck, path: '/supervisor/approvals' },
    { id: 'Profile', icon: User, path: '/supervisor/profile' }, // <-- Activated the Profile route here!
  ];

  return (
    <>
      {/* ================= MOBILE DRAWER OVERLAY ================= */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Dark Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsMobileOpen(false)} 
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 lg:hidden" 
            />
            
            {/* Sliding Sidebar Panel */}
            <motion.aside 
              initial={{ x: "-100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "-100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }} 
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 flex flex-col justify-between py-6 shadow-2xl lg:hidden"
            >
              <div>
                <div className="flex items-center justify-between px-6 mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full flex items-center justify-center text-white shadow-md">
                      <Users size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h1 className="text-[20px] font-bold text-gray-900 leading-none">Nin Bookings</h1>
                      <p className="text-[10px] font-semibold text-[#10B981] tracking-wider uppercase mt-0.5">Supervisor</p>
                    </div>
                  </div>
                  <button onClick={() => setIsMobileOpen(false)} className="p-2 -mr-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors active:scale-95">
                    <X size={18} />
                  </button>
                </div>
                <nav className="flex flex-col gap-1.5 px-4">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink key={item.id} to={item.path} className={({ isActive }) => `flex items-center px-4 py-3.5 rounded-[1.25rem] transition-all duration-200 ${isActive ? 'bg-[#10B981]/10 text-[#10B981] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <Icon size={22} className="mr-4" strokeWidth={1.5} />
                        <span className="text-[15px]">{item.id}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ================= DESKTOP SIDEBAR ================= */}
      {/* Hidden on screens smaller than LG so it perfectly hands off control to the Navbar */}
      <motion.aside 
        initial={{ width: 280 }} 
        animate={{ width: isOpen ? 280 : 88 }} 
        transition={{ type: "spring", stiffness: 300, damping: 30 }} 
        className="hidden lg:flex h-screen bg-[#F0F3FA] relative flex-col justify-between py-8 border-r border-gray-200/50 shadow-sm overflow-hidden z-20 shrink-0"
      >
        <div>
          <div onClick={() => setIsOpen(!isOpen)} className="flex items-center px-6 mb-10 cursor-pointer group hover:opacity-80 transition-opacity" title="Click to toggle sidebar">
            <div className="min-w-[48px] h-12 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full flex items-center justify-center text-white shadow-md transition-transform group-active:scale-95">
              <Users size={24} strokeWidth={1.5} />
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="ml-3 whitespace-nowrap overflow-hidden">
                  <h1 className="text-[22px] font-bold text-gray-900 leading-tight">Nin Bookings</h1>
                  <p className="text-[10px] font-bold text-[#10B981] tracking-wider uppercase">Supervisor Workspace</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <nav className="flex flex-col gap-1.5 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.id} to={item.path} className={({ isActive }) => `flex items-center px-3 py-3.5 rounded-[1.25rem] transition-all duration-300 relative overflow-hidden ${isActive ? 'bg-gradient-to-r from-[#10B981] to-[#34D399] text-white shadow-[0_4px_15px_rgba(16,185,129,0.25)]' : 'text-gray-600 hover:bg-[#E5E9F5] hover:text-gray-900'}`}>
                  {({ isActive }) => (
                    <>
                      <div className={`min-w-[24px] flex items-center justify-center ${isOpen ? 'ml-1' : 'mx-auto'}`}><Icon size={22} strokeWidth={isActive ? 2 : 1.5} /></div>
                      <AnimatePresence>
                        {isOpen && <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }} className="ml-4 text-[15px] font-medium whitespace-nowrap">{item.id}</motion.span>}
                      </AnimatePresence>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
        <div className="px-5 mb-4">
          <AnimatePresence>
            {isOpen ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }} className="bg-white/80 backdrop-blur-md border border-white rounded-[1.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <p className="text-[13px] font-medium text-gray-400 mb-1">System Status</p>
                <p className="text-[14px] text-gray-700 leading-snug font-medium">All systems operational.</p>
              </motion.div>
            ) : (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-12 h-12 mx-auto bg-white/80 border border-white rounded-full flex items-center justify-center shadow-sm text-emerald-500 cursor-pointer hover:bg-white transition-colors" title="All systems operational."><ShieldCheck size={20} strokeWidth={2.5} /></motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );
}