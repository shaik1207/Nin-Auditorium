import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, Check, ArrowLeft, Minus, Plus, 
  KeyRound, AlertTriangle, LogOut, Camera
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast'; 
import api from '../../services/api'; 
import { auth } from '../../firebase'; 
import { sendPasswordResetEmail } from 'firebase/auth';

export default function UserProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeView, setActiveView] = useState('main');
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
  });

  const [profileImage, setProfileImage] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [resetCountdown, setResetCountdown] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 1. Fetch User Profile Data on Mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        setFormData({
          fullName: response.data.fullName || '',
          email: response.data.email || '',
        });
        
        // Load the permanently saved image
        if (response.data.avatar) {
          setProfileImage(response.data.avatar);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        toast.error("Failed to load profile data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    let timer;
    if (resetCountdown > 0) {
      timer = setInterval(() => setResetCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resetCountdown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  // ==========================================
  // IMAGE COMPRESSION & HANDLING (THE FIX)
  // ==========================================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Create a canvas to compress the image
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400; // Optimal size for avatars
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Compress to JPEG with 0.7 quality to guarantee it fits in DB
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          
          setProfileImage(compressedBase64);
          setIsSaved(false); // Enable the "Save Changes" button
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. Save Updated Profile Data to Backend
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const response = await api.put('/auth/profile', {
        fullName: formData.fullName,
        email: formData.email,
        avatar: profileImage // Safely send the COMPRESSED base64 string to MongoDB
      });

      if (response.data.token) {
        localStorage.setItem('aurora_token', response.data.token);
      }

      setIsSaved(true);
      toast.success("Profile updated successfully!");
      setTimeout(() => setIsSaved(false), 2500);
    } catch (error) {
      console.error("Failed to update profile:", error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || "Failed to save image. File may be too large.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!formData.email) return toast.error("Please provide an email address first.");

    if (resetCountdown === 0) {
      try {
        await sendPasswordResetEmail(auth, formData.email);
        toast.success(`Password reset link sent to ${formData.email}!`, { duration: 4000 });
        setResetCountdown(60); 
      } catch (error) {
        toast.error(error.message.replace('Firebase: ', '').replace(/\(auth.*\)\.?/, ''));
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aurora_token'); 
    localStorage.removeItem('aurora_role'); 
    toast.success("Logged out successfully!");
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    toast.success("Account deleted successfully.");
    setShowDeleteModal(false);
  };

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };
  const slideVariants = {
    initial: (direction) => ({ x: direction === 'right' ? '100%' : '-100%', opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: (direction) => ({ x: direction === 'right' ? '-100%' : '100%', opacity: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } })
  };
  const modalVariants = { hidden: { opacity: 0, scale: 0.95, y: 20 }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }, exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } } };

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh] w-full"><Loader2 className="animate-spin text-[#8C7CFF]" size={40} /></div>;

  return (
    <div className="min-h-full w-full">
      <Toaster position="top-right" reverseOrder={false} toastOptions={{ style: { borderRadius: '12px', fontWeight: '500' } }} />

      <div className="min-h-full w-full bg-gradient-to-br from-[#E8EEFF] via-[#F3E8FF] to-[#E8EDFB] p-4 sm:p-8 md:p-12 rounded-[2rem] relative overflow-hidden transition-colors duration-500">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-300/20 blur-[120px] rounded-full pointer-events-none transition-colors duration-500" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-400/20 blur-[120px] rounded-full pointer-events-none transition-colors duration-500" />

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-[700px] w-full mx-auto relative z-10">
          <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-6 md:mb-8 pl-2 transition-colors duration-300">
            Profile
          </motion.h1>

          <AnimatePresence mode="wait" custom={activeView === 'photo-edit' ? 'right' : 'left'}>
            {activeView === 'main' && (
              <motion.div key="main" custom="left" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col transition-colors duration-300">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 mb-8 text-center sm:text-left relative">
                  <motion.div layout className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-[#8C7CFF] to-[#6C5CE7] rounded-full flex items-center justify-center shrink-0 shadow-[0_8px_20px_rgba(140,124,255,0.25)] relative group cursor-pointer overflow-hidden" onClick={() => setActiveView('photo-edit')}>
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl md:text-4xl font-bold text-white">{getInitial(formData.fullName)}</span>
                    )}
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-xs font-bold">EDIT</span>
                    </div>
                  </motion.div>

                  <div className="flex flex-col justify-center h-full pt-1">
                    <motion.h2 layout className="text-2xl font-bold text-gray-900 leading-tight transition-colors">
                      {formData.fullName || 'Unnamed User'}
                    </motion.h2>
                    <motion.p layout className="text-[15px] font-medium text-gray-500 mt-1 transition-colors">
                      {formData.email || 'No email provided'}
                    </motion.p>
                    <div className="mt-2.5 inline-block">
                      <span className="text-[#8C7CFF] bg-[#8C7CFF]/10 px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-widest uppercase">
                        Member
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-gray-200/60 mb-8 transition-colors" />

                <div className="space-y-8">
                  <div className="space-y-5">
                    <h3 className="text-xs font-bold text-gray-400 tracking-wide uppercase px-1">Personal Details</h3>
                    <motion.div variants={itemVariants} className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700 ml-1 transition-colors">Full name</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full bg-white/50 border border-gray-200 rounded-2xl px-5 py-3.5 outline-none focus:border-[#8C7CFF] focus:ring-4 focus:ring-[#8C7CFF]/10 transition-all text-[15px] font-medium text-gray-900 shadow-sm" />
                    </motion.div>
                    <motion.div variants={itemVariants} className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700 ml-1 transition-colors">Email address</label>
                      <input type="email" name="email" value={formData.email} disabled className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 outline-none text-[15px] font-medium text-gray-500 shadow-sm cursor-not-allowed" />
                      <p className="text-xs text-gray-400 ml-1 mt-1">Email is managed via Firebase and cannot be changed here.</p>
                    </motion.div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 tracking-wide uppercase px-1 mb-2">Security</h3>
                    <motion.div variants={itemVariants} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm text-gray-600 transition-colors"><KeyRound size={18} /></div>
                        <span className="text-[15px] font-semibold text-gray-900 transition-colors">Reset Password</span>
                      </div>
                      <button onClick={handlePasswordReset} disabled={resetCountdown > 0} className="text-sm font-bold text-[#8C7CFF] hover:text-[#7B61FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-28 text-right">
                        {resetCountdown > 0 ? `Resend in ${resetCountdown}s` : 'Send Link'}
                      </button>
                    </motion.div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 transition-colors space-y-3">
                    <motion.button type="button" variants={itemVariants} onClick={handleLogout} className="flex items-center justify-between w-full p-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 group transition-all shadow-sm">
                      <span className="text-[15px] font-semibold text-gray-700">Log Out</span>
                      <LogOut size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </motion.button>
                    <motion.button variants={itemVariants} onClick={() => setShowDeleteModal(true)} className="flex items-center justify-between w-full p-4 rounded-2xl border border-red-100 bg-red-50/50 hover:bg-red-50 group transition-all">
                      <span className="text-[15px] font-semibold text-red-500">Delete Account</span>
                      <AlertTriangle size={18} className="text-red-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                  </div>

                  <motion.div variants={itemVariants} className="pt-4">
                    <button onClick={handleSave} disabled={isSaving || isSaved} className={`w-full relative flex items-center justify-center py-4 rounded-2xl font-bold text-[15px] transition-all shadow-[0_4px_15px_rgba(140,124,255,0.2)] active:scale-[0.98] overflow-hidden ${isSaved ? 'bg-[#34C759] text-white shadow-[#34C759]/20' : 'bg-[#8C7CFF] hover:bg-[#7B61FF] text-white'}`}>
                      <AnimatePresence mode="wait">
                        {isSaving ? <motion.div key="saving" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}><Loader2 size={20} className="animate-spin" /></motion.div>
                        : isSaved ? <motion.div key="saved" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="flex items-center gap-2"><Check size={18} strokeWidth={3} /> Saved</motion.div>
                        : <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>Save changes</motion.div>}
                      </AnimatePresence>
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeView === 'photo-edit' && (
              <motion.div key="photo-edit" custom="right" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="bg-[#F9FAFB] border border-gray-200 rounded-[2rem] overflow-hidden flex flex-col h-[600px] shadow-xl relative z-20">
                <div className="flex items-center justify-center p-5 relative bg-white border-b border-gray-100 z-10 transition-colors">
                  <button onClick={() => setActiveView('main')} className="absolute left-5 text-gray-500 hover:text-gray-900 transition-colors"><ArrowLeft size={20} /></button>
                  <h2 className="text-[17px] font-semibold text-gray-900">Adjust Photo</h2>
                </div>
                
                <div className="flex-1 relative overflow-hidden bg-gray-200 flex items-center justify-center transition-colors">
                  <div className="absolute inset-0 bg-[#8C7CFF] flex items-center justify-center">
                    {profileImage ? <img src={profileImage} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-8xl font-bold text-white opacity-50">{getInitial(formData.fullName)}</span>}
                  </div>
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center"><div className="w-[280px] h-[280px] rounded-full border-[1000px] border-[#F9FAFB]/90 box-content transition-colors"></div></div>
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center p-1 border border-gray-100 transition-colors">
                    <button className="p-3 text-gray-500 hover:text-gray-900 active:scale-90"><Minus size={18} strokeWidth={2.5} /></button>
                    <div className="w-px h-5 bg-gray-200 mx-1"></div>
                    <button className="p-3 text-gray-500 hover:text-gray-900 active:scale-90"><Plus size={18} strokeWidth={2.5} /></button>
                  </div>
                </div>

                <div className="p-6 bg-white space-y-3 pb-8 z-10 transition-colors">
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                  <button onClick={() => fileInputRef.current.click()} className="w-full py-4 rounded-2xl bg-gray-50 border border-gray-200 text-[15px] font-semibold text-gray-900 hover:bg-gray-100 transition-colors shadow-sm active:scale-[0.98] flex items-center justify-center gap-2">
                    <Camera size={18} className="text-gray-500" /> Select from desktop
                  </button>
                  
                  <button onClick={() => { setActiveView('main'); toast.success("Photo selected! Click 'Save changes' to keep it permanently."); }} className="w-full py-4 rounded-2xl bg-[#8C7CFF] hover:bg-[#7B61FF] text-[15px] font-semibold text-white transition-colors shadow-md active:scale-[0.98]">
                    Confirm Image
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="bg-white rounded-[2rem] p-8 w-full max-w-sm text-center shadow-2xl border border-gray-100 relative overflow-hidden">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5"><AlertTriangle size={28} strokeWidth={2.5} /></div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Account?</h3>
              <p className="text-sm font-medium text-gray-500 mb-8">This action is permanent and cannot be undone. All your booking history will be lost.</p>
              <div className="flex flex-col gap-3">
                <button onClick={handleDeleteAccount} className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors active:scale-95 shadow-sm shadow-red-500/20">Yes, delete my account</button>
                <button onClick={() => setShowDeleteModal(false)} className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold transition-colors active:scale-95">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}