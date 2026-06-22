"use client";

import React, { useState } from "react";
import LandlordSidebar from "./LandlordSidebar";
import LandlordTopbar from "../dashboard/DashboardTopbar";

interface LandlordLayoutProps {
  children: React.ReactNode;
}

export default function LandlordLayout({ children }: LandlordLayoutProps) {
  // State to handle mobile sidebar toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar (Desktop always visible, Mobile is an overlay) */}
      <LandlordSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <LandlordTopbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Overlay Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
