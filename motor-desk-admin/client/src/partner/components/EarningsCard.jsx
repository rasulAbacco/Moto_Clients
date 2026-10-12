import React from "react";

const EarningsCard = ({ title, amount = 0, icon }) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-[#CBD5E1] flex items-center gap-4 shadow-sm hover:border-[#001F3F] transition-all group">
      {/* Icon Container - Navy Theme */}
      <div className="p-2.5 bg-[#F0F4F8] text-[#001F3F] rounded-lg shrink-0 group-hover:bg-[#001F3F] group-hover:text-white transition-colors">
        {React.cloneElement(icon, { size: 18 })}
      </div>

      <div className="min-w-0">
        {/* Label - 11px Bold Black */}
        <p className="text-[11px] font-bold text-black uppercase tracking-widest truncate">
          {title}
        </p>

        {/* Amount - Normalized Header */}
        <h2 className="text-lg font-bold text-[#001F3F] truncate tracking-tight">
          ₹{amount?.toLocaleString("en-IN")}
        </h2>
      </div>
    </div>
  );
};

export default EarningsCard;
