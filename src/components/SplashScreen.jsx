import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Volume2, Tv, Wifi, ShieldCheck, 
  Users, Calendar, ChevronRight, Play, Star, MapPin, 
  Phone, Mail, Ban, Clock, FileText, CheckCircle2, ArrowRight
} from 'lucide-react';

// ==========================================
// 3D TILT CARD ENGINE
// ==========================================
const TiltCard = ({ children, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateY, rotateX, transformStyle: "preserve-3d" }}
      className={`relative ${className}`}
    >
      <div style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }} className="w-full h-full">
        {children}
      </div>
    </motion.div>
  );
};

// ==========================================
// CUSTOM FALLBACK ICONS & ANIMATION UTILS
// ==========================================
const CustomSparkles = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: (custom = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.8, delay: custom * 0.15, ease: [0.25, 0.4, 0.25, 1] }
  })
};

// ==========================================
// DATA: FEATURES, AUDITORIUMS
// ==========================================
const features = [
  {
    title: "Dolby Atmos Acoustics",
    desc: "State-of-the-art 360° spatial audio system calibrated for crystal clear speech and immersive media playback.",
    icon: Volume2,
    gradient: "from-blue-600 to-indigo-600",
  },
  {
    title: "4K Laser Projection",
    desc: "Ultra-bright, cinema-grade 4K projection systems with motorized wide-gamut screens for stunning visual clarity.",
    icon: Tv, 
    gradient: "from-[#8C7CFF] to-indigo-500",
  },
  {
    title: "Dynamic Smart Lighting",
    desc: "Automated ambient and stage lighting with distinct presets for seminars, award ceremonies, and theatrical events.",
    icon: CustomSparkles, 
    gradient: "from-amber-400 to-orange-500",
  },
  {
    title: "High-Density Wi-Fi 6",
    desc: "Uninterrupted, high-speed enterprise connectivity capable of supporting 1000+ simultaneous devices.",
    icon: Wifi,
    gradient: "from-emerald-400 to-teal-500",
  }
];

const auditoriums = [
  {
    name: "Golden Jubilee Auditorium",
    capacity: "800 Seats",
    type: "Premium Tier",
    image: "https://images.unsplash.com/photo-1540835296345-8eea18b4eba8?q=80&w=2070&auto=format&fit=crop",
    tags: ["4K Projection", "Dolby Audio", "VIP Lounge"]
  },
  {
    name: "NIN Committee Hall",
    capacity: "150 Seats",
    type: "Executive Tier",
    image: "https://images.unsplash.com/photo-1576085898323-218337e3e43c?q=80&w=2000&auto=format&fit=crop",
    tags: ["Boardroom Setup", "Video Conferencing", "Private"]
  },
  {
    name: "Tarnaka Conference Room",
    capacity: "50 Seats",
    type: "Standard Tier",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2000&auto=format&fit=crop",
    tags: ["Interactive Whiteboard", "Flexible Seating"]
  }
];

export default function SplashScreen() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ 
        x: (e.clientX / window.innerWidth - 0.5) * 20, 
        y: (e.clientY / window.innerHeight - 0.5) * 20 
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#050B14] text-slate-200 font-sans overflow-hidden selection:bg-[#3B82F6] selection:text-white relative">
      
      {/* Dynamic Cursor Glow */}
      <motion.div 
        className="fixed top-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0"
        animate={{ x: mousePos.x * 20 + window.innerWidth/2 - 300, y: mousePos.y * 20 + window.innerHeight/2 - 300 }}
        transition={{ type: "spring", damping: 40, stiffness: 200, mass: 0.5 }}
      />

      {/* ==========================================
          OFFICIAL NAVBAR (Glassmorphic)
      ========================================== */}
      <nav className="absolute top-0 left-0 w-full z-50 border-b border-white/5 bg-[#050B14]/60 backdrop-blur-2xl">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="bg-white p-1 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <img src="/icmr-logo.png" alt="ICMR Logo" className="w-9 h-9 md:w-11 md:h-11 object-contain" />
            </div>
            <div className="hidden sm:block w-px h-8 bg-white/20" />
            <div>
              <h1 className="text-lg md:text-xl font-black tracking-tight text-white leading-tight drop-shadow-md">NIN Facility Booking</h1>
              <p className="text-[9px] md:text-[10px] font-bold text-blue-400 tracking-widest uppercase mt-0.5">Government of India</p>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-300">
            <a href="#features" className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">Infrastructure</a>
            <a href="#venues" className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">Venues</a>
            <a href="#guidelines" className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">Guidelines</a>
          </div>

          <Link 
            to="/login" 
            className="bg-white text-blue-950 hover:bg-blue-50 px-5 py-2.5 md:px-6 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] flex items-center gap-2"
          >
            Access Portal <ChevronRight size={16} className="hidden sm:block" />
          </Link>
        </div>
      </nav>

      {/* ==========================================
          PREMIUM 3D HERO SECTION
      ========================================== */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-6 max-w-[1400px] mx-auto min-h-[95vh] flex items-center z-10">
        
        {/* Deep Background Gradients */}
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-[#1E3A8A] rounded-full mix-blend-screen filter blur-[200px] opacity-40 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-600 rounded-full mix-blend-screen filter blur-[150px] opacity-20" />
        
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center w-full relative z-10">
          
          {/* Left Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-400 text-xs font-bold tracking-wide uppercase mb-6 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
            >
              <ShieldCheck size={14} /> Official ICMR Facility
            </motion.div>
            <h1 className="text-5xl md:text-6xl lg:text-[76px] font-black tracking-tighter leading-[1.05] mb-6 text-white drop-shadow-2xl">
              National Institute <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-[0_0_30px_rgba(99,102,241,0.4)]">of Nutrition</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-lg leading-relaxed font-medium">
              A centralized demonstration system for scheduling and managing official medical research symposiums, government conferences, and institutional ceremonies.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold shadow-[0_10px_30px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_40px_rgba(59,130,246,0.5)] transition-all active:scale-95 text-center flex items-center justify-center gap-2 group">
                Check Availability <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-bold backdrop-blur-md shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2">
                <Play size={18} className="text-blue-400" fill="currentColor" /> Facility Tour
              </button>
            </div>

            {/* Micro Stats in Hero */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-4"
            >
              <div>
                <p className="text-3xl font-black text-white drop-shadow-lg">3</p>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">Premium Halls</p>
              </div>
              <div>
                <p className="text-3xl font-black text-white drop-shadow-lg">1000+</p>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">Capacity</p>
              </div>
              <div>
                <p className="text-3xl font-black text-white drop-shadow-lg">24/7</p>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">Support</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right 3D Visual Composition (Glassmorphic Multi-Layer) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative h-[500px] md:h-[600px] w-full hidden lg:block"
            style={{ perspective: "1200px" }}
          >
            {/* Center Main Card */}
            <motion.div 
              animate={{ y: [-15, 15, -15], rotateY: mousePos.x * 2, rotateX: mousePos.y * -2 }}
              transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" }, rotateY: { type: "spring" }, rotateX: { type: "spring" } }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-[#12182B]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-[0_30px_60px_rgba(0,0,0,0.6)] z-20"
            >
              <div className="w-full h-36 bg-slate-800 rounded-2xl mb-5 overflow-hidden relative border border-white/5">
                <img src={auditoriums[0].image} alt="Hall" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12182B] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-white">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span className="text-[10px] font-bold tracking-wider uppercase">Tier 1</span>
                </div>
              </div>
              <h3 className="text-xl font-black text-white mb-2">Golden Jubilee Hall</h3>
              <p className="text-sm text-slate-400 font-medium">Fully equipped with 4K projection and Dolby acoustics.</p>
            </motion.div>

            {/* Top Right Floating Badge */}
            <motion.div 
              animate={{ y: [-20, 20, -20], rotateZ: [-3, 3, -3] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-12 right-0 w-64 bg-[#1E293B]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl transform rotate-6 z-10"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
                  <img src="/icmr-logo.png" alt="ICMR" className="w-6 h-6 object-contain drop-shadow-md" />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-md uppercase tracking-wider">Official</span>
              </div>
              <h3 className="text-md font-bold text-white">ISO 9001 Certified</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Compliant with health & safety mandates.</p>
            </motion.div>

            {/* Bottom Left Floating Badge */}
            <motion.div 
              animate={{ y: [20, -20, 20], x: [-10, 10, -10], rotateZ: [3, -3, 3] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-16 left-4 w-72 bg-gradient-to-br from-emerald-900/40 to-teal-900/40 backdrop-blur-2xl border border-emerald-500/30 rounded-2xl p-5 shadow-[0_20px_50px_rgba(16,185,129,0.2)] transform -rotate-6 z-30"
            >
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.4)] shrink-0">
                   <CheckCircle2 size={24} />
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-0.5">Booking Status</p>
                   <p className="text-sm font-black text-white leading-tight">Clearance Granted for Research Symposium</p>
                 </div>
               </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          FEATURES SECTION (Scroll to Reveal)
      ========================================== */}
      <section id="features" className="py-32 px-6 max-w-[1400px] mx-auto relative z-10 border-t border-white/5 bg-[#080D1A]">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">Infrastructure & Facilities</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">Equipped with enterprise-grade technology to meet the rigorous demands of scientific consortiums and national conferences.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" style={{ perspective: "1000px" }}>
          {features.map((feature, idx) => {
            const Icon = feature.icon; 
            return (
              <motion.div 
                custom={idx} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUpVariant}
                key={idx} className="h-full"
              >
                <TiltCard className="h-full">
                  <div className="bg-[#12182B]/60 backdrop-blur-md border border-white/5 rounded-[2rem] p-8 h-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:bg-[#1A233A] hover:border-blue-500/30 group">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                      <Icon size={28} strokeWidth={2} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                      {feature.desc}
                    </p>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ==========================================
          RADIAL BOOKING GUIDELINES (Animated Floating Nodes)
      ========================================== */}
      <section id="guidelines" className="py-32 px-6 bg-[#030712] relative overflow-hidden">
        
        {/* Ambient radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}
            className="text-center mb-16 lg:mb-32"
          >
            <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-full mb-6 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
               <FileText size={24} className="text-blue-400" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">Official Booking Guidelines</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">Please review the mandatory protocols set forth by the ICMR administration before requesting auditorium reservations.</p>
          </motion.div>

          {/* Radial Grid Layout with Animated Connections */}
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-0 items-center relative min-h-[500px]">
            
            {/* SVG Connecting Lines with Animated Arrows (Desktop Only) */}
            <div className="hidden lg:block absolute inset-0 pointer-events-none z-0">
              <svg className="w-full h-full absolute top-0 left-0" preserveAspectRatio="none">
                <defs>
                  {/* Gradient for lines */}
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#8C7CFF" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
                  </linearGradient>
                </defs>

                {/* Animated Dashed Paths connecting center to nodes */}
                <motion.path 
                  d="M 50% 50% L 25% 20%" stroke="url(#lineGrad)" strokeWidth="3" fill="none" strokeDasharray="10 10"
                  animate={{ strokeDashoffset: [0, -100] }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                />
                <motion.path 
                  d="M 50% 50% L 25% 80%" stroke="url(#lineGrad)" strokeWidth="3" fill="none" strokeDasharray="10 10"
                  animate={{ strokeDashoffset: [0, -100] }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                />
                <motion.path 
                  d="M 50% 50% L 75% 20%" stroke="url(#lineGrad)" strokeWidth="3" fill="none" strokeDasharray="10 10"
                  animate={{ strokeDashoffset: [0, 100] }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                />
                <motion.path 
                  d="M 50% 50% L 75% 80%" stroke="url(#lineGrad)" strokeWidth="3" fill="none" strokeDasharray="10 10"
                  animate={{ strokeDashoffset: [0, 100] }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                />
              </svg>
            </div>

            {/* Left Column Rules */}
            <div className="flex flex-col gap-6 lg:gap-32 z-10 lg:pr-12 relative">
              <motion.div 
                custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}
                animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="bg-[#12182B]/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl relative group hover:border-blue-500/40 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-4 lg:ml-auto lg:mb-0 lg:absolute lg:-right-6 lg:top-8 border border-blue-500/30 z-20 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  <FileText size={20} strokeWidth={2.5} />
                </div>
                <div className="lg:text-right lg:pr-8">
                  <h4 className="text-lg font-bold text-white mb-2">Academic Use Only</h4>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">Venues are strictly reserved for medical symposiums, research conferences, and institutional events. Political or religious gatherings are prohibited.</p>
                </div>
              </motion.div>

              <motion.div 
                custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}
                animate={{ y: [5, -5, 5] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="bg-[#12182B]/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl relative group hover:border-amber-500/40 transition-colors"
              >
                <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mb-4 lg:ml-auto lg:mb-0 lg:absolute lg:-right-6 lg:top-8 border border-amber-500/30 z-20 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  <Ban size={20} strokeWidth={2.5} />
                </div>
                <div className="lg:text-right lg:pr-8">
                  <h4 className="text-lg font-bold text-white mb-2">Decorum & Safety</h4>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">Consumption of eatables or beverages inside the main hall is strictly prohibited. Smoking and flammable items are banned within the campus.</p>
                </div>
              </motion.div>
            </div>

            {/* Center Node (ICMR Logo) */}
            <div className="hidden lg:flex justify-center items-center z-20">
              <motion.div 
                initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", bounce: 0.5, duration: 1 }}
                className="relative"
              >
                {/* Pulsing rings */}
                <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 bg-blue-500 rounded-full blur-xl" />
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0, 0.8] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 border-2 border-blue-400 rounded-full" />
                
                <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center p-6 border-[6px] border-[#0A0F1D] shadow-[0_0_50px_rgba(59,130,246,0.4)] relative z-10 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-100/50" />
                  <img src="/icmr-logo.png" alt="ICMR Node" className="w-full h-full object-contain relative z-10" />
                </div>
                
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-blue-400 bg-blue-950/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-blue-500/30 shadow-lg uppercase tracking-widest">
                  Central Authority
                </div>
              </motion.div>
            </div>

            {/* Right Column Rules */}
            <div className="flex flex-col gap-6 lg:gap-32 z-10 lg:pl-12 relative">
              <motion.div 
                custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}
                animate={{ y: [-5, 5, -5] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="bg-[#12182B]/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl relative group hover:border-emerald-500/40 transition-colors"
              >
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4 lg:mb-0 lg:absolute lg:-left-6 lg:top-8 border border-emerald-500/30 z-20 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <ShieldCheck size={20} strokeWidth={2.5} />
                </div>
                <div className="lg:pl-8">
                  <h4 className="text-lg font-bold text-white mb-2">Security & Permissions</h4>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">External organizers must secure mandatory NOCs and Police clearance prior to the event. Guest lists must be submitted 48 hours in advance.</p>
                </div>
              </motion.div>

              <motion.div 
                custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}
                animate={{ y: [5, -5, 5] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                className="bg-[#12182B]/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl relative group hover:border-rose-500/40 transition-colors"
              >
                <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mb-4 lg:mb-0 lg:absolute lg:-left-6 lg:top-8 border border-rose-500/30 z-20 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                  <Clock size={20} strokeWidth={2.5} />
                </div>
                <div className="lg:pl-8">
                  <h4 className="text-lg font-bold text-white mb-2">Cancellation Policy</h4>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">Standardized deductions apply to all bookings. 20% deduction within 30 days notice, and up to 50% deduction if cancelled within 7 days.</p>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ==========================================
          VENUES SHOWCASE (Scroll Reveal Cards)
      ========================================== */}
      <section id="venues" className="py-32 px-6 bg-[#050B14] border-t border-white/5 relative">
        <div className="max-w-[1400px] mx-auto relative z-10">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}
            className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">Venue Directory</h2>
              <p className="text-slate-400 text-lg max-w-xl font-medium">Authorized spaces allocated for official institute operations and approved external delegations.</p>
            </div>
            <Link to="/login" className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold backdrop-blur-md border border-white/10 flex items-center gap-2 transition-colors active:scale-95 shadow-lg">
              Check Master Schedule <Calendar size={18} />
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-10">
            {auditoriums.map((audi, idx) => (
              <motion.div 
                key={idx}
                custom={idx} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUpVariant}
                whileHover={{ y: -10 }} transition={{ duration: 0.3 }}
                className="group rounded-[2.5rem] overflow-hidden bg-[#12182B]/50 backdrop-blur-sm border border-white/5 shadow-2xl"
              >
                <div className="relative h-64 overflow-hidden bg-slate-900">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12182B] to-transparent z-10" />
                  <img 
                    src={audi.image} 
                    alt={audi.name} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out opacity-80" 
                  />
                  <div className="absolute top-5 right-5 z-20 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-white flex items-center gap-1.5 shadow-xl">
                    <Star size={12} className="text-amber-400 fill-amber-400" /> {audi.type}
                  </div>
                </div>

                <div className="p-8 relative z-20 -mt-6">
                  <h3 className="text-2xl font-black text-white mb-3">{audi.name}</h3>
                  <div className="flex items-center gap-5 text-sm font-bold text-slate-400 mb-6">
                    <span className="flex items-center gap-1.5"><Users size={16} className="text-blue-400"/> {audi.capacity}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={16} className="text-blue-400"/> Block C</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    {audi.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="px-3 py-1.5 text-[11px] font-bold bg-blue-500/10 text-blue-300 rounded-md border border-blue-500/20 uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link to="/login" className="w-full py-4 rounded-xl border border-white/10 bg-white/5 text-white font-bold flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-all active:scale-95 shadow-lg">
                    Request Booking
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          PREMIUM GOVERNMENT FOOTER
      ========================================== */}
      <footer className="bg-[#030712] text-slate-300 pt-24 pb-8 px-6 border-t border-white/10 relative overflow-hidden">
        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-4 gap-12 mb-16 relative z-10">
          
          {/* Identity */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-white p-2 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <img src="/icmr-logo.png" alt="ICMR" className="w-12 h-12 object-contain" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white leading-none tracking-tight">NIN Bookings</h3>
                <p className="text-xs text-blue-400 font-bold tracking-widest uppercase mt-1">National Institute of Nutrition</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-md font-medium">
              A premier research institute under the Indian Council of Medical Research, Department of Health Research, Ministry of Health and Family Welfare, Government of India.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Portal Access</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/login" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"><ChevronRight size={14}/> Admin Login</Link></li>
              <li><Link to="/login" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"><ChevronRight size={14}/> Submit Request</Link></li>
              <li><a href="#guidelines" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"><ChevronRight size={14}/> Booking Guidelines</a></li>
              <li><a href="#features" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"><ChevronRight size={14}/> Facilities Info</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Contact Admin</h4>
            <ul className="space-y-5 text-sm text-slate-400 font-medium">
              <li className="flex items-start gap-3">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10 shrink-0"><MapPin size={16} className="text-blue-400" /></div>
                <span className="mt-1">Beside Tarnaka Metro Station, Jamai Osmania PO, Hyderabad 500007</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10 shrink-0"><Phone size={16} className="text-blue-400" /></div>
                <span>+91-40-27197200</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10 shrink-0"><Mail size={16} className="text-blue-400" /></div>
                <span>admin@nin.res.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & Credits Row */}
        <div className="max-w-[1400px] mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold tracking-wide text-slate-600 uppercase">
          <p>© {new Date().getFullYear()} National Institute of Nutrition, ICMR. All rights reserved.</p>
          <p className="flex items-center gap-1">
            System Demonstration Portal <span className="mx-2">|</span> 
          </p>
        </div>
      </footer>

    </div>
  );
}