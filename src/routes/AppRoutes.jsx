import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

// ========== PUBLIC IMPORTS ==========
import SplashScreen from "../components/SplashScreen"; // Updated from Home

// ========== AUTH IMPORTS ==========
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

// ========== USER IMPORTS ==========
import UserHome from "../pages/user/UserHome";
import BookHall from "../pages/user/BookHall";
import MyBookings from "../pages/user/MyBookings";
import UserProfile from "../pages/user/UserProfile";
import UserSidebar from '../components/sidebar/UserSidebar.jsx';

// ========== ADMIN IMPORTS ==========
import Dashboard from "../pages/admin/Dashboard";
import Approvals from "../pages/admin/Approvals";
import Calendar from "../pages/admin/Calendar";
import Halls from "../pages/admin/Halls";
import Analytics from "../pages/admin/Analytics";
import AdminProfile from "../pages/admin/AdminProfile";
import Users from "../pages/admin/Users"; 

// ========== SUPERVISOR IMPORTS ==========
import SupervisorDashboard from "../pages/supervisor/SupervisorDashboard";
import SupervisorApprovals from "../pages/supervisor/SupervisorApprovals";
import SupervisorProfile from "../pages/supervisor/SupervisorProfile";
import SupervisorSidebar from "../components/sidebar/SupervisorSidebar.jsx"; 

// ========== LAYOUTS & GLOBALS ==========
import AuthLayout from "../layouts/AuthLayout";
import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";
import SupervisorLayout from "../layouts/SupervisorLayout"; 
import CookieConsent from "../components/CookieConsent.jsx";

// =========================================================
// 🛡️ STRICT PROTECTED ROUTE WRAPPER (PREVENTS 401 CRASHES)
// =========================================================
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('aurora_token');
  const role = localStorage.getItem('aurora_role')?.toUpperCase();
  const location = useLocation();

  // 1. If no token, instantly kick to login and remember where they tried to go
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If they are logged in but trying to access the wrong role's dashboard
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'SUPERVISOR') return <Navigate to="/supervisor/dashboard" replace />;
    return <Navigate to="/user/home" replace />;
  }

  // 3. Authorized! Render the requested layout.
  return children;
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <CookieConsent /> 

      <Routes>
        {/* PUBLIC SPLASH SCREEN */}
        <Route path="/" element={<SplashScreen />} />

        {/* ==================== AUTH LAYOUT ==================== */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* ==================== USER LAYOUT ==================== */}
        <Route path="/user" element={
          <ProtectedRoute allowedRoles={['USER']}>
            <UserLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="home" replace />} /> 
          <Route path="home" element={<UserHome />} />
          <Route path="UserSidebar" element={<UserSidebar/>} />
          <Route path="book" element={<BookHall />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>

        {/* ==================== SUPERVISOR LAYOUT ==================== */}
        <Route path="/supervisor" element={
          <ProtectedRoute allowedRoles={['SUPERVISOR', 'ADMIN']}>
            <SupervisorLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SupervisorDashboard />} />
          <Route path="approvals" element={<SupervisorApprovals />} />
          <Route path="profile" element={<SupervisorProfile />} />
          <Route path="SupervisorSidebar" element={<SupervisorSidebar />} /> 
        </Route>

        {/* ==================== ADMIN LAYOUT ==================== */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="halls" element={<Halls />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="users" element={<Users />} />
          <Route path="profile" element={<AdminProfile />} /> 
        </Route>

        {/* Catch-all 404 - Redirects back to Splash Screen instead of Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}