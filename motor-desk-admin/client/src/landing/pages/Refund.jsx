import React from "react";
import {
  FiShield,
  FiAlertTriangle,
  FiClock,
  FiCreditCard,
  FiMail,
  FiCheckCircle,
  FiActivity,
  FiXCircle,
} from "react-icons/fi";

const RefundProtocol = () => {
  const lastUpdated = "November 21, 2025"; //

  return (
    <div className="lg:pt-[7rem] max-w-7xl mx-auto py-16 px-6 animate-in fade-in duration-700">
      {/* --- Section Header --- */}
      <div className="text-center mb-16">
        <span className="text-[#001F3F] font-bold text-[11px] uppercase tracking-[0.4em] block mb-4">
          Governance & Compliance
        </span>
        <h1 className="text-4xl font-bold text-[#001F3F] tracking-tight">
          Refund Protocol.
        </h1>
        <p className="text-slate-400 mt-2 text-[11px] font-bold uppercase tracking-widest">
          Last System Update: {lastUpdated}
        </p>
      </div>

      {/* --- Critical Warning Terminal --- */}
      <div className="bg-red-50 border border-red-100 p-8 rounded-3xl mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <FiAlertTriangle size={80} className="text-red-900" />
        </div>
        <div className="relative z-10">
          <h3 className="text-red-900 font-black text-[13px] mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
            <FiShield /> Critical: Subscription Finality
          </h3>
          <p className="text-red-700 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
            Once the 7-day trial period expires and a subscription charge is
            processed, all payments are strictly non-refundable. Abacco
            Technology operates on a final-sale protocol for all active nodes.
          </p>
        </div>
      </div>

      {/* --- Protocol Guidelines Matrix --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="space-y-8">
          <h3 className="text-[11px] font-bold text-black uppercase tracking-[0.3em] border-b border-slate-100 pb-2">
            Standard Operating Procedures
          </h3>
          <div className="space-y-6">
            <ProtocolItem
              number="01"
              icon={<FiClock />}
              title="Trial Cancellation"
              desc="Subscribers must initiate cancellation before the 168-hour (7-day) mark to prevent automatic billing cycles."
            />
            <ProtocolItem
              number="02"
              icon={<FiActivity />}
              title="Partial Usage"
              desc="Partial refunds for unused server time or mid-cycle cancellations are not supported by the system."
            />
            <ProtocolItem
              number="03"
              icon={<FiXCircle />}
              title="Post-Charge window"
              desc="Requests submitted after 7 days of the transaction will be automatically rejected by the compliance layer."
            />
          </div>
        </div>

        <div className="bg-[#F8FAFC] p-8 rounded-3xl border border-[#CBD5E1]">
          <h3 className="text-[11px] font-bold text-black uppercase tracking-[0.3em] mb-6">
            Financial Discrepancies
          </h3>
          <div className="space-y-6">
            <p className="text-[11px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider">
              In the event of a duplicated transaction or technical system
              failure, users must file a report within{" "}
              <span className="text-black font-black">48 hours</span>.
            </p>
            <div className="flex items-center gap-4 p-4 bg-white border border-[#CBD5E1] rounded-xl">
              <FiMail className="text-[#001F3F]" />
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                  Incident Reporting
                </p>
                <p className="text-[11px] font-bold text-black">
                  support@themotordesk.com
                </p>
              </div>
            </div>
            <ul className="space-y-3 pt-4">
              <li className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                <FiCheckCircle className="text-green-500" /> Automated
                Verification
              </li>
              <li className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                <FiCheckCircle className="text-green-500" /> Log-Based
                Investigation
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* --- Footer Compliance Note --- */}
      <div className="text-center pt-8 border-t border-slate-100">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.5em]">
          MotorDesk Governance Protocol v1.0
        </p>
      </div>
    </div>
  );
};

// --- Atomic Component ---
const ProtocolItem = ({ number, icon, title, desc }) => (
  <div className="flex gap-4 group">
    <div className="text-[#001F3F] opacity-20 text-xl font-black italic">
      {number}
    </div>
    <div>
      <h4 className="text-[11px] font-bold text-black uppercase tracking-widest mb-1 flex items-center gap-2">
        {title}
      </h4>
      <p className="text-[11px] font-medium text-slate-500 leading-relaxed uppercase tracking-tight italic opacity-80">
        {desc}
      </p>
    </div>
  </div>
);

export default RefundProtocol;
