import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiDollarSign,
  FiUser,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiActivity,
  FiFileText,
} from "react-icons/fi";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const PartnerSidebar = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [partner, setPartner] = useState(null);

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const token = localStorage.getItem("partnerToken");
        if (!token) return;
        const res = await axios.get(`${API_URL}/api/partner/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPartner(res.data);
      } catch (err) {
        console.error("Sidebar data fetch failed", err);
      }
    };
    fetchSidebarData();
  }, []);

  const menuItems = [
    { to: "/partner/dashboard", label: "Overview", icon: <FiHome /> },
    { to: "/partner/referrals", label: "Referrals", icon: <FiUsers /> },
    { to: "/partner/earnings", label: "Revenue", icon: <FiDollarSign /> },
    {
      to: "/partner/verification",
      label: "KYC Documents",
      icon: <FiFileText />,
    },
    { to: "/partner/profile", label: "Settings", icon: <FiUser /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("partnerToken");
    localStorage.removeItem("partnerData");
    navigate("/partner/login", { replace: true });
  };

  return (
    <aside
      className={`relative h-screen bg-[#001F3F] flex flex-col transition-all duration-300 ease-in-out z-50 border-r border-[#1E3A8A]/30
        ${isCollapsed ? "w-20" : "w-64"}
      `}
    >
      {/* --- Collapse Toggle --- */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 bg-white text-[#001F3F] rounded-full p-1 border border-[#CBD5E1] hover:bg-[#F0F4F8] transition-all z-50 hidden md:block shadow-md"
      >
        {isCollapsed ? (
          <FiChevronRight size={14} />
        ) : (
          <FiChevronLeft size={14} />
        )}
      </button>

      {/* --- Brand Identity --- */}
      <div
        className={`h-20 flex items-center ${isCollapsed ? "justify-center" : "px-6"} mb-4`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg text-white shadow-lg shadow-blue-500/20">
            <FiActivity size={18} className="shrink-0" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-white">
                MotorDesk
              </span>
              <span className="text-[11px] font-bold text-blue-300/60 uppercase tracking-widest">
                Referral Portal
              </span>
            </div>
          )}
        </div>
      </div>

      {/* --- Navigation Workspace --- */}
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group relative
              ${
                isActive
                  ? "bg-white text-black font-bold shadow-lg shadow-black/10"
                  : "text-blue-100/70 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <span className="text-lg shrink-0 transition-transform group-hover:scale-110">
              {item.icon}
            </span>
            {!isCollapsed && (
              <span className="text-[11px] font-bold uppercase tracking-widest whitespace-nowrap">
                {item.label}
              </span>
            )}

            {/* Tooltip for Collapsed State */}
            {isCollapsed && (
              <div className="absolute left-full ml-4 bg-[#001F3F] text-white text-[11px] font-bold px-3 py-2 rounded shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 whitespace-nowrap uppercase tracking-widest border border-white/10">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* --- User Control Panel --- */}
      <div className="p-4 bg-black/20 border-t border-white/10 mt-auto">
        <div
          className={`flex items-center gap-3 mb-6 ${isCollapsed ? "justify-center" : "px-2"}`}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-inner">
            {partner ? partner.name.charAt(0).toUpperCase() : "?"}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-[11px] font-bold text-white uppercase tracking-wider truncate">
                {partner ? partner.name : "Loading..."}
              </span>
              <span className="text-[10px] text-blue-300 font-bold uppercase tracking-tighter opacity-70">
                {partner?.totalReferrals >= 10
                  ? "Gold Status"
                  : "Referral User"}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-4 rounded-lg text-blue-200/50 hover:bg-red-500 hover:text-white transition-all p-3 ${isCollapsed ? "justify-center" : "px-2"}`}
          title="Sign Out"
        >
          <FiLogOut size={16} className="shrink-0" />
          {!isCollapsed && (
            <span className="text-[11px] font-bold uppercase tracking-widest">
              End Session
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default PartnerSidebar;
