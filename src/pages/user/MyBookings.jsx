import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Users, AlertCircle, Loader2, 
  MapPin, CheckCircle2, Activity, Ticket, XCircle, X, 
  ImageIcon, ChevronLeft, Download, Share, BadgeCheck
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast'; 
import api from '../../services/api'; 
import html2canvas from 'html2canvas';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  
  // State for the Ticket Modal
  const [ticketModalBooking, setTicketModalBooking] = useState(null);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);

  // ==========================================
  // REAL-TIME POLLING FETCH
  // ==========================================
  const fetchMyBookings = async (isBackground = false) => {
    try {
      if (!isBackground) setIsLoading(true);
      const response = await api.get('/bookings/my');
      const sortedBookings = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(sortedBookings);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      if (!isBackground) toast.error("Failed to load bookings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings(false);
    const intervalId = setInterval(() => {
      fetchMyBookings(true);
    }, 15000);
    return () => clearInterval(intervalId); 
  }, []);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  // ==========================================
  // HANDLE VIEW PASS CLICK
  // ==========================================
  const handleViewPassClick = (booking) => {
    if (booking.status === 'Approved') {
      setTicketModalBooking(booking);
    } else if (booking.status === 'Rejected') {
      toast.error('This booking was rejected.', {
        style: { borderRadius: '12px', background: '#333', color: '#fff' }
      });
    } else {
      toast('Waiting for admin approval', {
        icon: '⏳',
        style: { borderRadius: '12px', background: '#333', color: '#fff' }
      });
    }
  };

  // ==========================================
  // SAVE AS IMAGE ACTION
  // ==========================================
  const handleSaveImage = async () => {
    const ticketElement = document.getElementById('printable-ticket');
    if (!ticketElement || !ticketModalBooking) return;

    setIsDownloadingImage(true);
    toast.loading("Saving your pass...", { id: 'image-download' });

    const hideForPrint = document.querySelectorAll('.hide-on-print');
    hideForPrint.forEach(el => el.style.opacity = '0');

    try {
      const canvas = await html2canvas(ticketElement, {
        scale: 3, 
        useCORS: true, 
        backgroundColor: '#ffffff',
        scrollY: -window.scrollY, 
        scrollX: 0,
      });

      const imgData = canvas.toDataURL('image/png');
      const hallName = ticketModalBooking.hall?.name || 'Auditorium';
      const safeHallName = hallName.replace(/[^a-zA-Z0-9]/g, '_'); 
      const fileName = `${safeHallName}_Pass.png`;

      const downloadLink = document.createElement('a');
      downloadLink.href = imgData;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      toast.success("Pass saved to gallery!", { id: 'image-download' });
    } catch (error) {
      console.error("Failed to generate image:", error);
      toast.error("Failed to save pass.", { id: 'image-download' });
    } finally {
      hideForPrint.forEach(el => el.style.opacity = '1');
      setIsDownloadingImage(false);
    }
  };

  // ==========================================
  // UI HELPERS
  // ==========================================
  const getStatusIcon = (status) => {
    switch(status) {
      case 'Approved': return <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-sm"><CheckCircle2 size={16} /></div>;
      case 'Rejected': return <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white shadow-sm"><XCircle size={16} /></div>;
      case 'Under Review': return <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-sm"><Activity size={16} /></div>;
      default: return <div className="w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-sm"><Clock size={16} /></div>;
    }
  };

  const getTimelineState = (status, stepIndex) => {
    if (status === 'Rejected') {
      if (stepIndex < 2) return 'completed'; 
      if (stepIndex === 2) return 'rejected'; 
      return 'upcoming';
    }
    if (status === 'Approved' || status === 'Completed') return 'completed'; 
    if (status === 'Under Review') {
      if (stepIndex === 0) return 'completed';
      if (stepIndex === 1) return 'current';
      return 'upcoming';
    }
    if (stepIndex === 0) return 'current';
    return 'upcoming';
  };

  // ==========================================
  // HORIZONTAL TIMELINE
  // ==========================================
  const renderHorizontalTimeline = (booking) => {
    const steps = [
      { label: 'Booking Confirmed', icon: Ticket },
      { label: 'Under Verification', icon: Activity },
      { label: 'Decision Made', icon: booking.status === 'Rejected' ? XCircle : CheckCircle2 },
      { label: 'Pass Generated', icon: ImageIcon }
    ];

    const latestMessage = booking.tracking?.length > 0 
      ? booking.tracking[booking.tracking.length - 1].message 
      : 'Your booking has been registered in the system.';

    return (
      <div className="mt-4 pt-6 border-t border-gray-100">
        <div className="relative flex items-center justify-between w-full max-w-3xl mx-auto px-2 sm:px-4 mb-8">
          {steps.map((step, index) => {
            const state = getTimelineState(booking.status, index);
            const isLast = index === steps.length - 1;

            let nodeClasses = "bg-gray-100 text-gray-400 border-4 border-white";
            let lineClasses = "bg-gray-100";
            
            if (state === 'completed') {
              nodeClasses = "bg-[#8C7CFF] text-white border-4 border-white shadow-md";
              lineClasses = "bg-[#8C7CFF]";
            } else if (state === 'current') {
              nodeClasses = "bg-[#A397FF] text-white border-4 border-white shadow-md ring-4 ring-[#8C7CFF]/20 animate-pulse";
            } else if (state === 'rejected') {
              nodeClasses = "bg-red-500 text-white border-4 border-white shadow-md ring-4 ring-red-100";
            }

            return (
              <React.Fragment key={index}>
                <div className="relative flex flex-col items-center justify-center z-10 w-10 sm:w-14">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors duration-500 z-10 ${nodeClasses}`}>
                    <step.icon size={18} strokeWidth={2.5} />
                  </div>
                  <span className={`absolute top-14 text-[10px] sm:text-xs font-bold text-center w-24 sm:w-32 leading-tight transition-colors duration-500
                    ${state === 'upcoming' ? 'text-gray-400' : state === 'rejected' ? 'text-red-600' : 'text-gray-900'}
                  `}>
                    {step.label}
                  </span>
                </div>

                {!isLast && (
                  <div className="flex-1 h-1.5 sm:h-2 mx-1 sm:mx-2 rounded-full relative z-0 overflow-hidden bg-gray-100">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: state === 'completed' ? '100%' : '0%' }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className={`absolute left-0 top-0 h-full ${lineClasses}`} 
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100 mt-12">
          {booking.status === 'Rejected' ? <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} /> : <Activity className="text-[#8C7CFF] shrink-0 mt-0.5" size={18} />}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Latest Update</p>
            <p className={`text-sm font-semibold ${booking.status === 'Rejected' ? 'text-red-600' : 'text-gray-800'}`}>
              {latestMessage}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const cardVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } } };

  if (isLoading) return <div className="flex items-center justify-center h-[60vh] w-full"><Loader2 className="animate-spin text-[#8C7CFF]" size={40} /></div>;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-[800px] w-full mx-auto pb-10 px-4 sm:px-6 relative">
      <Toaster position="bottom-center" />

      {/* HEADER */}
      <motion.div variants={cardVariants} className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="sm:hidden p-2 -ml-2 text-gray-900"><AlertCircle size={24} className="opacity-0" /></button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">My Bookings</h1>
        </div>
      </motion.div>

      {/* BOOKINGS LIST */}
      <motion.div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="w-full py-20 flex flex-col items-center justify-center bg-white border border-gray-100 rounded-3xl text-center shadow-sm">
            <Calendar size={48} className="text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-1">No bookings yet</h3>
            <p className="text-sm font-medium text-gray-500">You haven't requested any auditoriums.</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <motion.div key={booking._id} variants={cardVariants} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm overflow-hidden flex flex-col gap-4">
              
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#8C7CFF]/10 flex items-center justify-center text-[#8C7CFF]">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm sm:text-base">{booking.date}</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-500">{booking.startTime} - {booking.endTime}</p>
                  </div>
                </div>
                {getStatusIcon(booking.status)}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-2 border-b border-gray-50">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">{booking.title}</h3>
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5 mt-1">
                    <MapPin size={14} className="text-gray-400" /> {booking.hall?.name || 'Unknown Hall'}
                  </p>
                </div>
                
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-center sm:text-left">
                    <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-0.5">Capacity</p>
                    <p className="text-sm font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-1">
                      <Users size={14} className="text-gray-400"/> {booking.audience}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
                  <div className="text-center sm:text-left">
                    <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-0.5">Status</p>
                    <p className={`text-sm font-bold ${
                      booking.status === 'Approved' ? 'text-emerald-600' : booking.status === 'Rejected' ? 'text-red-600' : 'text-amber-600'
                    }`}>
                      {booking.status}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button 
                  onClick={() => toggleExpand(booking._id)} 
                  className="flex-1 py-2.5 rounded-xl border border-[#8C7CFF] text-[#8C7CFF] font-bold text-sm hover:bg-[#8C7CFF]/5 transition-colors active:scale-[0.98]"
                >
                  {expandedId === booking._id ? 'Close' : 'Track'}
                </button>
                <button 
                  onClick={() => handleViewPassClick(booking)}
                  className="flex-1 py-2.5 rounded-xl bg-[#8C7CFF] text-white font-bold text-sm hover:bg-[#7B61FF] transition-colors shadow-md active:scale-[0.98]"
                >
                  View Pass
                </button>
              </div>

              <AnimatePresence>
                {expandedId === booking._id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    {renderHorizontalTimeline(booking)}
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          ))
        )}
      </motion.div>

      {/* ==================== PREMIUM VERTICAL TICKET MODAL ==================== */}
      <AnimatePresence>
        {ticketModalBooking && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-md p-4 sm:p-8 overflow-y-auto"
          >
            <div className="absolute inset-0 z-0" onClick={() => setTicketModalBooking(null)} />

            <motion.div 
              initial={{ scale: 0.95, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-[380px] my-auto"
            >
              {/* THE TICKET ELEMENT (Targeted for Image Download) */}
              <div 
                id="printable-ticket"
                className="w-full bg-white rounded-[32px] flex flex-col shadow-2xl relative overflow-hidden"
              >
                {/* Top Header */}
                <div className="flex justify-between items-center px-6 pt-6 pb-2 hide-on-print transition-opacity duration-200">
                  <button 
                    onClick={() => setTicketModalBooking(null)}
                    className="flex items-center gap-1.5 text-gray-900 font-black text-sm active:scale-95 transition-transform"
                  >
                    <ChevronLeft size={20} strokeWidth={3} /> Booking confirmed
                  </button>
                  <button 
                    onClick={handleSaveImage}
                    disabled={isDownloadingImage}
                    className="text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
                  >
                    {isDownloadingImage ? <Loader2 size={20} className="animate-spin" /> : <Share size={20} />}
                  </button>
                </div>

                {/* Print-only spacer */}
                <div className="hidden print-spacer h-6 w-full"></div>

                {/* Event Details with ICMR Logo & Auditorium Image */}
                <div className="px-6 flex justify-between items-start mt-4 gap-4">
                  <div className="flex flex-col flex-1 min-w-0">
                    {/* Official ICMR Logo */}
                    <img 
                      src="/icmr-logo.png" 
                      alt="ICMR Logo" 
                      className="h-10 w-auto object-contain mb-3 self-start"
                      crossOrigin="anonymous"
                    />
                    <h2 className="text-[20px] font-black text-gray-900 leading-snug break-words">
                      {ticketModalBooking.title}
                    </h2>
                    <p className="text-[13px] font-bold text-gray-500 mt-1 capitalize truncate">
                      {ticketModalBooking.department || 'General Category'}
                    </p>
                  </div>
                  
                  {/* Event/Auditorium Thumbnail - INCREASED SIZE */}
                  <div className="w-[110px] h-[140px] shrink-0 rounded-2xl overflow-hidden shadow-md border border-gray-100 bg-gray-50">
                    <img 
                      src={ticketModalBooking.hall?.image || "https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&q=80&w=200&h=250"} 
                      alt="Auditorium" 
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 mt-5 px-6 flex-wrap">
                  <span className="bg-gray-100 text-gray-800 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest flex items-center gap-1">
                    <BadgeCheck size={12} className="text-[#0A4DD0]" /> Verified
                  </span>
                  <span className="bg-gray-100 text-gray-800 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest">
                    {ticketModalBooking.audience} Pax
                  </span>
                  <span className="bg-gray-100 text-gray-800 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest">
                    Official
                  </span>
                </div>

                {/* QR Code Container */}
                <div className="mt-6 flex justify-center px-6 relative">
                  <div className="relative p-5">
                    {/* Scan Brackets */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-[3px] border-l-[3px] border-gray-900 rounded-tl-xl"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-[3px] border-r-[3px] border-gray-900 rounded-tr-xl"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-[3px] border-l-[3px] border-gray-900 rounded-bl-xl"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-[3px] border-r-[3px] border-gray-900 rounded-br-xl"></div>
                    
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/admin/approvals?scanId=${ticketModalBooking.bookingId || ticketModalBooking._id}`)}&color=111827`} 
                      alt="Scan QR" 
                      className="w-[160px] h-[160px] mix-blend-multiply object-contain"
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>

                {/* Venue */}
                <div className="text-center mt-4 px-6">
                  <p className="font-bold text-gray-900 text-[16px] flex items-center justify-center gap-1.5">
                    {ticketModalBooking.hall?.name || 'Main Auditorium'}
                    <BadgeCheck size={16} className="text-[#0A4DD0]" />
                  </p>
                </div>

                {/* Vibrant Red Banner Section */}
                <div className="mx-4 mt-6 mb-6 bg-gradient-to-br from-[#E50914] to-[#B9090B] rounded-2xl p-5 text-white shadow-[0_8px_20px_rgba(229,9,20,0.25)] relative overflow-hidden flex justify-between items-center">
                  
                  {/* Banner Decoration */}
                  <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
                    <Ticket size={120} />
                  </div>
                  
                  {/* Date & Time */}
                  <div className="relative z-10 flex flex-col gap-1">
                    <p className="text-xs font-bold text-red-100/90 tracking-wide">{ticketModalBooking.date}</p>
                    <p className="text-2xl font-black tracking-tight">{ticketModalBooking.startTime}</p>
                  </div>
                  
                  {/* Capacity/Audi */}
                  <div className="relative z-10 flex flex-col gap-1 text-right">
                    <p className="text-[10px] font-bold text-red-100/90 tracking-widest uppercase">Capacity</p>
                    <p className="text-2xl font-black">{ticketModalBooking.audience}</p>
                  </div>
                </div>

                {/* Footer Details */}
                <div className="px-6 pb-7">
                  <p className="text-[13px] font-bold text-gray-800">Event ends at {ticketModalBooking.endTime}</p>
                  
                  <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Ref No.</p>
                      <p className="text-xs text-gray-900 font-black tracking-wider">
                        {ticketModalBooking.bookingId || ticketModalBooking._id.substring(0,8).toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Organizer</p>
                      <p className="text-xs text-gray-900 font-bold capitalize">
                        {ticketModalBooking.organizer || 'Authorized User'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* External Download Button (Mobile Only, floats below ticket) */}
              <button 
                onClick={handleSaveImage}
                disabled={isDownloadingImage}
                className="sm:hidden w-full mt-4 py-3.5 rounded-2xl bg-white text-gray-900 font-black text-sm shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-70"
              >
                {isDownloadingImage ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} 
                Save to Gallery
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}