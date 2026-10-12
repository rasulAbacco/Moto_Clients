import React, { useState } from "react";
import axios from "axios";
import {
  FiSearch,
  FiArrowRight,
  FiActivity,
  FiBriefcase,
} from "react-icons/fi";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_BASE_URL;

const SearchPanel = ({ onSelectUser }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const searchUsers = async () => {
    if (!query.trim()) return;

    try {
      setSearching(true);
      const res = await axios.get(
        `${API}/api/admin/support/search?q=${query}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        },
      );

      setResults(res.data.data || []);
      if (res.data.data.length === 0) toast.error("No matching nodes found");
    } catch (error) {
      toast.error("System query failed");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* --- Search Input Field --- */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 group">
          <FiSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#001F3F] transition-colors"
            size={14}
          />
          <input
            className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[11px] font-medium text-black outline-none focus:bg-white focus:border-[#001F3F] transition-all"
            placeholder="QUERY BY EMAIL / PHONE / COMPANY IDENTITY"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchUsers()}
          />
        </div>

        <button
          onClick={searchUsers}
          disabled={searching}
          className="bg-[#001F3F] text-white px-8 py-3 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#1E3A8A] transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {searching ? (
            <FiActivity className="animate-pulse" />
          ) : (
            "Execute Query"
          )}
        </button>
      </div>

      {/* --- Result Ledger --- */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {results.map((user) => (
            <div
              key={user.id}
              onClick={() => onSelectUser(user)}
              className="group p-5 bg-white border border-[#CBD5E1] rounded-2xl cursor-pointer hover:border-[#001F3F] hover:shadow-xl transition-all relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-[#F8FAFC] text-[#001F3F] rounded-lg group-hover:bg-[#001F3F] group-hover:text-white transition-all">
                  <FiBriefcase size={16} />
                </div>
                <FiArrowRight className="text-slate-300 group-hover:text-[#001F3F] transform group-hover:translate-x-1 transition-all" />
              </div>

              <h4 className="text-[11px] font-bold text-black uppercase tracking-widest mb-1 truncate">
                {user.companyName || "Personal Account"}
              </h4>
              <p className="text-[10px] text-slate-500 font-medium truncate mb-3">
                {user.email}
              </p>

              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Verified Node
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPanel;
