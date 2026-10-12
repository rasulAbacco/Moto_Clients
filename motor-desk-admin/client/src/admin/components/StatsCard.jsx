import React from "react";

const StatsCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-[#CBD5E1] flex items-center justify-between shadow-sm hover:border-[#001F3F] transition-all group h-[100px]">
      {/* Left Section */}
      <div className="min-w-0">
        {/* LABEL - 11px BOLD BLACK */}
        <p className="text-[11px] font-bold text-black uppercase tracking-widest truncate">
          {title}
        </p>
        {/* VALUE - NORMALIZED DASHBOARD SIZE */}
        <h3 className="text-2xl font-bold text-[#001F3F] mt-1 tracking-tight truncate">
          {value}
        </h3>
      </div>

      {/* Icon - Standardized Navy Container */}
      <div className="w-11 h-11 flex items-center justify-center rounded-lg bg-[#F8FAFC] text-[#001F3F] group-hover:bg-[#001F3F] group-hover:text-white transition-all shadow-sm">
        {React.cloneElement(icon, { size: 20 })}
      </div>
    </div>
  );
};

export default StatsCard;
