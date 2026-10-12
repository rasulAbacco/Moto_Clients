import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiActivity,
  FiTarget,
  FiArrowUpRight,
  FiArrowRight,
  FiDatabase,
  FiLayers,
  FiTrendingUp,
} from "react-icons/fi";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("partnerToken");
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/partner/dashboard`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setData(res.data);
      } catch (err) {
        toast.error("Telemetry sync failed");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <FiActivity className="text-[#001F3F] animate-pulse text-4xl" />
        <span className="text-[11px] font-bold text-black uppercase tracking-widest">
          Initializing Workspace...
        </span>
      </div>
    );

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      <Toaster position="top-right" />

      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#CBD5E1] pb-5">
        <div>
          <span className="text-black font-bold text-[11px] tracking-widest uppercase">
            Intelligence Hub
          </span>
          <h2 className="text-2xl font-bold text-[#001F3F] mt-1 tracking-tight">
            Performance Overview
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-white border border-[#CBD5E1] px-3 py-1.5 rounded-md">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-black font-bold text-[11px] uppercase tracking-widest">
            Live Telemetry
          </span>
        </div>
      </div>

      {/* 🟢 TOP ROW: NORMALIZED STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card - Size Normalized */}
        <div className="bg-gradient-to-br from-[#001F3F] to-[#1E3A8A] p-6 rounded-xl text-white shadow-md relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-blue-200/60 font-bold uppercase tracking-widest text-[11px] mb-2">
              Total Revenue
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold tracking-tight">
                ₹{data.metrics.totalRevenue}
              </h3>
              <span className="text-green-400 font-bold text-[10px] flex items-center gap-0.5">
                <FiTrendingUp size={10} /> {data.metrics.monthlyGrowth}
              </span>
            </div>
          </div>
        </div>

        {/* Conversion Card */}
        <div className="bg-white p-6 rounded-xl border border-[#CBD5E1] shadow-sm group hover:border-[#001F3F] transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-black font-bold text-[11px] uppercase tracking-widest">
              Conversion Yield
            </p>
            <FiTarget className="text-[#001F3F]" size={16} />
          </div>
          <h3 className="text-2xl font-bold text-black tracking-tight">
            {data.metrics.conversionRate}
          </h3>
        </div>

        {/* Network Card */}
        <div className="bg-white p-6 rounded-xl border border-[#CBD5E1] shadow-sm group hover:border-[#001F3F] transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-black font-bold text-[11px] uppercase tracking-widest">
              Verified Network
            </p>
            <FiLayers className="text-[#001F3F]" size={16} />
          </div>
          <h3 className="text-2xl font-bold text-black tracking-tight">
            {data.metrics.activeNetwork}
          </h3>
        </div>

        {/* Quick Action / Status Card */}
        <div className="bg-[#F8FAFC] p-6 rounded-xl border border-[#CBD5E1] shadow-sm">
          <p className="text-black font-bold text-[11px] uppercase tracking-widest mb-2">
            System Health
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase">
              Optimal
            </span>
          </div>
        </div>
      </div>

      {/* 🔵 BOTTOM ROW: THE LEDGER SLATE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#CBD5E1] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#CBD5E1] bg-[#F8FAFC] flex justify-between items-center">
            <div>
              <h3 className="text-[11px] font-bold text-black uppercase tracking-widest">
                Acquisition Stream
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                Recent Network Activity
              </p>
            </div>
            <button className="flex items-center gap-2 text-[11px] font-bold text-[#001F3F] uppercase tracking-widest hover:text-[#1E3A8A] transition-colors">
              View All <FiArrowRight />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {data.activity.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 hover:bg-[#F8FAFC] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded bg-[#001F3F] text-white flex items-center justify-center font-bold text-[11px]">
                    {item.entity.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-black text-[12px] uppercase tracking-tight">
                      {item.entity}
                    </p>
                    <p className="text-slate-500 font-medium text-[11px]">
                      {item.email}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      item.status === "REGISTERED"
                        ? "bg-green-100 text-green-700"
                        : "bg-[#001F3F] text-white"
                    }`}
                  >
                    {item.status}
                  </span>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                    {new Date(item.time).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Slate - Size Normalized */}
        <div className="bg-[#001F3F] rounded-xl p-6 text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-blue-300 font-bold text-[11px] tracking-widest uppercase">
              Resource Center
            </span>
            <h4 className="text-lg font-bold mt-2 leading-tight">
              Settlement Verification
            </h4>
            <p className="text-blue-100/60 font-medium text-[11px] mt-2 leading-relaxed">
              Verify your KYC profile to maintain your payout schedule.
            </p>
          </div>
          <button
            onClick={() => navigate("/partner/referrals")}
            className="relative z-10 mt-6 w-full py-3 bg-white text-[#001F3F] rounded-lg font-bold uppercase tracking-widest text-[11px] hover:bg-[#F0F4F8] transition-all"
          >
            Check Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
