import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, 
  Building2, 
  CalendarDays, 
  User, 
  Sparkles,
  Menu,
  X
} from 'lucide-react';

export default function UserSidebar() {
  const [isOpen, setIsOpen] = useState(true); // For Desktop collapsed state
  const [isMobileOpen, setIsMobileOpen] = useState(false); // For Mobile drawer state
  const location = useLocation();

  // Close mobile menu automatically when a route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Prevent scrolling on the body when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileOpen]);

  // Navigation Items
  const navItems = [
    { id: 'Dashboard', icon: LayoutGrid, path: '/user/home' },
    { id: 'Book Hall', icon: Building2, path: '/user/book' },
    { id: 'My Bookings', icon: CalendarDays, path: '/user/bookings' },
    { id: 'Profile', icon: User, path: '/user/profile' },
  ];

  return (
    <>
      {/* ================= FLOATING MOBILE MENU ICON ================= */}
      {/* This strictly shows just a floating menu button on mobile screens */}
      <div className="md:hidden fixed top-6 left-6 z-40">
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="p-3 bg-white rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] text-[#8C7CFF] hover:text-[#6C5CE7] hover:scale-105 transition-all active:scale-95 border border-gray-100"
        >
          <Menu size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* ================= MOBILE DRAWER OVERLAY ================= */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 md:hidden"
            />
            
            {/* Sliding Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 flex flex-col justify-between py-6 shadow-2xl md:hidden"
            >
              <div>
                <div className="flex items-center justify-between px-6 mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#8C7CFF] to-[#6C5CE7] rounded-full flex items-center justify-center text-white shadow-md">
                      <Sparkles size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h1 className="text-[20px] font-bold text-gray-900 leading-none">NIN</h1>
                      <p className="text-[10px] font-semibold text-gray-500 tracking-wider uppercase mt-0.5">Auditorium</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsMobileOpen(false)}
                    className="p-2 -mr-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <nav className="flex flex-col gap-1.5 px-4">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) => `flex items-center px-4 py-3.5 rounded-[1.25rem] transition-all duration-200 ${
                          isActive 
                            ? 'bg-[#8B7AFF]/10 text-[#8B7AFF] font-semibold' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
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
      <motion.aside
        initial={{ width: 280 }}
        animate={{ width: isOpen ? 280 : 88 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden md:flex h-screen bg-[#F0F3FA] relative flex-col justify-between py-8 border-r border-gray-200/50 shadow-sm overflow-hidden z-20 shrink-0"
      >
        <div>
          {/* Logo / Profile Toggle */}
          <div 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center px-6 mb-10 cursor-pointer group hover:opacity-80 transition-opacity"
            title="Click to toggle sidebar"
          >
            <div className="min-w-[48px] h-12 bg-gradient-to-br from-[#8C7CFF] to-[#6C5CE7] rounded-full flex items-center justify-center text-white shadow-md transition-transform group-active:scale-95">
              <Sparkles size={24} strokeWidth={1.5} />
            </div>
            
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3 whitespace-nowrap overflow-hidden"
                >
                  <h1 className="text-[22px] font-bold text-gray-900 leading-tight">NIN Booking</h1>
                  <p className="text-[10px] font-semibold text-gray-500 tracking-wider uppercase">Auditorium</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex flex-col gap-1.5 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) => `flex items-center px-3 py-3.5 rounded-[1.25rem] transition-all duration-300 relative overflow-hidden ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#8B7AFF] to-[#9B88FF] text-white shadow-[0_4px_15px_rgba(139,122,255,0.25)]' 
                      : 'text-gray-600 hover:bg-[#E5E9F5] hover:text-gray-900'
                  }`}
                >
                  {({ isActive }) => (
                    <>
                      <div className={`min-w-[24px] flex items-center justify-center ${isOpen ? 'ml-1' : 'mx-auto'}`}>
                        <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
                      </div>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-4 text-[15px] font-medium whitespace-nowrap"
                          >
                            {item.id}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Desktop Bottom Tip */}
        <div className="px-5 mb-4">
          <AnimatePresence>
            {isOpen ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="bg-white/80 backdrop-blur-md border border-white rounded-[1.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <p className="text-[13px] font-medium text-gray-400 mb-1">Tip</p>
                <p className="text-[14px] text-gray-700 leading-snug font-medium">
                  Show the Qr code for  Admin for easy booking
                </p>
              </motion.div>
            ) : (
               <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-12 h-12 mx-auto bg-white/80 border border-white rounded-full flex items-center justify-center shadow-sm text-gray-400 cursor-pointer hover:bg-white transition-colors"
                title="Toggle theme from the top bar for light or dark."
               >
                 <span className="font-bold text-lg leading-none">?</span>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );
}