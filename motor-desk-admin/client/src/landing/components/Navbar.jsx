import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiActivity,
  FiArrowRight,
  FiShield,
} from "react-icons/fi";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/features", label: "Features" },
    { to: "/pricing", label: "Pricing" },
    { to: "/partner-program", label: "Referral Program" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-[#CBD5E1] py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* --- Logo Identity --- */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-1.5 bg-[#001F3F] rounded-lg text-white group-hover:bg-[#1E3A8A] transition-colors">
            <FiActivity size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#001F3F]">
            Motor<span className="text-slate-400 font-light">Desk</span>
          </span>
        </Link>

        {/* --- Desktop Navigation --- */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-[11px] font-bold uppercase tracking-[0.15em] transition-colors ${
                location.pathname === link.to
                  ? "text-[#001F3F]"
                  : "text-slate-500 hover:text-[#001F3F]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* --- Desktop Auth Actions --- */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Subtle Admin Link */}
          <Link
            to="/admin/login"
            className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#001F3F] transition-colors flex items-center gap-1.5"
            title="Admin Access"
          >
            <FiShield size={12} />
            Admin
          </Link>

          <div className="h-4 w-[1px] bg-slate-200 mx-1" />

          <Link
            to="/partner/login"
            className="text-[11px] font-bold uppercase tracking-widest text-[#001F3F] hover:opacity-70 transition-opacity"
          >
            Referral Sign In
          </Link>

          <div className="h-4 w-[1px] bg-slate-200 mx-1" />

          <Link
            to="/partner/register"
            className="flex items-center gap-2 bg-[#001F3F] text-white px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-lg shadow-blue-900/10 active:scale-95"
          >
            Join Network <FiArrowRight />
          </Link>
        </div>

        {/* --- Mobile Toggle --- */}
        <button
          className="lg:hidden text-[#001F3F] p-2 hover:bg-slate-100 rounded-lg transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* --- Mobile Menu Overlay --- */}
      <div
        className={`lg:hidden absolute top-full left-0 w-full bg-white border-b border-[#CBD5E1] transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-screen opacity-100 py-8" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col px-8 space-y-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
            <Link
              to="/partner/login"
              className="text-[11px] font-bold uppercase tracking-widest text-[#001F3F]"
              onClick={() => setIsOpen(false)}
            >
              Partner Access
            </Link>

            {/* Admin Access in Mobile */}
            <Link
              to="/admin/login"
              className="text-[11px] font-bold uppercase tracking-widest text-slate-400"
              onClick={() => setIsOpen(false)}
            >
              Admin Console
            </Link>

            <Link
              to="/partner/register"
              className="w-full bg-[#001F3F] text-white py-4 rounded-xl text-[11px] font-bold uppercase tracking-widest text-center"
              onClick={() => setIsOpen(false)}
            >
              Become a Partner
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
