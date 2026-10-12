import React, { useState } from "react";
import {
  FiLayout,
  FiFileText,
  FiSettings,
  FiCreditCard,
  FiActivity,
  FiShield,
  FiChevronRight,
  FiUsers,
} from "react-icons/fi";

import OverviewTab from "./OverviewTab";
import InvoicesTab from "./InvoicesTab";
import ServicesTab from "./ServicesTab";
import PaymentsTab from "./PaymentsTab";
import LogsTab from "./LogsTab";
import AdminToolsTab from "./AdminToolsTab";
import ClientsTab from "./ClientsTab";

const CustomerWorkspace = ({ userId }) => {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Node Overview", icon: <FiLayout /> },
    { id: "clients", label: "Client Registry", icon: <FiUsers /> },
    { id: "invoices", label: "Billing Ledger", icon: <FiFileText /> },
    { id: "services", label: "Service History", icon: <FiSettings /> },
    { id: "payments", label: "Payment Flows", icon: <FiCreditCard /> },
    { id: "logs", label: "System Logs", icon: <FiActivity /> },
    { id: "tools", label: "Admin Override", icon: <FiShield /> },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      {/* --- Tab Navigation Protocol --- */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 mb-10 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-xl text-[11px] font-bold uppercase tracking-widest transition-all relative ${
              activeTab === tab.id
                ? "bg-[#F8FAFC] text-[#001F3F] border-x border-t border-slate-200 -mb-[1px]"
                : "text-slate-400 hover:text-[#001F3F] hover:bg-slate-50"
            }`}
          >
            {React.cloneElement(tab.icon, { size: 14 })}
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#001F3F]" />
            )}
          </button>
        ))}
      </div>

      {/* --- Breadcrumb Indicator --- */}
      <div className="flex items-center gap-2 mb-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <span>Workspace</span>
        <FiChevronRight />
        <span className="text-black">User Node: {userId}</span>
        <FiChevronRight />
        <span className="text-[#001F3F] bg-[#F8FAFC] px-2 py-0.5 rounded border border-slate-200 italic">
          {activeTab} active
        </span>
      </div>

      {/* --- Dynamic Content Rendering --- */}
      <div className="min-h-[500px]">
        {activeTab === "overview" && <OverviewTab userId={userId} />}
        {activeTab === "clients" && <ClientsTab userId={userId} />}
        {activeTab === "invoices" && <InvoicesTab userId={userId} />}
        {activeTab === "services" && <ServicesTab userId={userId} />}
        {activeTab === "payments" && <PaymentsTab userId={userId} />}
        {activeTab === "logs" && <LogsTab userId={userId} />}
        {activeTab === "tools" && <AdminToolsTab userId={userId} />}
      </div>
    </div>
  );
};

export default CustomerWorkspace;
