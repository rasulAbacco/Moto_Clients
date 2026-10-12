import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiFileText,
  FiDownload,
  FiActivity,
  FiExternalLink,
} from "react-icons/fi";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_BASE_URL;

const InvoicesTab = ({ userId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, [userId]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/api/admin/support/customer/${userId}/invoices`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        },
      );
      setData(res.data.data || []);
    } catch (error) {
      toast.error("Failed to retrieve billing ledger");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const s = status?.toUpperCase();
    if (s === "PAID") return "bg-green-50 text-green-700 border-green-100";
    if (s === "PENDING") return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-slate-50 text-slate-500 border-slate-200";
  };

  if (loading)
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <FiActivity className="text-[#001F3F] animate-pulse" size={24} />
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          Querying Billing Protocol...
        </p>
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* --- Ledger Header --- */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiFileText className="text-[#001F3F]" size={14} />
          <span className="text-black font-bold text-[11px] tracking-widest uppercase">
            Billing Ledger Registry
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
          Total Records: {data.length}
        </span>
      </div>

      {/* --- Data Table --- */}
      <div className="bg-white border border-[#CBD5E1] rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1]">
              <th className="py-4 px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                Invoice Protocol #
              </th>
              <th className="px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                Settlement Status
              </th>
              <th className="px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                Grand Total
              </th>
              <th className="px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                Generation Date
              </th>
              <th className="px-6 text-right text-[11px] font-bold text-black uppercase tracking-widest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="py-20 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest"
                >
                  No invoice records detected for this node
                </td>
              </tr>
            ) : (
              data.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-[#F8FAFC] transition-colors group"
                >
                  <td className="py-4 px-6">
                    <span className="text-[12px] font-bold text-[#001F3F] font-mono">
                      {inv.invoiceNumber}
                    </span>
                  </td>
                  <td className="px-6">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(inv.status)}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6">
                    <span className="text-[12px] font-black text-black">
                      ₹{inv.grandTotal.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6">
                    <span className="text-[11px] font-medium text-slate-500">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-[#001F3F] hover:bg-white border border-transparent hover:border-[#CBD5E1] rounded-lg transition-all">
                        <FiDownload size={14} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-[#001F3F] hover:bg-white border border-transparent hover:border-[#CBD5E1] rounded-lg transition-all">
                        <FiExternalLink size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoicesTab;
