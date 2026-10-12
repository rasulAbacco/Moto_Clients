import React, { useState } from "react";
import {
  FiZap,
  FiStar,
  FiCheck,
  FiInfo,
  FiActivity,
  FiGift,
  FiAward,
} from "react-icons/fi";
import { GiQueenCrown } from "react-icons/gi";

const Pricing = () => {
  const [activeTab, setActiveTab] = useState("car");
  const [isYearly, setIsYearly] = useState(false);

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
    if (activeTab === "car") return carPlans;
    if (activeTab === "bike") return bikePlans;
    return washingPlans;
  };

  return (
    <div className="space-y-16 pb-24 animate-in fade-in duration-700 pt-[7rem]">
      {/* --- Section Header --- */}
      <section className="text-center max-w-3xl mx-auto pt-10 px-6">
        <span className="text-[#001F3F] font-bold text-[11px] uppercase tracking-[0.4em] block mb-4">
          Infrastructure Costs
        </span>
        <h1 className="text-4xl font-bold text-[#001F3F] tracking-tight">
          Flexible Pricing for <br /> Every Service Type.
        </h1>

        {/* --- Hardware Promotion Banner (Visible for Car/Bike Yearly) --- */}
        {/* --- Hardware Promotion Banner (Explicitly for Car/Bike Yearly) --- */}
        <div className="mt-10 animate-in zoom-in duration-500">
          <div className="bg-[#001F3F] text-white p-6 rounded-3xl border-2 border-blue-400/30 relative overflow-hidden shadow-2xl shadow-blue-900/40">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <FiGift size={120} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <FiAward size={24} className="text-white" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full mb-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.15em]">
                      Limited Time Offer
                    </span>
                  </div>
                  <h2 className="text-xl font-bold">
                    Premium Hardware Synchronization
                  </h2>
                  {/* Updated text to clarify CRM modules */}
                  <p className="text-blue-200 text-[11px] font-bold uppercase tracking-widest mt-1">
                    Activate <span className="text-white">Yearly Premium</span>{" "}
                    for
                    <span className="text-white"> Car or Bike CRM</span> to
                    receive a{" "}
                    <span className="text-amber-400">
                      Lenovo Tab (₹12,500 Value)
                    </span>{" "}
                    free of cost.
                  </p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest text-center">
                  Equipment Status
                </p>
                <p className="text-lg font-bold text-white uppercase tracking-tight italic">
                  Complimentary
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- Toggle & Tabs Wrapper --- */}
        <div className="mt-12 flex flex-col items-center gap-8">
          <div className="inline-flex bg-[#F8FAFC] p-1.5 rounded-xl border border-[#CBD5E1]">
            {[
              { id: "car", label: "Car CRM" },
              { id: "bike", label: "Bike CRM" },
              { id: "washing", label: "Washing CRM" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab.id
                    ? "bg-[#001F3F] text-white shadow-lg"
                    : "text-slate-500 hover:text-[#001F3F]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <span
              className={`text-[11px] font-bold uppercase tracking-widest ${!isYearly ? "text-black" : "text-slate-400"}`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="w-12 h-6 bg-[#001F3F] rounded-full relative p-1 transition-all"
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-all ${isYearly ? "ml-6" : "ml-0"}`}
              />
            </button>
            <span
              className={`text-[11px] font-bold uppercase tracking-widest ${isYearly ? "text-black" : "text-slate-400"}`}
            >
              Yearly <span className="text-green-600 ml-1">(Save 20%)</span>
            </span>
          </div>
        </div>
      </section>

      {/* --- Pricing Cards Grid --- */}
      <section
        className={`grid grid-cols-1 gap-8 max-w-7xl mx-auto px-6 ${activeTab === "washing" ? "md:grid-cols-2 max-w-4xl" : "md:grid-cols-3"}`}
      >
        {getActivePlans().map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white border ${plan.badge ? "border-[#001F3F] ring-1 ring-[#001F3F]" : "border-[#CBD5E1]"} rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all group`}
          >
            {/* Hardware Tag for Premium Yearly Car/Bike */}
            {isYearly &&
              plan.id === "premium" &&
              (activeTab === "car" || activeTab === "bike") && (
                <div className="absolute -top-3 right-6 bg-red-600 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                  + Free Lenovo Tab
                </div>
              )}

            {plan.badge && (
              <div className="absolute -top-3 left-6 bg-[#001F3F] text-white px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">
                {plan.badge}
              </div>
            )}

            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-[#F8FAFC] text-[#001F3F] rounded-xl group-hover:bg-[#001F3F] group-hover:text-white transition-colors">
                {plan.icon}
              </div>
              <div className="text-right">
                <h3 className="text-[11px] font-bold text-black uppercase tracking-widest">
                  {plan.name}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  {plan.tagline}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[#001F3F]">
                  ₹
                  {isYearly
                    ? (plan.price * 10).toLocaleString()
                    : plan.price.toLocaleString()}
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  /{isYearly ? "Year" : "Month"}
                </span>
              </div>
            </div>

            <ul className="space-y-4 mb-10">
              {plan.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <FiCheck
                    className="text-green-500 mt-0.5 shrink-0"
                    size={14}
                  />
                  <span className="text-[11px] font-bold text-black uppercase tracking-tight leading-tight">
                    {feat}
                  </span>
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                plan.badge
                  ? "bg-[#001F3F] text-white hover:bg-[#1E3A8A] shadow-lg"
                  : "bg-white border border-[#CBD5E1] text-[#001F3F] hover:bg-slate-50"
              }`}
            >
              Initialize {plan.name}
            </button>
          </div>
        ))}
      </section>

      {/* --- Policy Disclaimer --- */}
      <section className="max-w-4xl mx-auto px-6 text-center">
        <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-center gap-4">
          <FiInfo className="text-[#001F3F]" />
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
            All plans include SSL Encryption, automated backups, and 99.9%
            uptime SLA.
            <span className="text-black ml-1">
              GST not included in listed prices.
            </span>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
