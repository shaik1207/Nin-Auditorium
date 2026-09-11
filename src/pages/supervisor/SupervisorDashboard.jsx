import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Users
} from 'lucide-react';
import api from '../../services/api'; 

export default function SupervisorDashboard() {
  // Real-time Data States
  const [supervisorData, setSupervisorData] = useState({ firstName: 'Supervisor' });
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
        api.get('/supervisor/analytics').catch(() => ({ data: { total: 0, pending: 0, approved: 0, rejected: 0 } })),
        api.get('/supervisor/bookings').catch(() => ({ data: [] })),
        api.get('/auth/profile').catch(() => ({ data: { fullName: 'Supervisor' } })) 
      ]);
      
      setStatsData(analyticsRes.data);
      
      // Safely handle bookings array
      const safeBookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
      setBookings(safeBookings);

      // Extract first name for the personalized greeting
      const fullName = profileRes.data.fullName || 'Supervisor';
      const firstName = fullName.split(' ')[0];
      setSupervisorData({ firstName });

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
      await api.put(`/supervisor/bookings/${bookingId}/status`, { status: newStatus });
      await fetchDashboardData();
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
    { title: 'TOTAL', value: statsData.total || 0, icon: Users, color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' },
  ];

  // Dynamically calculate "Bookings by hall" for the Bar Chart
  const calculateBarData = () => {
    const counts = {};
    if (bookings && bookings.length > 0) {
      bookings.forEach(b => {
        const hallName = b.hall?.name || 'Unknown';
        counts[hallName] = (counts[hallName] || 0) + 1;
      });
    }

    let sortedHalls = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
    
    // Ensure maxBookings is at least 4 so the graph scale looks good even with low numbers
    const values = sortedHalls.map(h => h[1]);
    const maxBookings = values.length > 0 ? Math.max(...values, 4) : 4;

    const formattedData = sortedHalls.map(([name, count]) => ({
      label: name.split(' ')[0], 
      value: count,
      max: maxBookings
    }));

    // Pad with empty bars if less than 4 halls exist
    while (formattedData.length < 4) {
      formattedData.push({ label: '-', value: 0, max: maxBookings });
    }

    return formattedData;
  };

  const barData = calculateBarData();

  // Filter pending requests and sort by newest
  const pendingRequests = bookings
    .filter(b => b.status === 'Pending')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } }
  };

  // Safe percentages for CSS Donut Chart (prevents NaN errors)
  const safeTotal = statsData.total > 0 ? statsData.total : 1; 
  const approvedPct = Math.round((statsData.approved / safeTotal) * 100) || 0;
  const pendingPct = Math.round((statsData.pending / safeTotal) * 100) || 0;
  const conicGradient = `conic-gradient(#10B981 0% ${approvedPct}%, #F59E0B ${approvedPct}% ${approvedPct + pendingPct}%, #EF4444 ${approvedPct + pendingPct}% 100%)`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="animate-spin text-[#10B981]" size={40} />
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full pb-10"
    >
      {/* ================= PREMIUM EMERALD SUPERVISOR HERO BANNER ================= */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-[2.5rem] p-10 md:p-14 mb-8 shadow-[0_15px_40px_rgba(16,185,129,0.15)] border border-[#064E3B]"
        style={{
          background: `
            radial-gradient(circle at 15% 100%, rgba(16, 185, 129, 0.35), transparent 50%), 
            radial-gradient(circle at 85% 0%, rgba(52, 211, 153, 0.15), transparent 50%), 
            radial-gradient(circle at 50% 50%, rgba(6, 78, 59, 0.6), transparent 80%), 
            #022C22
          `
        }}
      >
        <div className="absolute top-6 right-6 lg:top-10 lg:right-10 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase shadow-xl z-20">
          <ShieldCheck size={16} className="text-[#34D399]" />
          Team Supervisor
        </div>

        {/* Abstract Decorative Shapes */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} 
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} 
          className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full border-[40px] border-[#10B981]/10 blur-xl pointer-events-none hidden md:block"
        />
        <motion.div 
          animate={{ y: [0, -5, 0] }} 
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} 
          className="absolute -bottom-6 left-[10%] hidden md:flex items-end gap-1.5 pointer-events-none"
        >
          {[30, 50, 40, 70, 50, 80, 40].map((height, i) => (
            <div 
              key={i} 
              className="w-4 bg-gradient-to-t from-[#10B981] to-[#6EE7B7] rounded-t-full shadow-[0_0_15px_rgba(16,185,129,0.4)] opacity-80" 
              style={{ height: `${height}px` }} 
            />
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="relative z-10 max-w-xl">
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-medium text-white leading-[1.1] tracking-tight mb-4 drop-shadow-lg">
            {greeting}, <br /> {supervisorData.firstName}
          </h1>
          <p className="text-emerald-50 text-[17px] md:text-lg leading-relaxed mb-8 font-medium">
            Team operations are running smoothly. Review pending team requests and monitor venue utilization.
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            <Link 
              to="/supervisor/approvals"
              className="flex items-center gap-2 bg-[#10B981] text-white hover:bg-[#059669] px-6 py-3.5 rounded-full font-bold transition-all shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_10px_25px_rgba(16,185,129,0.4)] active:scale-95 text-[15px]"
            >
              <Activity size={18} />
              Review Approvals
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
          <h3 className="text-lg font-bold text-gray-900 mb-6">Team Bookings by Hall</h3>
          
          {/* Chart Wrapper - Uses explicit height and precise flex alignment to prevent collapsing */}
          <div className="flex-1 flex items-end gap-2 md:gap-4 h-[200px] md:h-[240px] relative mt-2">
            
            {/* Y-Axis Labels */}
            <div className="flex flex-col justify-between h-[calc(100%-24px)] text-[10px] md:text-xs font-semibold text-gray-400 absolute left-0 py-1 w-4 md:w-6 top-0">
              <span>{barData[0]?.max || 4}</span>
              <span>{Math.round((barData[0]?.max || 4) * 0.75)}</span>
              <span>{Math.round((barData[0]?.max || 4) * 0.5)}</span>
              <span>{Math.round((barData[0]?.max || 4) * 0.25)}</span>
              <span>0</span>
            </div>

            {/* Background Grid Lines */}
            <div className="absolute inset-0 pl-6 md:pl-8 flex flex-col justify-between h-[calc(100%-24px)] py-1 pointer-events-none top-0">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full border-b border-gray-100/80"></div>
              ))}
            </div>

            {/* Bars Container */}
            <div className="w-full h-[calc(100%-24px)] flex justify-around items-end pl-6 md:pl-8 relative z-10 border-b border-gray-200">
              {barData.map((bar, index) => {
                const heightPercentage = bar.max > 0 ? (bar.value / bar.max) * 100 : 0;
                
                return (
                  <div key={index} className="flex flex-col items-center justify-end w-full group h-full relative">
                    
                    {/* Hover Tooltip */}
                    <div className="absolute bottom-[calc(100%+8px)] bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-20 whitespace-nowrap">
                      {bar.value} Bookings
                    </div>

                    {/* The Bar */}
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercentage}%` }}
                      transition={{ duration: 1, delay: 0.1 + (index * 0.1), type: "spring", bounce: 0.3 }}
                      className={`w-full max-w-[40px] md:max-w-[70px] rounded-t-xl transition-all duration-300 relative overflow-hidden
                        ${bar.value > 0 ? 'bg-gradient-to-tr from-[#10B981] to-[#34D399] shadow-sm' : 'bg-transparent'}
                      `}
                      style={bar.value > 0 ? { boxShadow: 'inset -2px 0 8px rgba(0,0,0,0.1), inset 2px 0 8px rgba(255,255,255,0.2)' } : {}}
                    >
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent"></div>
                    </motion.div>
                    
                    {/* X-Axis Label */}
                    <span className="absolute -bottom-6 text-[10px] md:text-xs font-bold text-gray-500 tracking-wide truncate max-w-[90%] text-center">
                      {bar.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Dynamic Donut Chart Panel */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 md:p-8 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col justify-between items-center relative">
          <h3 className="text-lg font-bold text-gray-900 w-full text-left md:absolute md:top-8 md:left-8 mb-4 md:mb-0">Status Mix</h3>
          
          <div className="w-36 h-36 md:w-44 md:h-44 mt-4 md:mt-12 relative flex items-center justify-center">
            <motion.div 
              initial={{ rotate: -90, scale: 0.8, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 1, type: "spring" }}
              className="absolute inset-0 rounded-full drop-shadow-md transition-all duration-500"
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

      {/* ================= LATEST PENDING LIST ================= */}
      <motion.div variants={itemVariants} className="bg-white border border-gray-100 rounded-3xl p-5 md:p-8 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Latest Pending Actions</h3>
        </div>

        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
             <div className="text-center py-8 text-gray-500 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
               No pending requests to review right now.
             </div>
          ) : (
            pendingRequests.map((req) => (
              <motion.div 
                key={req._id}
                whileHover={{ scale: 1.01 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 transition-all"
              >
                <div className="flex flex-col">
                  <h4 className="text-base font-bold text-gray-900 mb-1">{req.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded-md text-gray-700 font-semibold">{req.bookingId}</span>
                    <div className="flex items-center gap-1"><Calendar size={12} className="text-[#10B981]" /> {req.date}</div>
                    <span className="hidden sm:block text-gray-300">•</span>
                    <span>{req.hall?.name || 'Unknown Hall'}</span>
                    <span className="hidden sm:block text-gray-300">•</span>
                    <span>By: {req.user?.fullName || req.organizer}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-gray-100 sm:border-0">
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
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

    </motion.div>
  );
}