import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, ShieldCheck, Mail, Lock, EyeOff, Eye, 
  UserCircle, Loader2, Users, Check, Building
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// FIREBASE IMPORTS FOR GOOGLE SSO
import { auth } from '../../firebase'; 
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

import api from '../../services/api'; 

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation(); // <-- Added useLocation
  
  const [role, setRole] = useState('user'); 
  const [activeTab, setActiveTab] = useState('login'); 
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Determine intended destination if redirected from a protected route
  const from = location.state?.from?.pathname; 

  // ==========================================
  // AUTOMATIC LOGIN REDIRECT
  // ==========================================
  useEffect(() => {
    const existingToken = localStorage.getItem('aurora_token');
    const existingRole = localStorage.getItem('aurora_role'); 

    if (existingToken) {
      if (from) return navigate(from, { replace: true });
      if (existingRole === 'ADMIN') navigate('/admin/dashboard', { replace: true });
      else if (existingRole === 'SUPERVISOR') navigate('/supervisor/dashboard', { replace: true });
      else navigate('/user/home', { replace: true });
    }
  }, [navigate, from]);

  // ==========================================
  // HANDLE STANDARD EMAIL/PASSWORD SUBMIT
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (activeTab === 'login') {
        const response = await api.post('/auth/login', { email, password });
        const userData = response.data;
        const assignedRole = userData.role?.toUpperCase() || 'USER';

        if (role === 'admin' && assignedRole !== 'ADMIN') {
          throw new Error("This account does not have administrative privileges.");
        }
        if (role === 'supervisor' && assignedRole !== 'SUPERVISOR') {
          throw new Error("This account does not have supervisor privileges.");
        }
        if (role === 'user' && (assignedRole === 'ADMIN' || assignedRole === 'SUPERVISOR')) {
          throw new Error("Staff accounts must log in through their respective portals.");
        }

        // Save JWT Token & Role to browser
        localStorage.setItem('aurora_token', userData.token);
        localStorage.setItem('aurora_role', assignedRole); 
        toast.success(`Welcome back, ${userData.fullName}!`);
        
        // Smart Routing: Go to intended URL, or default dashboard
        let defaultDashboard = '/user/home';
        if (assignedRole === 'ADMIN') defaultDashboard = '/admin/dashboard';
        if (assignedRole === 'SUPERVISOR') defaultDashboard = '/supervisor/dashboard';
        
        navigate(from || defaultDashboard, { replace: true });
        
      } else {
        if (role === 'admin' || role === 'supervisor') {
          toast.error(`${role.charAt(0).toUpperCase() + role.slice(1)} registration requires special verification.`);
          navigate('/signup'); 
          return;
        }

        await api.post('/auth/register', { 
          fullName: name, email, password, role: 'USER' 
        });

        setActiveTab('login');
        setPassword('');
        toast.success("Account created successfully! You can now log in.");
      }
    } catch (error) {
      console.error("Auth Error:", error);
      toast.error(error.response?.data?.message || error.message || "Authentication failed. Check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // HANDLE GOOGLE AUTHENTICATION
  // ==========================================
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      const response = await api.post('/auth/google', {
        fullName: googleUser.displayName,
        email: googleUser.email,
        role: role.toUpperCase()
      });

      const userData = response.data;
      const assignedRole = userData.role?.toUpperCase() || 'USER';

      localStorage.setItem('aurora_token', userData.token);
      localStorage.setItem('aurora_role', assignedRole); 
      
      toast.success(`Welcome, ${userData.fullName}!`);
      
      let defaultDashboard = '/user/home';
      if (assignedRole === 'ADMIN') defaultDashboard = '/admin/dashboard';
      if (assignedRole === 'SUPERVISOR') defaultDashboard = '/supervisor/dashboard';
      
      navigate(from || defaultDashboard, { replace: true });
      
    } catch (error) {
      console.error("Google Auth Error:", error);
      toast.error(error.response?.data?.message || "Google Authentication failed or was closed.");
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { id: 'user', title: 'User', icon: User, color: 'text-[#3B82F6]' },
    { id: 'admin', title: 'IT Admin', icon: ShieldCheck, color: 'text-[#8B5CF6]' },
    { id: 'supervisor', title: 'Supervisor', icon: Users, color: 'text-[#10B981]' }
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-4 sm:p-8 font-sans relative">
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontWeight: '500' } }} />

      <div className="w-full max-w-[1200px] bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] flex flex-col lg:flex-row overflow-hidden relative z-10 min-h-[700px]">
        
        {/* ================= LEFT PANEL ================= */}
        <div className="hidden lg:flex w-[40%] relative flex-col justify-between overflow-hidden p-12">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1540835296345-8eea18b4eba8?q=80&w=2070&auto=format&fit=crop')` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-[#0A192F]/60 to-[#0A192F]/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-[#0A4DD0]/20" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white p-2.5 rounded-xl shadow-lg flex items-center justify-center shrink-0">
              <Building size={24} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">NIN Auditorium Booking</h2>
              <p className="text-blue-100 text-xs font-medium">Smart. Simple. Seamless.</p>
            </div>
          </div>

          <div className="relative z-10 mt-auto">
            <h1 className="text-white text-5xl font-extrabold leading-[1.1] tracking-tight mb-4 drop-shadow-lg">
              Manage.<br />Book.<br /><span className="text-[#60A5FA]">Simplify.</span>
            </h1>
            <p className="text-blue-50 text-[15px] leading-relaxed max-w-sm font-medium drop-shadow-md">
              A unified platform to manage auditoriums, users and operations with ease.
            </p>
          </div>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="w-full lg:w-[60%] p-8 sm:p-12 flex flex-col relative bg-white">
          <div className="text-center mb-6">
            <h2 className="text-[32px] font-extrabold text-gray-900 mb-2">Welcome Back!</h2>
            <p className="text-gray-500 text-[15px] font-medium">Please select your role to continue</p>
          </div>

          <div className="flex justify-center gap-4 sm:gap-6 mb-8">
            {roles.map((r) => {
              const Icon = r.icon;
              const isActive = role === r.id;
              
              return (
                <button
                  key={r.id} type="button" onClick={() => setRole(r.id)}
                  className={`relative group flex flex-col items-center justify-center w-[84px] h-[84px] sm:w-[96px] sm:h-[96px] rounded-3xl border-2 transition-all duration-300 ease-out overflow-hidden ${
                    isActive ? 'border-[#0A4DD0] bg-[#FAFAFF] shadow-[0_8px_20px_rgba(10,77,208,0.08)]' : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-2 right-2 w-3.5 h-3.5 bg-[#0A4DD0] rounded-full flex items-center justify-center text-white">
                      <Check size={8} strokeWidth={4} />
                    </div>
                  )}
                  <div className={`transition-transform duration-300 ${isActive ? '-translate-y-3' : 'group-hover:-translate-y-3'}`}>
                    <Icon size={28} className={isActive ? r.color : 'text-gray-400 group-hover:text-gray-600 transition-colors'} strokeWidth={1.5} />
                  </div>
                  <span className={`absolute bottom-3 text-xs sm:text-[13px] font-bold transition-all duration-300 ${
                    isActive ? 'opacity-100 translate-y-0 text-[#0A4DD0]' : 'opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 text-gray-600'
                  }`}>
                    {r.title}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-center mb-6">
            <div className="flex bg-gray-100 p-1 rounded-full w-full max-w-sm">
              {['login', 'signup'].map((tab) => (
                <button 
                  key={tab} type="button" onClick={() => setActiveTab(tab)} 
                  className={`flex-1 py-2 text-sm font-bold rounded-full capitalize transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-md w-full mx-auto flex-1">
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="popLayout">
                {activeTab === 'signup' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><UserCircle size={18} /></div>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-[#0A4DD0]/20 focus:border-[#0A4DD0] transition-all placeholder:font-normal" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Mail size={18} /></div>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-[#0A4DD0]/20 focus:border-[#0A4DD0] transition-all placeholder:font-normal" />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Lock size={18} /></div>
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-[#0A4DD0]/20 focus:border-[#0A4DD0] transition-all placeholder:font-normal" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"><EyeOff size={18} /></button>
              </div>

              {activeTab === 'login' && (
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    {/* The 15-day cookie logic handles the backend persistence automatically! */}
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-[#0A4DD0] focus:ring-[#0A4DD0] cursor-pointer" />
                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
                  </label>
                  <Link to="#" className="text-sm font-bold text-[#0A4DD0] hover:text-[#083CA8] transition-colors">
                    Forgot password?
                  </Link>
                </div>
              )}

              <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center text-white py-3.5 rounded-xl font-bold bg-[#0A4DD0] hover:bg-[#083CA8] shadow-[0_8px_20px_rgba(10,77,208,0.2)] active:scale-[0.98] transition-all mt-4 disabled:opacity-70">
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : (activeTab === 'login' ? 'Login' : 'Create Account')}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative flex items-center justify-center mb-5">
                <div className="absolute w-full border-t border-gray-200" />
                <span className="relative bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-wide">or continue with</span>
              </div>
              <button type="button" onClick={handleGoogleSignIn} disabled={isLoading} className="w-full flex items-center justify-center py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all shadow-sm disabled:opacity-70">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                <span className="ml-3 text-[15px] font-bold text-gray-700">Continue with Google</span>
              </button>
            </div>
          </div>

          <div className="mt-auto pt-8 flex items-center justify-center gap-4 text-xs font-semibold text-gray-400">
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Secure</span> • 
            <span>Reliable</span> • 
            <span>Trusted</span>
          </div>

        </div>
      </div>
    </div>
  );
}