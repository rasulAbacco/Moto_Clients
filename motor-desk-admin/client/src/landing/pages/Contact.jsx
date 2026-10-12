import React from "react";
import { FiMail, FiPhone, FiMapPin, FiSend, FiActivity } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Transmission Received");
  };

  return (
    <div className="space-y-24 pb-24 animate-in fade-in duration-700 pt-[7rem]">
      <Toaster position="top-right" />

      {/* --- Section Header --- */}
      <section className="text-center max-w-3xl mx-auto pt-10">
        <span className="text-[#001F3F] font-bold text-[11px] uppercase tracking-[0.4em] block mb-4">
          Communication Terminal
        </span>
        <h1 className="text-4xl font-bold text-[#001F3F] tracking-tight">
          Connect With Our <br />
          <span className="text-slate-400 font-light italic">
            Support Engineers.
          </span>
        </h1>
        <p className="text-slate-500 mt-4 text-[13px] font-medium leading-relaxed">
          Have questions about the MotorDesk ecosystem? Our team is ready to
          assist with technical deployment and partner inquiries.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* --- Unified Contact Form --- */}
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-[#CBD5E1] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#001F3F]" />

          <div className="mb-10">
            <h2 className="text-[11px] font-bold text-black uppercase tracking-[0.3em] mb-2">
              Message Protocol
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Provide incident details below
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-black uppercase tracking-widest ml-1">
                  Identity Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-black text-[11px] font-medium outline-none focus:bg-white focus:border-[#001F3F] transition-all"
                  placeholder="LEGAL FULL NAME"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-black uppercase tracking-widest ml-1">
                  Return Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-black text-[11px] font-medium outline-none focus:bg-white focus:border-[#001F3F] transition-all"
                  placeholder="ADMIN@COMPANY.COM"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-black uppercase tracking-widest ml-1">
                Subject / Inquiry
              </label>
              <input
                type="text"
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-black text-[11px] font-medium outline-none focus:bg-white focus:border-[#001F3F] transition-all"
                placeholder="TECHNICAL DEPLOYMENT"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-black uppercase tracking-widest ml-1">
                Data Body
              </label>
              <textarea
                rows="4"
                required
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-black text-[11px] font-medium outline-none focus:bg-white focus:border-[#001F3F] transition-all resize-none"
                placeholder="WRITE YOUR MESSAGE..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#001F3F] text-white py-4 rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-[#1E3A8A] transition-all shadow-xl shadow-blue-900/10 active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <FiSend /> Initialize Transmission
            </button>
          </form>
        </div>

        {/* --- Validated Contact Information --- */}
        <div className="space-y-12 py-6">
          <div className="border-l-2 border-[#CBD5E1] pl-8 py-2">
            <h3 className="text-[11px] font-bold text-black uppercase tracking-[0.4em] mb-10">
              Validated Access Points
            </h3>

            <div className="space-y-10">
              {/* Phone Node */}
              <ContactInfoItem
                icon={<FiPhone className="text-[#001F3F]" />}
                label="Direct Voice Line"
                value="+91 7795692753"
              />

              {/* Email Node */}
              <ContactInfoItem
                icon={<FiMail className="text-[#001F3F]" />}
                label="Digital Inbox"
                value="support@themotordesk.com"
              />

              {/* Address Node */}
              <ContactInfoItem
                icon={<FiMapPin className="text-[#001F3F]" />}
                label="Global Headquarters"
                value={
                  <>
                    No 12,13 & 12/A, Kirthan Arcade, <br />
                    3rd Floor, Aditya Nagar, <br />
                    Sandeep Unnikrishnan Road, Bangalore - 560097
                  </>
                }
              />
            </div>
          </div>

          {/* System Status Indicator */}
          <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-6 rounded-2xl flex items-center gap-4">
            <div className="relative">
              <FiActivity className="text-[#001F3F]" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
              Network Status: <span className="text-black">Operational</span>{" "}
              <br />
              <span className="text-[10px] text-slate-400">
                Response Window: &lt; 24 Hours
              </span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- Reusable Contact Detail Item ---
const ContactInfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-6 group cursor-pointer">
    <div className="w-12 h-12 bg-[#F8FAFC] rounded-xl flex items-center justify-center border border-[#E2E8F0] transition-all shadow-sm group-hover:bg-[#001F3F]">
      {React.cloneElement(icon, {
        size: 20,
        className:
          "text-[#001F3F] group-hover:text-white transition-colors duration-300",
      })}
    </div>

    <div>
      <p className="text-[11px] font-bold text-black uppercase tracking-widest mb-1.5 group-hover:text-[#001F3F]">
        {label}
      </p>
      <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
        {value}
      </p>
    </div>
  </div>
);

export default Contact;
