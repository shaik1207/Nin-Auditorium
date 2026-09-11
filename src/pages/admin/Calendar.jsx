import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, MapPin, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import api from '../../services/api'; // Ensure this points to your Axios instance

export default function Calendar() {
  // State for the calendar view
  const [currentMonth, setCurrentMonth] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Backend Data States
  const [bookingsMap, setBookingsMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch and format bookings on mount
  useEffect(() => {
    const fetchCalendarBookings = async () => {
      try {
        const response = await api.get('/admin/bookings');
        const allBookings = response.data;

        // Group the array of bookings into an object mapped by date string (YYYY-MM-DD)
        const groupedData = {};
        
        allBookings.forEach((booking) => {
          const dateKey = booking.date; // Assuming backend saves date as YYYY-MM-DD
          
          if (!groupedData[dateKey]) {
            groupedData[dateKey] = [];
          }
          
          groupedData[dateKey].push({
            id: booking._id,
            title: booking.title,
            hall: booking.hall?.name || 'Unknown Venue',
            time: `${booking.startTime} - ${booking.endTime}`,
            status: booking.status
          });
        });

        setBookingsMap(groupedData);
      } catch (error) {
        console.error("Failed to fetch calendar data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarBookings();
  }, []);

  // Calendar Helper Functions
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  
  const formatDateString = (date) => {
    const d = new Date(date);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
  };

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  // Generate Calendar Grid Array
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const daysInPrevMonth = getDaysInMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  
  const calendarCells = [];
  
  // Previous Month Padding Days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarCells.push({
      day: daysInPrevMonth - i,
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, daysInPrevMonth - i),
      isCurrentMonth: false
    });
  }
  
  // Current Month Days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({
      day: i,
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i),
      isCurrentMonth: true
    });
  }
  
  // Next Month Padding Days
  const remainingCells = 42 - calendarCells.length; // 6 rows of 7 days
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({
      day: i,
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i),
      isCurrentMonth: false
    });
  }

  // Formatting for Header and Details Panel
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const selectedDateString = formatDateString(selectedDate);
  const selectedBookings = bookingsMap[selectedDateString] || [];

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="animate-spin text-[#8C7CFF]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-[#E8EEFF] via-[#F3E8FF] to-[#E8EDFB] p-4 sm:p-6 md:p-8 rounded-[2rem] relative overflow-hidden">
      
      {/* Decorative Background Blurs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-300/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-400/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-[1400px] w-full mx-auto relative z-10"
      >
        
        {/* ================= HEADER ================= */}
        <motion.div variants={itemVariants} className="mb-6 md:mb-8 pl-2">
          <h1 className="text-3xl md:text-[2.5rem] font-bold text-gray-900 tracking-tight mb-2">
            Calendar
          </h1>
          <p className="text-gray-500 text-sm md:text-[15px] font-medium">
            Visualize all bookings across halls.
          </p>
        </motion.div>

        {/* ================= MAIN LAYOUT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT: CALENDAR GRID */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            
            {/* Calendar Controls */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-full transition-colors active:scale-95">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={handleToday} className="px-3 py-1.5 hover:bg-white rounded-xl transition-colors active:scale-95">
                  Today
                </button>
                <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-full transition-colors active:scale-95">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 mb-4">
              {weekDays.map(day => (
                <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider pb-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-2 md:gap-3">
              {calendarCells.map((cell, index) => {
                const cellDateString = formatDateString(cell.date);
                const isSelected = selectedDateString === cellDateString;
                const dayBookings = bookingsMap[cellDateString];

                return (
                  <div 
                    key={index}
                    onClick={() => setSelectedDate(cell.date)}
                    className={`
                      relative aspect-square sm:aspect-[4/3] p-2 flex flex-col justify-between rounded-2xl cursor-pointer transition-all duration-200 border border-transparent
                      ${!cell.isCurrentMonth ? 'opacity-40 bg-transparent hover:bg-white/50' : ''}
                      ${cell.isCurrentMonth && !isSelected ? 'bg-white/50 hover:bg-white hover:shadow-sm hover:border-gray-100 text-gray-900' : ''}
                      ${isSelected ? 'bg-gradient-to-br from-[#8C7CFF] to-[#6C5CE7] text-white shadow-[0_8px_20px_rgba(140,124,255,0.3)] scale-105 z-10' : ''}
                    `}
                  >
                    <span className={`text-sm sm:text-base font-bold pl-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                      {cell.day}
                    </span>

                    {/* Booking Indicators (Lines at the bottom) */}
                    {dayBookings && (
                      <div className="flex gap-1 w-full px-1 mb-1">
                        {dayBookings.slice(0, 4).map((booking, i) => (
                          <div 
                            key={i} 
                            className={`h-1 rounded-full flex-1 ${
                              isSelected ? 'bg-white/80' : 
                              booking.status === 'Approved' ? 'bg-[#10B981]' : 
                              booking.status === 'Rejected' ? 'bg-[#EF4444]' : 'bg-[#F59E0B]'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* RIGHT: DAY DETAILS PANEL */}
          <motion.div variants={itemVariants} className="lg:col-span-1 bg-white/70 backdrop-blur-xl border border-white rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:min-h-[600px] flex flex-col sticky top-8">
            
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {weekDays[selectedDate.getDay()]}day, {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}
            </h3>
            <div className="w-full h-px bg-gray-200/60 my-6" />

            <div className="flex-1 flex flex-col">
              <AnimatePresence mode="wait">
                {selectedBookings.length === 0 ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex-1 flex flex-col items-center justify-center text-center opacity-60 mt-10"
                  >
                    <CalendarIcon size={48} className="text-gray-300 mb-4" strokeWidth={1.5} />
                    <p className="text-[15px] font-medium text-gray-500">No bookings on this date.</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {selectedBookings.map((booking) => (
                      <div key={booking.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-gray-900 leading-tight pr-4">{booking.title}</h4>
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            booking.status === 'Approved' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                            booking.status === 'Rejected' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                            'bg-amber-500'
                          }`} />
                        </div>
                        
                        <div className="space-y-2 text-xs font-semibold text-gray-500">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-[#8C7CFF]" />
                            <span>{booking.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-[#8C7CFF]" />
                            <span>{booking.hall}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-50">
                           <span className={`text-[11px] font-bold tracking-wide uppercase ${
                              booking.status === 'Approved' ? 'text-emerald-600' : 
                              booking.status === 'Rejected' ? 'text-red-500' : 
                              'text-amber-600'
                           }`}>
                             {booking.status}
                           </span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}