import React from 'react';
import { Outlet } from "react-router-dom";

import AdminSidebar from "../components/sidebar/AdminSidebar";
import AdminNavbar from "../components/navbar/AdminNavbar";

export default function AdminLayout() {
  return (
    // 1. Locks the entire app to exactly the height of the screen and hides window scrolling.
    <div className="flex w-full h-screen overflow-hidden bg-[#F9FAFB]">

      {/* ================= STICKY SIDEBAR ================= */}
      {/* 2. shrink-0 ensures the sidebar never gets squished. 
          Flexbox automatically handles its width changes (280px -> 88px). */}
      <div className="shrink-0 h-screen z-30">
        <AdminSidebar />
      </div>

      {/* ================= MAIN SCROLLING AREA ================= */}
      {/* 3. flex-1 dynamically takes up exactly whatever space is left.
          overflow-y-auto & no-scrollbar apply our custom clean scrolling. */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto scroll-smooth no-scrollbar relative w-full">
        
        {/* Navbar */}
        {/* Note: If you want the Navbar to stay pinned to the top while scrolling, 
            change this class to: "shrink-0 sticky top-0 z-20 bg-[#F9FAFB]" */}
        <div className="shrink-0">
          <AdminNavbar />
        </div>

        {/* Dashboard / Outlet Content */}
        <div className="p-4 sm:p-6 md:p-8 w-full min-h-full">
          <Outlet />
        </div>

      </div>

    </div>
  );
}