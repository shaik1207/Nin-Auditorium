import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, MapPin, Plus, Trash2, X, Building2, Sparkles, Loader2, Camera, Mail, ShieldAlert, AlertTriangle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast'; 
import api from '../../services/api';

export default function Halls() {
  const [halls, setHalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hallToDelete, setHallToDelete] = useState(null); // Tracks the ID of the hall to delete
  const [isDeleting, setIsDeleting] = useState(false); // Tracks delete API call

  // Form State
  const [newHall, setNewHall] = useState({
    name: '',
    capacity: '',
    location: '',
    status: 'Available',
    tagsString: '',
    supervisorEmail: '', 
    image: '' 
  });

  // 1. Fetch Halls
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const response = await api.get('/halls');
        const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setHalls(sorted);
      } catch (error) {
        console.error("Failed to fetch halls:", error);
        toast.error("Failed to load auditoriums.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHalls();
  }, []);

  const filteredHalls = halls.filter(hall => {
    const matchesSearch = hall.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          hall.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || hall.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // 2. Custom Delete Popup Handler
  const confirmDelete = async () => {
    if (!hallToDelete) return;
    
    setIsDeleting(true);
    const toastId = toast.loading("Deleting auditorium...");
    
    try {
      await api.delete(`/halls/${hallToDelete}`);
      setHalls(prev => prev.filter(hall => hall._id !== hallToDelete && hall.id !== hallToDelete));
      toast.success("Hall deleted successfully", { id: toastId });
      setHallToDelete(null); // Close modal
    } catch (error) {
      console.error("Failed to delete hall:", error);
      toast.error("Failed to delete hall.", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewHall(prev => ({ ...prev, [name]: value }));
  };

  // 3. Image Compression
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; 
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); 
          setNewHall(prev => ({ ...prev, image: compressedBase64 }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // 4. Add New Hall & Verify Email
  const handleAddHallSubmit = async (e) => {
    e.preventDefault();
    if (!newHall.name || !newHall.location || !newHall.capacity || !newHall.supervisorEmail) {
      return toast.error("Please fill in all required fields including Supervisor Email.");
    }

    setIsAdding(true);
    const toastId = toast.loading("Verifying email & provisioning hall...");

    try {
      const payload = {
        name: newHall.name,
        capacity: parseInt(newHall.capacity) || 0,
        location: newHall.location,
        status: newHall.status,
        supervisorEmail: newHall.supervisorEmail, 
        image: newHall.image || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop', 
        tags: newHall.tagsString ? newHall.tagsString.split(',').map(t => t.trim().toUpperCase()) : ['GENERAL']
      };

      const response = await api.post('/halls', payload);
      
      setHalls(prev => [response.data, ...prev]);
      setIsModalOpen(false);
      toast.success("Hall created successfully! Authority assigned.", { id: toastId });
      
      setNewHall({
        name: '', capacity: '', location: '', status: 'Available', tagsString: '', supervisorEmail: '', image: ''
      });
    } catch (error) {
      console.error("Failed to add hall:", error);
      toast.error(error.response?.data?.message || "Verification failed. Check supervisor email.", { id: toastId });
    } finally {
      setIsAdding(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Available': return 'bg-[#E6F4EA] text-[#0D6E42]';
      case 'Limited': return 'bg-amber-50 text-amber-700';
      case 'Maintenance': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const cardVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 25 } }, exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } } };
  const modalVariants = { hidden: { opacity: 0, scale: 0.95, y: 20 }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }, exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } } };

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-[#E8EEFF] via-[#F3E8FF] to-[#E8EDFB] p-4 sm:p-6 md:p-8 rounded-[2rem] relative overflow-hidden">
      
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontWeight: '500' } }} />

      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-300/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-400/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1400px] w-full mx-auto relative z-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-[2.5rem] font-bold text-gray-900 tracking-tight mb-2">Auditoriums</h1>
            <p className="text-gray-500 text-sm md:text-[15px] font-medium">Discover, create, and manage available event spaces.</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-[#8C7CFF] hover:bg-[#7B61FF] text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-[0.98] self-start md:self-auto"
          >
            <Plus size={18} strokeWidth={2.5} />
            Add new auditorium
          </button>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col xl:flex-row gap-4 mb-8 xl:items-center justify-between">
          <div className="relative w-full max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search halls or location..."
              className="w-full pl-11 pr-4 py-3.5 bg-white/70 backdrop-blur-xl border border-white rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8C7CFF]/30 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 md:pb-0 scroll-smooth">
            {['All', 'Available', 'Limited', 'Maintenance'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeFilter === filter 
                    ? 'bg-[#8C7CFF] text-white shadow-md' 
                    : 'bg-white/60 text-gray-600 border border-white hover:bg-white hover:text-gray-900 backdrop-blur-md shadow-sm'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* CATALOG GRID */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-70">
            <Loader2 size={48} className="animate-spin text-[#8C7CFF] mb-4" />
            <p className="text-gray-500 font-medium tracking-wide">Syncing structures...</p>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredHalls.map((hall) => {
                const hallId = hall._id || hall.id;

                return (
                <motion.div 
                  key={hallId}
                  variants={cardVariants}
                  layout
                  className="bg-white rounded-[1.5rem] overflow-hidden flex flex-col shadow-sm border border-gray-100 transition-all duration-300 relative hover:shadow-md group"
                >
                  {/* Top Image Banner */}
                  <div className="relative h-[200px] w-full overflow-hidden bg-gray-900">
                    <img src={hall.image} alt={hall.name} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" />
                    
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                      <div className={`px-4 py-1.5 rounded-full text-[12px] font-bold tracking-wide shadow-sm ${getStatusStyle(hall.status)}`}>
                        {hall.status}
                      </div>
                      
                      <button 
                        onClick={() => setHallToDelete(hallId)}
                        className="w-9 h-9 bg-white/90 hover:bg-red-50 backdrop-blur-md rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 shadow-sm transition-all active:scale-90"
                      >
                         <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-[22px] font-extrabold text-[#8C7CFF] mb-4 line-clamp-1">{hall.name}</h3>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium mb-4">
                      <div className="flex items-center gap-1.5"><Users size={16} className="text-[#8C7CFF]" /><span>{hall.capacity}</span></div>
                      <span className="text-gray-300">|</span>
                      <div className="flex items-center gap-1.5 truncate"><MapPin size={16} className="text-[#8C7CFF] shrink-0" /><span className="truncate">{hall.location}</span></div>
                    </div>

                    {/* SUPERVISOR EMAIL - Highly Visible Box */}
                    <div className="flex items-center gap-2 text-sm text-gray-700 font-bold mb-5 truncate bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                      <Mail size={16} className="text-[#8C7CFF] shrink-0" />
                      <span className="truncate">{hall.supervisorEmail || hall.supervisor?.email || 'No Authority Assigned'}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                      {hall.tags?.map((tag, index) => (
                        <span key={index} className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="w-full h-px bg-gray-100 mb-4" />
                    <p className="text-xs text-center font-bold text-gray-400 uppercase tracking-widest">Auditorium Workspace Asset</p>
                  </div>
                </motion.div>
              )})}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty Catalog Fallback */}
        {!isLoading && filteredHalls.length === 0 && (
          <div className="w-full py-20 flex flex-col items-center justify-center bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-white text-center">
            <Building2 size={48} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-1">No structures found</h3>
            <p className="text-sm text-gray-400 font-medium">Try resetting your filter parameters or write a new asset entry.</p>
          </div>
        )}
      </div>

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      <AnimatePresence>
        {hallToDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="bg-white rounded-[2rem] p-8 w-full max-w-sm text-center shadow-2xl border border-gray-100 relative overflow-hidden">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
                <AlertTriangle size={28} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Auditorium?</h3>
              <p className="text-sm font-medium text-gray-500 mb-8">This action is permanent and will remove the hall from all user views. Associated bookings may be affected.</p>
              
              <div className="flex flex-col gap-3">
                <button onClick={confirmDelete} disabled={isDeleting} className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors active:scale-95 shadow-sm shadow-red-500/20 flex items-center justify-center gap-2">
                  {isDeleting ? <Loader2 size={18} className="animate-spin" /> : "Yes, delete auditorium"}
                </button>
                <button onClick={() => setHallToDelete(null)} disabled={isDeleting} className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold transition-colors active:scale-95">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= ADD NEW AUDITORIUM MODAL ================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-6 md:p-8 w-full max-w-lg relative z-50 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-[#8C7CFF]" />
                  <h3 className="text-lg font-bold text-gray-900">Add Auditorium</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddHallSubmit} className="space-y-4 overflow-y-auto no-scrollbar pr-1 flex-1">
                
                {/* Image Upload Area */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Cover Photo</label>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                  
                  {newHall.image ? (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden group cursor-pointer border border-gray-200" onClick={() => fileInputRef.current.click()}>
                      <img src={newHall.image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-bold">CHANGE PHOTO</span>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current.click()} className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-[#8C7CFF] hover:bg-[#8C7CFF]/5 hover:border-[#8C7CFF]/50 transition-colors">
                      <Camera size={24} className="mb-2" />
                      <span className="text-sm font-semibold">Upload Hall Photo</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Hall Name</label>
                  <input required type="text" name="name" value={newHall.name} onChange={handleInputChange} placeholder="e.g. Golden Jubilee Block" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-[#8C7CFF] focus:bg-white transition-all" />
                </div>

                {/* Supervisor Email Input with Dynamic Loader overlay */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1 flex items-center justify-between w-full">
                    <span>Supervisor Authority Email <span className="text-[#8C7CFF]">*</span></span>
                  </label>
                  <div className="relative">
                    <input required type="email" name="supervisorEmail" value={newHall.supervisorEmail} onChange={handleInputChange} placeholder="supervisor@university.edu" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium outline-none focus:border-[#8C7CFF] focus:bg-white transition-all" />
                    {isAdding && <Loader2 size={16} className="absolute right-4 top-3.5 animate-spin text-[#8C7CFF]" />}
                  </div>
                  <div className="flex items-start gap-1.5 mt-1.5 ml-1">
                    <ShieldAlert size={12} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-gray-400 leading-tight">Must be an existing Supervisor. If they don't have an account, please create one in User Management first.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Capacity</label>
                    <input required type="number" name="capacity" value={newHall.capacity} onChange={handleInputChange} placeholder="e.g. 250" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-[#8C7CFF] focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Status</label>
                    <select name="status" value={newHall.status} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-[#8C7CFF] focus:bg-white transition-all">
                      <option value="Available">Available</option>
                      <option value="Limited">Limited</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Location Details</label>
                  <input required type="text" name="location" value={newHall.location} onChange={handleInputChange} placeholder="e.g. Block C, Level 3" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-[#8C7CFF] focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Feature Tags (comma separated)</label>
                  <input type="text" name="tagsString" value={newHall.tagsString} onChange={handleInputChange} placeholder="AC, STAGE, LED WALL, MIC" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-[#8C7CFF] focus:bg-white transition-all" />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 mt-6">
                  <button type="button" disabled={isAdding} onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-bold text-gray-600 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isAdding} className="flex items-center justify-center min-w-[150px] px-5 py-2.5 bg-[#8C7CFF] hover:bg-[#7B61FF] text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-70">
                    {isAdding ? <Loader2 size={16} className="animate-spin" /> : "Verify & Save"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}