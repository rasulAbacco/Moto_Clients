import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiArrowLeft,
  FiActivity,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/partner/login`, formData);
      toast.success(`Welcome back, ${res.data.partner.name}!`);
      localStorage.setItem("partnerToken", res.data.token);
      localStorage.setItem("partnerData", JSON.stringify(res.data.partner));
      setTimeout(() => navigate("/partner/dashboard"), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-6 font-sans text-[#1E293B] antialiased">
      <Toaster position="top-center" />

      {/* --- Back to Home --- */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-8 left-8 flex items-center gap-2 text-[#001F3F] font-bold text-[11px] uppercase tracking-widest group transition-opacity hover:opacity-70"
      >
        <FiArrowLeft size={14} />
        <span>Return Home</span>
      </button>

      <div className="w-full max-w-4xl bg-white flex flex-col md:flex-row border border-[#CBD5E1] shadow-2xl overflow-hidden rounded-3xl min-h-[550px]">
        {/* --- Left Branding Panel --- */}
        <div className="md:w-80 bg-gradient-to-br from-[#001F3F] to-[#1E3A8A] p-10 flex flex-col justify-between text-white relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="p-2 bg-blue-500 rounded-lg">
                <FiActivity className="text-xl" />
              </div>
              <span className="font-bold tracking-tight text-xl">
                MotorDesk
              </span>
            </div>

            <h2 className="text-3xl font-extrabold leading-tight">
              Referral <br />
              <span className="text-blue-300 font-light italic">Portal.</span>
            </h2>
            <p className="mt-6 text-blue-100/70 text-[11px] font-bold uppercase tracking-widest leading-relaxed max-w-[200px]">
              Secure access to your referral dashboard and performance insights.
            </p>
          </div>

          <div className="text-[11px] font-bold tracking-[0.3em] opacity-40 uppercase">
            System v1.0
          </div>
        </div>

        {/* --- Right Form Panel --- */}
        <div className="flex-1 p-8 md:p-16 bg-white flex flex-col justify-center">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-[#001F3F] tracking-tight">
              Login
            </h1>
            <p className="text-[11px] text-slate-500 mt-2 font-bold uppercase tracking-widest">
              Please enter your credentials to proceed.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-black">
                Email Address
              </label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1E3A8A] transition-colors" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@business.com"
                  className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#1E3A8A] transition-all text-[11px] font-medium text-black"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-black">
                Password
              </label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1E3A8A] transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#1E3A8A] transition-all text-[11px] font-medium text-black"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1E3A8A] transition-colors"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#001F3F] text-white py-4 rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-[#1E3A8A] shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-10 pt-8 border-t border-[#F0F4F8] text-center">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
              Not a referral user yet?{" "}
              <Link
                to="/partner/register"
                className="text-[#001F3F] border-b border-[#001F3F] pb-0.5 ml-1 hover:opacity-70"
              >
                Join as Referral User
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
