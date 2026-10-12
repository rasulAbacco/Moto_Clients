import React, { useEffect, useState } from "react";
import {
  FiUsers,
  FiAlertCircle,
  FiActivity,
  FiDollarSign,
  FiZap,
} from "react-icons/fi";
import axios from "axios";
import StatsCard from "../components/StatsCard";

const ExecutiveDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/admin/dashboard-summary`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return <div className="p-10 text-center">Loading Intelligence...</div>;

  return (
    <div className="space-y-6 pb-12">
      <h1 className="text-2xl font-bold text-[#001F3F]">
        Executive Intelligence
      </h1>

      {/* 🚀 Pillar 1: Software Subscription Health */}
      <section className="space-y-4">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          Software & User Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Installs"
            value={data.software.totalUsers}
            icon={<FiUsers />}
          />
          <StatsCard
            title="Active Subs"
            value={data.software.activeUsers}
            icon={<FiActivity />}
            color="emerald"
          />
          <StatsCard
            title="Trial Mode"
            value={data.software.trialUsers}
            icon={<FiZap />}
            color="blue"
          />
          <StatsCard
            title="Expired"
            value={data.software.expiredUsers}
            icon={<FiAlertCircle />}
            color="red"
          />
        </div>
      </section>

      {/* 🤝 Pillar 2 & 3: Partner & Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#CBD5E1] shadow-sm">
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Partner Ecosystem
          </h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-4xl font-black text-[#001F3F]">
                {data.partners.total}
              </p>
              <p className="text-xs text-gray-500 font-bold">
                Registered Partners
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-emerald-600">
                ₹{data.partners.accruedCommissions.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400 uppercase font-bold">
                Total Commissions Earned
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#001F3F] p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
          <h3 className="text-[11px] font-bold text-blue-300 uppercase tracking-widest mb-4">
            Financial Disbursement
          </h3>
          <div className="relative z-10">
            <p className="text-4xl font-black">
              ₹{data.partners.actuallyPaid.toLocaleString()}
            </p>
            <p className="text-xs text-blue-200 font-bold">
              Total Amount Paid to Partners
            </p>
          </div>
          <FiDollarSign
            className="absolute -bottom-4 -right-4 text-white/10"
            size={120}
          />
        </div>
      </div>

      {/* 📊 Recent Activity Ledger */}
      <div className="bg-white rounded-xl border border-[#CBD5E1] overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-[#CBD5E1]">
          <h3 className="text-[11px] font-bold text-black uppercase tracking-widest">
            Cross-Platform Activity Ledger
          </h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter border-b">
              <th className="px-6 py-3">Inbound User</th>
              <th className="px-6 py-3">Plan</th>
              <th className="px-6 py-3">Source Partner</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.recentActivity.map((ref) => (
              <tr key={ref.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-bold">{ref.user}</td>
                <td className="px-6 py-4">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-black">
                    {ref.plan}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{ref.partner}</td>
                <td className="px-6 py-4">
                  <span
                    className={`text-[10px] font-bold uppercase ${ref.status === "PAID" ? "text-emerald-500" : "text-orange-500"}`}
                  >
                    {ref.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
