import React, { useState } from "react";
import { FiSearch, FiUser, FiActivity, FiShield, FiCpu } from "react-icons/fi";
import SearchPanel from "../components/support/SearchPanel";
import CustomerWorkspace from "../components/support/CustomerWorkspace";

const SupportPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      {/* --- Terminal Header --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#CBD5E1] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FiActivity className="text-[#001F3F] animate-pulse" size={14} />
            <span className="text-black font-bold text-[11px] tracking-[0.2em] uppercase">
              Operational Interface
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#001F3F] tracking-tight">
            Customer Support Console
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#F8FAFC] px-4 py-2 rounded-lg border border-[#CBD5E1] flex items-center gap-2">
            <FiShield className="text-green-600" size={14} />
            <span className="text-[11px] font-bold text-black uppercase tracking-widest">
              Secure Session
            </span>
          </div>
        </div>
      </div>

      {/* --- Query & Retrieval Section --- */}
      <section className="bg-white rounded-2xl border border-[#CBD5E1] shadow-sm overflow-hidden group hover:border-[#001F3F] transition-all">
        <div className="px-6 py-3 bg-[#F8FAFC] border-b border-[#CBD5E1] flex items-center gap-2">
          <FiSearch className="text-slate-400" size={14} />
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            User Node Discovery
          </span>
        </div>
        <div className="p-8">
          <SearchPanel onSelectUser={setSelectedUser} />
        </div>
      </section>

      {/* --- Active Workspace --- */}
      {selectedUser ? (
        <section className="bg-white rounded-2xl border border-[#001F3F] shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="px-6 py-4 bg-[#001F3F] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <FiUser size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-300 uppercase tracking-[0.2em]">
                  Active Management Node
                </span>
                <h3 className="text-[13px] font-bold uppercase tracking-widest leading-none mt-1">
                  {selectedUser.name || "Identified User"}
                </h3>
              </div>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-white/20 rounded-md hover:bg-white/10 transition-all"
            >
              Close Workspace
            </button>
          </div>
          <div className="p-8">
            <CustomerWorkspace userId={selectedUser.id} />
          </div>
        </section>
      ) : (
        /* Empty State */
        <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl opacity-50">
          <FiCpu size={48} className="text-slate-300 mb-4" />
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">
            Awaiting Command: Select a User Node to begin
          </p>
        </div>
      )}
    </div>
  );
};

export default SupportPage;
