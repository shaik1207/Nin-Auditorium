import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, ScanLine, ShieldCheck, 
  CheckCircle2, AlertCircle, Loader2, Check, X, Menu
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Scanner } from '@yudiel/react-qr-scanner';
import api from '../../services/api';

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [adminName, setAdminName] = useState('Loading...');

  // Scanner & Modal States
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedBooking, setScannedBooking] = useState(null);
  const [isResolvingScan, setIsResolvingScan] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // ==========================================
  // INITIALIZATION: Profile
  // ==========================================
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        const firstName = response.data.fullName?.split(' ')[0] || 'Admin';
        setAdminName(firstName);
      } catch (error) {
        setAdminName('Admin');
      }
    };
    fetchAdminProfile();
    
    // Ensure dark mode classes are applied correctly
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('aurora_token');
    toast.success("Logged out successfully!");
    navigate('/login');
  };

  // ==========================================
  // SCANNER & APPROVAL LOGIC
  // ==========================================
  const handleScan = async (detectedData, legacyResult) => {
    if (isResolvingScan) return;

    let rawText = '';
    const payload = detectedData || legacyResult;
    
    if (typeof payload === 'string') {
      rawText = payload;
    } else if (Array.isArray(payload) && payload.length > 0) {
      rawText = payload[0].rawValue || payload[0].text;
    } else if (payload && (payload.rawValue || payload.text)) {
      rawText = payload.rawValue || payload.text;
    }

    if (!rawText) return;

    try {
      setIsResolvingScan(true);

      let extractedId = rawText;
      try {
        const url = new URL(rawText);
        const paramId = url.searchParams.get('scanId');
        if (paramId) extractedId = paramId;
      } catch (e) {}

      if (extractedId) {
        const res = await api.get('/admin/bookings');
        const bookingsList = Array.isArray(res.data) ? res.data : (res.data.bookings || []);
        
        const found = bookingsList.find(b => 
          String(b._id) === String(extractedId) || 
          String(b.bookingId) === String(extractedId)
        );
        
        if (found) {
          setIsScannerOpen(false); 
          setScannedBooking(found); 
        } else {
          toast.error("Booking not found. Invalid or expired pass.");
          setIsScannerOpen(false);
        }
      } else {
        toast.error("Invalid QR Code format.");
        setIsScannerOpen(false);
      }
    } catch (e) {
      console.error("Scanner Error:", e);
      if (e.message === 'Network Error' || e.code === 'ERR_NETWORK') {
        toast.error("Network Error: Ensure your device is on the same Wi-Fi and using the Local IP address.", { duration: 5000 });
      } else {
        toast.error("Failed to fetch booking details.");
      }
      setIsScannerOpen(false);
    } finally {
      setTimeout(() => setIsResolvingScan(false), 800);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      await api.put(`/admin/bookings/${bookingId}/status`, { status: newStatus });
      setScannedBooking(prev => ({ ...prev, status: newStatus }));
      toast.success(`Booking successfully ${newStatus.toLowerCase()}!`);
      
      if (location.pathname === '/admin/approvals') {
        window.location.reload(); 
      }
    } catch (error) {
      toast.error(`Could not update booking status.`);
    } finally {
      setUpdatingId(null);
    }
  };

  const currentStatus = scannedBooking?.status?.toLowerCase() || '';
  const isPending = currentStatus === 'pending' || currentStatus === 'under review';
  const isApproved = currentStatus === 'approved';

  return (
    <>
      {/* ==================== DYNAMIC ISLAND NAVBAR ==================== */}
      {/* OVERLAP BUG FIXED: Changed z-50 to z-20 so the sidebar perfectly slides over this component */}
      <div className="sticky top-0 z-20 w-full px-3 sm:px-4 pt-4 pb-2 mb-6 pointer-events-none flex justify-center items-center gap-2 sm:gap-3">
        
        {/* 1. Detached Menu Circle (Mobile Only) */}
        <motion.button 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
          onClick={() => window.dispatchEvent(new Event('toggle-admin-sidebar'))}
          className="lg:hidden pointer-events-auto w-10 h-10 sm:w-[42px] sm:h-[42px] bg-gradient-to-br from-[#1A1A2E]/95 to-[#2A1B54]/95 backdrop-blur-3xl border border-white/10 rounded-full flex items-center justify-center text-white shadow-[0_20px_40px_rgba(42,27,84,0.4)] shrink-0 active:scale-95 transition-transform"
        >
          <Menu size={18} strokeWidth={2.5} />
        </motion.button>

        {/* 2. Main Admin Pill */}
        <motion.nav 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.3, delay: 0.05 }}
          className="bg-gradient-to-r from-[#1A1A2E]/95 via-[#2A1B54]/95 to-[#1A1A2E]/95 backdrop-blur-3xl border border-white/10 p-1.5 flex items-center justify-between flex-1 lg:flex-none w-full max-w-[800px] shadow-[0_20px_40px_rgba(42,27,84,0.4)] pointer-events-auto"
          style={{ borderRadius: '100px' }} 
        >
          {/* LEFT SIDE: Brand Logo & Profile */}
          <div className="flex items-center gap-2 pr-4 pl-1">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5 outline-none group pl-1">
              <div className="hidden sm:flex w-8 h-8 rounded-full bg-white items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
                <ShieldCheck size={16} className="text-[#2A1B54]" />
              </div>
              <span className="font-bold text-white tracking-wide text-sm pr-2 pl-2 sm:pl-0">
                {adminName}
              </span>
            </Link>
          </div>

          {/* RIGHT SIDE: Action Buttons (Scan & Logout) */}
          <div className="flex items-center bg-white/10 border border-white/10 rounded-full p-1 pl-2 ml-auto backdrop-blur-md">
            {/* Scanner Button */}
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full hover:bg-white/20 text-white transition-all active:scale-95 group shadow-sm"
            >
              <ScanLine size={16} className="group-hover:animate-pulse text-[#B0A3FF]" />
              <span className="text-[13px] font-bold hidden md:block pr-1 tracking-wide">Scan Pass</span>
            </button>

            <div className="w-px h-5 bg-white/20 mx-1" />

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-500/20 text-red-300 transition-all active:scale-95 ml-0.5"
              title="Logout"
            >
              <LogOut size={15} strokeWidth={2.5} />
            </button>
          </div>
        </motion.nav>
      </div>

      {/* ==================== MODAL 1: CAMERA SCANNER ==================== */}
      <AnimatePresence>
        {isScannerOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-md bg-[#1C1E26] rounded-[2rem] overflow-hidden shadow-2xl relative border border-white/5">
              <div className="p-4 flex items-center justify-between border-b border-white/5 bg-[#1C1E26] relative z-10">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <ScanLine size={18} className="text-[#8C7CFF]" /> Scan Ticket QR
                </h3>
                <button onClick={() => setIsScannerOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors active:scale-90 z-10">
                  <X size={16} />
                </button>
              </div>

              <div className="bg-black aspect-square w-full relative overflow-hidden flex items-center justify-center">
                {isResolvingScan ? (
                  <div className="flex flex-col items-center gap-3 text-white">
                    <Loader2 size={40} className="animate-spin text-[#8C7CFF]" />
                    <p className="font-medium text-sm">Verifying Ticket...</p>
                  </div>
                ) : (
                  <>
                    <Scanner 
                      onScan={(result) => handleScan(result)} 
                      onResult={(text, result) => handleScan(text, result)}
                      onError={(error) => console.log("Scanner Error:", error?.message)}
                      components={{ audio: false, finder: false }} 
                    />
                    <div className="absolute inset-0 pointer-events-none border-[50px] border-[#1C1E26]/80" />
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-64 h-64 border-2 border-white/30 rounded-[2rem] relative">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#8C7CFF] rounded-tl-[2rem] -translate-x-[2px] -translate-y-[2px]" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#8C7CFF] rounded-tr-[2rem] translate-x-[2px] -translate-y-[2px]" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#8C7CFF] rounded-bl-[2rem] -translate-x-[2px] translate-y-[2px]" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#8C7CFF] rounded-br-[2rem] translate-x-[2px] translate-y-[2px]" />
                        <motion.div animate={{ y: [0, 250, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="w-full h-0.5 bg-[#8C7CFF] shadow-[0_0_15px_#8C7CFF]" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== MODAL 2: GLASSSMORPHISM DETAILS ==================== */}
      <AnimatePresence>
        {scannedBooking && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} 
              className="w-full max-w-[420px] bg-[#1C1E26]/80 backdrop-blur-3xl rounded-[2rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/5 relative"
            >
              <div className="absolute top-0 left-0 w-[150%] h-64 bg-gradient-to-br from-[#8C7CFF]/30 via-[#8C7CFF]/5 to-transparent pointer-events-none rounded-full blur-3xl -translate-x-1/4 -translate-y-1/4" />

              <button onClick={() => setScannedBooking(null)} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20">
                <X size={16} />
              </button>

              <div className="p-8 relative z-10">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4 border border-white/5 shadow-inner">
                  <ScanLine size={18} className="text-white" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-1 leading-tight">{scannedBooking.title}</h2>
                <p className="text-sm text-[#A3A3C2] mb-6">Ticket ID: {scannedBooking._id.substring(0,8).toUpperCase()}</p>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-sm text-[#A3A3C2]">Current Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                      isApproved ? 'bg-[#4ADE80]/20 text-[#4ADE80]' : 
                      isPending ? 'bg-[#FFB800]/20 text-[#FFB800]' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {scannedBooking.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-sm text-[#A3A3C2]">Organizer</span>
                    <span className="text-sm font-bold text-white">{scannedBooking.organizer}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-sm text-[#A3A3C2]">Venue</span>
                    <span className="text-sm font-bold text-white">{scannedBooking.hall?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-sm text-[#A3A3C2]">Timeline</span>
                    <span className="text-sm font-bold text-white text-right w-[160px] truncate">{scannedBooking.date} <br/> ({scannedBooking.startTime} - {scannedBooking.endTime})</span>
                  </div>
                </div>

                {/* Conditional Rendering Based on Booking Status */}
                {isPending ? (
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleStatusUpdate(scannedBooking._id, 'Approved')}
                      disabled={updatingId === scannedBooking._id}
                      className="flex-1 py-3.5 bg-gradient-to-b from-[#4ADE80] to-[#22C55E] text-white rounded-full font-bold shadow-[0_0_20px_rgba(34,197,94,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {updatingId === scannedBooking._id ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} strokeWidth={2.5} />} Approve
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(scannedBooking._id, 'Rejected')}
                      disabled={updatingId === scannedBooking._id}
                      className="flex-1 py-3.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-full font-bold shadow-[0_0_20px_rgba(239,68,68,0.1)] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {updatingId === scannedBooking._id ? <Loader2 size={18} className="animate-spin" /> : <X size={18} strokeWidth={2.5} />} Reject
                    </button>
                  </div>
                ) : isApproved ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 mt-4">
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                      <CheckCircle2 size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-black text-emerald-400 tracking-wide uppercase">Verified Pass</h3>
                    <p className="text-sm font-medium text-emerald-200/70 text-center">This booking is approved and the pass is valid.</p>
                  </div>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-start gap-3 mt-4">
                    <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium text-red-300">This pass has been rejected or is invalid. Entry denied.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}