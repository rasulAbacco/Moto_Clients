import React from "react";
import { Link } from "react-router-dom";
import {
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
  FiActivity,
  FiShield,
} from "react-icons/fi";
import { FaGooglePlay } from "react-icons/fa"; // Using FontAwesome for the Play Store icon

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const playStoreUrl =
    "https://play.google.com/store/apps/details?id=com.abacco.motordesk&pcampaignid=web_share";

  return (
    <footer className="bg-[#001F3F] text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
        {/* --- Brand Identity & App Download --- */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500 rounded-lg">
              <FiActivity size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Motor
              <span className="text-blue-300 font-light italic">Desk.</span>
            </span>
          </div>
          <p className="text-blue-100/60 text-[11px] font-medium leading-relaxed uppercase tracking-wider">
            The next-generation CRM ecosystem for automotive service
            professionals. Streamline operations and master your workspace.
          </p>

          <div className="flex space-x-5 text-blue-200/50 pt-2">
            <a href="#" className="hover:text-white transition-colors">
              <FiFacebook size={20} />
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <FiTwitter size={20} />
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <FiInstagram size={20} />
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <FiLinkedin size={20} />
            </a>
          </div>
        </div>

        {/* --- Product Workspace --- */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-white mb-8">
            Product
          </h3>
          <ul className="space-y-4 text-[11px] font-bold uppercase tracking-widest text-blue-100/50">
            <li>
              <Link
                to="/features"
                className="hover:text-blue-300 transition-colors"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                to="/pricing"
                className="hover:text-blue-300 transition-colors"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                to="/partner-program"
                className="hover:text-blue-300 transition-colors"
              >
                Referral Program
              </Link>
            </li>
          </ul>
        </div>

        {/* --- Governance --- */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-white mb-8">
            Governance
          </h3>
          <ul className="space-y-4 text-[11px] font-bold uppercase tracking-widest text-blue-100/50">
            <li>
              <Link to="/privacy" className="hover:text-blue-300 transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-blue-300 transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/refund" className="hover:text-blue-300 transition-colors">
                Refund Protocol
              </Link>
            </li>
            <li>
              <Link
                to="/admin/login"
                className="flex items-center gap-2 hover:text-blue-300 transition-colors"
              >
                <FiShield size={12} /> Admin Console
              </Link>
            </li>
          </ul>
        </div>

        {/* --- Global Support --- */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-white mb-8">
            Support
          </h3>
          <div className="space-y-4">
            <p className="text-[11px] font-bold tracking-widest text-blue-100/50">
              Technical Assistance:
              <span className="block text-white mt-1">
                support@themotordesk.com
              </span>
            </p>
            {/* Play Store Button */}
            <a
              href={playStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 bg-[#001F3F] px-4 py-2 rounded-xl border border-[#001F3F] transition-all duration-300 hover:bg-white hover:border-[#001F3F] shadow-lg shadow-blue-900/10 active:scale-95"
            >
              {/* Icon - Color flips from white to navy on group hover */}
              <FaGooglePlay className="text-white text-2xl transition-all duration-300 group-hover:text-[#001F3F] group-hover:scale-110" />

              <div className="text-left">
                {/* Upper Text - Transitions from light blue to slate on group hover */}
                <p className="text-[9px] font-bold uppercase tracking-widest text-blue-200/60 transition-colors duration-300 group-hover:text-slate-400 leading-none mb-1">
                  Get it on
                </p>

                {/* Main Brand Text - Transitions from white to navy on group hover */}
                <p className="text-[13px] font-bold text-white transition-colors duration-300 group-hover:text-[#001F3F] leading-none">
                  Google Play
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* --- Footer Bottom Ledger --- */}
      <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] font-bold text-blue-100/30 uppercase tracking-[0.2em]">
          © {currentYear} The MotorDesk Ecosystem. Precision Engineered.
        </p>
        <div className="flex items-center gap-6 opacity-30">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white">
            System v1.0
          </span>
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
