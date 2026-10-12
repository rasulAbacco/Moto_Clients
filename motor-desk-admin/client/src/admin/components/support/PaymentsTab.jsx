import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiCreditCard,
  FiActivity,
  FiArrowUpRight,
  FiCheckCircle,
  FiXCircle,
  FiClock,
} from "react-icons/fi";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_BASE_URL;

const PaymentsTab = ({ userId }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, [userId]);

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API}/api/admin/support/customer/${userId}/payments`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        },
      );

      setPayments(res.data.data || []);
    } catch (err) {
      toast.error("Failed to sync payment records");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const s = status?.toUpperCase();
    if (s === "SUCCESS")
      return {
        color: "text-green-600 bg-green-50 border-green-100",
        icon: <FiCheckCircle />,
      };
    if (s === "FAILED")
      return {
        color: "text-red-600 bg-red-50 border-red-100",
        icon: <FiXCircle />,
      };
    return {
      color: "text-amber-600 bg-amber-50 border-amber-100",
      icon: <FiClock />,
    };
  };

  if (loading)
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <FiActivity className="text-[#001F3F] animate-pulse" size={24} />
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          Verifying Financial Node...
        </p>
      </div>
    );

  if (!payments.length)
    return (
      <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
        <FiCreditCard className="mx-auto text-slate-200 mb-4" size={32} />
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          No transaction flow detected
        </p>
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* --- Ledger Header --- */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
        <FiCreditCard className="text-[#001F3F]" size={14} />
        <span className="text-black font-bold text-[11px] tracking-widest uppercase">
          Transaction Flow Registry
        </span>
      </div>

      <div className="overflow-x-auto bg-white border border-[#CBD5E1] rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#F8FAFC] border-b border-[#CBD5E1]">
            <tr className="text-[11px] font-bold text-black uppercase tracking-widest">
              <th className="py-4 px-6">Capital Flow</th>
              <th className="px-6">Node Status</th>
              <th className="px-6">Protocol Order ID</th>
              <th className="px-6 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((payment) => {
              const config = getStatusConfig(payment.status);
              return (
                <tr
                  key={payment.id}
                  className="hover:bg-[#F8FAFC] transition-colors group"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <FiArrowUpRight className="text-green-500" />
                      <span className="text-[13px] font-black text-black">
                        ₹{payment.amount?.toLocaleString() || 0}
                      </span>
                    </div>
                  </td>

                  <td className="px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${config.color}`}
                    >
                      {React.cloneElement(config.icon, { size: 12 })}
                      {payment.status}
                    </span>
                  </td>

                  <td className="px-6">
                    <code className="text-[10px] font-bold text-[#001F3F] bg-[#F0F4F8] px-2 py-1 rounded border border-[#CBD5E1] font-mono">
                      {payment.orderId || "NODE_UNDEF"}
                    </code>
                  </td>

                  <td className="px-6 text-right">
                    <span className="text-[11px] font-medium text-slate-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsTab;
