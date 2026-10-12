import React, { useState, useEffect } from "react";
import { FiCopy, FiCheck, FiShield, FiUser, FiActivity } from "react-icons/fi";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Profile = () => {
  const [partner, setPartner] = useState({
    name: "",
    email: "",
    phone: "",
    upiId: "",
    address: "",
    referralCode: "",
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("partnerToken");
        const res = await axios.get(`${API_URL}/api/partner/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPartner(res.data);
      } catch (err) {
        toast.error("Data synchronization failed");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(partner.referralCode);
    setCopied(true);
    toast.success("Code secured to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const token = localStorage.getItem("partnerToken");
      await axios.put(
        `${API_URL}/api/partner/profile`,
        {
          name: partner.name,
          phone: partner.phone,
          upiId: partner.upiId,
          address: partner.address,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Identity updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Modification rejected");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <FiActivity className="text-[#001F3F] animate-pulse text-4xl" />
        <p className="text-black font-bold uppercase tracking-widest text-[11px]">
          Syncing Workspace...
        </p>
      </div>
    );

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-500">
      <Toaster position="top-right" />

      {/* --- Page Header --- */}
      <div className="flex justify-between items-end border-b border-[#CBD5E1] pb-5">
        <div>
          <span className="text-black font-bold text-[11px] tracking-widest uppercase">
            Control Panel
          </span>
          <h2 className="text-2xl font-bold text-[#001F3F] mt-1 tracking-tight">
            Identity & Payouts
          </h2>
        </div>
      </div>

      {/* --- Referral Identity Card --- */}
      <div className="bg-[#001F3F] rounded-xl shadow-lg p-6 md:p-8 text-white relative overflow-hidden border border-[#1E3A8A]/30">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-3 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20">
              <FiActivity size={24} className="text-white" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-blue-300 font-bold uppercase tracking-widest text-[11px] mb-1">
                Your Referral Identity
              </p>
              <h1 className="text-3xl font-bold tracking-[0.15em]">
                {partner.referralCode}
              </h1>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-[#001F3F] px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-[11px] hover:bg-[#F0F4F8] transition-all shadow-md active:scale-95"
          >
            {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
            {copied ? "Secured" : "Copy Code"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- Profile Update Slate --- */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#CBD5E1] p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-8 border-b border-slate-100 pb-4">
            <FiUser className="text-[#001F3F]" />
            <h3 className="text-[11px] font-bold text-black uppercase tracking-widest">
              Business Profile
            </h3>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { label: "Legal Full Name", val: partner.name, key: "name" },
                { label: "Contact Phone", val: partner.phone, key: "phone" },
                { label: "Payout ID (UPI)", val: partner.upiId, key: "upiId" },
              ].map((f) => (
                <div key={f.key} className="space-y-1.5 group">
                  <label className="text-[11px] font-bold text-black uppercase tracking-widest">
                    {f.label}
                  </label>
                  <input
                    type="text"
                    value={f.val}
                    onChange={(e) =>
                      setPartner({ ...partner, [f.key]: e.target.value })
                    }
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-3 text-black text-[11px] font-medium outline-none focus:bg-white focus:border-[#001F3F] transition-all"
                  />
                </div>
              ))}

              <div className="space-y-1.5 opacity-60">
                <label className="text-[11px] font-bold text-black uppercase tracking-widest">
                  System Email (Fixed)
                </label>
                <input
                  type="email"
                  value={partner.email}
                  disabled
                  className="w-full bg-slate-50 border border-dashed border-[#CBD5E1] text-slate-500 text-[11px] font-medium rounded-lg px-4 py-3 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-black uppercase tracking-widest">
                Business Address
              </label>
              <textarea
                rows="3"
                value={partner.address}
                onChange={(e) =>
                  setPartner({ ...partner, address: e.target.value })
                }
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-3 text-black text-[11px] font-medium outline-none focus:bg-white focus:border-[#001F3F] transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full sm:w-auto bg-[#001F3F] text-white font-bold uppercase tracking-widest text-[11px] px-8 py-3.5 rounded-lg hover:bg-[#1E3A8A] transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              {updating ? "Committing Updates..." : "Sync Profile"}
            </button>
          </form>
        </div>

        {/* --- Security/Vault Slate --- */}
        <div className="bg-[#F8FAFC] rounded-xl border border-[#CBD5E1] p-6 md:p-8 flex flex-col shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-4">
            <FiShield className="text-[#001F3F]" />
            <h3 className="text-[11px] font-bold text-black uppercase tracking-widest">
              Vault Access
            </h3>
          </div>

          <div className="space-y-6 flex-1">
            <div className="space-y-1.5 group">
              <label className="text-[11px] font-bold text-black uppercase tracking-widest">
                Update Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-white border border-[#E2E8F0] rounded-lg px-4 py-3 text-black text-[11px] font-medium outline-none focus:border-[#001F3F] transition-all"
              />
            </div>

            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">
              * Verification will be required via email to finalize any
              credential modifications.
            </p>
          </div>

          <button className="mt-8 w-full bg-white border border-[#001F3F] text-[#001F3F] font-bold uppercase tracking-widest text-[11px] py-3.5 rounded-lg hover:bg-[#001F3F] hover:text-white transition-all shadow-sm">
            Update Security
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
