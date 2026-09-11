import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck,
  Check,
  X,
  Calendar,
  Loader2,
  Activity,
  SlidersHorizontal
} from 'lucide-react';
import api from '../../services/api'; 

export default function Dashboard() {
  // Real-time Data States
  const [adminData, setAdminData] = useState({ firstName: 'Admin' });
  const [statsData, setStatsData] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [greeting, setGreeting] = useState('');

  // Determine Time-Based Greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, bookingsRes, profileRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/bookings'),
        api.get('/auth/profile') 
      ]);
      
      setStatsData(analyticsRes.data);
      
      // Robust array extraction to prevent crashes
      const fetchedBookings = Array.isArray(bookingsRes.data) 
        ? bookingsRes.data 
        : (bookingsRes.data?.bookings || bookingsRes.data?.data || []);
      
      setBookings(fetchedBookings);

      // Extract first name for the personalized greeting
      const fullName = profileRes.data.fullName || 'Admin';
      const firstName = fullName.split(' ')[0];
      setAdminData({ firstName });

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Action Handler: Approve or Reject a booking
  const handleStatusUpdate = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      await api.put(`/admin/bookings/${bookingId}/status`, { status: newStatus });
      await fetchDashboardData(); // Refresh data to update charts and lists
    } catch (error) {
      console.error(`Failed to mark as ${newStatus}:`, error);
      alert(`Could not update booking status.`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Dynamic Top Stats Grid
  const stats = [
    { title: 'PENDING', value: statsData.pending || 0, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { title: 'APPROVED', value: statsData.approved || 0, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'REJECTED', value: statsData.rejected || 0, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
    { title: 'TOTAL', value: statsData.total || 0, icon: ShieldCheck, color: 'text-[#8B7AFF]', bg: 'bg-[#8B7AFF]/10' },
  ];

  // Dynamically calculate "Bookings by hall" for the Bar Chart
  const calculateBarData = () => {
    const counts = {};
    bookings.forEach(b => {
      const hallName = b.hall?.name || 'Unknown';
      counts[hallName] = (counts[hallName] || 0) + 1;
    });

    let sortedHalls = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
    
    // Safely calculate max to avoid Infinity errors if empty, and ensure a minimum scale of 4
    const maxBookings = sortedHalls.length > 0 ? Math.max(...sortedHalls.map(h => h[1])) : 0;
    const finalMax = Math.max(maxBookings, 4); 

    const formattedData = sortedHalls.map(([name, count]) => ({
      label: name.split(' ').slice(0, 2).join(' '), // Shorter label for UI
      value: count,
      max: finalMax
    }));

    // Pad with empty bars if less than 4 halls exist
    while (formattedData.length < 4) {
      formattedData.push({ label: '-', value: 0, max: finalMax });
    }

    return formattedData;
  };

  const barData = calculateBarData();

  // FIX: Stable Sorting and show ALL recent bookings (Pending ones get action buttons, others get badges)
  const recentBookings = bookings
    .sort((a, b) => {
      // Use fallback of 0 instead of Date.now() to prevent NaN sorting errors
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 6); // Take the latest 6 to populate the dashboard

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } }
  };

  // Calculate percentages for CSS Donut Chart safely
  const total = statsData.total || 1; 
  const approvedPct = ((statsData.approved || 0) / total) * 100;
  const pendingPct = ((statsData.pending || 0) / total) * 100;
  const conicGradient = `conic-gradient(#10B981 0% ${approvedPct}%, #F59E0B ${approvedPct}% ${approvedPct + pendingPct}%, #EF4444 ${approvedPct + pendingPct}% 100%)`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="animate-spin text-[#8C7CFF]" size={40} />
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-[1200px] w-full mx-auto pb-10"
    >
      {/* ================= PREMIUM IOS ADMIN HERO BANNER ================= */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-[2.5rem] p-10 md:p-14 mb-8 shadow-[0_15px_40px_rgba(0,0,0,0.1)] border border-[#2A1B54]"
        style={{
          background: `
            radial-gradient(circle at 15% 100%, rgba(140, 124, 255, 0.25), transparent 50%), 
            radial-gradient(circle at 85% 0%, rgba(16, 185, 129, 0.15), transparent 50%), 
            radial-gradient(circle at 50% 50%, rgba(59, 30, 99, 0.5), transparent 80%), 
            #110A1F
          `
        }}
      >
        <div className="absolute top-6 right-6 lg:top-10 lg:right-10 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase shadow-xl z-20">
          <ShieldCheck size={16} className="text-[#8C7CFF]" />
          System Admin
        </div>

        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} 
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} 
          className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full border-[40px] border-[#8C7CFF]/10 blur-xl pointer-events-none hidden md:block"
        />

        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} 
          className="absolute top-24 right-[25%] hidden lg:flex flex-col gap-3 rotate-[15deg] pointer-events-none"
        >
          <div className="w-24 h-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.3)] ml-8 flex items-center px-2 gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="w-8 h-1.5 bg-white/30 rounded-full" />
          </div>
          <div className="w-32 h-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.3)] ml-2 flex items-center px-2 gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <div className="w-12 h-1.5 bg-white/30 rounded-full" />
          </div>
          <div className="w-28 h-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.3)] flex items-center px-2 gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#8C7CFF] animate-pulse" />
            <div className="w-10 h-1.5 bg-white/30 rounded-full" />
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, -5, 0] }} 
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} 
          className="absolute -bottom-6 left-[10%] hidden md:flex items-end gap-1.5 pointer-events-none"
        >
          {[20, 40, 60, 40, 80, 50, 30].map((height, i) => (
            <div 
              key={i} 
              className="w-4 bg-gradient-to-t from-[#8C7CFF] to-[#B0A3FF] rounded-t-full shadow-[0_0_15px_rgba(140,124,255,0.4)] opacity-80" 
              style={{ height: `${height}px` }} 
            />
          ))}
        </motion.div>

        <div className="relative z-10 max-w-xl">
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-medium text-white leading-[1.1] tracking-tight mb-4 drop-shadow-lg">
            {greeting}, <br /> {adminData.firstName}
          </h1>
          <p className="text-gray-300 text-[17px] md:text-lg leading-relaxed mb-8 font-medium">
            System operations are running smoothly. Monitor utilization, process pending approvals, and manage infrastructure.
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            <Link 
              to="/admin/approvals"
              className="flex items-center gap-2 bg-[#8C7CFF] text-white hover:bg-[#7B61FF] px-6 py-3.5 rounded-full font-bold transition-all shadow-[0_8px_20px_rgba(140,124,255,0.3)] hover:shadow-[0_10px_25px_rgba(140,124,255,0.4)] active:scale-95 text-[15px]"
            >
              <Activity size={18} />
              Review Approvals
            </Link>
            <Link 
              to="/admin/profile"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3.5 rounded-full font-bold transition-all backdrop-blur-md active:scale-95 text-[15px]"
            >
              <SlidersHorizontal size={18} />
              System Settings
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ================= TOP STATS GRID ================= */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-6 md:mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={index} 
              whileHover={{ y: -5, scale: 1.02, boxShadow: "0 15px 30px -10px rgba(0,0,0,0.08)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white border border-gray-100 rounded-3xl p-5 md:p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] cursor-pointer relative overflow-hidden"
            >
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-40 pointer-events-none ${stat.bg}`}></div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4 relative z-10">
                <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`p-2 rounded-xl w-fit ${stat.bg}`}>
                  <Icon size={18} className={stat.color} strokeWidth={2.5} />
                </div>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mt-1 relative z-10">
                {stat.value}
              </h2>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ================= CHARTS SECTION ================= */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        
        {/* Left: Dynamic Bar Chart Panel */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-5 md:p-8 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Bookings by hall</h3>
          
          <div className="flex-1 flex items-end gap-2 md:gap-4 h-[200px] md:h-[240px] relative mt-2 mb-8">
            {/* Y-Axis Labels */}
            <div className="flex flex-col justify-between h-full text-[10px] md:text-xs font-semibold text-gray-400 absolute left-0 py-2 w-4 md:w-6">
              <span>{barData[0]?.max || 4}</span>
              <span>{Math.round((barData[0]?.max || 4) * 0.75)}</span>
              <span>{Math.round((barData[0]?.max || 4) * 0.5)}</span>
              <span>{Math.round((barData[0]?.max || 4) * 0.25)}</span>
              <span>0</span>
            </div>

            {/* Grid Lines */}
            <div className="absolute inset-0 pl-8 md:pl-10 flex flex-col justify-between py-2 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full border-b border-gray-100/80"></div>
              ))}
            </div>

            {/* Render Bars cleanly within exact inner padding */}
            <div className="absolute inset-0 pl-8 md:pl-10 py-2">
              <div className="w-full h-full flex justify-around items-end relative z-10">
                {barData.map((bar, index) => {
                  const heightPercentage = bar.max > 0 ? (bar.value / bar.max) * 100 : 0;
                  return (
                    <div key={index} className="flex flex-col items-center w-full group relative" style={{ height: '100%' }}>
                      {/* FIXED: Added style={{ height: '100%' }} to bounds container */}
                      <div className="w-full max-w-[40px] md:max-w-[70px] flex items-end relative" style={{ height: '100%' }}>
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-20">
                          {bar.value}
                        </div>
                        <motion.div 
                          initial={{ height: "0%" }}
                          animate={{ height: `${heightPercentage}%` }}
                          transition={{ duration: 1, delay: 0.1 + (index * 0.1), type: "spring", bounce: 0.3 }}
                          className={`w-full rounded-t-xl transition-all duration-300 relative overflow-hidden
                            ${bar.value > 0 ? 'bg-gradient-to-tr from-[#6C5CE7] to-[#9B88FF] shadow-sm' : 'bg-transparent'}
                          `}
                          style={bar.value > 0 ? { boxShadow: 'inset -2px 0 8px rgba(0,0,0,0.1), inset 2px 0 8px rgba(255,255,255,0.2)' } : {}}
                        >
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent"></div>
                        </motion.div>
                      </div>
                      
                      {/* X-Axis label cleanly placed under the chart flow */}
                      <span className="absolute -bottom-8 text-[10px] md:text-xs font-bold text-gray-500 tracking-wide truncate w-[120%] text-center px-1">
                        {bar.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Dynamic Donut Chart Panel */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 md:p-8 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col justify-between items-center relative">
          <h3 className="text-lg font-bold text-gray-900 w-full text-left md:absolute md:top-8 md:left-8 mb-4 md:mb-0">Status mix</h3>
          
          <div className="w-36 h-36 md:w-44 md:h-44 mt-4 md:mt-12 relative flex items-center justify-center">
            <motion.div 
              initial={{ rotate: -90, scale: 0.8, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 1, type: "spring" }}
              className="absolute inset-0 rounded-full drop-shadow-md"
              style={{ background: statsData.total > 0 ? conicGradient : '#F3F4F6' }}
            />
            <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-full z-10 shadow-inner flex items-center justify-center flex-col">
              <span className="text-2xl md:text-3xl font-extrabold text-gray-900">{statsData.total}</span>
              <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-8 text-[10px] md:text-xs font-bold text-gray-600">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-md">
              <div className="w-2 h-2 rounded-full bg-[#10B981]"></div> Approved
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-md">
              <div className="w-2 h-2 rounded-full bg-[#F59E0B]"></div> Pending
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 rounded-md">
              <div className="w-2 h-2 rounded-full bg-[#EF4444]"></div> Rejected
            </div>
          </div>
        </div>
      </motion.div>

      {/* ================= RECENT BOOKINGS LIST ================= */}
      <motion.div variants={itemVariants} className="bg-white border border-gray-100 rounded-3xl p-5 md:p-8 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Recent Bookings</h3>
        </div>

        <div className="space-y-4">
          {recentBookings.length === 0 ? (
             <div className="text-center py-10 text-gray-500 font-medium bg-gray-50 border border-gray-100 border-dashed rounded-2xl">
               No recent bookings found in the system.
             </div>
          ) : (
            recentBookings.map((req) => {
              const statusStr = (req.status || '').toLowerCase().trim();
              const isPending = statusStr === 'pending' || statusStr === 'under review';
              
              return (
                <motion.div 
                  key={req._id}
                  whileHover={{ scale: 1.01 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 transition-all"
                >
                  <div className="flex flex-col">
                    <h4 className="text-base font-bold text-gray-900 mb-1">{req.title || 'Untitled Event'}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded-md text-gray-700 font-semibold">{req.bookingId || req._id.substring(0,8)}</span>
                      <div className="flex items-center gap-1"><Calendar size={12} className="text-[#8C7CFF]" /> {req.date}</div>
                      <span className="hidden sm:block text-gray-300">•</span>
                      <span>{req.hall?.name || 'Unknown Hall'}</span>
                      <span className="hidden sm:block text-gray-300">•</span>
                      <span>By: {req.user?.fullName || req.organizer}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-gray-100 sm:border-0">
                    {isPending ? (
                      // Show Action Buttons ONLY if the status is pending
                      <>
                        <button 
                          onClick={() => handleStatusUpdate(req._id, 'Approved')}
                          disabled={updatingId === req._id}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl text-sm font-bold transition-colors active:scale-95 disabled:opacity-50"
                        >
                          {updatingId === req._id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={2.5} />}
                          Approve
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(req._id, 'Rejected')}
                          disabled={updatingId === req._id}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-sm font-bold transition-colors active:scale-95 disabled:opacity-50"
                        >
                          {updatingId === req._id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} strokeWidth={2.5} />} 
                          Reject
                        </button>
                      </>
                    ) : (
                      // Show a clean status badge if it's already processed
                      <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 flex-1 sm:flex-none ${
                        statusStr === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                      }`}>
                        {statusStr === 'approved' ? <CheckCircle2 size={16} strokeWidth={2.5} /> : <XCircle size={16} strokeWidth={2.5} />}
                        {req.status}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>

    </motion.div>
  );
}