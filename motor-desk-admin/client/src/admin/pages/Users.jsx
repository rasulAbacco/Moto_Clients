import React, { useEffect, useState } from "react";
import {
  FiSearch,
  FiEye,
  FiDownload,
  FiX,
  FiBriefcase,
  FiCalendar,
  FiUsers,
  FiFilter,
  FiActivity,
} from "react-icons/fi";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [page, search, status]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API_URL}/api/admin/users`, {
        params: { page, limit: 15, search, status },
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch (error) {
      toast.error("Failed to sync user database");
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (planExpiry) => {
    if (!planExpiry) return "trial";
    return new Date(planExpiry) < new Date() ? "expired" : "active";
  };

  const StatusBadge = ({ status }) => {
    const config = {
      active: "bg-green-50 text-green-700 border-green-100",
      expired: "bg-red-50 text-red-700 border-red-100",
      trial: "bg-blue-50 text-[#001F3F] border-blue-100",
    };
    return (
      <span
        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${config[status]}`}
      >
        {status}
      </span>
    );
  };

  const handleExport = async () => {
    // ... (Existing export logic remains same)
    toast.success("Generating Data Export");
  };

  const UserAvatar = ({ name }) => (
    <div className="h-9 w-9 rounded-lg bg-[#001F3F] flex items-center justify-center text-white font-bold text-xs">
      {name ? name.substring(0, 2).toUpperCase() : "NA"}
    </div>
  );

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      <Toaster position="top-right" />

      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#CBD5E1] pb-5">
        <div>
          <span className="text-black font-bold text-[11px] tracking-widest uppercase">
            System Administration
          </span>
          <h1 className="text-2xl font-bold text-[#001F3F] mt-1 tracking-tight">
            User Management
          </h1>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#CBD5E1] rounded-lg text-[11px] font-bold text-black uppercase tracking-widest hover:bg-[#F8FAFC] transition-all"
        >
          <FiDownload size={14} /> Export CSV
        </button>
      </div>

      {/* --- Filters Bar --- */}
      <div className="bg-white p-4 rounded-xl border border-[#CBD5E1] shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#001F3F]"
            size={14}
          />
          <input
            type="text"
            placeholder="Search by identity or company..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[11px] font-medium text-black outline-none focus:bg-white focus:border-[#001F3F] transition-all"
          />
        </div>
        <div className="relative w-full md:w-48">
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
            className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[11px] font-bold text-black uppercase tracking-widest outline-none cursor-pointer appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="trial">Trial</option>
          </select>
        </div>
      </div>

      {/* --- Table Section --- */}
      <div className="bg-white border border-[#CBD5E1] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1]">
                <th className="py-4 px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  User / Identity
                </th>
                <th className="py-4 px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  Company
                </th>
                <th className="py-4 px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  CRM Access
                </th>
                <th className="py-4 px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  Plan
                </th>
                <th className="py-4 px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  Staff
                </th>
                <th className="py-4 px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  Status
                </th>
                <th className="py-4 px-6 text-right text-[11px] font-bold text-black uppercase tracking-widest">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <FiActivity className="animate-pulse text-[#001F3F] mx-auto text-2xl" />
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user.username} />
                        <div>
                          <p className="text-[13px] font-bold text-black">
                            {user.username}
                          </p>
                          <p className="text-[11px] font-medium text-slate-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[11px] font-bold text-black uppercase">
                      {user.companyName || "—"}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {user.allowedCrms?.length > 0 ? (
                          user.allowedCrms.map((crm) => (
                            <span
                              key={crm}
                              className="px-2 py-0.5 text-[10px] font-bold bg-[#F0F4F8] text-[#001F3F] rounded uppercase"
                            >
                              {crm} CRM
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-[#001F3F] uppercase">
                          {user.plan}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 flex items-center gap-1">
                          <FiCalendar size={10} />{" "}
                          {user.planExpiry
                            ? new Date(user.planExpiry).toLocaleDateString()
                            : "Trial"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[11px] font-bold text-black">
                      {user.activeStaff} / {user.totalStaff}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={getStatus(user.planExpiry)} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 text-slate-400 hover:text-[#001F3F] hover:bg-white border border-transparent hover:border-[#CBD5E1] rounded-lg transition-all"
                      >
                        <FiEye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination --- */}
        {pagination?.totalPages > 1 && (
          <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#CBD5E1] flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Page {pagination.page} <span className="text-black">/</span>{" "}
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

      {/* --- Side Detail Drawer --- */}
      <div
        className={`fixed inset-0 z-40 bg-[#001F3F]/20 backdrop-blur-sm transition-opacity ${
          selectedUser
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={() => setSelectedUser(null)}
      />
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[420px] bg-white shadow-2xl border-l border-[#CBD5E1] transform transition-transform duration-300 ${
          selectedUser ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedUser && (
          <div className="h-full flex flex-col">
            <div className="p-6 bg-[#F8FAFC] border-b border-[#CBD5E1] flex justify-between items-center">
              <h2 className="text-[11px] font-bold text-black uppercase tracking-widest">
                Inspection Panel
              </h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 text-slate-400 hover:text-black"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <UserAvatar name={selectedUser.username} />
                <div>
                  <h3 className="text-lg font-bold text-[#001F3F]">
                    {selectedUser.username}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {selectedUser.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Entity" value={selectedUser.companyName} />
                <DetailItem
                  label="GST Identity"
                  value={selectedUser.gstNumber || "N/A"}
                />
                <DetailItem
                  label="Current Plan"
                  value={selectedUser.plan}
                  highlight
                />
                <DetailItem
                  label="Active Staff"
                  value={`${selectedUser.activeStaff} / ${selectedUser.totalStaff}`}
                />
                <DetailItem
                  label="Referral ID"
                  value={selectedUser.myReferralCode}
                  highlight
                />
                <DetailItem
                  label="Network Link"
                  value={selectedUser.referredBy || "Direct"}
                />
                <div className="col-span-2 mt-4 pt-4 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-black uppercase tracking-widest mb-2">
                    Office Address
                  </p>
                  <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                    {selectedUser.address || "No address data available."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailItem = ({ label, value, highlight }) => (
  <div>
    <p className="text-[11px] font-bold text-black uppercase tracking-widest mb-1">
      {label}
    </p>
    <p
      className={`text-[11px] font-medium p-2 rounded-md ${highlight ? "bg-[#F0F4F8] text-[#001F3F] font-bold" : "bg-slate-50 text-slate-600"}`}
    >
      {value || "—"}
    </p>
  </div>
);

export default Users;
