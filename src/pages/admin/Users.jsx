import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Users as UsersIcon, Download, UserPlus, 
  Ban, CheckCircle2, ShieldCheck, Loader2, 
  X, AlertTriangle, ShieldAlert
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../../services/api'; 

export default function Users() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal & Action States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Block Modal State
  const [blockModal, setBlockModal] = useState({
    isOpen: false,
    user: null,
    reason: ''
  });

  const [newUser, setNewUser] = useState({
    fullName: '', email: '', password: '', role: 'USER'
  });

  // Fetch Users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/users'); 
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to connect to backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || 
                          (statusFilter === 'Active' && !user.isBlocked) || 
                          (statusFilter === 'Blocked' && user.isBlocked);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalUsers = filteredUsers.length;
  const activeUsers = filteredUsers.filter(u => !u.isBlocked).length;
  const blockedUsers = filteredUsers.filter(u => u.isBlocked).length;

  // Export to Excel
  const exportToExcel = () => {
    if (filteredUsers.length === 0) return toast.error("No data to export.");
    const headers = ['User ID', 'Full Name', 'Email', 'Role', 'Status', 'Join Date'];
    const csvRows = filteredUsers.map(u => [
      u._id, `"${u.fullName}"`, u.email, u.role, u.isBlocked ? 'Blocked' : 'Active', new Date(u.createdAt).toLocaleDateString()
    ]);
    const csvContent = [headers.join(','), ...csvRows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Export downloaded successfully!");
  };

  // ==========================================
  // ACTION: INITIATE BLOCK / UNBLOCK
  // ==========================================
  const handleToggleClick = (user) => {
    if (user.isBlocked) {
      // If currently blocked, just unblock directly
      executeBlockToggle(user._id, false, '');
    } else {
      // If active, open the reason modal
      setBlockModal({ isOpen: true, user: user, reason: '' });
    }
  };

  // ==========================================
  // ACTION: EXECUTE BLOCK / UNBLOCK API
  // ==========================================
  const executeBlockToggle = async (userId, newStatus, reason) => {
    setActionLoadingId(userId);
    try {
      await api.put(`/admin/users/${userId}/block`, { 
        isBlocked: newStatus,
        reason: reason 
      });
      
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBlocked: newStatus } : u));
      toast.success(newStatus ? "User blocked & notified via email." : "User access restored.");
      setBlockModal({ isOpen: false, user: null, reason: '' });
    } catch (error) {
      console.error("Block action failed:", error);
      toast.error(error.response?.data?.message || "Action failed.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const submitBlockForm = (e) => {
    e.preventDefault();
    if (!blockModal.reason.trim()) return toast.error("Please provide a reason.");
    executeBlockToggle(blockModal.user._id, true, blockModal.reason);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.post('/admin/users/create', newUser);
      setUsers([response.data, ...users]); 
      setIsAddModalOpen(false);
      setNewUser({ fullName: '', email: '', password: '', role: 'USER' });
      toast.success("New user provisioned successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'SUPERVISOR': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-10">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight mb-1">User Management</h1>
          <p className="text-gray-500 text-sm font-medium">Analyze, provision, and control access across your platform.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-bold shadow-sm">
            <Download size={16} /> Export Data
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#8B5CF6] text-white rounded-xl hover:bg-[#7C3AED] text-sm font-bold shadow-md">
            <UserPlus size={18} /> Provision User
          </button>
        </div>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex justify-between">
          <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Directory</p><h3 className="text-2xl font-extrabold">{totalUsers}</h3></div>
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center"><UsersIcon size={24} /></div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex justify-between">
          <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Access</p><h3 className="text-2xl font-extrabold">{activeUsers}</h3></div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center"><CheckCircle2 size={24} /></div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex justify-between">
          <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Restricted</p><h3 className="text-2xl font-extrabold">{blockedUsers}</h3></div>
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center"><Ban size={24} /></div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#8B5CF6] outline-none" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
          <option value="All">All Roles</option>
          <option value="USER">Standard User</option>
          <option value="SUPERVISOR">Supervisor</option>
          <option value="ADMIN">IT Admin</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Blocked">Blocked</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">User Details</th>
              <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Role</th>
              <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="relative">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center"><Loader2 className="animate-spin text-[#8B5CF6] mx-auto" /></td></tr>
              ) : filteredUsers.map((user) => (
                <motion.tr key={user._id} variants={itemVariants} initial="hidden" animate="show" exit="hidden" className="border-b border-gray-50 hover:bg-gray-50/30">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center font-bold">{user.fullName?.charAt(0)}</div>
                    <div><div className="font-bold text-sm">{user.fullName}</div><div className="text-gray-500 text-xs">{user.email}</div></div>
                  </td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${getRoleBadge(user.role)}`}>{user.role}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${user.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`} />
                      <span className={`text-xs font-bold ${user.isBlocked ? 'text-red-600' : 'text-emerald-600'}`}>{user.isBlocked ? 'Restricted' : 'Active'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleToggleClick(user)}
                      disabled={actionLoadingId === user._id}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${user.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                    >
                      {actionLoadingId === user._id ? <Loader2 size={14} className="animate-spin" /> : (user.isBlocked ? <CheckCircle2 size={14} /> : <Ban size={14} />)}
                      {user.isBlocked ? 'Restore Access' : 'Block User'}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* ==================== BLOCK REASON MODAL ==================== */}
      <AnimatePresence>
        {blockModal.isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-red-50/50">
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center"><ShieldAlert size={20} /></div>
                <h3 className="text-xl font-bold text-gray-900">Restrict Access</h3>
              </div>
              <form onSubmit={submitBlockForm} className="p-6 space-y-4">
                <p className="text-sm font-medium text-gray-600">You are about to block <strong>{blockModal.user?.fullName}</strong>. They will instantly lose access and receive an email notification.</p>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Reason for blocking (Sent to user)</label>
                  <textarea required value={blockModal.reason} onChange={(e) => setBlockModal({...blockModal, reason: e.target.value})} rows="3" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-red-400" placeholder="e.g. Violation of terms of service..." />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setBlockModal({isOpen: false, user: null, reason: ''})} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold">Cancel</button>
                  <button type="submit" disabled={actionLoadingId === blockModal.user?._id} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 flex justify-center items-center">
                    {actionLoadingId === blockModal.user?._id ? <Loader2 className="animate-spin" size={18} /> : 'Confirm & Block'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== ADD USER MODAL ==================== */}
      {/* ... (Keeping your existing Add User Modal exactly the same) ... */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden relative">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-xl flex items-center justify-center"><UserPlus size={20} /></div>
                  <h3 className="text-xl font-bold text-gray-900">Provision New User</h3>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white p-2 rounded-full shadow-sm"><X size={18} /></button>
              </div>

              <form onSubmit={handleAddUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                  <input required type="text" value={newUser.fullName} onChange={(e) => setNewUser({...newUser, fullName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#8B5CF6]" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <input required type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#8B5CF6]" placeholder="john@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role Assignment</label>
                  <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-[#8B5CF6]">
                    <option value="USER">Standard User</option>
                    <option value="SUPERVISOR">Supervisor</option>
                    <option value="ADMIN">IT Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Initial Password</label>
                  <input required type="password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#8B5CF6]" placeholder="••••••••" />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-[#8B5CF6] text-white rounded-xl font-bold hover:bg-[#7C3AED] transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-70">
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}