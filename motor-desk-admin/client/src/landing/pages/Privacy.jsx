import React from "react";
import {
  FiLock,
  FiShield,
  FiDatabase,
  FiServer,
  FiGlobe,
  FiMail,
} from "react-icons/fi";

const PrivacyPolicy = () => {
  const lastUpdated = "November 21, 2025";

  return (
    <div className="max-w-7xl lg:pt-[7rem] mx-auto py-16 px-6 animate-in fade-in duration-700">
      {/* --- Section Header --- */}
      <div className="text-center mb-16">
        <span className="text-[#001F3F] font-bold text-[11px] uppercase tracking-[0.4em] block mb-4">
          Governance & Compliance
        </span>
        <h1 className="text-4xl font-bold text-[#001F3F] tracking-tight">
          Privacy Policy.
        </h1>
        <p className="text-slate-400 mt-2 text-[11px] font-bold uppercase tracking-widest">
          Last System Audit: {lastUpdated}
        </p>
      </div>

      {/* --- Core Philosophy --- */}
      <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-8 rounded-3xl mb-12">
        <div className="flex items-center gap-3 mb-4">
          <FiShield className="text-[#001F3F]" size={20} />
          <h3 className="text-[11px] font-bold text-black uppercase tracking-[0.3em]">
            Foundational Data Ethics
          </h3>
        </div>
        <p className="text-[11px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider">
          The MotorDesk ecosystem is engineered to collect data strictly for the
          facilitation of automotive tools and data services. Every byte of
          personal information is handled with industrial-grade protection
          protocols to ensure the integrity of your workspace.
        </p>
      </div>

      {/* --- Policy Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Node 01: Information Architecture */}
        <PolicyNode
          icon={<FiServer />}
          title="01. Information Architecture"
          description="We implement high-density encryption for all stored records. Data is isolated to ensure that garage management operations remain private and secure."
        />

        {/* Node 02: Intellectual Property */}
        <PolicyNode
          icon={<FiGlobe />}
          title="02. Intellectual Property (IP)"
          description="All software, algorithms, and designs within this domain are the exclusive property of Abacco Technology. Unauthorized scraping or cloning is strictly prohibited."
        />

        {/* Node 03: Data Usage Protocol */}
        <PolicyNode
          icon={<FiDatabase />}
          title="03. Data Usage Protocol"
          description="Information is utilized to synchronize dashboards, calculate referral payouts, and provide priority support for Standard and Premium nodes."
        />

        {/* Node 04: Third-Party Interfacing */}
        <PolicyNode
          icon={<FiLock />}
          title="04. Security Interfacing"
          description="We do not sell data to third-party aggregators. External API calls are limited to essential payment processors and verified WhatsApp approval channels."
        />
      </div>

      {/* --- Security Terminal --- */}
      <div className="p-10 bg-[#001F3F] rounded-3xl text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <FiLock size={120} />
        </div>
        <div className="relative z-10 max-w-lg">
          <h4 className="text-blue-300 font-bold text-[11px] uppercase tracking-[0.4em] mb-4">
            Security Contact Terminal
          </h4>
          <p className="text-blue-100/60 text-[13px] font-medium leading-relaxed mb-8">
            Questions regarding data encryption or requests for the permanent
            deletion of a node? Please contact our compliance engineers
            directly.
          </p>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-xl inline-flex">
            <FiMail className="text-blue-300" />
            <span className="text-[11px] font-bold  tracking-widest text-white">
              support@themotordesk.com
            </span>
          </div>
        </div>
      </div>

      {/* --- Footer Note --- */}
      <div className="text-center pt-12 border-t border-slate-100">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.5em]">
          MotorDesk Privacy Framework v1.0
        </p>
      </div>
    </div>
  );
};

// --- Atomic Component ---
const PolicyNode = ({ icon, title, description }) => (
  <div className="space-y-4 group">
    <div className="flex items-center gap-3">
      <div className="text-[#001F3F] group-hover:scale-110 transition-transform duration-300">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <h3 className="text-[11px] font-bold text-black uppercase tracking-[0.3em]">
        {title}
      </h3>
    </div>
    <p className="text-[11px] font-medium text-slate-500 leading-relaxed uppercase tracking-tight italic opacity-80">
      {description}
    </p>
  </div>
);

export default PrivacyPolicy;
