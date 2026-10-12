import React, { useEffect, useState } from "react";
import {
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiTrendingUp,
  FiChevronDown,
  FiActivity,
} from "react-icons/fi";
import axios from "axios";
import EarningsCard from "../components/EarningsCard";
import toast, { Toaster } from "react-hot-toast";

const Earnings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedMonth, setExpandedMonth] = useState(null);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("partnerToken");
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/partner/earnings`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setData(res.data);
      } catch (err) {
        toast.error("Failed to load financial telemetry");
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (loading)
    return (
      <div className="flex h-[60vh] items-center justify-center gap-3">
        <FiActivity className="text-[#001F3F] animate-pulse text-2xl" />
        <span className="text-[#001F3F] font-bold uppercase tracking-[0.2em] text-[11px]">
          Syncing Revenue Desk...
        </span>
      </div>
    );

  return (
    <div className="mx-auto space-y-6 pb-10 animate-in fade-in duration-500">
      <Toaster position="top-right" />

      {/* --- Page Header --- */}
      <div className="border-b border-[#CBD5E1] pb-5">
        <span className="text-black font-bold text-[11px] uppercase tracking-widest">
          Financial Ledger
        </span>
        <h1 className="text-2xl font-bold text-[#001F3F] tracking-tight mt-1">
          Revenue Overview
        </h1>
      </div>

      {/* --- Earnings Cards Grid --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <EarningsCard
          title="Total Yield"
          amount={data.summary.totalEarnings}
          icon={<FiTrendingUp />}
        />
        <EarningsCard
          title="Available Balance"
          amount={data.summary.availableBalance}
          icon={<FiCheckCircle />}
        />
        <EarningsCard
          title="Pending Settlement"
          amount={data.summary.pendingPayout}
          icon={<FiClock />}
        />
        <EarningsCard
          title="Paid Out"
          amount={data.summary.paidAmount}
          icon={<FiDollarSign />}
        />
      </div>

      {/* --- Monthly Breakdown Section --- */}
      <div className="bg-white rounded-xl border border-[#CBD5E1] overflow-hidden shadow-sm">
        <div className="p-4 bg-[#F8FAFC] border-b border-[#CBD5E1] flex items-center justify-between">
          <h3 className="text-[11px] font-bold text-black uppercase tracking-widest">
            Monthly Performance
          </h3>
          <FiActivity className="text-[#001F3F] text-sm" />
        </div>

        <div className="p-4 space-y-2">
          {data.monthlyBreakdown?.map((group) => (
            <div
              key={group.month}
              className="border border-[#E2E8F0] rounded-lg overflow-hidden transition-all"
            >
              <button
                onClick={() =>
                  setExpandedMonth(
                    expandedMonth === group.month ? null : group.month,
                  )
                }
                className="w-full flex justify-between items-center p-4 bg-white hover:bg-[#F8FAFC] transition-colors"
              >
                <span className="font-bold text-black text-[13px] uppercase tracking-tight">
                  {group.month}
                </span>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-[#001F3F] text-sm">
                    ₹{group.totalAmount.toLocaleString()}
                  </span>
                  <FiChevronDown
                    className={`text-slate-400 transition-transform duration-300 ${
                      expandedMonth === group.month
                        ? "rotate-180 text-[#001F3F]"
                        : ""
                    }`}
                  />
                </div>
              </button>

              {expandedMonth === group.month && (
                <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] overflow-x-auto">
                  <table className="w-full text-left min-w-[400px]">
                    <thead className="text-[10px] font-bold text-black uppercase border-b border-[#CBD5E1]">
                      <tr>
                        <th className="pb-3">Garage Identity</th>
                        <th className="pb-3">Plan</th>
                        <th className="pb-3 text-right">Yield</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {group.referrals.map((ref, i) => (
                        <tr
                          key={i}
                          className="text-[11px] font-medium text-slate-600"
                        >
                          <td className="py-3 font-bold text-black uppercase">
                            {ref.garageName}
                          </td>
                          <td className="py-3">
                            <span className="bg-[#001F3F] text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                              {ref.plan}
                            </span>
                          </td>
                          <td className="py-3 text-right font-bold text-[#001F3F]">
                            ₹{ref.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* --- Settlement History Section --- */}
      <div className="bg-white rounded-xl border border-[#CBD5E1] overflow-hidden shadow-sm">
        <div className="p-4 bg-[#001F3F] text-white">
          <h3 className="text-[11px] font-bold uppercase tracking-widest">
            Settlement Log
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead className="bg-[#F8FAFC] text-[10px] font-bold text-black uppercase border-b border-[#CBD5E1]">
              <tr>
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">Transaction Ref</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.payoutHistory?.map((p) => (
                <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-4 px-6 text-[11px] font-bold text-black">
                    {new Date(p.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="py-4 px-6 font-mono text-[10px] text-slate-500 truncate max-w-[150px]">
                    {p.transactionReference || "—"}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                        p.status === "PAID"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-50 text-[#001F3F]"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-black text-sm">
                    ₹{p.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
