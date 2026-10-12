import React from "react";
import {
  FiCalendar,
  FiFileText,
  FiBell,
  FiCreditCard,
  FiPackage,
  FiHeadphones,
  FiActivity,
} from "react-icons/fi";

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-8 rounded-xl border border-[#CBD5E1] shadow-sm hover:border-[#001F3F] transition-all group">
      {/* Icon Container - 11px Design System Theme */}
      <div className="w-12 h-12 bg-[#F8FAFC] text-[#001F3F] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#001F3F] group-hover:text-white transition-all shadow-sm">
        {React.cloneElement(icon, { size: 24 })}
      </div>

      {/* Header - 11px Bold Black */}
      <h3 className="text-[11px] font-bold text-black uppercase tracking-[0.2em] mb-3">
        {title}
      </h3>

      {/* Description - Normalized Medium Text */}
      <p className="text-slate-500 text-[13px] leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
};

const Features = () => {
  return (
    <div className="space-y-24 py-12 animate-in fade-in duration-700 pt-[7rem]">
      {/* --- Section Header --- */}
      <section className="text-center max-w-3xl mx-auto px-6">
        <span className="text-[#001F3F] font-bold text-[11px] uppercase tracking-[0.4em] block mb-4">
          Core Architecture
        </span>
        <h1 className="text-4xl font-bold text-[#001F3F] tracking-tight">
          Everything You Need to <br />
          <span className="text-slate-400 font-light italic">
            Run Your Garage.
          </span>
        </h1>
        <p className="text-slate-500 mt-4 text-[13px] font-medium leading-relaxed">
          Comprehensive tools designed specifically for modern automotive
          workshops.
        </p>
      </section>

      {/* --- Feature Intelligence Grid --- */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <FeatureCard
          icon={<FiCalendar />}
          title="Smart Scheduling"
          description="AI-powered appointment system that maximizes your bay utilization."
        />

        <FeatureCard
          icon={<FiFileText />}
          title="Digital Invoicing"
          description="Create and send professional invoices in seconds."
        />

        <FeatureCard
          icon={<FiBell />}
          title="Automated Reminders"
          description="Never miss a service appointment with smart notifications."
        />

        <FeatureCard
          icon={<FiCreditCard />}
          title="Payment Processing"
          description="Accept all payment methods with integrated POS."
        />

        <FeatureCard
          icon={<FiPackage />}
          title="Inventory Management"
          description="Track parts and supplies with automatic reorder alerts."
        />

        <FeatureCard
          icon={<FiHeadphones />}
          title="24/7 Support"
          description="Get help whenever you need it from our expert team."
        />
      </section>

      {/* --- Performance Indicator Footer --- */}
      <section className="max-w-4xl mx-auto px-6 text-center">
        <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-center gap-4">
          <FiActivity className="text-[#001F3F]" />
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
            All modules are synchronized with the
            <span className="text-black ml-1">MotorDesk Real-Time Cloud.</span>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Features;
