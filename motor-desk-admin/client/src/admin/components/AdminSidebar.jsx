import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiUsers,
  FiBriefcase,
  FiShare2,
  FiDollarSign,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiActivity,
  FiHeadphones,
  FiClipboard,
  FiShield,
  FiUserCheck,
} from "react-icons/fi";
import { IoDocumentAttachOutline } from "react-icons/io5";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: <FiGrid /> },
    { to: "/admin/users", label: "Users", icon: <FiUsers /> },
    { to: "/admin/partners", label: "Partners", icon: <FiBriefcase /> },
    { to: "/admin/referrals", label: "Referrals", icon: <FiShare2 /> },
    { to: "/admin/payouts", label: "Payouts", icon: <FiDollarSign /> },
    {
      to: "/admin/kyc",
      label: "KYC Documents",
      icon: <IoDocumentAttachOutline />,
    },
    { label: "Seller Management", to: "/admin/sellers", icon: <FiUserCheck /> },
    { label: "Vehicle Verification", to: "/admin/vehicle-verification", icon: <FiShield /> },
    { label: "Field Inspectors", to: "/admin/inspectors", icon: <FiUserCheck /> },
    { label: "All Inspections", to: "/admin/inspections", icon: <FiClipboard /> },
    { to: "/admin/support", label: "Support", icon: <FiHeadphones /> },
    // { to: "/admin/settings", label: "Settings", icon: <FiSettings /> },
  ];

  const handleLogout = () => {
    if (window.confirm("Terminate administrative session?")) {
      localStorage.removeItem("adminToken");
      navigate("/admin/login", { replace: true });
    }
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
        className="absolute -right-3 top-8 bg-white text-[#001F3F] rounded-full p-1 border border-[#CBD5E1] hover:bg-[#F0F4F8] transition-all z-50 hidden md:block shadow-md"
      >
        {isCollapsed ? (
          <FiChevronRight size={14} />
        ) : (
          <FiChevronLeft size={14} />
        )}
      </button>

      {/* --- Brand Identity --- */}
      <div
        className={`h-16 flex items-center ${isCollapsed ? "justify-center" : "px-6"} border-b border-white/5`}
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-500 rounded-lg text-white shadow-lg shadow-blue-500/20">
            <FiActivity size={18} className="shrink-0" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg tracking-tight text-white whitespace-nowrap">
              Admin<span className="text-blue-400">Panel</span>
            </span>
          )}
        </div>
      </div>

      {/* --- Navigation Workspace --- */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group relative
              ${isActive
                ? "bg-white text-black font-bold shadow-lg"
                : "text-blue-100/60 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <span className="text-lg shrink-0">{item.icon}</span>
            {!isCollapsed && (
              <span className="text-[11px] font-bold uppercase tracking-widest whitespace-nowrap">
                {item.label}
              </span>
            )}

            {isCollapsed && (
              <div className="absolute left-full ml-4 bg-black text-white text-[11px] font-bold px-3 py-2 rounded shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap uppercase tracking-widest">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* --- Admin Footer --- */}
      <div className="p-4 bg-black/20 border-t border-white/5">
        <div
          className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : "px-2"}`}
        >
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-inner">
            SA
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-[11px] font-bold text-white uppercase tracking-wider truncate">
                Super Admin
              </span>
              <span className="text-[10px] text-blue-300 font-bold uppercase tracking-tighter opacity-50">
                Root Access
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={`mt-4 w-full flex items-center gap-4 rounded-lg text-blue-200/40 hover:bg-red-500 hover:text-white transition-all p-2.5 ${isCollapsed ? "justify-center" : "px-2"}`}
        >
          <FiLogOut size={16} className="shrink-0" />
          {!isCollapsed && (
            <span className="text-[11px] font-bold uppercase tracking-widest">
              Terminate
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
