import React, { useEffect, useState, useCallback } from "react";
import {
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiActivity,
  FiDatabase,
} from "react-icons/fi";
import axios from "axios";
import ReferralTable from "../components/ReferralTable";
import toast, { Toaster } from "react-hot-toast";

const Referrals = () => {
  const [summary, setSummary] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchReferralData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("partnerToken");
      if (!token) {
        toast.error("Session expired.");
        return;
      }
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/partner/referrals`,
        {
          params: { page, limit: 10 },
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSummary(res.data.summary || null);
      setReferrals(res.data.referrals || []);
      setPagination(res.data.pagination || null);
    } catch (error) {
      toast.error("Sync failed.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <Toaster position="top-right" />

      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#CBD5E1] pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#001F3F] rounded-lg text-white">
            <FiDatabase size={16} />
          </div>
          <div>
            <span className="text-black font-bold text-[11px] uppercase tracking-widest">
              Network Registry
            </span>
            <h2 className="text-2xl font-bold text-[#001F3F] tracking-tight">
              Acquisition Data
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white border border-[#CBD5E1] px-3 py-1.5 rounded-md">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-black font-bold text-[11px] uppercase tracking-widest">
            Live Database
          </span>
        </div>
      </div>

      {/* --- Performance Summary Bar --- */}
      {summary && (
        <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#CBD5E1]">
            <SummarySlate
              title="Global Network"
              val={summary.totalReferrals}
              icon={<FiUsers size={16} />}
            />
            <SummarySlate
              title="Verified Conversions"
              val={summary.successfulReferrals}
              icon={<FiCheckCircle size={16} />}
            />
            <SummarySlate
              title="Awaiting Sync"
              val={summary.pendingReferrals}
              icon={<FiClock size={16} />}
            />
          </div>
        </div>
      )}

      {/* --- Main Workspace Container --- */}
      <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#CBD5E1] bg-[#F8FAFC] flex items-center justify-between">
          <h3 className="text-[11px] font-bold text-black uppercase tracking-widest">
            Referral Ledger
          </h3>
          <FiActivity className="text-[#001F3F] opacity-30" />
        </div>

        <div>
          <ReferralTable data={referrals} loading={loading} />
        </div>

        {/* --- Pagination Footer --- */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#CBD5E1] flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Entry {pagination.page} <span className="text-black">/</span>{" "}
              {pagination.totalPages}
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 1 || loading}
                onClick={() => setPage((prev) => prev - 1)}
                className="p-2.5 bg-white text-[#001F3F] rounded-lg border border-[#CBD5E1] hover:bg-[#F0F4F8] transition-all disabled:opacity-30"
              >
                <FiChevronLeft size={16} />
              </button>
              <button
                disabled={page === pagination.totalPages || loading}
                onClick={() => setPage((prev) => prev + 1)}
                className="p-2.5 bg-[#001F3F] text-white rounded-lg hover:bg-[#1E3A8A] transition-all disabled:opacity-30 shadow-md shadow-blue-900/10"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SummarySlate = ({ title, val, icon }) => (
  <div className="px-6 py-5 flex items-center gap-4 hover:bg-[#F8FAFC] transition-colors group">
    <div className="p-2.5 bg-[#F0F4F8] text-[#001F3F] rounded-lg group-hover:bg-[#001F3F] group-hover:text-white transition-all">
      {icon}
    </div>
    <div className="flex flex-col">
      <h4 className="text-[11px] font-bold text-black uppercase tracking-widest">
        {title}
      </h4>
      <p className="text-xl font-bold text-[#001F3F] tracking-tight leading-none mt-1">
        {val ?? 0}
      </p>
    </div>
  </div>
);

export default Referrals;
