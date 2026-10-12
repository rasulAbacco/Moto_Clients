import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiUserPlus,
  FiShare2,
  FiDollarSign,
  FiTrendingUp,
  FiArrowRight,
  FiShield,
  FiCheckCircle,
  FiInfo,
} from "react-icons/fi";

const PartnerProgram = () => {
  const [activePlanTab, setActivePlanTab] = useState("monthly");

  return (
    <div className="space-y-32 pb-24 animate-in fade-in duration-700 pt-[7rem]">
      {/* --- Section Header (Hero) --- */}
      <section className="text-center max-w-4xl mx-auto pt-12 px-6">
        <span className="text-[#001F3F] font-bold text-[11px] uppercase tracking-[0.4em] block mb-4">
          Reference Bounce
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-[#001F3F] tracking-tight leading-tight">
          Share the Love, Earn Rewards, <br />
          <span className="text-slate-400 font-light italic">
            and Grow Together.
          </span>
        </h1>
        <p className="text-slate-500 mt-6 text-lg font-medium leading-relaxed max-w-2xl mx-auto">
          Get paid every month your friends stay subscribed. Unlimited
          referrals, unlimited earnings. Welcome to the Abacco Technology DBA
          The Motor Desk referral program.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/partner/register"
            className="bg-[#001F3F] text-white px-10 py-4 rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-xl shadow-blue-900/20 active:scale-95 flex items-center gap-2"
          >
            Get Started <FiArrowRight />
          </Link>
          <button className="px-10 py-4 rounded-full border border-[#CBD5E1] font-bold text-[11px] uppercase tracking-widest text-[#001F3F] hover:bg-[#F8FAFC] transition-all">
            Know More
          </button>
        </div>
        <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Effective Date: November 18, 2025
        </p>
      </section>

      {/* --- Core Metric Overview --- */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <MetricCard
          label="Per Referral Monthly"
          value="₹100-200"
          sub="Continuous Yield"
        />
        <MetricCard
          label="Referrals Allowed"
          value="Unlimited"
          sub="Scale Without Limits"
        />
        <MetricCard
          label="Annual Bonus"
          value="₹1,200-2,400"
          sub="Per Active Node"
        />
      </section>

      {/* --- Earning Possibilities (Pathways) --- */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[#001F3F] font-bold text-[11px] uppercase tracking-[0.4em] block mb-4">
            Your Potential
          </span>
          <h2 className="text-3xl font-bold text-[#001F3F] tracking-tight">
            Choose your path and maximize rewards.
          </h2>

          {/* Pathway Switcher */}
          <div className="mt-8 inline-flex bg-[#F8FAFC] p-1.5 rounded-xl border border-[#CBD5E1]">
            <button
              onClick={() => setActivePlanTab("monthly")}
              className={`px-8 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${activePlanTab === "monthly" ? "bg-[#001F3F] text-white shadow-lg" : "text-slate-500 hover:text-[#001F3F]"}`}
            >
              Monthly Plans
            </button>
            <button
              onClick={() => setActivePlanTab("annual")}
              className={`px-8 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${activePlanTab === "annual" ? "bg-[#001F3F] text-white shadow-lg" : "text-slate-500 hover:text-[#001F3F]"}`}
            >
              Annual Plans
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plan 1 */}
          <div className="bg-white border border-[#CBD5E1] rounded-2xl p-8 hover:border-[#001F3F] transition-all group">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[11px] font-bold text-black uppercase tracking-widest">
                Standard Plan
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                ₹2,000 /Mo
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              You Earn {activePlanTab === "monthly" ? "Per Month" : "Upfront"}
            </p>
            <h3 className="text-4xl font-black text-[#001F3F] mb-8">
              ₹{activePlanTab === "monthly" ? "100" : "1,200"}
            </h3>
            <ul className="space-y-4 border-t border-slate-100 pt-6 mb-8">
              <li className="flex items-center gap-2 text-[11px] font-bold text-black uppercase tracking-tight">
                <FiCheckCircle className="text-green-500" /> Basic Features
              </li>
              <li className="flex items-center gap-2 text-[11px] font-bold text-black uppercase tracking-tight">
                <FiCheckCircle className="text-green-500" />{" "}
                {activePlanTab === "monthly"
                  ? "Monthly Rewards"
                  : "Lump Sum Reward"}
              </li>
              <li className="flex items-center gap-2 text-[11px] font-bold text-black uppercase tracking-tight">
                <FiCheckCircle className="text-green-500" /> Standard Support
              </li>
            </ul>
            <Link
              to="/partner/register"
              className="block w-full text-center bg-[#F8FAFC] text-[#001F3F] py-4 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#001F3F] hover:text-white transition-all"
            >
              Begin Referral
            </Link>
          </div>

          {/* Plan 2 */}
          <div className="bg-white border-2 border-[#001F3F] rounded-2xl p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-[#001F3F] text-white px-4 py-1 rounded-bl-xl text-[9px] font-bold uppercase tracking-widest">
              Popular
            </div>
            <div className="flex justify-between items-start mb-6">
              <span className="text-[11px] font-bold text-black uppercase tracking-widest">
                Premium Plan
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                ₹3,000 /Mo
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              You Earn {activePlanTab === "monthly" ? "Per Month" : "Upfront"}
            </p>
            <h3 className="text-4xl font-black text-[#001F3F] mb-8">
              ₹{activePlanTab === "monthly" ? "200" : "2,400"}
            </h3>
            <ul className="space-y-4 border-t border-slate-100 pt-6 mb-8">
              <li className="flex items-center gap-2 text-[11px] font-bold text-black uppercase tracking-tight">
                <FiCheckCircle className="text-green-500" /> All Features
              </li>
              <li className="flex items-center gap-2 text-[11px] font-bold text-black uppercase tracking-tight">
                <FiCheckCircle className="text-green-500" /> Higher Rewards
              </li>
              <li className="flex items-center gap-2 text-[11px] font-bold text-black uppercase tracking-tight">
                <FiCheckCircle className="text-green-500" /> Priority Support
              </li>
            </ul>
            <Link
              to="/partner/register"
              className="block w-full text-center bg-[#001F3F] text-white py-4 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#1E3A8A] transition-all"
            >
              Begin Referral
            </Link>
          </div>
        </div>
      </section>

      {/* --- Program Guidelines (The Fine Print) --- */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-3xl p-8 md:p-16">
          <div className="flex items-center gap-3 mb-12 border-b border-slate-200 pb-6">
            <FiShield className="text-[#001F3F]" size={24} />
            <div>
              <h2 className="text-[11px] font-bold text-black uppercase tracking-[0.4em]">
                Program Guidelines
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">
                Governance & Compliance Protocols
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <GuidelineBox
              number="01"
              title="Eligibility"
              items={[
                "Open to all active, paying customers",
                "Must have Standard/Premium subscription",
                "Maintain good account standing",
              ]}
            />
            <GuidelineBox
              number="02"
              title="Unique ID"
              items={[
                "Receive a unique referral ID upon entry",
                "ID must be entered during sign-up",
                "No retroactive applications permitted",
              ]}
            />
            <GuidelineBox
              number="03"
              title="Criteria"
              items={[
                "Referred customer must be new node",
                "Plan must be Standard or Premium",
                "Strictly no self-referrals allowed",
              ]}
            />
            <GuidelineBox
              number="04"
              title="Payouts"
              items={[
                "UPI / Bank / Wallet transfers",
                "Monthly for monthly plans",
                "Upfront for annual purchases",
                "Minimum threshold: ₹100",
              ]}
            />
            <GuidelineBox
              number="05"
              title="Scale"
              items={[
                "No limit on total referrals",
                "Earnings multiply with each active node",
                "Example: 10 Premium = ₹2,000/mo",
              ]}
            />
            <GuidelineBox
              number="06"
              title="Fraud Control"
              items={[
                "No duplicate or manipulated accounts",
                "Account suspension for code misuse",
                "Real-time monitoring for compliance",
              ]}
            />
          </div>

          <div className="mt-16 p-6 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4">
            <FiInfo className="text-red-500 mt-1 shrink-0" />
            <p className="text-[10px] font-bold text-red-700 uppercase leading-relaxed tracking-widest">
              Important: Violation of self-referral or fraud policies results in
              immediate account termination. Abacco Technology may modify terms
              at its discretion with prior notification.
            </p>
          </div>
        </div>
      </section>

      {/* --- Final CTA --- */}
      <section className="text-center max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-[#001F3F] tracking-tight mb-4">
          Ready to Start Earning?
        </h2>
        <p className="text-slate-500 font-medium text-[13px] mb-10">
          Get your unique referral code and start sharing the Motor Desk
          experience today.
        </p>
        <Link
          to="/partner/register"
          className="bg-[#001F3F] text-white px-12 py-5 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-[#1E3A8A] transition-all shadow-2xl"
        >
          Get Your Referral Code
        </Link>
      </section>
    </div>
  );
};

// --- Sub Components ---

const MetricCard = ({ label, value, sub }) => (
  <div className="bg-white border border-[#CBD5E1] p-8 rounded-2xl text-center hover:border-[#001F3F] transition-all group">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
      {label}
    </p>
    <h3 className="text-3xl font-black text-[#001F3F] mb-1">{value}</h3>
    <p className="text-[9px] font-bold text-green-600 uppercase tracking-widest">
      {sub}
    </p>
  </div>
);

const GuidelineBox = ({ number, title, items }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-black text-[#001F3F] opacity-20">
        {number}
      </span>
      <h4 className="text-[11px] font-bold text-black uppercase tracking-widest">
        {title}
      </h4>
    </div>
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          key={i}
          className="text-[10px] font-medium text-slate-500 leading-relaxed"
        >
          • {item}
        </li>
      ))}
    </ul>
  </div>
);

export default PartnerProgram;
