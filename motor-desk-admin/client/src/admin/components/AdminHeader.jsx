import React from "react";
import {
  FiBell,
  FiSearch,
  FiSettings,
  FiChevronDown,
  FiActivity,
} from "react-icons/fi";

const AdminHeader = () => {
  return (
    <header className="h-full bg-white flex items-center justify-between px-6 md:px-10">
      {/* --- Left Side: Global Search --- */}
      <div className="hidden md:flex items-center flex-1 max-w-sm">
        <div className="relative w-full group">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#001F3F] transition-colors"
            size={14}
          />
          <input
            type="text"
            placeholder="Search system data..."
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg py-2 pl-10 pr-4 text-[11px] font-medium text-black placeholder:text-slate-400 focus:bg-white focus:border-[#001F3F] transition-all outline-none"
          />
        </div>
      </div>

      {/* --- Right Side: System Actions & Admin Identity --- */}
      <div className="flex items-center gap-2 md:gap-6 ml-auto">
        {/* Quick Utilities */}
        <div className="flex items-center gap-1 border-r border-[#CBD5E1] pr-4 md:pr-6">
          <button
            className="p-2 text-slate-500 hover:text-[#001F3F] hover:bg-[#F0F4F8] rounded-lg transition-all"
            title="System Settings"
          >
            <FiSettings size={18} />
          </button>

          <button
            className="relative p-2 text-slate-500 hover:text-[#001F3F] hover:bg-[#F0F4F8] rounded-lg transition-all"
            title="Alerts"
          >
            <FiBell size={18} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#001F3F] rounded-full border border-white"></span>
          </button>
        </div>

        {/* Profile Identity Component */}
        <button className="flex items-center gap-3 group">
          <div className="hidden sm:flex flex-col text-right">
            {/* LABEL - 11px BOLD BLACK */}
            <p className="text-[11px] font-bold text-black uppercase tracking-widest leading-none">
              Super Admin
            </p>
            <div className="flex items-center justify-end gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                System Root
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-[#001F3F] flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-900/10 group-hover:bg-[#1E3A8A] transition-all">
              SA
            </div>
          </div>

          <FiChevronDown
            className="text-slate-400 group-hover:text-black transition-colors hidden sm:block"
            size={14}
          />
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
