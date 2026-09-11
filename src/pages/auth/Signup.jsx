import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, ShieldCheck, Mail, Lock, EyeOff, Eye, 
  UserCircle, KeyRound, Loader2, Users, Check, Building
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// FIREBASE IMPORTS (Only for Google SSO popup)
import { auth } from '../../firebase'; 
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

import api from '../../services/api'; 

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState('user'); // 'user', 'admin', or 'supervisor'
  const [showPassword, setShowPassword] = useState(false);
  
  // Auth Loading State
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP States
  const [step, setStep] = useState(1); // Step 1: Details, Step 2: OTP Verification
  const [otp, setOtp] = useState('');

  // ==========================================
  // AUTOMATIC LOGIN REDIRECT ("REMEMBER ME")
  // ==========================================
  useEffect(() => {
    const existingToken = localStorage.getItem('aurora_token');
    const existingRole = localStorage.getItem('aurora_role');

    if (existingToken) {
      if (existingRole === 'ADMIN') navigate('/admin/dashboard');
      else if (existingRole === 'SUPERVISOR') navigate('/supervisor/dashboard');
      else navigate('/user/home');
    }
  }, [navigate]);

  // ==========================================
  // STEP 1: INITIAL SUBMIT (SEND OTP OR REGISTER)
  // ==========================================
  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (role === 'admin' || role === 'supervisor') {
        // Request backend to generate and send an Email OTP
        await api.post('/auth/send-otp', { email });
        toast.success(`OTP sent to ${email}`);
        setStep(2); // Move UI to OTP input step
      } else {
        // If User: Standard Email/Password Signup directly to backend
        await finalizeRegistration(null);
      }
    } catch (error) {
      console.error("Signup Error:", error);
      toast.error(error.response?.data?.message || "An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // STEP 2: VERIFY OTP (STAFF ONLY)
  // ==========================================
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await finalizeRegistration(otp);
    } catch (error) {
      console.error("OTP Error:", error);
      toast.error(error.response?.data?.message || "Invalid OTP code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // FINALIZE REGISTRATION (CUSTOM BACKEND)
  // ==========================================
  const finalizeRegistration = async (staffOtp) => {
    const assignedRole = role.toUpperCase();
    
    const payload = {
      fullName: name,
      email: email,
      password: password,
      role: assignedRole, 
      otp: staffOtp 
    };

    const response = await api.post('/auth/register', payload);
    
    // Save the returned JWT session token & Role to browser storage
    localStorage.setItem('aurora_token', response.data.token);
    localStorage.setItem('aurora_role', assignedRole);
    
    toast.success(`Successfully registered as ${role}!`);
    
    if (assignedRole === 'ADMIN') navigate('/admin/dashboard');
    else if (assignedRole === 'SUPERVISOR') navigate('/supervisor/dashboard');
    else navigate('/user/home');
  };

  // ==========================================
  // HANDLE GOOGLE AUTHENTICATION (HYBRID FLOW)
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

      const assignedRole = response.data.role?.toUpperCase() || 'USER';

      localStorage.setItem('aurora_token', response.data.token);
      localStorage.setItem('aurora_role', assignedRole);
      
      toast.success(`Welcome, ${response.data.fullName}!`);
      
      if (assignedRole === 'ADMIN') navigate('/admin/dashboard');
      else if (assignedRole === 'SUPERVISOR') navigate('/supervisor/dashboard');
      else navigate('/user/home');
      
    } catch (error) {
      console.error("Google Auth Error:", error);
      toast.error(error.response?.data?.message || "Google Authentication failed or was closed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Compact UI Roles Configuration
  const roles = [
    { id: 'user', title: 'User', icon: User, color: 'text-[#3B82F6]' },
    { id: 'admin', title: 'IT Admin', icon: ShieldCheck, color: 'text-[#8B5CF6]' },
    { id: 'supervisor', title: 'Supervisor', icon: Users, color: 'text-[#10B981]' }
  ];

  // Framer Motion variants
  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-4 sm:p-8 font-sans relative">
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontWeight: '500' } }} />

      <div className="w-full max-w-[1200px] bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] flex flex-col lg:flex-row overflow-hidden relative z-10 min-h-[700px]">
        
        {/* ================= LEFT PANEL (IMAGE BACKGROUND) ================= */}
        <div className="hidden lg:flex w-[40%] relative flex-col justify-between overflow-hidden p-12">
          {/* High-quality Unsplash Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1540835296345-8eea18b4eba8?q=80&w=2070&auto=format&fit=crop')` }}
          />
          {/* Sleek Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-[#0A192F]/60 to-[#0A192F]/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-[#0A4DD0]/20" />

          {/* Header */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white p-2.5 rounded-xl shadow-lg flex items-center justify-center shrink-0">
              <Building size={24} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">NIN Auditorium Booking</h2>
              <p className="text-blue-100 text-xs font-medium">Smart. Simple. Seamless.</p>
            </div>
          </div>

          {/* Main Title - Positioned at the bottom */}
          <div className="relative z-10 mt-auto">
            <h1 className="text-white text-5xl font-extrabold leading-[1.1] tracking-tight mb-4 drop-shadow-lg">
              Manage.<br />Book.<br /><span className="text-[#60A5FA]">Simplify.</span>
            </h1>
            <p className="text-blue-50 text-[15px] leading-relaxed max-w-sm font-medium drop-shadow-md">
              A unified platform to manage auditoriums, users and operations with ease.
            </p>
          </div>
        </div>

        {/* ================= RIGHT PANEL (FORM) ================= */}
        <div className="w-full lg:w-[60%] p-8 sm:p-12 flex flex-col relative bg-white overflow-hidden">
          
          <AnimatePresence mode="wait">
            
            {/* STEP 1: USER DETAILS */}
            {step === 1 && (
              <motion.div key="step1" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="flex-1 flex flex-col">
                
                <div className="text-center mb-6 mt-4">
                  <h2 className="text-[32px] font-extrabold text-gray-900 mb-2">Create an Account</h2>
                  <p className="text-gray-500 text-[15px] font-medium">Select a role to get started</p>
                </div>

                {/* Compact Role Selector (Hover to reveal text) */}
                <div className="flex justify-center gap-4 sm:gap-6 mb-8">
                  {roles.map((r) => {
                    const Icon = r.icon;
                    const isActive = role === r.id;
                    
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id)}
                        className={`relative group flex flex-col items-center justify-center w-[84px] h-[84px] sm:w-[96px] sm:h-[96px] rounded-3xl border-2 transition-all duration-300 ease-out overflow-hidden ${
                          isActive 
                            ? 'border-[#0A4DD0] bg-[#FAFAFF] shadow-[0_8px_20px_rgba(10,77,208,0.08)]' 
                            : 'border-gray-100 bg-white hover:border-gray-200'
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
                          isActive 
                            ? 'opacity-100 translate-y-0 text-[#0A4DD0]' 
                            : 'opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 text-gray-600'
                        }`}>
                          {r.title}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="max-w-md w-full mx-auto flex-1">
                  <form onSubmit={handleInitialSubmit} className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><UserCircle size={18} /></div>
                      <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-[#0A4DD0]/20 focus:border-[#0A4DD0] transition-all placeholder:font-normal" />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Mail size={18} /></div>
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-[#0A4DD0]/20 focus:border-[#0A4DD0] transition-all placeholder:font-normal" />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Lock size={18} /></div>
                      <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" className="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-[#0A4DD0]/20 focus:border-[#0A4DD0] transition-all placeholder:font-normal" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"><EyeOff size={18} /></button>
                    </div>

                    {role !== 'user' && (
                      <p className="text-[13px] text-gray-500 font-medium text-center mt-2 flex items-center justify-center gap-1.5">
                        <ShieldCheck size={14} className="text-[#0A4DD0]" />
                        Staff registration requires email verification.
                      </p>
                    )}

                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} className="w-full flex items-center justify-center text-white py-3.5 rounded-xl font-bold bg-[#0A4DD0] hover:bg-[#083CA8] shadow-[0_8px_20px_rgba(10,77,208,0.2)] active:scale-[0.98] transition-all mt-4 disabled:opacity-70">
                      {isLoading ? <Loader2 size={20} className="animate-spin" /> : (role === 'user' ? 'Create Account' : 'Send Verification Code')}
                    </motion.button>
                  </form>

                  {/* Social Logins */}
                  <div className="mt-6">
                    <div className="relative flex items-center justify-center mb-5">
                      <div className="absolute w-full border-t border-gray-200" />
                      <span className="relative bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-wide">or sign up with</span>
                    </div>
                    <button type="button" onClick={handleGoogleSignIn} disabled={isLoading} className="w-full flex items-center justify-center py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all shadow-sm disabled:opacity-70">
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                      <span className="ml-3 text-[15px] font-bold text-gray-700">Google</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: STAFF OTP VERIFICATION */}
            {step === 2 && (
              <motion.div key="step2" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 bg-[#EFF6FF] text-[#0A4DD0] rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-[#EFF6FF]/50">
                    <Mail size={32} />
                  </div>
                  <h2 className="text-[28px] font-extrabold text-gray-900 mb-2">Check Your Email</h2>
                  <p className="text-gray-500 text-[15px] font-medium max-w-[280px] mx-auto leading-relaxed">
                    We've sent a 6-digit verification code to <span className="font-bold text-gray-800">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><KeyRound size={20} /></div>
                    <input type="text" required maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="Enter 6-digit OTP" className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 text-center tracking-[0.5em] text-xl font-bold rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0A4DD0]/20 focus:border-[#0A4DD0] transition-all placeholder:tracking-normal placeholder:font-medium placeholder:text-[15px] placeholder:text-gray-400" />
                  </div>

                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading || otp.length < 6} className="w-full flex items-center justify-center text-white py-4 rounded-xl font-bold bg-[#0A4DD0] hover:bg-[#083CA8] shadow-[0_8px_20px_rgba(10,77,208,0.2)] transition-colors disabled:opacity-70">
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Verify & Create Account'}
                  </motion.button>
                  
                  <button type="button" onClick={() => setStep(1)} className="w-full text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors mt-4">
                    ← Back to Details
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Bottom Login Link */}
          {step === 1 && (
            <p className="text-center text-[15px] text-gray-500 mt-8 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-[#0A4DD0] font-bold hover:text-[#083CA8] transition-colors">
                Log in
              </Link>
            </p>
          )}

        </div>
      </div>
    </div>
  );
}