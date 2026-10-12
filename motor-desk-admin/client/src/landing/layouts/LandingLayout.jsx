import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const LandingLayout = () => {
  const location = useLocation();

  // Hide navbar & footer for admin and partner dashboards
  const hideLayout =
    location.pathname.startsWith("/admin/") ||
    location.pathname.startsWith("/partner/");

  if (hideLayout) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-black antialiased selection:bg-[#001F3F] selection:text-white">
      {/* --- Aesthetic Background Grid (Optional) --- */}
      <div className="fixed inset-0 z-[-1] opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#001F3F_1px,transparent_1px)] [background-size:32px_32px]"></div>
      </div>

      {/* --- Fixed Navbar --- */}
      <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-[#CBD5E1]">
        <Navbar />
      </nav>

      {/* --- Page Content --- */}
      {/* Removed the restricted max-width here so Hero sections can be full-width */}
      <main className="flex-1">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
          <Outlet />
        </div>
      </main>

      {/* --- Footer --- */}
      <footer className="bg-[#001F3F] border-t border-white/10">
        <Footer />
      </footer>
    </div>
  );
};

export default LandingLayout;
