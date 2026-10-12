import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import PartnerSidebar from "../components/PartnerSidebar";
import { FiBell, FiMenu, FiSearch, FiActivity } from "react-icons/fi";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const PartnerLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [partner, setPartner] = useState(null);

  // --- Sync Partner Identity ---
  useEffect(() => {
    const fetchIdentity = async () => {
      try {
        const token = localStorage.getItem("partnerToken");
        if (!token) return;

        const res = await axios.get(`${API_URL}/api/partner/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPartner(res.data);
      } catch (err) {
        console.error("Identity sync failed at layout level");
      }
    };
    fetchIdentity();
  }, []);

  return (
    <div className="flex h-screen bg-[#F0F4F8] overflow-hidden font-sans selection:bg-[#001F3F] selection:text-white">
      {/* --- Sidebar Container --- */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        border-r border-[#CBD5E1] bg-[#001F3F]
      `}
      >
        <PartnerSidebar />
      </div>

      {/* --- Mobile Overlay --- */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[#001F3F]/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- Main Workspace Area --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* --- Unified Navy Header --- */}
        <header className="h-16 bg-white border-b border-[#CBD5E1] px-6 md:px-10 flex items-center justify-between z-30">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-[#001F3F] hover:bg-[#F0F4F8] rounded-lg md:hidden transition-all"
            >
              <FiMenu size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex p-1.5 bg-[#001F3F] rounded-lg text-white">
                <FiActivity size={16} />
              </div>
              <h2 className="text-[11px] font-bold text-black uppercase tracking-[0.2em] hidden sm:block">
                Motor<span className="text-[#1E3A8A]">Desk</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {/* Search Workspace - Normal Text Input */}
            <div className="hidden lg:flex items-center relative group">
              <FiSearch
                className="absolute left-3 text-slate-400 group-focus-within:text-[#1E3A8A] transition-colors"
                size={14}
              />
              <input
                type="text"
                placeholder="Search workspace..."
                className="pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[11px] font-medium text-black placeholder:text-slate-400 focus:ring-2 focus:ring-[#1E3A8A]/5 focus:border-[#1E3A8A] transition-all outline-none w-48 focus:w-64"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2.5 text-[#001F3F] hover:bg-[#F0F4F8] rounded-full transition-all">
              <FiBell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Profile Brief */}
            <div className="flex items-center gap-4 pl-6 border-l border-[#CBD5E1]">
              <div className="text-right hidden md:block">
                <p className="text-[11px] font-bold text-black uppercase tracking-wider leading-none">
                  {partner ? partner.name : "SYNCING..."}
                </p>
                <div className="flex items-center justify-end gap-1.5 mt-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${partner ? "bg-green-500" : "bg-amber-500 animate-pulse"}`}
                  ></span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                    {partner ? "Verified User" : "Authenticating"}
                  </span>
                </div>
              </div>

              <div className="w-9 h-9 rounded-lg bg-[#001F3F] text-white flex items-center justify-center font-bold text-xs shadow-md border border-[#1E3A8A] hover:bg-[#1E3A8A] transition-all cursor-pointer">
                {partner ? partner.name.charAt(0).toUpperCase() : "?"}
              </div>
            </div>
          </div>
        </header>

        {/* --- Workspace Content --- */}
        <main className="flex-1 overflow-y-auto bg-[#F0F4F8] p-6 md:p-8">
          <div className="max-w-[1600px] mx-auto">
            {/* 11px Breadcrumb/Helper Text Example */}
            <div className="mb-6">
              <p className="text-[11px] font-bold text-black uppercase tracking-[0.2em] opacity-60">
                Workspace /{" "}
                <span className="text-[#001F3F]">Current Session</span>
              </p>
            </div>

            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PartnerLayout;
