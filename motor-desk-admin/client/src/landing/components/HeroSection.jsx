import React from "react";
import { Link } from "react-router-dom";
import {
  FiCheckCircle,
  FiArrowRight,
  FiActivity,
  FiZap,
  FiDollarSign,
} from "react-icons/fi";

const HeroSection = () => {
  return (
    <section className="relative pt-20 pb-24 overflow-hidden">
      {/* --- Ambient Background Elements --- */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50/50 to-transparent z-[-1]" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* --- Left Content: Value Proposition --- */}
        <div className="animate-in fade-in slide-in-from-left-8 duration-1000 ease-out">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F0F4F8] border border-[#CBD5E1] rounded-full mb-6">
            <FiZap className="text-[#001F3F]" size={12} />
            <span className="text-[11px] font-bold text-[#001F3F] uppercase tracking-widest">
              v1.0 Performance Update Live
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-[#001F3F] leading-[1.1] tracking-tight">
            The Operating System <br />
            <span className="text-slate-400 font-light italic">
              for Modern Garages.
            </span>
          </h1>

          <p className="text-slate-600 mt-8 text-lg md:text-xl leading-relaxed max-w-xl">
            A precision-engineered CRM to manage bike, car, and washing
            services. Automate your workflow, from WhatsApp approvals to partner
            settlements.
          </p>

          {/* Features Checklist - 11px System */}
          <div className="mt-10 space-y-4">
            {[
              "Automated Service & Invoice Ledger",
              "One-Click WhatsApp Approval Flow",
              "Integrated Referral & Revenue Network",
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 group">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                  <FiCheckCircle
                    className="text-green-600 group-hover:text-white transition-colors"
                    size={14}
                  />
                </div>
                <span className="text-[11px] font-bold text-black uppercase tracking-widest">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Group */}
          <div className="mt-12 flex flex-wrap gap-5">
            <Link
              to="/partner/register"
              className="flex items-center gap-3 bg-[#001F3F] text-white px-8 py-4 rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-xl shadow-blue-900/20 active:scale-95"
            >
              Initialize Network <FiArrowRight />
            </Link>

            <Link
              to="/pricing"
              className="px-8 py-4 rounded-full border border-[#CBD5E1] font-bold text-[11px] uppercase tracking-widest text-[#001F3F] hover:bg-[#F0F4F8] transition-all"
            >
              Explore Plans
            </Link>
          </div>
        </div>

        {/* --- Right Content: Floating Mock Dashboard --- */}
        <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-200">
          {/* Decorative Back Elements */}
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl" />

          {/* Main Mock Interface */}
          <div className="relative bg-white border border-[#CBD5E1] rounded-2xl shadow-2xl overflow-hidden animate-float">
            {/* Window Header */}
            <div className="bg-[#F8FAFC] border-b border-[#CBD5E1] px-4 py-3 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <div className="flex items-center gap-2">
                <FiActivity className="text-[#001F3F]" size={12} />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  System_Live.exe
                </span>
              </div>
            </div>

            {/* Content Mockup */}
            <div className="p-8 space-y-6 bg-gradient-to-b from-white to-slate-50">
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <div className="h-2 w-20 bg-slate-200 rounded" />
                  <div className="h-6 w-32 bg-[#001F3F] rounded" />
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-lg" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 bg-white border border-dashed border-slate-200 rounded-xl p-4 flex flex-col justify-end">
                  <div className="h-2 w-12 bg-slate-100 rounded mb-2" />
                  <div className="h-3 w-20 bg-green-100 rounded" />
                </div>
                <div className="h-24 bg-white border border-dashed border-slate-200 rounded-xl p-4 flex flex-col justify-end">
                  <div className="h-2 w-12 bg-slate-100 rounded mb-2" />
                  <div className="h-3 w-16 bg-blue-100 rounded" />
                </div>
              </div>

              <div className="h-32 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-[#001F3F]" />
                  </div>
                  <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                    Processing Registry...
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Small Secondary Floating Element */}
          <div className="absolute -bottom-6 -left-6 bg-white border border-[#CBD5E1] p-4 rounded-xl shadow-xl animate-float-delayed hidden md:block">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white">
                <FiDollarSign size={16} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">
                  Settlement
                </p>
                <p className="text-sm font-bold text-[#001F3F]">₹1,24,500.00</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Custom CSS for Float --- */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 5s ease-in-out infinite; delay: 1s; }
      `}</style>
    </section>
  );
};

export default HeroSection;
