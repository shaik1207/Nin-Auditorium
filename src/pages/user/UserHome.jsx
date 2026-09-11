import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ListOrdered, 
  Sparkles, 
  CalendarDays, 
  Building2,
  Clock,
  MapPin,
  Calendar,
  Loader2
} from 'lucide-react';
import api from '../../services/api';

export default function UserHome() {
  // Real-time Data States
  const [userData, setUserData] = useState({ firstName: 'User' });
  const [statsData, setStatsData] = useState({ total: 0, approved: 0, pending: 0, halls: 0 });
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  // Determine Time-Based Greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Fetch real-time data from backend on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch profile, user bookings, and available halls simultaneously
        const [profileRes, bookingsRes, hallsRes] = await Promise.all([
          api.get('/auth/profile'),
          api.get('/bookings/my'),
          api.get('/halls')
        ]);

        const bookings = bookingsRes.data;
        const halls = hallsRes.data;

        // Extract first name for the personalized greeting
        const fullName = profileRes.data.fullName || 'User';
        const firstName = fullName.split(' ')[0];
        setUserData({ firstName });

        // Calculate real-time stats
        setStatsData({
          total: bookings.length,
          approved: bookings.filter(b => b.status === 'Approved').length,
          pending: bookings.filter(b => b.status === 'Pending').length,
          halls: halls.filter(h => h.status === 'Available').length
        });

        // Get the latest 2 bookings
        const sortedBookings = bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setUpcomingBookings(sortedBookings.slice(0, 2));

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  // Dynamic Stats Array
  const stats = [
    { title: 'TOTAL BOOKINGS', value: statsData.total, icon: ListOrdered, color: 'text-[#0064E0]', bg: 'bg-[#0064E0]/10' },
    { title: 'APPROVED', value: statsData.approved, icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'PENDING', value: statsData.pending, icon: CalendarDays, color: 'text-amber-500', bg: 'bg-amber-50' },
    { title: 'HALLS AVAILABLE', value: statsData.halls, icon: Building2, color: 'text-[#8C7CFF]', bg: 'bg-[#8C7CFF]/10' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh] w-full">
        <Loader2 className="animate-spin text-[#0064E0]" size={40} />
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
      {/* ================= PREMIUM IOS HERO BANNER ================= */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-[2.5rem] p-10 md:p-14 mb-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white"
        style={{
          // Premium Multi-Color Mesh Gradient matching the Meta design
          background: `
            radial-gradient(circle at 15% 50%, rgba(226, 246, 206, 0.9), transparent 45%), 
            radial-gradient(circle at 85% 20%, rgba(212, 231, 254, 0.9), transparent 50%), 
            radial-gradient(circle at 75% 85%, rgba(251, 224, 224, 0.9), transparent 50%), 
            #F4F7FB
          `
        }}
      >
        {/* Abstract Shape 1: Pink Fan (Bottom Left) */}
        <motion.div 
          animate={{ y: [0, -10, 0] }} 
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} 
          className="absolute -bottom-8 left-[10%] hidden md:flex items-end gap-1.5"
        >
          <div className="w-5 h-20 bg-gradient-to-t from-[#FF6B9E] to-[#FF9EBC] rounded-full rotate-[-45deg] origin-bottom shadow-lg" />
          <div className="w-5 h-24 bg-gradient-to-t from-[#FF6B9E] to-[#FF9EBC] rounded-full rotate-[-25deg] origin-bottom shadow-lg" />
          <div className="w-5 h-28 bg-gradient-to-t from-[#FF6B9E] to-[#FF9EBC] rounded-full rotate-[0deg] origin-bottom shadow-lg" />
          <div className="w-5 h-24 bg-gradient-to-t from-[#FF6B9E] to-[#FF9EBC] rounded-full rotate-[25deg] origin-bottom shadow-lg" />
          <div className="w-5 h-20 bg-gradient-to-t from-[#FF6B9E] to-[#FF9EBC] rounded-full rotate-[45deg] origin-bottom shadow-lg" />
        </motion.div>

        {/* Abstract Shape 2: Blue Stack (Top Right) */}
        <motion.div 
          animate={{ y: [0, 12, 0] }} 
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} 
          className="absolute top-10 right-[25%] hidden md:flex flex-col gap-2 rotate-[15deg]"
        >
          <div className="w-32 h-8 bg-gradient-to-r from-[#4A8CFF] to-[#6EB1FF] rounded-full shadow-[0_10px_20px_rgba(74,140,255,0.3)] ml-8" />
          <div className="w-36 h-9 bg-gradient-to-r from-[#2970FF] to-[#5C9BFF] rounded-full shadow-[0_10px_20px_rgba(41,112,255,0.3)] ml-2" />
          <div className="w-28 h-7 bg-gradient-to-r from-[#7BAFFF] to-[#A3CDFF] rounded-full shadow-[0_10px_20px_rgba(123,175,255,0.3)]" />
        </motion.div>

        {/* Abstract Shape 3: Green Ribbed Cylinder (Bottom Right) */}
        <motion.div 
          animate={{ y: [0, -8, 0] }} 
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} 
          className="absolute bottom-12 right-[8%] hidden lg:flex flex-col items-center gap-[3px]"
        >
          {[16, 24, 32, 40, 48, 56, 60, 60, 56, 48, 40, 32, 24, 16].map((width, i) => (
            <div 
              key={i} 
              className="h-[6px] bg-gradient-to-r from-[#34C759] to-[#6AD884] rounded-full shadow-sm" 
              style={{ width: `${width}px` }} 
            />
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="relative z-10 max-w-xl">
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-medium text-[#1C1E21] leading-[1.1] tracking-tight mb-4">
            {greeting}, <br /> {userData.firstName}
          </h1>
          <p className="text-[#606770] text-[17px] md:text-lg leading-relaxed mb-8 font-medium">
            Welcome to your Auditorium Booking Workspace. Browse premium halls, request slots, and track your events.
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            <Link 
              to="/user/book"
              className="flex items-center gap-2 bg-[#0064E0] text-white hover:bg-[#0054BD] px-6 py-3.5 rounded-full font-bold transition-all shadow-[0_8px_20px_rgba(0,100,224,0.25)] hover:shadow-[0_10px_25px_rgba(0,100,224,0.35)] active:scale-95 text-[15px]"
            >
              Browse halls
            </Link>
            <Link 
              to="/user/bookings"
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-[#1C1E21] border border-gray-200 px-6 py-3.5 rounded-full font-bold transition-all shadow-sm active:scale-95 text-[15px]"
            >
              My bookings
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ================= STATS GRID ================= */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-10">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={index} 
              whileHover={{ y: -5, scale: 1.02, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.08)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`p-2 rounded-xl ${stat.bg}`}>
                  <Icon size={18} className={stat.color} strokeWidth={2.5} />
                </div>
              </div>
              <h2 className="text-4xl font-extrabold text-[#1C1E21]">
                {stat.value}
              </h2>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ================= UPCOMING BOOKINGS ================= */}
      <motion.div variants={itemVariants} className="flex flex-col">
        <div className="flex items-center justify-between mb-5 px-1">
          <h3 className="text-xl md:text-2xl font-bold text-[#1C1E21] tracking-tight">Recent bookings</h3>
          <Link 
            to="/user/bookings" 
            className="text-sm font-bold text-[#0064E0] hover:underline transition-all flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="space-y-4">
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-10 bg-white border border-gray-100 rounded-[1.5rem]">
              <p className="text-gray-500 font-medium">You haven't made any bookings yet.</p>
            </div>
          ) : (
            upcomingBookings.map((booking) => (
              <Link key={booking._id} to="/user/bookings" className="block outline-none">
                <motion.div 
                  whileHover={{ y: -3, boxShadow: "0 15px 30px -5px rgba(0,0,0,0.05)" }}
                  className="bg-white border border-gray-100 rounded-[1.5rem] p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-[0_4px_15px_rgba(0,0,0,0.02)] transition-all cursor-pointer group"
                >
                  <div className="w-full sm:w-[160px] h-[120px] rounded-[1rem] overflow-hidden shrink-0 relative bg-gray-100 shadow-inner">
                    <img 
                      src={booking.hall?.image || "https://images.unsplash.com/photo-1592247350271-c5efb34dd967?q=80&w=2070&auto=format&fit=crop"} 
                      alt="Auditorium" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>

                  <div className="flex-1 w-full flex flex-col justify-center">
                    <div className="flex flex-col sm:flex-row justify-between items-start w-full gap-4">
                      <div>
                        <h4 className="text-lg md:text-xl font-bold text-[#1C1E21] mb-1 leading-tight group-hover:text-[#0064E0] transition-colors">
                          {booking.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-[#606770] mb-3">
                          <MapPin size={14} className="text-gray-400" />
                          <span>{booking.hall?.name || "Unknown Hall"}</span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500">
                          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                            <Calendar size={14} className="text-[#0064E0]" />
                            <span>{booking.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                            <Clock size={14} className="text-[#0064E0]" />
                            <span>{booking.startTime} - {booking.endTime}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0 shadow-sm mt-2 sm:mt-0 border ${
                        booking.status === 'Approved' ? 'bg-emerald-50 border-emerald-200' :
                        booking.status === 'Rejected' ? 'bg-red-50 border-red-200' :
                        'bg-amber-50 border-amber-200'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          booking.status === 'Approved' ? 'bg-emerald-500' :
                          booking.status === 'Rejected' ? 'bg-red-500' :
                          'bg-amber-500 animate-pulse'
                        }`}></div>
                        <span className={`text-[11px] uppercase tracking-wider font-bold ${
                          booking.status === 'Approved' ? 'text-emerald-600' :
                          booking.status === 'Rejected' ? 'text-red-600' :
                          'text-amber-600'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))
          )}
        </div>
      </motion.div>

    </motion.div>
  );
}