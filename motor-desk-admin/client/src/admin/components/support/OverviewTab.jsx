import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiBox,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiTruck,
  FiSettings,
  FiActivity,
} from "react-icons/fi";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_BASE_URL;

const OverviewTab = ({ userId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/api/admin/support/customer/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        },
      );
      setData(res.data.data);
    } catch (error) {
      toast.error("Failed to sync node overview");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <FiActivity className="text-[#001F3F] animate-pulse" size={24} />
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          Retrieving Node Data...
        </p>
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* --- Core Infrastructure Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          icon={<FiBox />}
          title="Subscription Tier"
          value={data.currentPlan}
          subText="Active Lifecycle"
        />
        <MetricCard
          icon={<FiCalendar />}
          title="Protocol Expiry"
          value={new Date(data.planExpiry).toLocaleDateString()}
          subText="Renewal Required"
          isWarning={new Date(data.planExpiry) < new Date()}
        />
        <MetricCard
          icon={<FiDollarSign />}
          title="Total Yield (Revenue)"
          value={`₹${data.totalPaid.toLocaleString()}`}
          subText="Cumulative Collections"
        />
      </div>

      {/* --- Operational Output Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
        <DataPoint
          title="System Invoices"
          value={data.totalInvoices}
          icon={<FiFileText />}
        />
        <DataPoint
          title="Car Service Nodes"
          value={data.carTotalServices}
          icon={<FiSettings />}
        />
        <DataPoint
          title="Bike Service Nodes"
          value={data.bikeTotalServices}
          icon={<FiTruck />}
        />
      </div>
    </div>
  );
};

// --- Atomic Metric Card ---
const MetricCard = ({ icon, title, value, subText, isWarning }) => (
  <div className="bg-white p-6 rounded-2xl border border-[#CBD5E1] shadow-sm hover:border-[#001F3F] transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-[#F8FAFC] text-[#001F3F] rounded-lg group-hover:bg-[#001F3F] group-hover:text-white transition-all">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <span
        className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
          isWarning
            ? "bg-red-50 text-red-600 border-red-100"
            : "bg-green-50 text-green-600 border-green-100"
        }`}
      >
        {isWarning ? "Critical" : "Operational"}
      </span>
    </div>
    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
      {title}
    </p>
    <h3 className="text-2xl font-black text-[#001F3F] tracking-tight">
      {value}
    </h3>
    <p className="text-[10px] font-bold text-slate-300 uppercase mt-2 tracking-tighter">
      {subText}
    </p>
  </div>
);

// --- Simple Data Point ---
const DataPoint = ({ title, value, icon }) => (
  <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-xl border border-transparent hover:border-[#CBD5E1] transition-all">
    <div className="text-[#001F3F] opacity-40">{icon}</div>
    <div>
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">
        {title}
      </p>
      <p className="text-lg font-black text-black leading-none">{value}</p>
    </div>
  </div>
);

export default OverviewTab;
