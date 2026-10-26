import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  ArrowUp,
  Siren,
  Search,
  Download,
  X,
  CornerDownLeft,
} from "lucide-react";
import logoIcon from "../assets/IconOnly_Transparent.png";
import useReveal from "../hooks/useReveal";
import { CONTACT, APPS } from "../data/site";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/spare-parts", label: "Spare Parts" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

// Items shown in the header search
const searchIndex = [
  ["Car service & repair", "/services", "Service"],
  ["Bike service", "/services", "Service"],
  ["AC service & repair", "/services", "Service"],
  ["Denting & painting", "/services", "Service"],
  ["Tyres & wheel care", "/services", "Service"],
  ["Battery replacement", "/services", "Service"],
  ["Service packages", "/services", "Service"],
  ["Brake pads & discs", "/spare-parts", "Spare part"],
  ["Filters & oils", "/spare-parts", "Spare part"],
  ["Clutch kits", "/spare-parts", "Spare part"],
  ["Request a spare part", "/spare-parts", "Spare part"],
  ["Breakdown / SOS help", "/sos", "Emergency"],
  ["Towing & recovery", "/sos", "Emergency"],
  ["Fuel delivery", "/sos", "Emergency"],
  ["About Motor Konnect", "/about", "Company"],
  ["Partner with us", "/contact", "Company"],
  ["Contact support", "/contact", "Company"],
  ["Privacy policy", "/privacy", "Legal"],
  ["Terms of service", "/terms", "Legal"],
];

const SearchOverlay = ({ open, onClose }) => {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const input = useRef(null);
  const navigate = useNavigate();
  const results = searchIndex
    .filter(([l, , g]) => `${l} ${g}`.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 8);

  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      setTimeout(() => input.current?.focus(), 60);
    }
  }, [open]);

  const go = (to) => {
    onClose();
    navigate(to);
  };

  return (
    <div className={`search-ov ${open ? "open" : ""}`} onClick={onClose}>
      <div className="search-box" onClick={(e) => e.stopPropagation()}>
        <div className="search-in">
          <Search size={20} />
          <input
            ref={input}
            value={q}
            placeholder="Search services, spare parts, SOS…"
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown")
                setSel((s) => Math.min(s + 1, results.length - 1));
              if (e.key === "ArrowUp") setSel((s) => Math.max(s - 1, 0));
              if (e.key === "Enter" && results[sel]) go(results[sel][1]);
            }}
          />
          <button onClick={onClose} aria-label="Close search">
            <X size={18} />
          </button>
        </div>
        <div className="search-res">
          {results.map(([l, to, g], i) => (
            <button
              key={l}
              className={i === sel ? "on" : ""}
              onMouseEnter={() => setSel(i)}
              onClick={() => go(to)}
            >
              <span>{l}</span>
              <small>{g}</small>
              {i === sel && <CornerDownLeft size={14} />}
            </button>
          ))}
          {results.length === 0 && (
            <p>No results. Try “battery”, “towing” or “brake”.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Logo = ({ light = false }) => (
  <Link to="/" className="brand" aria-label="Motor Konnect home">
    <span className={`brand-mark ${light ? "light" : ""}`}>
      <img src={logoIcon} alt="" />
    </span>
    <span>
      <span
        className="brand-name"
        style={{ color: light ? "#fff" : "var(--ink)" }}
      >
        Motor <em>Konnect</em>
      </span>
      {!light && <span className="brand-tag">Drive with confidence</span>}
    </span>
  </Link>
);

const Layout = ({ children }) => {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  useReveal(location.pathname);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 40);
      setProgress(h > 0 ? y / h : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? "hidden" : "";
  }, [menuOpen, searchOpen]);

  // Ctrl/Cmd + K opens search
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="grain">
      <style>{`
        .topbar { background: var(--ink); color: #c9d3de; font-size: .76rem; letter-spacing: .02em; }
        .topbar .wrap { display: flex; justify-content: space-between; align-items: center; height: 40px; gap: 24px; }
        .topbar a { display: inline-flex; align-items: center; gap: 8px; transition: color .2s; }
        .topbar a:hover { color: var(--brass-2); }
        .topbar-l, .topbar-r { display: flex; gap: 28px; align-items: center; }
        @media (max-width: 860px) { .topbar { display: none; } }

        .nav { position: sticky; top: 0; z-index: 60; background: rgba(247,241,232,.6); backdrop-filter: blur(10px); transition: background .4s, box-shadow .4s, backdrop-filter .4s; }
        .nav.scrolled { background: rgba(246,242,234,.86); backdrop-filter: blur(14px) saturate(1.4); box-shadow: 0 1px 0 var(--line); }
        .nav-inner { display: flex; align-items: center; justify-content: space-between; gap: 20px; height: 84px; transition: height .4s var(--ease); }
        .nav.scrolled .nav-inner { height: 68px; }
        .progress { position: absolute; left: 0; bottom: -1px; height: 2px; background: linear-gradient(90deg, var(--brass), var(--brass-2)); transform-origin: left; }

        .brand { display: flex; align-items: center; gap: 12px; }
        .brand-mark { width: 54px; height: 46px; display: grid; place-items: center; transition: transform .6s var(--ease); }
        .brand-mark.light { width: 44px; height: 44px; border-radius: 12px; background: #fff; padding: 5px; }
        .brand-tag { display: block; white-space: nowrap; font-size: .56rem; font-weight: 700; letter-spacing: .32em; text-transform: uppercase; color: var(--muted); margin-top: 2px; }
        .brand:hover .brand-mark { transform: rotate(-10deg); }
        .brand-mark img { width: 100%; height: 100%; object-fit: contain; }
        .brand-name { font-family: var(--serif); font-weight: 800; font-size: 1.6rem; letter-spacing: -.02em; line-height: 1; display: block; white-space: nowrap; }
        .brand-name em { color: var(--brass); font-style: normal; }

        .nav-links { display: flex; gap: 6px; align-items: center; padding: 6px; border-radius: 999px; border: 1px solid transparent; transition: .4s; }
        .nav.scrolled .nav-links { border-color: var(--line); background: rgba(255,255,255,.6); }
        .nav-link { padding: 10px 20px; border-radius: 999px; font-size: .9rem; font-weight: 500; color: #4a4a44; transition: background .3s, color .3s; }
        .nav-link:hover { color: var(--ink); background: rgba(11,31,51,.05); }
        .nav-link.active { background: var(--ink); color: #fff; }
        .nav-actions { display: flex; gap: 10px; align-items: center; }
        .sos-pill { display: inline-flex; align-items: center; gap: 8px; padding: 12px 18px; border-radius: 12px; font-size: .82rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: #fff; background: var(--sos); box-shadow: 0 10px 24px -12px rgba(226,52,45,.9); transition: .3s var(--ease); }
        .sos-pill:hover, .sos-pill.active { background: var(--sos-2); transform: translateY(-2px); }
        .sos-pill svg { animation: sosBlink 1.6s ease-in-out infinite; }
        @keyframes sosBlink { 0%,100% { opacity: 1; } 50% { opacity: .45; } }
        .icon-btn { width: 46px; height: 46px; border-radius: 50%; border: 1px solid transparent; background: transparent; display: grid; place-items: center; color: var(--ink); transition: .3s; }
        .icon-btn:hover { background: #fff; border-color: var(--line); }
        @media (max-width: 1160px) { .nav-links, .nav-actions .btn { display: none; } }
        @media (max-width: 1160px) { .sos-pill { padding: 12px 14px; } }
        @media (max-width: 520px) {
          .nav-actions { gap: 6px; }
          .brand { gap: 8px; } .brand-mark { width: 42px; height: 38px; }
          .brand-name { font-size: 1.3rem; } .brand-tag { font-size: .5rem; letter-spacing: .22em; }
          .icon-btn, .burger { width: 42px; height: 42px; } .burger span { left: 12px; }
          .burger span:nth-child(1) { top: 16px; } .burger span:nth-child(2) { top: 21px; } .burger span:nth-child(3) { top: 26px; }
          .burger.open span:nth-child(1), .burger.open span:nth-child(3) { top: 21px; }
          .sos-pill { padding: 11px 12px; }
        }
        @media (max-width: 440px) { .nav-actions .icon-btn, .sos-pill .lbl { display: none; } .nav-inner { gap: 10px; } }
        @media (max-width: 340px) { .brand-tag { display: none; } }
        .m-search { display: flex; align-items: center; gap: 12px; width: 100%; padding: 16px 18px; border-radius: 14px; border: 1px solid var(--line-dark); background: rgba(255,255,255,.05); color: #c9cfd6; font-size: 1rem; margin-bottom: 18px; }

        .search-ov { position: fixed; inset: 0; z-index: 80; background: rgba(22,27,34,.55); backdrop-filter: blur(6px); display: flex; justify-content: center; align-items: flex-start; padding: 12vh 16px 0; opacity: 0; pointer-events: none; transition: opacity .3s; }
        .search-ov.open { opacity: 1; pointer-events: auto; }
        .search-box { width: 100%; max-width: 620px; background: #fff; border-radius: 20px; box-shadow: var(--shadow-lg); overflow: hidden; transform: translateY(-16px) scale(.98); transition: transform .45s var(--ease); }
        .search-ov.open .search-box { transform: none; }
        .search-in { display: flex; align-items: center; gap: 12px; padding: 18px 20px; border-bottom: 1px solid var(--line); color: var(--muted); }
        .search-in input { flex: 1; border: 0; outline: 0; font: inherit; font-size: 1.05rem; color: var(--ink); background: none; }
        .search-in button { border: 0; background: var(--paper); width: 32px; height: 32px; border-radius: 8px; display: grid; place-items: center; color: var(--muted); }
        .search-res { padding: 8px; max-height: 50vh; overflow: auto; }
        .search-res button { width: 100%; display: flex; align-items: center; gap: 12px; padding: 13px 14px; border: 0; background: none; border-radius: 12px; text-align: left; font-size: .95rem; color: var(--ink); }
        .search-res button span { flex: 1; }
        .search-res button small { font-size: .68rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--brass); }
        .search-res button.on { background: var(--brass-soft); }
        .search-res p { padding: 18px 14px; margin: 0; color: var(--muted); }

        .burger { display: none; width: 46px; height: 46px; border-radius: 50%; border: 1px solid var(--line); background: #fff; position: relative; }
        .burger span { position: absolute; left: 14px; width: 18px; height: 1.5px; background: var(--ink); transition: .35s var(--ease); }
        .burger span:nth-child(1) { top: 18px; } .burger span:nth-child(2) { top: 23px; } .burger span:nth-child(3) { top: 28px; }
        .burger.open span:nth-child(1) { top: 23px; transform: rotate(45deg); }
        .burger.open span:nth-child(2) { opacity: 0; }
        .burger.open span:nth-child(3) { top: 23px; transform: rotate(-45deg); }
        @media (max-width: 1060px) { .burger { display: block; } }

        .mobile-menu { position: fixed; inset: 0; z-index: 55; background: var(--ink); color: #fff; padding: 110px 28px 36px; display: flex; flex-direction: column; clip-path: circle(0% at calc(100% - 48px) 40px); transition: clip-path .7s var(--ease); }
        .mobile-menu.open { clip-path: circle(150% at calc(100% - 48px) 40px); }
        .mobile-menu a.m-link { font-family: var(--serif); font-size: 2.4rem; padding: 10px 0; border-bottom: 1px solid var(--line-dark); display: flex; justify-content: space-between; align-items: center; opacity: 0; transform: translateY(20px); transition: .6s var(--ease); }
        .mobile-menu.open a.m-link { opacity: 1; transform: none; }
        .mobile-menu a.m-link.active { color: var(--brass-2); }

        .footer { background: var(--ink); color: #c9d3de; position: relative; overflow: hidden; }
        .footer-cta { border-bottom: 1px solid var(--line-dark); padding: 72px 0; display: flex; justify-content: space-between; align-items: center; gap: 32px; flex-wrap: wrap; }
        .footer-grid { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1.4fr; gap: 48px; padding: 72px 0 56px; }
        @media (max-width: 960px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 560px) { .footer-grid { grid-template-columns: 1fr; } }
        .f-head { font-size: .7rem; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: var(--brass-2); margin: 0 0 22px; }
        .f-link { display: block; padding: 6px 0; font-size: .92rem; color: #a8b3c0; transition: color .25s, transform .35s var(--ease); }
        .f-link:hover { color: #fff; transform: translateX(6px); }
        .f-contact { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 18px; font-size: .9rem; line-height: 1.55; color: #c9d3de; }
        .f-contact svg { color: var(--brass-2); flex-shrink: 0; margin-top: 3px; }
        .f-contact a:hover { color: #fff; }
        .f-bottom { border-top: 1px solid var(--line-dark); padding: 28px 0; display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; font-size: .82rem; color: #8b97a5; }
        .f-watermark { font-family: var(--serif); font-size: clamp(5rem, 16vw, 15rem); line-height: .8; color: rgba(255,255,255,.035); white-space: nowrap; text-align: center; user-select: none; margin-bottom: -.12em; }

        .to-top { position: fixed; right: 24px; bottom: 24px; z-index: 50; width: 50px; height: 50px; border-radius: 50%; border: 0; background: var(--ink); color: #fff; display: grid; place-items: center; box-shadow: var(--shadow-lg); transition: .45s var(--ease); }
        .to-top.hide { opacity: 0; transform: translateY(20px) scale(.8); pointer-events: none; }
        .to-top:hover { background: var(--brass); }
      `}</style>

      {/* Top info bar */}
      <div className="topbar">
        <div className="wrap">
          <div className="topbar-l">
            <a href={`mailto:${CONTACT.email}`}>
              <Mail size={13} /> {CONTACT.email}
            </a>
            <a href={`tel:${CONTACT.phoneRaw}`}>
              <Phone size={13} /> {CONTACT.phone}
            </a>
            <span
              style={{ display: "inline-flex", gap: 8, alignItems: "center" }}
            >
              <Clock size={13} /> {CONTACT.hours}
            </span>
          </div>
          <div className="topbar-r">
            <a href={`tel:${CONTACT.sosRaw}`} style={{ color: "#f3b2a9" }}>
              <span className="dot-live red" /> 24/7 SOS Hotline:{" "}
              {CONTACT.sosPhone}
            </a>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`nav ${scrolled || menuOpen ? "scrolled" : ""}`}>
        <div className="wrap nav-inner">
          <Logo />
          <div className="nav-links">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
          <div className="nav-actions">
            <button
              className="icon-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search size={19} />
            </button>
            <NavLink
              to="/sos"
              className={({ isActive }) =>
                `sos-pill ${isActive ? "active" : ""}`
              }
            >
              <Siren size={16} /> <span className="lbl">SOS</span>
            </NavLink>
            <a
              href="#get-app"
              className="btn btn-brass"
              style={{ padding: "13px 22px" }}
            >
              <Download size={16} /> Get the App
            </a>
            <button
              className={`burger ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
        <div
          className="progress"
          style={{ width: "100%", transform: `scaleX(${progress})` }}
        />
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <button
          className="m-search"
          onClick={() => {
            setMenuOpen(false);
            setSearchOpen(true);
          }}
        >
          <Search size={18} /> Search services, parts, SOS…
        </button>
        {[...navLinks, { to: "/sos", label: "Emergency SOS" }].map((l, i) => (
          <NavLink
            key={l.to}
            to={l.to}
            end
            className={({ isActive }) => `m-link ${isActive ? "active" : ""}`}
            style={{
              transitionDelay: menuOpen ? `${0.15 + i * 0.06}s` : "0s",
              color: l.to === "/sos" ? "#f3b2a9" : undefined,
            }}
          >
            {l.label} <ArrowRight size={22} />
          </NavLink>
        ))}
        <div style={{ marginTop: "auto", display: "grid", gap: 12 }}>
          <a href={`tel:${CONTACT.sosRaw}`} className="btn btn-sos">
            <Siren size={18} /> Call SOS {CONTACT.sosPhone}
          </a>
          <a href={`mailto:${CONTACT.email}`} className="btn btn-ghost-light">
            {CONTACT.email}
          </a>
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <main key={location.pathname} className="page-enter">
        {children}
      </main>

      {/* Footer */}
      <footer className="footer" id="get-app">
        <div className="wrap">
          <div className="footer-cta">
            <div>
              <span className="eyebrow" style={{ color: "var(--brass-2)" }}>
                Motor Konnect App
              </span>
              <h3 className="h2" style={{ color: "#fff", marginTop: 14 }}>
                Your garage, in your <em>pocket.</em>
              </h3>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a
                href={APPS.android.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-brass"
              >
                {APPS.android.app} for Android <ArrowRight size={16} />
              </a>
              <a
                href={APPS.ios.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost-light"
              >
                {APPS.ios.app} for iOS
              </a>
            </div>
          </div>

          <div className="footer-grid">
            <div>
              <Logo light />
              <p
                style={{
                  color: "#a8b3c0",
                  lineHeight: 1.75,
                  maxWidth: 340,
                  margin: "24px 0 0",
                  fontSize: ".95rem",
                }}
              >
                India's trusted automotive network — connecting vehicle owners
                with verified garages, genuine spare parts and 24/7 roadside
                assistance under one transparent roof.
              </p>
            </div>
            <div>
              <p className="f-head">Explore</p>
              {[...navLinks, { to: "/sos", label: "Emergency SOS" }].map(
                (l) => (
                  <Link key={l.to} to={l.to} className="f-link">
                    {l.label}
                  </Link>
                ),
              )}
            </div>
            <div>
              <p className="f-head">Legal & Trust</p>
              <Link to="/privacy" className="f-link">
                Privacy Policy
              </Link>
              <Link to="/terms" className="f-link">
                Terms of Service
              </Link>
              <Link to="/contact" className="f-link">
                Partner With Us
              </Link>
              <Link to="/contact" className="f-link">
                Support Centre
              </Link>
            </div>
            <div>
              <p className="f-head">Head Office</p>
              <div className="f-contact">
                <MapPin size={17} />
                <span>{CONTACT.address}</span>
              </div>
              <div className="f-contact">
                <Phone size={17} />
                <a href={`tel:${CONTACT.phoneRaw}`}>{CONTACT.phone}</a>
              </div>
              <div className="f-contact">
                <Mail size={17} />
                <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </div>
              <div className="f-contact">
                <Clock size={17} />
                <span>
                  {CONTACT.hours}
                  <br />
                  SOS desk open 24/7
                </span>
              </div>
            </div>
          </div>

          <div className="f-bottom">
            <span>
              © {new Date().getFullYear()} Abacco Technology. All rights
              reserved.
            </span>
            <span>Made with excellence in India</span>
          </div>
        </div>
        <div className="f-watermark">Motor Konnect</div>
      </footer>

      <button
        className={`to-top ${progress > 0.15 ? "" : "hide"}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
};

export default Layout;
