import React from "react";
import {
  FiFileText,
  FiClock,
  FiUsers,
  FiShield,
  FiAlertOctagon,
  FiCheckCircle,
  FiActivity,
} from "react-icons/fi";

const TermsOfService = () => {
  const lastUpdated = "November 21, 2025";

  return (
    <div className="max-w-7xl lg:pt-[7rem] mx-auto py-16 px-6 animate-in fade-in duration-700">
      {/* --- Section Header --- */}
      <div className="text-center mb-16">
        <span className="text-[#001F3F] font-bold text-[11px] uppercase tracking-[0.4em] block mb-4">
          Governance & Compliance
        </span>
        <h1 className="text-4xl font-bold text-[#001F3F] tracking-tight">
          Terms of Service.
        </h1>
        <p className="text-slate-400 mt-2 text-[11px] font-bold uppercase tracking-widest">
          Protocol Version 2.0.4 | Updated: {lastUpdated}
        </p>
      </div>

      {/* --- 01. Acceptance Node --- */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <FiFileText className="text-[#001F3F]" size={18} />
          <h3 className="text-[11px] font-bold text-black uppercase tracking-[0.3em]">
            01. Acceptance of Protocol
          </h3>
        </div>
        <p className="text-[11px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider">
          By accessing TheMotorDesk.com and initializing a user node, you
          confirm that you have read, understood, and agree to be bound by these
          governance terms. Failure to comply with system protocols may result
          in immediate access termination.
        </p>
      </section>

      {/* --- 02. Subscription Matrix --- */}
      <section className="mb-12 bg-[#F8FAFC] p-8 rounded-3xl border border-[#CBD5E1]">
        <div className="flex items-center gap-3 mb-6">
          <FiClock className="text-[#001F3F]" size={18} />
          <h3 className="text-[11px] font-bold text-black uppercase tracking-[0.3em]">
            02. Subscription & 7-Day Trial
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TermsFeature
            title="Full Access"
            desc="Experience all core tools with zero commitment for exactly 168 hours."
          />
          <TermsFeature
            title="Auto Activation"
            desc="Selected plans activate automatically via the billing layer after trial expiry."
          />
          <TermsFeature
            title="Credential Security"
            desc="Users are strictly prohibited from sharing login tokens or scraping platform data."
          />
        </div>
      </section>

      {/* --- 03. Affiliate Management (Reference Bounce) --- */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <FiUsers className="text-[#001F3F]" size={18} />
          <h3 className="text-[11px] font-bold text-black uppercase tracking-[0.3em]">
            03. Referral Program (Reference Bounce)
          </h3>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
          Effective Date: November 18, 2025
        </p>

        {/* Yield Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-4 border border-green-100 bg-green-50 rounded-xl">
            <p className="text-[11px] font-black text-green-700 uppercase tracking-tighter">
              Standard Node: ₹100/Mo Rewards
            </p>
          </div>
          <div className="p-4 border border-blue-100 bg-blue-50 rounded-xl">
            <p className="text-[11px] font-black text-blue-700 uppercase tracking-tighter">
              Premium Node: ₹200/Mo Rewards
            </p>
          </div>
        </div>

        <ul className="space-y-4">
          <TermsList
            icon={<FiShield />}
            text="Eligibility: Open to active, paying customers maintaining nodes in good standing."
          />
          <TermsList
            icon={<FiCheckCircle />}
            text="Verification: Annual rewards (₹1,200-2,400) credited after 12-month purchase audit."
          />
          <TermsList
            icon={<FiActivity />}
            text="Settlement: Minimum payout threshold is ₹100 via UPI or Bank Transfer."
          />
        </ul>
      </section>

      {/* --- 04. Fraud Prevention Terminal --- */}
      <div className="bg-red-50 p-8 rounded-3xl border border-red-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 text-red-900">
          <FiAlertOctagon size={80} />
        </div>
        <h4 className="text-red-700 font-black uppercase text-[11px] tracking-[0.3em] mb-4 flex items-center gap-2">
          <FiShield /> Anti-Fraud Protocol
        </h4>
        <p className="text-red-600 text-[11px] font-bold uppercase tracking-widest leading-relaxed relative z-10">
          Self-referrals, duplicate node creation, or manipulation of unique
          referral codes results in immediate account suspension and total
          forfeiture of all accrued earnings. The MotorDesk uses real-time
          monitoring to detect fraudulent acquisition patterns.
        </p>
      </div>

      {/* --- Footer Note --- */}
      <div className="text-center pt-12 border-t border-slate-100 mt-16">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.5em]">
          Abacco Technology DBA MotorDesk Ecosystem
        </p>
      </div>
    </div>
  );
};

// --- Atomic Components ---
const TermsFeature = ({ title, desc }) => (
  <div className="space-y-2">
    <p className="text-[10px] font-black text-black uppercase tracking-widest underline decoration-[#001F3F] decoration-2 underline-offset-4">
      {title}
    </p>
    <p className="text-[11px] font-medium text-slate-500 leading-relaxed uppercase tracking-tight italic">
      {desc}
    </p>
  </div>
);

const TermsList = ({ icon, text }) => (
  <li className="flex items-center gap-3">
    <div className="text-[#001F3F]">
      {React.cloneElement(icon, { size: 14 })}
    </div>
    <span className="text-[11px] font-bold text-black uppercase tracking-tight">
      {text}
    </span>
  </li>
);

export default TermsOfService;
