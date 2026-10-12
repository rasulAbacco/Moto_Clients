import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiMapPin,
  FiCreditCard,
  FiArrowLeft,
  FiEye,
  FiEyeOff,
  FiActivity,
} from "react-icons/fi";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    upiId: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword)
      return toast.error("Passwords do not match");
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/partner/register`, formData);
      toast.success("Account created successfully!");
      setTimeout(() => navigate("/partner/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-6 md:p-12 font-sans text-[#1E293B] antialiased">
      <Toaster position="top-center" />

      {/* --- Navigation --- */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-8 left-8 flex items-center gap-2 text-[#001F3F] font-bold text-[11px] uppercase tracking-wider transition-all hover:opacity-70"
      >
        <FiArrowLeft size={14} />
        <span>Exit to Website</span>
      </button>

      <div className="w-full max-w-6xl bg-white flex flex-col md:flex-row border border-[#CBD5E1] shadow-2xl overflow-hidden rounded-3xl min-h-[720px]">
        {/* --- Left Branding Panel --- */}
        <div className="md:w-85 bg-gradient-to-br from-[#001F3F] to-[#1E3A8A] p-12 flex flex-col justify-between text-white relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="p-2.5 bg-blue-500 rounded-xl">
                <FiActivity className="text-xl text-white" />
              </div>
              <span className="font-bold tracking-tight text-2xl">
                MotorDesk
              </span>
            </div>

            <h2 className="text-4xl font-extrabold leading-tight mb-6">
              Start Your <br />
              <span className="text-blue-300 font-bold italic">
                Referral Journey.
              </span>
            </h2>
            <p className="text-blue-100/70 text-[11px] leading-relaxed max-w-[220px] uppercase tracking-wide">
              Access the most advanced automotive dashboard in the ecosystem.
            </p>
          </div>

          <div className="text-[11px] font-bold tracking-[0.3em] text-blue-200/50 uppercase">
            Official Network v1.0
          </div>
        </div>

        {/* --- Main Registration Form --- */}
        <div className="flex-1 p-8 md:p-16 bg-white">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-[#001F3F] tracking-tight">
              Referral User Enrollment
            </h1>
            <p className="text-[11px] text-slate-500 mt-2 font-bold uppercase tracking-widest">
              Join our referral network and start earning rewards.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {[
                {
                  label: "Full Name",
                  name: "name",
                  icon: <FiUser />,
                  type: "text",
                },
                {
                  label: "Business Email",
                  name: "email",
                  icon: <FiMail />,
                  type: "email",
                },
                {
                  label: "Contact Phone",
                  name: "phone",
                  icon: <FiPhone />,
                  type: "text",
                },
                {
                  label: "UPI ID",
                  name: "upiId",
                  icon: <FiCreditCard />,
                  type: "text",
                },
              ].map((f) => (
                <div key={f.name} className="space-y-1.5">
                  <label className="text-[11px] font-bold text-black uppercase tracking-widest">
                    {f.label}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      {f.icon}
                    </div>
                    <input
                      {...f}
                      value={formData[f.name]}
                      onChange={handleChange}
                      required
                      placeholder={f.label}
                      className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#1E3A8A] transition-all text-[11px] font-medium text-black"
                    />
                  </div>
                </div>
              ))}

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-black uppercase tracking-widest">
                  Business Address
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="Physical location"
                    className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#1E3A8A] transition-all text-[11px] font-medium text-black"
                  />
                </div>
              </div>

              {[
                {
                  label: "Password",
                  name: "password",
                  show: showPass,
                  toggle: setShowPass,
                },
                {
                  label: "Confirm Password",
                  name: "confirmPassword",
                  show: showConfirm,
                  toggle: setShowConfirm,
                },
              ].map((p) => (
                <div key={p.name} className="space-y-1.5">
                  <label className="text-[11px] font-bold text-black uppercase tracking-widest">
                    {p.label}
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={p.show ? "text" : "password"}
                      name={p.name}
                      value={formData[p.name]}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#1E3A8A] transition-all text-[11px] font-medium text-black"
                    />
                    <button
                      type="button"
                      onClick={() => p.toggle(!p.show)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1E3A8A]"
                    >
                      {p.show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                Already Referral User?{" "}
                <Link
                  to="/partner/login"
                  className="text-[#001F3F] border-b border-[#001F3F] pb-0.5 ml-1"
                >
                  Log In
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-10 py-4 bg-[#001F3F] text-white rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-[#1E3A8A] shadow-xl shadow-blue-900/20 transition-all disabled:opacity-50"
              >
                {loading ? "Establishing..." : "Create Referral Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
