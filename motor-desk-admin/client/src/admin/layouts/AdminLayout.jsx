import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-[#F0F4F8] font-sans text-black antialiased selection:bg-[#001F3F] selection:text-white">
      {/* --- Global Admin Sidebar --- */}
      <aside className="h-screen bg-[#001F3F] border-r border-[#1E3A8A]/30">
        <AdminSidebar />
      </aside>

      {/* --- Workspace Content Area --- */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        {/* --- Global Admin Header --- */}
        <header className="h-16 bg-white border-b border-[#CBD5E1] z-30">
          <AdminHeader />
        </header>

        {/* --- Dynamic Page Content --- */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
          <div className="max-w-[1600px] mx-auto">
            {/* Breadcrumb / Session Label Helper */}
            <div className="mb-6">
              <p className="text-[11px] font-bold text-black uppercase tracking-[0.2em] opacity-40">
                Root System <span className="mx-2 text-slate-300">/</span> Admin
                Control
              </p>
            </div>

            {/* Injected Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
