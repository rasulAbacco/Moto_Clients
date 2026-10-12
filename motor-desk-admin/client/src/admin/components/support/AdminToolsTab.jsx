import React, { useState } from "react";
import axios from "axios";
import {
  FiRefreshCw,
  FiLock,
  FiUserCheck,
  FiClock,
  FiKey,
  FiActivity,
  FiShield,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const API = import.meta.env.VITE_API_BASE_URL;

const AdminToolsTab = ({ userId }) => {
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(30);

  const adminHeader = {
    headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
  };

  const handleAction = async (url, body = {}) => {
    try {
      setLoading(true);
      await axios.post(`${API}${url}`, body, adminHeader);
      toast.success("Protocol Execution Successful");
    } catch (err) {
      toast.error("Protocol Execution Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <Toaster position="top-right" />

      {/* --- Section Header --- */}
      <div className="flex items-center gap-2 mb-8 border-b border-slate-100 pb-4">
        <FiShield className="text-[#001F3F]" size={14} />
        <span className="text-black font-bold text-[11px] tracking-[0.2em] uppercase">
          Administrative Override Controls
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Snapshot Refresh Node */}
        <ToolCard
          title="Refresh Analytics Snapshot"
          description="Force real-time recalculation of user node metrics."
          icon={<FiRefreshCw />}
          buttonText="Execute Refresh"
          onClick={() =>
            handleAction(`/api/admin/support/customer/${userId}/refresh`)
          }
          loading={loading}
        />

        {/* Plan Extension Node */}
        <ToolCard
          title="Protocol Validity Extension"
          description="Manually adjust subscription lifecycle parameters."
          icon={<FiClock />}
        >
          <div className="flex items-center gap-3 mt-5 pt-5 border-t border-slate-50">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
                Days to Extend
              </label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-24 px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[11px] font-bold text-[#001F3F] outline-none focus:border-[#001F3F]"
              />
            </div>

            <button
              onClick={() =>
                handleAction(
                  `/api/admin/support/customer/${userId}/extend-plan`,
                  { days },
                )
              }
              className="mt-4 bg-[#001F3F] text-white px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-md active:scale-95"
            >
              Update Lifecycle
            </button>
          </div>
        </ToolCard>

        {/* Account Status Node */}
        <ToolCard
          title="Node Access Management"
          description="Toggle global account authorization status (Suspend/Activate)."
          icon={<FiLock />}
          buttonText="Toggle Status"
          onClick={() =>
            handleAction(`/api/admin/support/customer/${userId}/toggle-status`)
          }
          loading={loading}
        />

        {/* Password Reset Node */}
        <ToolCard
          title="Credential Reset Protocol"
          description="Generate a new temporary access token for the identity."
          icon={<FiKey />}
          buttonText="Reset Credentials"
          onClick={() =>
            handleAction(`/api/admin/support/customer/${userId}/reset-password`)
          }
          loading={loading}
        />

        {/* Impersonation Node */}
        <ToolCard
          title="Secure Node Impersonation"
          description="Access the user interface as this identity for system verification."
          icon={<FiUserCheck />}
          buttonText="Initialize Impersonation"
          onClick={async () => {
            try {
              setLoading(true);
              const res = await axios.post(
                `${API}/api/admin/support/customer/${userId}/impersonate`,
                {},
                adminHeader,
              );

              const token = res.data.token;
              window.open(
                `${import.meta.env.VITE_USER_PANEL_URL}?token=${token}`,
                "_blank",
              );
              toast.success("Impersonation Session Started");
            } catch (err) {
              toast.error("Impersonation Request Denied");
            } finally {
              setLoading(false);
            }
          }}
          loading={loading}
        />
      </div>
    </div>
  );
};

/* --- Administrative Control Card --- */
const ToolCard = ({
  title,
  description,
  icon,
  buttonText,
  onClick,
  loading,
  children,
}) => {
  return (
    <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 shadow-sm hover:border-[#001F3F] transition-all group">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex gap-5">
          <div className="w-12 h-12 flex items-center justify-center bg-[#F8FAFC] text-[#001F3F] rounded-xl border border-[#E2E8F0] group-hover:bg-[#001F3F] group-hover:text-white transition-all shadow-sm">
            {React.cloneElement(icon, { size: 20 })}
          </div>

          <div>
            <h3 className="text-[11px] font-bold text-black uppercase tracking-[0.1em]">
              {title}
            </h3>
            <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-tight">
              {description}
            </p>
          </div>
        </div>

        {buttonText && (
          <button
            disabled={loading}
            onClick={onClick}
            className="w-full md:w-auto bg-[#001F3F] text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-[#1E3A8A] transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <FiActivity className="animate-pulse" /> : buttonText}
          </button>
        )}
      </div>

      {children}
    </div>
  );
};

export default AdminToolsTab;
