import React, { useState } from "react";
import {
  FiActivity,
  FiInbox,
  FiEye,
  FiX,
  FiUser,
  FiCreditCard,
  FiCalendar,
} from "react-icons/fi";

// Status styles updated to match Navy/Verfied theme
const statusStyles = {
  REGISTERED: "bg-blue-50 text-[#001F3F] border border-blue-100",
  PAID: "bg-green-50 text-green-700 border border-green-100",
  REWARDED: "bg-[#001F3F] text-white",
  CANCELLED: "bg-red-50 text-red-600 border border-red-100",
};

const ReferralTable = ({ data = [], loading = false }) => {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1]">
                <th className="py-4 px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  User Identity
                </th>
                <th className="py-4 px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  Plan
                </th>
                <th className="py-4 px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  Txn Amount
                </th>
                <th className="py-4 px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  Commission
                </th>
                <th className="py-4 px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  Status
                </th>
                <th className="py-4 px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  Timestamp
                </th>
                <th className="py-4 px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  Inspect
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <FiActivity className="animate-pulse text-2xl mx-auto text-[#001F3F]" />
                    <p className="text-[11px] font-bold text-black uppercase tracking-widest mt-4">
                      Syncing Ledger...
                    </p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center opacity-40">
                    <FiInbox className="mx-auto text-3xl text-slate-400" />
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-4">
                      No Entries Found
                    </p>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.id}
                    className="group hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-black">
                          {item.username || "Anonymous"}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          {item.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[10px] font-bold text-[#001F3F] bg-[#F0F4F8] px-2 py-0.5 rounded border border-[#CBD5E1] uppercase">
                        {item.plan}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-black text-[13px]">
                      ₹{item.amount ?? 0}
                    </td>
                    <td className="py-4 px-6 font-bold text-[#001F3F] text-[13px]">
                      ₹{item.commission ?? 0}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${statusStyles[item.referralStatus] || "bg-gray-100 text-gray-600"}`}
                      >
                        {item.referralStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-black">
                          {item.joinDate
                            ? new Date(item.joinDate).toLocaleDateString(
                                "en-GB",
                              )
                            : "-"}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          Registered
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => setSelected(item)}
                        className="p-2 text-[#001F3F] hover:bg-[#001F3F] hover:text-white border border-[#CBD5E1] rounded-lg transition-all"
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
      </div>

      {/* 🔵 SIDE DETAIL DRAWER */}
      <div
        className={`fixed inset-0 z-[60] bg-[#001F3F]/20 backdrop-blur-sm transition-opacity duration-300 ${selected ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
        onClick={() => setSelected(null)}
      />
      <div
        className={`fixed inset-y-0 right-0 z-[70] w-full md:w-[400px] bg-white shadow-2xl transform transition-transform duration-500 ease-in-out border-l border-[#CBD5E1] ${selected ? "translate-x-0" : "translate-x-full"}`}
      >
        {selected && (
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-[#CBD5E1] flex items-center justify-between bg-[#F8FAFC]">
              <div>
                <span className="text-black font-bold text-[11px] tracking-widest uppercase">
                  Inspection File
                </span>
                <h3 className="text-xl font-bold text-[#001F3F] tracking-tight">
                  Reference Detail
                </h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 text-slate-400 hover:text-black transition-all"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="h-14 w-14 bg-[#001F3F] text-white rounded-xl flex items-center justify-center text-xl font-bold">
                  {selected.username?.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-black">
                    {selected.username}
                  </h4>
                  <p className="text-slate-500 font-medium text-[11px]">
                    {selected.email}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <DetailItem
                  icon={<FiUser />}
                  label="Client Identity"
                  val={selected.phone || "No Phone Provided"}
                />
                <DetailItem
                  icon={<FiInbox />}
                  label="Email Address"
                  val={selected.email || "Not Provided"}
                />

                <DetailItem
                  icon={<FiActivity />}
                  label="Registered Address"
                  val={selected.address || "Not Provided"}
                />
                <DetailItem
                  icon={<FiCreditCard />}
                  label="Transaction Ledger"
                  val={`Plan: ${selected.plan} | Earned: ₹${selected.commission}`}
                />
                <DetailItem
                  icon={<FiCalendar />}
                  label="Timeline Data"
                  val={`Registered: ${
                    selected.joinDate
                      ? new Date(selected.joinDate).toLocaleDateString("en-GB")
                      : "-"
                  } | Status: ${selected.paymentStatus || "-"}`}
                />

                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#CBD5E1]">
                  <p className="text-[11px] font-bold text-black uppercase tracking-widest mb-3">
                    Verification Status
                  </p>
                  <span
                    className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${statusStyles[selected.referralStatus]}`}
                  >
                    {selected.referralStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#F8FAFC] border-t border-[#CBD5E1]">
              <button
                onClick={() => setSelected(null)}
                className="w-full bg-[#001F3F] text-white py-3 rounded-lg font-bold uppercase tracking-widest text-[11px] shadow-lg hover:bg-[#1E3A8A] transition-all"
              >
                Close Inspection
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const DetailItem = ({ icon, label, val }) => (
  <div className="flex items-start gap-4">
    <div className="p-2 bg-[#F0F4F8] rounded-lg text-[#001F3F]">{icon}</div>
    <div>
      <p className="text-[11px] font-bold text-black uppercase tracking-widest">
        {label}
      </p>
      <p className="text-[13px] font-medium text-slate-600 mt-1">{val}</p>
    </div>
  </div>
);

export default ReferralTable;
