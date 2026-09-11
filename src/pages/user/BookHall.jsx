import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, ArrowLeft, Check, ChevronRight, Calendar as CalendarIcon, 
  Clock, Sparkles, MapPin, CheckCircle2, Ticket, AlertCircle, Loader2, Filter, LayoutList, Grid, BadgeCheck
} from 'lucide-react';
import api from '../../services/api'; 
import toast, { Toaster } from 'react-hot-toast';

// --- TIME CALCULATION HELPERS ---
const timeToMins = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours * 60) + minutes;
};

const minsToTimeStr = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h > 12 ? h - 12 : (h === 0 ? 12 : h);
  const displayM = m.toString().padStart(2, '0');
  return `${displayH}:${displayM} ${ampm}`;
};

export default function BookHall() {
  const navigate = useNavigate();

  // Data States
  const [hallsData, setHallsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeFilter, setTimeFilter] = useState('All'); 
  const [capacityFilter, setCapacityFilter] = useState('All'); 
  const [viewMode, setViewMode] = useState('grid'); 

  // Booking Flow States
  const [selectedHall, setSelectedHall] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showToken, setShowToken] = useState(false);
  const [generatedBookingId, setGeneratedBookingId] = useState('');
  const [bookingTimestamp, setBookingTimestamp] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '', purpose: '', organizer: '',
    date: '', startTime: '', endTime: '',
    audience: '', department: '', contact: '', notes: ''
  });

  // Fetch Data whenever Date changes
  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/halls/availability?date=${selectedDate}`);
        setHallsData(response.data);
      } catch (error) {
        console.error("Failed to fetch availability:", error);
        toast.error("Failed to load hall availability.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvailability();
  }, [selectedDate]);

  // ==========================================
  // FILTER LOGIC
  // ==========================================
  const filteredHalls = hallsData.filter(hall => {
    if (capacityFilter === 'Small' && hall.capacity >= 50) return false;
    if (capacityFilter === 'Medium' && (hall.capacity < 50 || hall.capacity >= 200)) return false;
    if (capacityFilter === 'Large' && hall.capacity < 200) return false;
    return true;
  });

  // Determine Time Bounds based on filter
  let displayStartMins = 8 * 60; // 8:00 AM
  let displayEndMins = 17.5 * 60; // 5:30 PM
  if (timeFilter === 'Morning') displayEndMins = 12 * 60; 
  if (timeFilter === 'Afternoon') displayStartMins = 12 * 60; 
  const totalDisplayMins = displayEndMins - displayStartMins;

  // Generate dynamic grid headers based on time filter bounds
  const timeHeaders = [];
  for (let m = displayStartMins; m < displayEndMins; m += 60) {
    timeHeaders.push(minsToTimeStr(m));
  }
  timeHeaders.push(minsToTimeStr(displayEndMins));

  // Generate blocks mathematically within bounds
  const generateTimeBlocks = (bookings) => {
    let currentMins = displayStartMins;
    const blocks = [];

    bookings.forEach(booking => {
      const startMins = Math.max(timeToMins(booking.startTime), displayStartMins);
      const endMins = Math.min(timeToMins(booking.endTime), displayEndMins);

      if (endMins <= displayStartMins || startMins >= displayEndMins) return;

      if (startMins > currentMins) {
        blocks.push({
          type: 'Available',
          startMins: currentMins, endMins: startMins,
          startTimeStr: minsToTimeStr(currentMins), endTimeStr: minsToTimeStr(startMins)
        });
      }

      blocks.push({
        type: 'Booked',
        startMins: startMins, endMins: endMins,
        startTimeStr: minsToTimeStr(startMins), endTimeStr: minsToTimeStr(endMins)
      });
      currentMins = endMins;
    });

    if (currentMins < displayEndMins) {
      blocks.push({
        type: 'Available',
        startMins: currentMins, endMins: displayEndMins,
        startTimeStr: minsToTimeStr(currentMins), endTimeStr: minsToTimeStr(displayEndMins)
      });
    }

    return blocks;
  };

  // ==========================================
  // ACTION HANDLERS
  // ==========================================
  const handleInitiateBooking = (hall, startTime = '', endTime = '') => {
    setSelectedHall(hall);
    setFormData(prev => ({
      ...prev,
      date: selectedDate,
      startTime: startTime,
      endTime: endTime
    }));
    setCurrentStep(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        hallId: selectedHall._id, 
        title: formData.title || 'Untitled Event',
        purpose: formData.purpose || 'General',
        organizer: formData.organizer,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        audience: parseInt(formData.audience) || 0,
        department: formData.department,
        contact: formData.contact
      };

      const response = await api.post('/bookings', payload);
      setGeneratedBookingId(response.data._id); 
      
      const now = new Date();
      setBookingTimestamp(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      
      setShowToken(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionableQRCodeUrl = () => {
    const scanUrl = `${window.location.origin}/admin/approvals?scanId=${generatedBookingId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(scanUrl)}&color=111827`;
  };

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    in: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    out: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-10 relative">
      <Toaster position="top-right" />

      <AnimatePresence mode="wait">
        
        {/* ==================== VIEW 1: CATALOG ==================== */}
        {!selectedHall && !showToken && (
          <motion.div key="catalog" variants={pageVariants} initial="initial" animate="in" exit="out">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-[28px] font-bold text-[#1F2937] tracking-tight mb-1">Available Halls</h1>
                <p className="text-[#6B7280] text-sm font-medium">Find and book the perfect hall for your event.</p>
              </div>
              <button 
                onClick={() => navigate('/user/bookings')}
                className="flex items-center gap-2 px-4 py-2 border border-[#8B5CF6]/20 text-[#6D28D9] bg-[#F5F3FF] hover:bg-[#EDE9FE] rounded-lg text-sm font-bold transition-colors shadow-sm active:scale-95"
              >
                <CalendarIcon size={16} /> View My Bookings
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-wrap gap-4 items-end mb-8">
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><CalendarIcon size={16} /></div>
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/30 focus:border-[#8B5CF6] transition-all" />
                </div>
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">Time Range</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Clock size={16} /></div>
                  <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 font-medium focus:outline-none cursor-pointer">
                    <option value="All">Full Day (08:00 AM - 05:30 PM)</option>
                    <option value="Morning">Morning (8 AM - 12 PM)</option>
                    <option value="Afternoon">Afternoon (12 PM - 5:30 PM)</option>
                  </select>
                </div>
              </div>

              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">Capacity</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Users size={16} /></div>
                  <select value={capacityFilter} onChange={(e) => setCapacityFilter(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 font-medium focus:outline-none cursor-pointer">
                    <option value="All">All Capacity</option>
                    <option value="Small">Small (Up to 50)</option>
                    <option value="Medium">Medium (50 - 200)</option>
                    <option value="Large">Large (200+)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                {filteredHalls.length} Halls Available
              </div>

              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button onClick={() => setViewMode('grid')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-[#6D28D9] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Grid size={16} /> Time Grid
                </button>
                <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white text-[#6D28D9] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  <LayoutList size={16} /> List View
                </button>
              </div>

              {viewMode === 'grid' && (
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-sm" /> Available</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[#F5F3FF] border border-[#DDD6FE] rounded-sm" /> Booked</div>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-[#8B5CF6]" size={40} /></div>
            ) : filteredHalls.length === 0 ? (
              <div className="text-center py-12 text-gray-500 font-medium bg-white rounded-2xl shadow-sm border border-gray-100">No halls match your filters.</div>
            ) : viewMode === 'grid' ? (
              
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-x-auto">
                <div className="min-w-[800px]">
                  
                  <div className="flex border-b border-gray-200 bg-gray-50/50">
                    <div className="w-[260px] shrink-0 p-4 border-r border-gray-200 font-bold text-gray-900 text-[15px]">Halls</div>
                    <div className="flex-1 flex text-[11px] font-bold text-gray-500 tracking-wide uppercase py-4">
                      {timeHeaders.map((time, i) => (
                        <div key={i} className="flex-1 text-center border-l border-gray-200/50 first:border-0">{time}</div>
                      ))}
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {filteredHalls.map((hall) => {
                      const blocks = generateTimeBlocks(hall.bookings || []);

                      return (
                        <div key={hall._id} className="flex group hover:bg-gray-50/30 transition-colors">
                          <div className="w-[260px] shrink-0 p-4 border-r border-gray-200 flex items-center gap-4 bg-white">
                            <img src={hall.image} alt={hall.name} className="w-16 h-12 rounded-lg object-cover border border-gray-100 shadow-sm" />
                            <div>
                              <h3 className="text-sm font-bold text-gray-900 leading-tight truncate max-w-[150px]">{hall.name}</h3>
                              <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1"><Users size={12} /> {hall.capacity} Seats</p>
                            </div>
                          </div>

                          <div className="flex-1 relative flex items-center p-2 gap-1 bg-white">
                            {blocks.map((block, i) => {
                              const widthPercentage = ((block.endMins - block.startMins) / totalDisplayMins) * 100;
                              
                              if (block.type === 'Available') {
                                return (
                                  <button 
                                    key={i} style={{ width: `${widthPercentage}%` }}
                                    onClick={() => handleInitiateBooking(hall, block.startTimeStr, block.endTimeStr)}
                                    className="h-full min-h-[64px] bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] rounded-lg flex flex-col items-center justify-center text-center transition-colors group/btn cursor-pointer"
                                  >
                                    <span className="text-xs font-bold text-[#047857] px-1 truncate w-full">{block.startTimeStr} - {block.endTimeStr}</span>
                                    <span className="text-[11px] font-bold text-[#059669] opacity-0 group-hover/btn:opacity-100 transition-opacity">Book</span>
                                  </button>
                                );
                              }
                              return (
                                <div key={i} style={{ width: `${widthPercentage}%` }} className="h-full min-h-[64px] bg-[#F5F3FF] border border-[#DDD6FE] rounded-lg flex flex-col items-center justify-center text-center cursor-not-allowed">
                                  <span className="text-xs font-bold text-[#5B21B6] px-1 truncate w-full">{block.startTimeStr} - {block.endTimeStr}</span>
                                  <span className="text-[11px] font-bold text-[#7C3AED] mt-0.5">Booked</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredHalls.map((hall) => (
                  <div key={hall._id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-col shadow-sm group hover:shadow-md transition-shadow">
                    <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                      <img src={hall.image} alt={hall.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{hall.name}</h3>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold mb-4">
                        <MapPin size={14} className="text-[#8B5CF6] shrink-0" />
                        <span className="truncate">{hall.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold mb-5">
                        <Users size={14} className="text-[#8B5CF6] shrink-0" />
                        <span>Capacity: {hall.capacity}</span>
                      </div>
                      <button 
                        onClick={() => handleInitiateBooking(hall)}
                        className="w-full mt-auto bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-3.5 rounded-2xl font-semibold transition-all active:scale-[0.98]"
                      >
                        Book This Hall
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'grid' && (
              <div className="mt-6 bg-[#F5F3FF] border border-[#DDD6FE] rounded-2xl p-4 flex items-center gap-3 text-[#5B21B6]">
                <div className="w-8 h-8 rounded-full bg-[#6D28D9] text-white flex items-center justify-center shrink-0">
                  <span className="font-serif italic font-bold">i</span>
                </div>
                <p className="text-sm font-medium">All times are shown in your local timezone. Select a green "Available" time slot to start booking.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ==================== VIEW 2: MULTI-STEP FORM ==================== */}
        {selectedHall && !showToken && (
          <motion.div key="booking-form" variants={pageVariants} initial="initial" animate="in" exit="out" className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mt-4">
            <div className="relative h-[160px] w-full bg-gray-900">
              <img src={selectedHall.image} alt="Hall" className="w-full h-full object-cover opacity-50" />
              <button onClick={() => setSelectedHall(null)} className="absolute top-6 left-6 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-800 shadow-sm transition-transform hover:scale-105 active:scale-95"><ArrowLeft size={20} /></button>
              <div className="absolute bottom-6 left-6 flex items-end gap-4">
                <h1 className="text-3xl font-bold text-white shadow-sm leading-none">{selectedHall.name}</h1>
                <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-1">{formData.date} {formData.startTime && `| ${formData.startTime} - ${formData.endTime}`}</span>
              </div>
            </div>

            <div className="p-6 md:p-10">
              <div className="flex items-center justify-between w-full max-w-3xl mx-auto mb-10 relative">
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-100 -z-10 transform -translate-y-1/2" />
                {['Event', 'Schedule', 'Audience', 'Review'].map((stepName, index) => (
                  <div key={stepName} className="flex flex-col items-center bg-white px-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${currentStep >= index + 1 ? 'border-[#8B5CF6] text-[#8B5CF6] bg-[#F5F3FF]' : 'border-gray-200 text-gray-400 bg-white'}`}>
                      {currentStep > index + 1 ? <Check size={14} /> : index + 1}
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-full max-w-2xl mx-auto space-y-5">
                {currentStep === 1 && (
                  <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Event title <span className="text-red-500">*</span></label>
                      <input name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. AI in Future: Opportunities & Challenges" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-[#8B5CF6] focus:bg-white transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Purpose of event <span className="text-red-500">*</span></label>
                      <input name="purpose" value={formData.purpose} onChange={handleInputChange} placeholder="Conference / Seminar / Meeting" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-[#8B5CF6] focus:bg-white transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Organized by <span className="text-red-500">*</span></label>
                      <input name="organizer" value={formData.organizer} onChange={handleInputChange} placeholder="e.g. John Doe / Computer Science Department" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-[#8B5CF6] focus:bg-white transition-all" />
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date <span className="text-red-500">*</span></label>
                      <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-[#8B5CF6] focus:bg-white transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start time <span className="text-red-500">*</span></label>
                        <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-[#8B5CF6] focus:bg-white transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">End time <span className="text-red-500">*</span></label>
                        <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-[#8B5CF6] focus:bg-white transition-all" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Expected audience <span className="text-red-500">*</span></label>
                      <input type="number" name="audience" value={formData.audience} onChange={handleInputChange} placeholder={`Max capacity: ${selectedHall.capacity}`} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-[#8B5CF6] focus:bg-white transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department / organization <span className="text-red-500">*</span></label>
                      <input name="department" value={formData.department} onChange={handleInputChange} placeholder="e.g. Computer Science Department" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-[#8B5CF6] focus:bg-white transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contact information <span className="text-red-500">*</span></label>
                      <input name="contact" value={formData.contact} onChange={handleInputChange} placeholder="+91 XXXXX XXXXX" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-[#8B5CF6] focus:bg-white transition-all" />
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Review summary</h2>
                    <div className="flex justify-between border-b border-gray-100 pb-3 text-sm"><span className="text-gray-500">Hall</span><span className="font-semibold text-gray-900 text-right">{selectedHall.name}</span></div>
                    <div className="flex justify-between border-b border-gray-100 pb-3 text-sm pt-1"><span className="text-gray-500">Title</span><span className="font-semibold text-gray-900 text-right">{formData.title || '-'}</span></div>
                    <div className="flex justify-between border-b border-gray-100 pb-3 text-sm pt-1"><span className="text-gray-500">Organizer</span><span className="font-semibold text-gray-900 text-right">{formData.organizer || '-'}</span></div>
                    <div className="flex justify-between border-b border-gray-100 pb-3 text-sm pt-1"><span className="text-gray-500">Date</span><span className="font-semibold text-gray-900 text-right">{formData.date || '-'}</span></div>
                    <div className="flex justify-between border-b border-gray-100 pb-3 text-sm pt-1"><span className="text-gray-500">Time</span><span className="font-semibold text-gray-900 text-right">{formData.startTime || '-'} to {formData.endTime || '-'}</span></div>
                    <div className="flex justify-between pb-1 text-sm pt-1"><span className="text-gray-500">Audience</span><span className="font-semibold text-gray-900 text-right">{formData.audience || '-'}</span></div>
                  </motion.div>
                )}

                {/* Footer Nav */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <button onClick={() => setCurrentStep(p => Math.max(1, p - 1))} disabled={currentStep === 1 || isSubmitting} className="text-sm font-bold text-gray-500 hover:text-gray-800 disabled:opacity-30">Back</button>
                  {currentStep < 4 ? (
                    <button onClick={() => setCurrentStep(p => p + 1)} className="bg-[#8B5CF6] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-1 shadow-sm hover:bg-[#7C3AED] active:scale-[0.98] transition-all">Continue <ChevronRight size={16} /></button>
                  ) : (
                    <button onClick={handleFormSubmit} disabled={isSubmitting} className="bg-[#8B5CF6] text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-[#7C3AED] active:scale-[0.98] transition-all min-w-[160px]">
                      {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <>Submit booking <Check size={16} /></>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ==================== VIEW 3: PREMIUM PENDING TOKEN ==================== */}
        {showToken && (
          <motion.div key="token" variants={pageVariants} initial="initial" animate="in" exit="out" className="w-full flex flex-col items-center justify-center mt-8 font-sans">
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50/50">
                <CheckCircle2 size={36} strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Booking Request Sent!</h2>
              <p className="text-sm font-medium text-gray-500">Your request is pending administrative approval.</p>
            </div>

            {/* THE TICKET ELEMENT */}
            <div className="w-full max-w-[380px] bg-white rounded-[32px] flex flex-col shadow-2xl relative overflow-hidden border border-gray-100">
              
              {/* Top Header */}
              <div className="px-6 flex justify-between items-start mt-6 gap-4">
                <div className="flex flex-col flex-1 min-w-0">
                  {/* Official ICMR Logo */}
                  <img 
                    src="/icmr-logo.png" 
                    alt="ICMR Logo" 
                    className="h-10 w-auto object-contain mb-3 self-start"
                    crossOrigin="anonymous"
                  />
                  <h2 className="text-[20px] font-black text-gray-900 leading-snug break-words">
                    {formData.title || "Untitled Event"}
                  </h2>
                  <p className="text-[13px] font-bold text-gray-500 mt-1 capitalize truncate">
                    {formData.department || 'General Category'}
                  </p>
                </div>
                
                {/* Event/Auditorium Thumbnail */}
                <div className="w-[110px] h-[140px] shrink-0 rounded-2xl overflow-hidden shadow-md border border-gray-100 bg-gray-50">
                  <img 
                    src={selectedHall?.image || "https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&q=80&w=200&h=250"} 
                    alt="Auditorium" 
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 mt-5 px-6 flex-wrap">
                <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest flex items-center gap-1">
                  <Clock size={12} /> Pending
                </span>
                <span className="bg-gray-100 text-gray-800 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest">
                  {formData.audience || "0"} Pax
                </span>
                <span className="bg-gray-100 text-gray-800 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest">
                  Request
                </span>
              </div>

              {/* QR Code Container */}
              <div className="mt-6 flex justify-center px-6 relative">
                <div className="relative p-5">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-[3px] border-l-[3px] border-gray-900 rounded-tl-xl"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-[3px] border-r-[3px] border-gray-900 rounded-tr-xl"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-[3px] border-l-[3px] border-gray-900 rounded-bl-xl"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-[3px] border-r-[3px] border-gray-900 rounded-br-xl"></div>
                  
                  <img 
                    src={getActionableQRCodeUrl()} 
                    alt="Scan QR" 
                    className="w-[160px] h-[160px] mix-blend-multiply object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
              </div>

              {/* Venue */}
              <div className="text-center mt-4 px-6">
                <p className="font-bold text-gray-900 text-[16px] flex items-center justify-center gap-1.5">
                  {selectedHall?.name || 'Main Auditorium'}
                  <MapPin size={16} className="text-[#0A4DD0]" />
                </p>
              </div>

              {/* Vibrant Red Banner Section */}
              <div className="mx-4 mt-6 mb-6 bg-gradient-to-br from-[#E50914] to-[#B9090B] rounded-2xl p-5 text-white shadow-[0_8px_20px_rgba(229,9,20,0.25)] relative overflow-hidden flex justify-between items-center">
                <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
                  <Ticket size={120} />
                </div>
                
                <div className="relative z-10 flex flex-col gap-1">
                  <p className="text-xs font-bold text-red-100/90 tracking-wide">{formData.date}</p>
                  <p className="text-2xl font-black tracking-tight">{formData.startTime}</p>
                </div>
                
                <div className="relative z-10 flex flex-col gap-1 text-right">
                  <p className="text-[10px] font-bold text-red-100/90 tracking-widest uppercase">Capacity</p>
                  <p className="text-2xl font-black">{formData.audience || "0"}</p>
                </div>
              </div>

              {/* Footer Details */}
              <div className="px-6 pb-7">
                <p className="text-[13px] font-bold text-gray-800">Event ends at {formData.endTime}</p>
                
                <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Ref No.</p>
                    <p className="text-xs text-gray-900 font-black tracking-wider">
                      {generatedBookingId ? generatedBookingId.substring(0,8).toUpperCase() : 'PENDING'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Organizer</p>
                    <p className="text-xs text-gray-900 font-bold capitalize">
                      {formData.organizer || 'Authorized User'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => { 
                  setShowToken(false); setSelectedHall(null); setCurrentStep(1); 
                  setFormData({ title: '', purpose: '', organizer: '', date: selectedDate, startTime: '', endTime: '', audience: '', department: '', contact: '', notes: '' }); 
                }}
                className="bg-white border border-gray-200 text-gray-700 px-8 py-3.5 rounded-2xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-all active:scale-[0.98]"
              >
                Book Another
              </button>
              <button 
                onClick={() => navigate('/user/bookings')}
                className="bg-[#8B5CF6] text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl hover:bg-[#7C3AED] transition-all active:scale-[0.98]"
              >
                View My Bookings
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}