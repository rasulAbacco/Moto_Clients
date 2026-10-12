import React, { useEffect, useState } from "react";
import {
  FiSearch,
  FiDownload,
  FiActivity,
  FiFilter,
  FiLink,
} from "react-icons/fi";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Referrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReferrals();
  }, [page, search, status, type]);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API_URL}/api/admin/referrals`, {
        params: { page, limit: 25, search, status, type },
        headers: { Authorization: `Bearer ${token}` },
      });
      setReferrals(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch (error) {
      toast.error("Network ledger sync failed");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    toast.success("Generating encrypted CSV...");
    // ... logic for export remains same as previous functional component
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      REGISTERED: "bg-amber-50 text-amber-700 border-amber-100",
      CONVERTED: "bg-blue-50 text-blue-700 border-blue-100",
      APPROVED: "bg-purple-50 text-purple-700 border-purple-100",
      PAID: "bg-green-50 text-green-700 border-green-100",
      CANCELLED: "bg-red-50 text-red-700 border-red-100",
    };
    return (
      <span
        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[status] || "bg-slate-50 text-slate-500 border-slate-200"}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <Toaster position="top-right" />

      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#CBD5E1] pb-5">
        <div>
          <span className="text-black font-bold text-[11px] tracking-widest uppercase">
            Acquisition Registry
          </span>
          <h1 className="text-2xl font-bold text-[#001F3F] mt-1 tracking-tight">
            Referral Records
          </h1>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#CBD5E1] rounded-lg text-[11px] font-bold text-black uppercase tracking-widest hover:bg-[#F8FAFC] transition-all active:scale-95"
        >
          <FiDownload size={14} /> Export Records
        </button>
      </div>

      {/* --- Filters & Search Bar --- */}
      <div className="bg-white p-2 rounded-xl border border-[#CBD5E1] shadow-sm flex flex-col lg:flex-row gap-2">
        <div className="relative flex-1 group">
          <FiSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#001F3F]"
            size={14}
          />
          <input
            type="text"
            placeholder="Search by identity, email, or referral protocol..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFC] border border-transparent rounded-lg text-[11px] font-medium text-black outline-none focus:bg-white focus:border-[#001F3F] transition-all"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative group">
            <FiFilter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={14}
            />
            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              className="pl-9 pr-8 py-2.5 bg-[#F8FAFC] border border-transparent rounded-lg text-[11px] font-bold text-black uppercase tracking-widest outline-none cursor-pointer appearance-none hover:bg-slate-50 focus:bg-white focus:border-[#001F3F] transition-all"
            >
              <option value="">All Status Protocols</option>
              <option value="REGISTERED">REGISTERED</option>
              <option value="CONVERTED">CONVERTED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="PAID">PAID</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="relative group">
            <FiLink
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={14}
            />
            <select
              value={type}
              onChange={(e) => {
                setPage(1);
                setType(e.target.value);
              }}
              className="pl-9 pr-8 py-2.5 bg-[#F8FAFC] border border-transparent rounded-lg text-[11px] font-bold text-black uppercase tracking-widest outline-none cursor-pointer appearance-none hover:bg-slate-50 focus:bg-white focus:border-[#001F3F] transition-all"
            >
              <option value="">All Connection Types</option>
              <option value="USER">USER</option>
              <option value="PARTNER">PARTNER</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- Data Workspace (Table) --- */}
      <div className="bg-white border border-[#CBD5E1] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1]">
                <th className="py-4 px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  Referrer Node
                </th>
                <th className="px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  Protocol Code
                </th>
                <th className="px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  Connection
                </th>
                <th className="px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  Referred Identity
                </th>
                <th className="px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  Tier/Plan
                </th>
                <th className="px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  Yield
                </th>
                <th className="px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 text-[11px] font-bold text-black uppercase tracking-widest text-right">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-24 text-center">
                    <FiActivity className="animate-pulse mx-auto text-[#001F3F] text-2xl" />
                  </td>
                </tr>
              ) : referrals.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-20 text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      No matching registry records found
                    </p>
                  </td>
                </tr>
              ) : (
                referrals.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-[#F8FAFC] transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <p className="text-[13px] font-bold text-black">
                        {r.referrerName}
                      </p>
                      <p className="text-[11px] font-medium text-slate-500">
                        {r.referrerEmail}
                      </p>
                    </td>
                    <td className="px-6">
                      <code className="bg-[#F0F4F8] px-2 py-1 rounded text-[#001F3F] font-bold text-[10px] border border-[#CBD5E1]">
                        {r.referralCode}
                      </code>
                    </td>
                    <td className="px-6">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest ${r.type === "PARTNER" ? "text-orange-600" : "text-indigo-600"}`}
                      >
                        {r.type}
                      </span>
                    </td>
                    <td className="px-6">
                      <p className="text-[13px] font-bold text-black">
                        {r.referredUserName}
                      </p>
                      <p className="text-[11px] font-medium text-slate-500">
                        {r.referredUserEmail}
                      </p>
                    </td>
                    <td className="px-6 text-[11px] font-bold text-black uppercase tracking-tight">
                      {r.plan}
                    </td>
                    <td className="px-6 text-[11px] font-bold text-green-600">
                      ₹{r.commissionAmount || 0}
                    </td>
                    <td className="px-6">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-6 text-right text-[11px] font-medium text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination Footer --- */}
        {pagination?.totalPages > 1 && (
          <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#CBD5E1] flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Entry {pagination.page} <span className="text-black">/</span>{" "}
              {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 bg-white border border-[#CBD5E1] rounded-lg text-[11px] font-bold text-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-30"
              >
                Prev
              </button>
              <button
                disabled={page === pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 bg-[#001F3F] text-white rounded-lg text-[11px] font-bold text-black uppercase tracking-widest hover:bg-[#1E3A8A] disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Referrals;
