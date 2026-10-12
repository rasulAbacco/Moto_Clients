import React, { useEffect, useState } from "react";
import {
  FiSearch,
  FiX,
  FiDollarSign,
  FiActivity,
  FiShield,
  FiDownload,
} from "react-icons/fi";
import { FaCheckCircle } from "react-icons/fa";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Payouts = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedPartner, setSelectedPartner] = useState(null);
  const [txnRef, setTxnRef] = useState("");

  /* ================= CYCLE STATE ================= */
  const [cycleStart, setCycleStart] = useState("");
  const [cycleEnd, setCycleEnd] = useState("");
  const [cycleTxnRef, setCycleTxnRef] = useState("");

  useEffect(() => {
    fetchPayouts();

    // Optional UX Improvement: Default to current month 1st-14th
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");

    setCycleStart(`${year}-${month}-01`);
    setCycleEnd(`${year}-${month}-14`);
  }, []);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API_URL}/api/admin/payouts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sorted = (res.data.data || [])
        .map((p) => ({
          ...p,
          totalEarnings: Number(p.totalEarnings) || 0,
          paidAmount: Number(p.paidAmount) || 0,
          availableBalance: Number(p.availableBalance) || 0,
        }))
        .sort((a, b) => b.totalEarnings - a.totalEarnings);

      setPartners(sorted);
    } catch (err) {
      toast.error("Failed to load payout data");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SINGLE PAYMENT ================= */
  const handleConfirmPayment = async () => {
    if (!txnRef.trim()) {
      toast.error("Transaction reference is required");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");

      await axios.post(
        `${API_URL}/api/admin/payouts/${selectedPartner.id}/mark-paid`,
        {
          type: selectedPartner.type,
          amount: selectedPartner.availableBalance,
          transactionReference: txnRef,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Payment recorded successfully");
      setSelectedPartner(null);
      setTxnRef("");
      fetchPayouts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record payment");
    }
  };

  /* ================= EXPORT CYCLE ================= */
  const handleExport = async () => {
    if (!cycleStart || !cycleEnd) {
      toast.error("Select cycle dates");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");

      const response = await axios.get(
        `${API_URL}/api/admin/payouts/export-cycle`,
        {
          params: {
            cycleStart,
            cycleEnd,
          },
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `payout_${cycleStart}_to_${cycleEnd}.csv`);
      document.body.appendChild(link);
      link.click();

      toast.success("Cycle exported");
    } catch (err) {
      toast.error(err.response?.data?.message || "Export failed");
    }
  };

  /* ================= CONFIRM CYCLE ================= */
  const handleConfirmCycle = async () => {
    if (!cycleStart || !cycleEnd) {
      toast.error("Select cycle dates");
      return;
    }

    const reference = prompt("Enter Batch Transaction Reference");

    if (!reference) return;

    try {
      const token = localStorage.getItem("adminToken");

      await axios.post(
        `${API_URL}/api/admin/payouts/confirm-cycle`,
        {
          cycleStart,
          cycleEnd,
          transactionReference: reference,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Cycle confirmed successfully");
      fetchPayouts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Confirm failed");
    }
  };

  const filteredPartners = partners.filter((p) =>
    (p.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <Toaster position="top-right" />

      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#CBD5E1] pb-5">
        <div>
          <span className="text-black font-bold text-[11px] tracking-widest uppercase">
            Financial Settlement
          </span>
          <h1 className="text-2xl font-bold text-[#001F3F] mt-1 tracking-tight">
            Referral Payouts
          </h1>
        </div>

        {/* Cycle Controls & Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="date"
            value={cycleStart}
            onChange={(e) => setCycleStart(e.target.value)}
            className="border px-3 py-2 rounded text-xs"
          />

          <input
            type="date"
            value={cycleEnd}
            onChange={(e) => setCycleEnd(e.target.value)}
            className="border px-3 py-2 rounded text-xs"
          />

          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-[11px] font-bold uppercase hover:bg-green-700 transition-all"
          >
            <FiDownload /> Export Cycle
          </button>

          <button
            onClick={handleConfirmCycle}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-[11px] font-bold uppercase hover:bg-blue-700 transition-all"
          >
            <FaCheckCircle /> Confirm Cycle
          </button>

          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-md border border-green-100">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-green-700 font-bold text-[11px] uppercase tracking-widest">
              Ledger Balanced
            </span>
          </div>
        </div>
      </div>

      {/* --- Search Controller --- */}
      <div className="bg-white p-2 rounded-xl border border-[#CBD5E1] shadow-sm">
        <div className="relative w-full md:w-80 group">
          <FiSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#001F3F]"
            size={14}
          />
          <input
            type="text"
            placeholder="Search affiliate node..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFC] border border-transparent rounded-lg text-[11px] font-medium text-black outline-none focus:bg-white focus:border-[#001F3F] transition-all"
          />
        </div>
      </div>

      {/* --- Payout Workspace (Table) --- */}
      <div className="bg-white border border-[#CBD5E1] rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1]">
                <th className="py-4 px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  Partner Node
                </th>
                <th className="px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  Total Yield
                </th>
                <th className="px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  Settled
                </th>
                <th className="px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  Available
                </th>
                <th className="px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  Payout Endpoint
                </th>
                <th className="px-6 text-right text-[11px] font-bold text-black uppercase tracking-widest">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <FiActivity className="animate-pulse mx-auto text-[#001F3F] text-2xl" />
                  </td>
                </tr>
              ) : filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      No payout records found
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPartners.map((partner) => (
                  <tr
                    key={`${partner.type}-${partner.id}`}
                    className="hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="py-4 px-6">
                      <p className="text-[13px] font-bold text-black">
                        {partner.name}
                      </p>
                      <p className="text-[11px] font-medium text-slate-500">
                        {partner.email}
                      </p>
                      {/* Type Badge */}
                      <p className="text-[10px] font-bold text-indigo-600 uppercase mt-1">
                        {partner.type}
                      </p>
                    </td>

                    <td className="px-6 text-[11px] font-bold text-black">
                      ₹{partner.totalEarnings.toLocaleString()}
                    </td>
                    <td className="px-6 text-[11px] font-medium text-slate-500">
                      ₹{partner.paidAmount.toLocaleString()}
                    </td>
                    <td className="px-6 text-[11px] font-bold text-green-600">
                      ₹{partner.availableBalance.toLocaleString()}
                    </td>
                    <td className="px-6">
                      <code className="text-[10px] font-bold text-[#001F3F] bg-[#F0F4F8] px-2 py-1 rounded border border-[#CBD5E1]">
                        {partner.upiId || "—"}
                      </code>
                    </td>

                    <td className="px-6 text-right">
                      {partner.availableBalance > 0 ? (
                        <button
                          onClick={() => setSelectedPartner(partner)}
                          className="inline-flex items-center gap-2 bg-[#001F3F] text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[#1E3A8A] shadow-md transition-all active:scale-95"
                        >
                          <FaCheckCircle /> Mark Paid
                        </button>
                      ) : partner.lastPaidAt ? (
                        <div className="text-[10px] text-green-600 font-bold uppercase tracking-tight">
                          Settled{" "}
                          {new Date(partner.lastPaidAt).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300 font-bold">
                          CLEAR
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Settlement Confirmation Modal --- */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-[#001F3F]/40 backdrop-blur-sm flex items-center justify-center z-[60] p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-[#CBD5E1]">
            <div className="bg-[#F8FAFC] px-6 py-4 border-b border-[#CBD5E1] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FiShield className="text-[#001F3F]" />
                <h3 className="text-[11px] font-bold text-black uppercase tracking-widest">
                  Vault Settlement
                </h3>
              </div>
              <button
                onClick={() => setSelectedPartner(null)}
                className="text-slate-400 hover:text-black"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="p-8">
              <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                  <FiDollarSign size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">
                    Amount to Release
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    ₹{selectedPartner.availableBalance.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                  Initiating payout for{" "}
                  <span className="text-black font-bold">
                    {selectedPartner.name}
                  </span>
                  . Input the bank/UPI reference number to synchronize this
                  transaction with the ledger.
                </p>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-black uppercase tracking-widest ml-1">
                    Protocol Ref / TXN ID
                  </label>
                  <input
                    type="text"
                    value={txnRef}
                    onChange={(e) => setTxnRef(e.target.value)}
                    placeholder="ENTER REFERENCE ID"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-black text-[11px] font-medium outline-none focus:bg-white focus:border-[#001F3F] transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleConfirmPayment}
                className="w-full mt-8 bg-[#001F3F] text-white py-4 rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-[#1E3A8A] transition-all shadow-xl active:scale-95"
              >
                Confirm Settlement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payouts;
