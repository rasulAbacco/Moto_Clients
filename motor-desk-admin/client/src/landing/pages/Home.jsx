import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiSettings,
  FiUsers,
  FiDollarSign,
  FiArrowRight,
  FiCpu,
  FiCheckCircle,
  FiZap,
  FiStar,
} from "react-icons/fi";
import { GiQueenCrown } from "react-icons/gi";

import HeroSection from "../components/HeroSection";

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("car");

  // --- Plan Data Structures ---
  const carPlans = [
    {
      id: "basic",
      name: "Basic",
      tagline: "Small Garages",
      price: 1000,
      icon: <FiZap />,
      features: [
        "Upload RC (10/day)",
        "Basic OCR extraction",
        "Local history save",
        "CSV/PDF Export",
        "Email Support",
      ],
    },
    {
      id: "standard",
      name: "Standard",
      tagline: "Most Popular",
      price: 2000,
      icon: <FiStar />,
      badge: "POPULAR",
      features: [
        "Unlimited Uploads",
        "High-accuracy OCR",
        "Priority Support",
        "SMS/WhatsApp Alerts",
        "Team (up to 3)",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      tagline: "Growing Business",
      price: 3000,
      icon: <GiQueenCrown />,
      badge: "BEST VALUE",
      features: [
        "Everything in Standard",
        "Team (up to 10)",
        "Bulk processing",
        "Auto Invoice",
        "Staff Salary Mgmt",
      ],
    },
  ];

  const bikePlans = [
    {
      id: "basic",
      name: "Basic",
      tagline: "Small Garages",
      price: 600,
      icon: <FiZap />,
      features: [
        "Upload RC (10/day)",
        "Basic OCR extraction",
        "Local history save",
        "CSV/PDF Export",
        "Email Support",
      ],
    },
    {
      id: "standard",
      name: "Standard",
      tagline: "Professional",
      price: 1200,
      icon: <FiStar />,
      badge: "POPULAR",
      features: [
        "Unlimited Uploads",
        "High-accuracy OCR",
        "Priority Support",
        "SMS/WhatsApp Alerts",
        "Team (up to 3)",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      tagline: "Growing Business",
      price: 2000,
      icon: <GiQueenCrown />,
      badge: "BEST VALUE",
      features: [
        "Everything in Standard",
        "Team (up to 10)",
        "Maintenance Alerts",
        "Dedicated Manager",
        "Auto Invoice",
      ],
    },
  ];

  const washingPlans = [
    {
      id: "standard",
      name: "Standard",
      tagline: "Popular Choice",
      price: 500,
      icon: <FiStar />,
      badge: "POPULAR",
      features: [
        "Unlimited Uploads",
        "Priority Support",
        "Export CSV/PDF",
        "WhatsApp Alerts",
        "Team (up to 3)",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      tagline: "High Volume",
      price: 1000,
      icon: <GiQueenCrown />,
      badge: "BEST VALUE",
      features: [
        "Everything in Standard",
        "Team (up to 10)",
        "Bulk Processing",
        "Auto Invoice",
        "Online Payments",
      ],
    },
  ];

  const getActivePlans = () => {
    if (activeCategory === "car") return carPlans;
    if (activeCategory === "bike") return bikePlans;
    return washingPlans;
  };

  return (
    <div className="space-y-32 pb-24 pt-[7rem]">
      <HeroSection />

      {/* --- Feature Intelligence Hub --- */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="text-[#001F3F] font-bold text-[11px] uppercase tracking-[0.4em] block mb-3">
              Core Architecture
            </span>
            <h2 className="text-4xl font-bold text-[#001F3F] tracking-tight">
              Engineered for Service Excellence.
            </h2>
          </div>
          <p className="text-slate-500 text-[13px] font-medium max-w-sm">
            Our modular system adapts to your workflow, providing deep insights
            into every service job and transaction.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<FiSettings />}
            title="Service Management"
            desc="Real-time tracking of service lifecycles, progress milestones, and automated digital approvals."
          />
          <FeatureCard
            icon={<FiUsers />}
            title="Resource Allocation"
            desc="Comprehensive staff profiles, efficiency metrics, and automated payroll for your mechanical teams."
          />
          <FeatureCard
            icon={<FiDollarSign />}
            title="Financial Ledger"
            desc="Generate precision-grade invoices and track revenue streams with granular reporting tools."
          />
        </div>
      </section>

      {/* --- Modular Deployment Plans (Updated with your data) --- */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-[#001F3F] font-bold text-[11px] uppercase tracking-[0.4em] block mb-4">
            Deployment Hub
          </span>
          <h2 className="text-4xl font-bold text-[#001F3F] tracking-tight">
            Select Your Infrastructure.
          </h2>

          {/* Category Switcher */}
          <div className="mt-8 inline-flex bg-[#F8FAFC] p-1 rounded-xl border border-[#CBD5E1]">
            {["car", "bike", "washing"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${activeCategory === cat ? "bg-[#001F3F] text-white shadow-lg" : "text-slate-500 hover:text-[#001F3F]"}`}
              >
                {cat} Plans
              </button>
            ))}
          </div>
        </div>

        <div
          className={`grid grid-cols-1 gap-8 ${activeCategory === "washing" ? "md:grid-cols-2 max-w-4xl mx-auto" : "md:grid-cols-3"}`}
        >
          {getActivePlans().map((plan) => (
            <HomePricingCard
              key={plan.id}
              icon={plan.icon}
              title={plan.name}
              tagline={plan.tagline}
              price={plan.price}
              badge={plan.badge}
              features={plan.features}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="https://themotordesk.com/pricing"
            className="text-[11px] font-bold text-[#001F3F] uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-70 transition-opacity"
          >
            Review Full Capabilities <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* --- Final CTA --- */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-[#001F3F] rounded-3xl text-white p-12 md:p-20 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <FiCpu className="w-full h-full text-white translate-x-1/4 translate-y-1/4" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <span className="text-blue-300 font-bold text-[11px] uppercase tracking-[0.5em] block mb-6">
              System Initialization
            </span>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
              Ready to synchronize your garage <br /> with the modern ecosystem?
            </h2>
            <p className="mt-8 text-blue-100/60 text-lg font-medium leading-relaxed">
              Join a network of elite service providers. Start your 7-day
              operational trial today. No credit card required.
            </p>
            <div className="mt-12 flex flex-wrap gap-6">
              <Link
                to="https://themotordesk.com/pricing"
                className="bg-white text-[#001F3F] px-10 py-4 rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl active:scale-95"
              >
                Start Free Trial
              </Link>
              <Link
                to="https://themotordesk.com/"
                className="flex items-center gap-2 text-white px-8 py-4 rounded-full font-bold text-[11px] uppercase tracking-widest border border-white/20 hover:bg-white/5 transition-all"
              >
                Schedule Demo <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- Custom Internal Card for Home ---
const HomePricingCard = ({ icon, title, tagline, price, features, badge }) => (
  <div
    className={`bg-white p-8 rounded-2xl border ${badge ? "border-[#001F3F] ring-1 ring-[#001F3F]" : "border-[#CBD5E1]"} shadow-sm hover:shadow-xl transition-all group relative`}
  >
    {badge && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#001F3F] text-white px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">
        {badge}
      </div>
    )}
    <div className="w-12 h-12 bg-[#F8FAFC] text-[#001F3F] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#001F3F] group-hover:text-white transition-all shadow-sm">
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div className="mb-6">
      <h3 className="text-[11px] font-bold text-black uppercase tracking-[0.2em]">
        {title}
      </h3>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
        {tagline}
      </p>
    </div>
    <div className="flex items-baseline gap-1 mb-8">
      <span className="text-3xl font-black text-[#001F3F]">₹{price}</span>
      <span className="text-[11px] font-bold text-slate-400 uppercase">
        /Mo
      </span>
    </div>
    <ul className="space-y-4 mb-10">
      {features.map((f, i) => (
        <li
          key={i}
          className="flex items-start gap-3 text-[11px] font-bold text-black uppercase tracking-tight leading-tight"
        >
          <FiCheckCircle className="text-green-500 shrink-0 mt-0.5" size={14} />{" "}
          {f}
        </li>
      ))}
    </ul>
    <Link
      to="https://themotordesk.com/pricing"
      className={`block w-full text-center py-4 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${badge ? "bg-[#001F3F] text-white hover:bg-[#1E3A8A]" : "bg-[#F8FAFC] text-[#001F3F] hover:bg-slate-100"}`}
    >
      Initialize {title}
    </Link>
  </div>
);

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white p-8 rounded-2xl border border-[#CBD5E1] shadow-sm hover:border-[#001F3F] transition-all group">
    <div className="w-12 h-12 bg-[#F8FAFC] text-[#001F3F] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#001F3F] group-hover:text-white transition-all shadow-sm">
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <h3 className="text-[11px] font-bold text-black uppercase tracking-[0.2em] mb-3">
      {title}
    </h3>
    <p className="text-slate-500 text-[13px] leading-relaxed font-medium">
      {desc}
    </p>
  </div>
);

export default Home;
