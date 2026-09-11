import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Calendar, Users, Loader2, Check, X, RefreshCw, ScanLine, XCircle, AlertCircle } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner'; 
import toast, { Toaster } from 'react-hot-toast';
import api from '../../services/api'; 

export default function SupervisorApprovals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Real-time Backend State
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null); 

  // Scanner & Modal States
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedBooking, setScannedBooking] = useState(null);

  // ==========================================
  // FETCH BOOKINGS
  // ==========================================
  const fetchApprovalsData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/supervisor/bookings');
      
      // Extract data safely
      const dataArray = Array.isArray(response.data) ? response.data : [];

      // Sort newest first safely
      const sortedBookings = dataArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(sortedBookings);

    } catch (error) {
      console.error("Failed to fetch approvals data:", error);
      const errorMessage = error.response?.data?.message || "Failed to sync latest approvals. Check backend connection.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalsData();
  }, []);

  // ==========================================
  // NATIVE CAMERA SUPPORT (URL PARAMETERS)
  // ==========================================
  useEffect(() => {
    const scanId = searchParams.get('scanId');
    if (scanId && bookings.length > 0) {
      const found = bookings.find(b => b._id === scanId);
      if (found) {
        setScannedBooking(found);
        setSearchParams({}); // Clear URL to prevent looping
      } else {
        toast.error("Booking not found or already archived.");
        setSearchParams({});
      }
    }
  }, [searchParams, bookings, setSearchParams]);

  // ==========================================
  // IN-APP SCANNER HANDLER
  // ==========================================
  const handleScan = (text) => {
    if (text) {
      try {
        const url = new URL(text);
        const extractedScanId = url.searchParams.get('scanId');
        
        if (extractedScanId) {
          const found = bookings.find(b => b._id === extractedScanId);
          if (found) {
            setIsScannerOpen(false); 
            setScannedBooking(found); 
            toast.success("Ticket scanned successfully!");
          } else {
            toast.error("Booking not found in the current system.");
            setIsScannerOpen(false);
          }
        } else {
          toast.error("Invalid QR Code format.");
        }
      } catch (e) {
        toast.error("Unrecognized QR Code.");
      }
    }
  };

  // ==========================================
  // ACTION: APPROVE / REJECT
  // ==========================================
  const handleStatusUpdate = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      await api.put(`/supervisor/bookings/${bookingId}/status`, { status: newStatus });
      
      // Update local state instantly for snappy UI
      setBookings(prevBookings => 
        prevBookings.map(b => b._id === bookingId ? { ...b, status: newStatus } : b)
      );

      // Update modal state if open
      if (scannedBooking && scannedBooking._id === bookingId) {
        setScannedBooking({ ...scannedBooking, status: newStatus });
      }

      toast.success(`Booking ${newStatus}!`);
    } catch (error) {
      console.error(`Failed to mark as ${newStatus}:`, error);
      toast.error(error.response?.data?.message || `Could not update booking status.`);
    } finally {
      setUpdatingId(null);
    }
  };

  // UI Filtering Logic
  const filteredData = bookings.filter(item => {
    if (activeFilter === 'All') return true;
    return item.status === activeFilter;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-[#ECFDF5] via-[#F0FDF4] to-[#ECFDF5] p-4 sm:p-6 md:p-8 rounded-[2rem] relative overflow-hidden">
      
      <Toaster position="top-right" />

      {/* Emerald themed decorative background blurs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-300/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-teal-400/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1400px] w-full mx-auto relative z-10">
        
        {/* ================= HEADER & FILTERS ================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="flex items-start gap-4">
            <div>
              <h1 className="text-3xl md:text-[2.5rem] font-bold text-gray-900 tracking-tight mb-2">Team Approvals</h1>
              <p className="text-gray-500 text-sm md:text-[15px] font-medium">Review booking requests and oversee your team.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <button onClick={fetchApprovalsData} disabled={isLoading} className="p-3 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-all text-gray-600 active:scale-95 disabled:opacity-50" title="Refresh Data">
                <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
              </button>

              <button 
                onClick={() => setIsScannerOpen(true)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:bg-gray-800 transition-all active:scale-95 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <ScanLine size={20} className="relative z-10 group-hover:animate-pulse" />
                <span className="font-bold text-sm relative z-10 pr-1">Scan Ticket</span>
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2 lg:pb-0">
            {['Pending', 'Approved', 'Rejected', 'All'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2.5 rounded-2xl text-[13px] font-bold transition-all whitespace-nowrap active:scale-95 ${
                  activeFilter === filter 
                    ? 'bg-[#10B981] text-white shadow-[0_4px_15px_rgba(16,185,129,0.3)]' 
                    : 'bg-white/60 backdrop-blur-md text-gray-600 border border-white hover:bg-white hover:shadow-sm'
                }`}
              >
                {filter}
              </button>
            ))}
          </motion.div>
        </div>

        {/* ================= DATA LIST CONTAINER ================= */}
        {isLoading && bookings.length === 0 ? (
          <div className="flex items-center justify-center py-20 opacity-70">
            <Loader2 className="animate-spin text-[#10B981]" size={48} />
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredData.map((item) => (
                <motion.div key={item._id} variants={itemVariants} initial="hidden" animate="show" exit="exit" layout className="bg-white/80 backdrop-blur-xl border border-white rounded-[1.5rem] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all group">
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full md:w-auto">
                    <div className="w-full sm:w-[160px] h-[100px] rounded-[1rem] overflow-hidden shrink-0 bg-gray-100 shadow-inner">
                      <img src={item.hall?.image || 'https://images.unsplash.com/photo-1592247350271-c5efb34dd967?q=80&w=2070&auto=format&fit=crop'} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 className="text-lg font-bold text-gray-900 mb-0.5 leading-tight group-hover:text-[#10B981] transition-colors">
                        {item.title} <span className="text-gray-400 text-sm ml-2 font-medium">({item._id.substring(0, 6).toUpperCase()})</span>
                      </h3>
                      <p className="text-sm font-medium text-gray-500 mb-3">{item.user?.fullName || item.organizer} · {item.user?.email || 'N/A'}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-gray-500">
                        <div className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400" /><span>{item.hall?.name || 'Unknown Venue'}</span></div>
                        <div className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400" /><span>{item.date} · {item.startTime}-{item.endTime}</span></div>
                        <div className="flex items-center gap-1.5"><Users size={14} className="text-gray-400" /><span>{item.audience} attendees</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between md:justify-end w-full md:w-auto gap-4 md:gap-3 pt-4 md:pt-0 border-t border-gray-100 md:border-0 shrink-0">
                    <div className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-sm w-full sm:w-auto ${item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : item.status === 'Rejected' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Approved' ? 'bg-emerald-500' : item.status === 'Rejected' ? 'bg-red-500' : 'bg-amber-500 animate-pulse'}`} />
                      {item.status}
                    </div>

                    {item.status === 'Pending' && (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button onClick={() => handleStatusUpdate(item._id, 'Approved')} disabled={updatingId === item._id} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-sm font-bold transition-colors active:scale-95 disabled:opacity-50 shadow-sm">
                          {updatingId === item._id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={2.5} />} Approve
                        </button>
                        <button onClick={() => handleStatusUpdate(item._id, 'Rejected')} disabled={updatingId === item._id} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-500 rounded-xl text-sm font-bold transition-colors active:scale-95 disabled:opacity-50 shadow-sm">
                          {updatingId === item._id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} strokeWidth={2.5} />} Reject
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {!isLoading && filteredData.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full py-16 flex flex-col items-center justify-center text-center bg-white/50 backdrop-blur-md rounded-[1.5rem] border border-white">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400"><Calendar size={24} /></div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No requests found</h3>
                <p className="text-sm font-medium text-gray-500">There are no {activeFilter.toLowerCase()} bookings at the moment.</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* ==================== MODAL 1: CAMERA SCANNER ==================== */}
      <AnimatePresence>
        {isScannerOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl relative">
              
              <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-white relative z-10">
                <h3 className="font-bold text-gray-900 flex items-center gap-2"><ScanLine size={18} className="text-[#10B981]" /> Scan Ticket QR</h3>
                <button onClick={() => setIsScannerOpen(false)} className="text-gray-400 hover:text-gray-700 active:scale-90 transition-transform"><XCircle size={24} /></button>
              </div>

              <div className="bg-black aspect-square w-full relative overflow-hidden flex items-center justify-center">
                <Scanner 
                  onResult={(text) => handleScan(text)} 
                  onError={(error) => console.log("Scanner Error:", error?.message)}
                  components={{ audio: false, finder: false }} 
                />
                
                <div className="absolute inset-0 pointer-events-none border-[50px] border-black/40" />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-white/50 rounded-3xl relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#10B981] rounded-tl-3xl -translate-x-[2px] -translate-y-[2px]" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#10B981] rounded-tr-3xl translate-x-[2px] -translate-y-[2px]" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#10B981] rounded-bl-3xl -translate-x-[2px] translate-y-[2px]" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#10B981] rounded-br-3xl translate-x-[2px] translate-y-[2px]" />
                    <motion.div animate={{ y: [0, 250, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="w-full h-0.5 bg-[#10B981] shadow-[0_0_15px_#10B981]" />
                  </div>
                </div>
              </div>

              <div className="p-5 text-center bg-white">
                <p className="text-sm font-medium text-gray-500">Position the QR code within the frame to scan.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== MODAL 2: SCANNED BOOKING DETAILS ==================== */}
      <AnimatePresence>
        {scannedBooking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-[500px] bg-white rounded-[2rem] overflow-hidden shadow-2xl">
              
              <div className="p-6 bg-gradient-to-br from-[#10B981] to-[#059669] text-white relative">
                <button onClick={() => setScannedBooking(null)} className="absolute top-6 right-6 text-white/70 hover:text-white active:scale-90 transition-transform"><XCircle size={24} /></button>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                  <CheckCircle2 size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-1 line-clamp-1">{scannedBooking.title}</h2>
                <p className="text-white/80 font-medium text-sm">Ticket ID: {scannedBooking._id.substring(0,8).toUpperCase()}</p>
              </div>

              <div className="p-8 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <span className="text-sm text-gray-500 font-medium">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${scannedBooking.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : scannedBooking.status === 'Rejected' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'}`}>
                    {scannedBooking.status}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <span className="text-sm text-gray-500 font-medium">Organizer</span>
                  <span className="text-sm font-bold text-gray-900">{scannedBooking.organizer}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <span className="text-sm text-gray-500 font-medium">Venue</span>
                  <span className="text-sm font-bold text-gray-900">{scannedBooking.hall?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between pb-2">
                  <span className="text-sm text-gray-500 font-medium">Timeline</span>
                  <span className="text-sm font-bold text-gray-900">{scannedBooking.date} ({scannedBooking.startTime}-{scannedBooking.endTime})</span>
                </div>

                {/* Only show action buttons if the booking is currently pending */}
                {scannedBooking.status === 'Pending' ? (
                  <div className="flex gap-3 pt-6">
                    <button 
                      onClick={() => handleStatusUpdate(scannedBooking._id, 'Approved')}
                      disabled={updatingId === scannedBooking._id}
                      className="flex-1 py-3.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-bold shadow-[0_4px_15px_rgba(16,185,129,0.2)] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {updatingId === scannedBooking._id ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} strokeWidth={2.5} />} Approve
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(scannedBooking._id, 'Rejected')}
                      disabled={updatingId === scannedBooking._id}
                      className="flex-1 py-3.5 bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 rounded-xl font-bold active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {updatingId === scannedBooking._id ? <Loader2 size={18} className="animate-spin" /> : <X size={18} strokeWidth={2.5} />} Reject
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-3 mt-4 border border-gray-100">
                    <AlertCircle size={18} className="text-gray-400 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium text-gray-500">This request has already been processed. No further action is required.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}