import React, { useEffect, useState } from "react";
import {
  FiSearch,
  FiEye,
  FiDownload,
  FiX,
  FiUser,
  FiTrendingUp,
  FiDollarSign,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCreditCard,
  FiCalendar,
  FiToggleRight,
  FiToggleLeft,
  FiActivity,
  FiFilter,
} from "react-icons/fi";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [metrics, setMetrics] = useState({
    totalPartners: 0,
    netReferrals: 0,
    pendingLedger: 0,
    totalEarnings: 0,
  });
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);

  useEffect(() => {
    fetchPartners();
  }, [page, search, status]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API_URL}/api/admin/partners`, {
        params: { page, limit: 12, search, status },
        headers: { Authorization: `Bearer ${token}` },
      });

      setPartners(res.data.data || []);
      if (res.data.metrics) setMetrics(res.data.metrics);
      setPagination(res.data.pagination || {});
    } catch (error) {
      toast.error("Registry synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.patch(`${API_URL}/api/admin/partners/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Identity Status Modified");
      fetchPartners();
      if (selectedPartner?.id === id) {
        setSelectedPartner({ ...selectedPartner, isActive: !selectedPartner.isActive });
      }
    } catch (error) {
      toast.error("Protocol modification rejected");
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <Toaster position="top-right" />

      {/* --- Terminal Header --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FiActivity className="text-[#001F3F] animate-pulse" size={14} />
            <span className="text-black font-bold text-[11px] tracking-[0.2em] uppercase">
              Affiliate Network Console
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#001F3F] tracking-tight">
            Partner Registry
          </h1>
        </div>
        <button
          onClick={() => toast.success("Exporting Encrypted Ledger...")}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 rounded-lg text-[11px] font-bold text-black uppercase tracking-widest hover:bg-[#F8FAFC] transition-all shadow-sm active:scale-95"
        >
          <FiDownload size={14} /> Export Global Data
        </button>
      </div>

      {/* --- Performance Matrix --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Active Nodes" value={metrics.totalPartners} icon={<FiUser />} color="blue" />
        <StatCard title="Network Referrals" value={metrics.netReferrals} icon={<FiTrendingUp />} color="indigo" />
        <StatCard title="Pending Settlement" value={`₹${metrics.pendingLedger.toLocaleString()}`} icon={<FiDollarSign />} color="amber" />
        <StatCard title="Cumulative Yield" value={`₹${metrics.totalEarnings.toLocaleString()}`} icon={<FiCreditCard />} color="green" />
      </div>

      {/* --- Query & Filter Controller --- */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-2">
        <div className="relative flex-1 group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#001F3F] transition-colors" size={14} />
          <input
            type="text"
            placeholder="Query by identity, email, or referral protocol..."
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-transparent rounded-lg text-[11px] font-medium text-black outline-none focus:bg-white focus:border-[#001F3F] transition-all"
          />
        </div>
        <div className="relative w-full md:w-56 group">
          <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <select
            value={status}
            onChange={(e) => { setPage(1); setStatus(e.target.value); }}
            className="w-full pl-11 pr-10 py-3 bg-[#F8FAFC] border border-transparent rounded-lg text-[11px] font-bold text-black uppercase tracking-widest outline-none cursor-pointer appearance-none focus:bg-white focus:border-[#001F3F] transition-all"
          >
            <option value="">All Protocol Status</option>
            <option value="active">Active Nodes</option>
            <option value="inactive">Suspended Nodes</option>
          </select>
        </div>
      </div>

      {/* --- Data Workspace --- */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-200">
                <th className="py-4 px-6 text-[11px] font-bold text-black uppercase tracking-widest">Node Identity</th>
                <th className="px-6 text-[11px] font-bold text-black uppercase tracking-widest">Communication</th>
                <th className="px-6 text-[11px] font-bold text-black uppercase tracking-widest">Ref Code</th>
                <th className="px-6 text-[11px] font-bold text-black uppercase tracking-widest">Net Yield</th>
                <th className="px-6 text-[11px] font-bold text-black uppercase tracking-widest">Protocol</th>
                <th className="px-6 text-right text-[11px] font-bold text-black uppercase tracking-widest">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="py-24 text-center"><FiActivity className="animate-pulse mx-auto text-[#001F3F] text-3xl" /></td></tr>
              ) : (
                partners.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#001F3F] text-white flex items-center justify-center font-bold text-xs shadow-inner">
                          {p.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-black leading-none mb-1">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Partner Node</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6">
                      <p className="text-[11px] font-bold text-black">{p.email}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{p.phone}</p>
                    </td>
                    <td className="px-6">
                      <code className="bg-[#F0F4F8] px-2.5 py-1 rounded text-[#001F3F] font-bold text-[10px] border border-slate-200">
                        {p.referralCode}
                      </code>
                    </td>
                    <td className="px-6">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-black">{p.totalReferrals} Acquisitions</span>
                        <span className="text-[10px] text-green-600 font-bold uppercase tracking-tighter italic">₹{p.totalEarnings.toLocaleString()} Cleared</span>
                      </div>
                    </td>
                    <td className="px-6">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${p.isActive ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-600 border-red-100"}`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 text-right">
                      <button onClick={() => setSelectedPartner(p)} className="p-2.5 text-slate-400 hover:text-[#001F3F] hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all shadow-sm">
                        <FiEye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination Controller --- */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-t border-slate-200 flex justify-between items-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            Registry Frame {pagination.page} <span className="text-black">/</span> {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-[11px] font-bold text-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-30 transition-all">Previous</button>
            <button disabled={page === pagination.totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 bg-[#001F3F] text-white rounded-lg text-[11px] font-bold text-black uppercase tracking-widest hover:bg-[#1E3A8A] disabled:opacity-30 transition-all shadow-md">Next Entry</button>
          </div>
        </div>
      </div>

      {/* --- Partner Inspection Drawer --- */}
      <div className={`fixed inset-0 z-40 bg-[#001F3F]/30 backdrop-blur-sm transition-opacity duration-300 ${selectedPartner ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`} onClick={() => setSelectedPartner(null)} />
      
      <div className={`fixed inset-y-0 right-0 z-50 w-full md:w-[440px] bg-white shadow-2xl border-l border-slate-200 transform transition-transform duration-500 ease-out ${selectedPartner ? "translate-x-0" : "translate-x-full"}`}>
        {selectedPartner && (
          <div className="h-full flex flex-col">
            <div className="p-6 bg-[#F8FAFC] border-b border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-black font-bold text-[11px] tracking-widest uppercase opacity-50">Inspection Protocol</span>
                <h3 className="text-xl font-bold text-[#001F3F] tracking-tight mt-1">Partner Dossier</h3>
              </div>
              <button onClick={() => setSelectedPartner(null)} className="p-2.5 text-slate-400 hover:text-red-600 transition-all"><FiX size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              <div className="flex items-center gap-5 pb-8 border-b border-slate-100">
                <div className="h-16 w-16 bg-[#001F3F] text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-xl">
                  {selectedPartner.name?.substring(0, 1).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-black">{selectedPartner.name}</h3>
                  <p className="text-[#001F3F] font-bold text-[11px] uppercase tracking-[0.2em]">{selectedPartner.referralCode}</p>
                </div>
              </div>

              <div className="space-y-8">
                <DetailSection title="Communication Node">
                  <InfoItem icon={<FiMail />} label="Registry Email" value={selectedPartner.email} />
                  <InfoItem icon={<FiPhone />} label="Verified Phone" value={selectedPartner.phone} />
                  <InfoItem icon={<FiMapPin />} label="Primary Address" value={selectedPartner.address || "Data stream missing."} />
                </DetailSection>

                <DetailSection title="Financial Matrix">
                  <div className="bg-green-50 p-5 rounded-xl border border-green-100 flex justify-between items-center mb-4">
                    <div>
                      <p className="text-[10px] text-green-700 font-bold uppercase tracking-widest">Active Settlement</p>
                      <p className="text-3xl font-bold text-green-800">₹{selectedPartner.pendingPayout?.toLocaleString() || 0}</p>
                    </div>
                    <FiDollarSign size={32} className="text-green-200" />
                  </div>
                  <InfoItem icon={<FiCreditCard />} label="VPA / UPI Endpoint" value={selectedPartner.upiId || "Unconfigured"} />
                  <InfoItem icon={<FiTrendingUp />} label="Life-Cycle Yield" value={`₹${selectedPartner.totalEarnings?.toLocaleString() || 0}`} />
                </DetailSection>
              </div>
            </div>

            <div className="p-6 bg-[#F8FAFC] border-t border-slate-200">
              <button
                onClick={() => toggleStatus(selectedPartner.id)}
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                  selectedPartner.isActive ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                }`}
              >
                {selectedPartner.isActive ? <FiToggleLeft size={18} /> : <FiToggleRight size={18} />}
                {selectedPartner.isActive ? "Deactivate Partner Node" : "Authorize Partner Node"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Atomic Components ---

const StatCard = ({ title, value, icon, color }) => {
  const themes = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    green: "bg-green-50 text-green-600 border-green-100",
  };
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-[#001F3F] transition-all duration-300">
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-bold text-[#001F3F] tracking-tight truncate">{value}</p>
      </div>
      <div className={`w-12 h-12 flex items-center justify-center rounded-xl shadow-sm ${themes[color] || themes.blue}`}>
        {React.cloneElement(icon, { size: 22 })}
      </div>
    </div>
  );
};

const DetailSection = ({ title, children }) => (
  <div className="space-y-5">
    <h4 className="text-[11px] font-bold text-black uppercase tracking-[0.3em] border-b border-slate-100 pb-3">{title}</h4>
    <div className="space-y-5">{children}</div>
  </div>
);

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-4">
    <div className="mt-1 text-slate-300 group-hover:text-[#001F3F] transition-colors">{icon}</div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-[12px] font-bold text-black truncate">{value}</p>
    </div>
  </div>
);

export default Partners;