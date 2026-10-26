import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Printer, Mail, FileText, ShieldCheck } from "lucide-react";
import PageHero from "../components/PageHero";
import { CONTACT } from "../data/site";

const privacy = [
  { h: "Information we collect", p: "We collect the details you give us when you create an account or book a service — your name, phone number, email, vehicle details and service history — along with device and usage data that helps us keep the app running smoothly.", list: ["Account and contact information", "Vehicle make, model, registration and service records", "Location data, only while booking or during an active SOS", "Payment confirmations shared by partner garages (we never store card details)"] },
  { h: "How we use your data", p: "Motor Konnect uses high-precision location to dispatch SOS help and to show nearby garages. We do not sell your personal or movement data to advertisers.", list: ["Matching you with verified garages and technicians", "Sending booking confirmations, reminders and SOS updates", "Improving service quality and preventing fraud"] },
  { h: "The SOS exception", p: "When you trigger an SOS, some privacy limits are relaxed to keep you safe: your real-time GPS coordinates are shared with the assigned responder, our recovery partners and, where necessary, emergency services.", note: "Location sharing ends automatically when the SOS job is closed." },
  { h: "Sharing with partners", p: "We share only what a garage or technician needs to complete your job — your name, contact number, vehicle details and the service requested. Partners are contractually bound to protect this information." },
  { h: "Security & retention", p: "Personal identifiers are encrypted in transit and at rest. Inactive accounts are purged after 12 months, and you can request a copy or deletion of your data at any time.", list: ["End-to-end encryption on personal identifiers", "Automated data purging after 12 months of inactivity", "Handled in line with applicable Indian data protection law"] },
  { h: "Your rights", p: `You can access, correct or delete your information, and withdraw consent for optional communications. Write to ${CONTACT.email} and we'll respond within 30 days.` },
];

const terms = [
  { h: "Platform licence", p: "By using Motor Konnect you receive a non-exclusive, non-transferable licence to use our garage discovery, booking, spare parts and SOS tools for personal or business vehicle care. Scraping or reverse-engineering the technician network is prohibited." },
  { h: "Bookings & estimates", p: "Prices shown in the app are estimates provided by the garage. The final invoice is issued by the service provider after inspection, and any additional work requires your approval first.", list: ["Cancel or reschedule free of charge up to 2 hours before your slot", "Repeated no-shows may limit future bookings"] },
  { h: "Direct payment governance", p: "Our “Pay at Garage” model is built for transparency. Motor Konnect is a facilitator, not a payment processor for maintenance fees.", list: ["Financial disputes are settled directly with the garage owner — we'll help mediate", "Motor Konnect takes no commission from your service total"] },
  { h: "Emergency usage", p: "SOS is for genuine breakdowns and roadside emergencies. Dispatch times depend on location, traffic and weather and are estimates, not guarantees.", note: "Fraudulent SOS alerts or platform misuse may lead to a permanent ban from the Motor Konnect network." },
  { h: "Spare parts", p: "Parts are graded as OEM, OES or certified aftermarket. Warranty terms follow the manufacturer or supplier. Unused parts in original packaging may be returned per the return policy shared at the time of order." },
  { h: "Technician liability", p: "Every technician is vetted through the Motor Desk verification process. Motor Konnect acts as a discovery and coordination layer and is not liable for mechanical failures or secondary damage during service; workmanship claims are handled with the partner garage, with our support." },
];

const Legal = ({ type }) => {
  const isPrivacy = type === "privacy";
  const sections = isPrivacy ? privacy : terms;
  const [active, setActive] = useState(0);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number(e.target.dataset.i))),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    document.querySelectorAll("[data-i]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [type]);

  return (
    <div>
      <style>{`
        .legal { display: grid; grid-template-columns: 260px 1fr; gap: 56px; align-items: start; }
        @media (max-width: 900px) { .legal { grid-template-columns: 1fr; } .toc { display: none; } }
        .toc { position: sticky; top: 110px; }
        .toc a { display: flex; gap: 12px; padding: 11px 14px; border-radius: 12px; font-size: .88rem; color: var(--muted); border-left: 2px solid transparent; transition: .3s; }
        .toc a.on { color: var(--ink); background: #fff; border-left-color: var(--brass); font-weight: 700; }
        .toc a span { color: var(--brass); font-weight: 800; font-size: .75rem; }
        .legal-card { padding: 56px; }
        @media (max-width: 560px) { .legal-card { padding: 32px 22px; } }
        .lsec { padding: 36px 0; border-bottom: 1px solid var(--line); scroll-margin-top: 110px; }
        .lsec:first-child { padding-top: 0; }
        .lsec:last-child { border-bottom: 0; }
        .lsec h2 { font-family: var(--serif); font-weight: 400; font-size: 1.8rem; color: var(--ink); margin: 0 0 16px; display: flex; gap: 14px; align-items: baseline; }
        .lsec h2 span { font-size: .9rem; color: var(--brass); font-family: var(--sans); font-weight: 800; }
        .lsec p { color: var(--muted); line-height: 1.85; margin: 0 0 16px; }
        .lsec ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
        .lsec li { position: relative; padding-left: 22px; color: var(--muted); line-height: 1.6; }
        .lsec li::before { content: ""; position: absolute; left: 0; top: 9px; width: 7px; height: 7px; border-radius: 50%; background: var(--brass); }
        .lnote { background: var(--brass-soft); border-radius: 14px; padding: 16px 20px; font-weight: 600; color: var(--ink); font-size: .9rem; }
        @media print { .nav, .topbar, .footer, .page-hero, .toc, .to-top { display: none !important; } }
      `}</style>

      <PageHero
        crumb={isPrivacy ? "Privacy Policy" : "Terms of Service"}
        eyebrow="Compliance Document v2.4"
        title={isPrivacy ? <>Privacy <em>Policy</em></> : <>Terms of <em>Service</em></>}
        lead="Last updated: May 2026. This document governs the use of the Motor Konnect app, website, Spare Parts Desk and the Motor Desk CRM ecosystem."
      />

      <section className="section">
        <div className="wrap legal">
          <nav className="toc reveal">
            {sections.map((s, i) => (
              <a key={s.h} href={`#s${i}`} className={active === i ? "on" : ""}><span>{String(i + 1).padStart(2, "0")}</span>{s.h}</a>
            ))}
            <Link to={isPrivacy ? "/terms" : "/privacy"} style={{ marginTop: 18, color: "var(--brass)", fontWeight: 700 }}>
              {isPrivacy ? <FileText size={16} /> : <ShieldCheck size={16} />} {isPrivacy ? "Terms of Service" : "Privacy Policy"} →
            </Link>
          </nav>

          <div className="card legal-card reveal d1">
            {sections.map((s, i) => (
              <div key={s.h} id={`s${i}`} data-i={i} className="lsec">
                <h2><span>{String(i + 1).padStart(2, "0")}</span>{s.h}</h2>
                <p>{s.p}</p>
                {s.list && <ul>{s.list.map((li) => <li key={li}>{li}</li>)}</ul>}
                {s.note && <div className="lnote" style={{ marginTop: 18 }}>{s.note}</div>}
              </div>
            ))}

            <div style={{ marginTop: 40, paddingTop: 32, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div className="muted" style={{ fontSize: ".88rem" }}>
                Questions? Reach our compliance team at<br />
                <a href={`mailto:${CONTACT.email}`} style={{ color: "var(--brass)", fontWeight: 700, display: "inline-flex", gap: 6, alignItems: "center" }}><Mail size={14} /> {CONTACT.email}</a>
              </div>
              <button onClick={() => window.print()} className="btn btn-ink"><Printer size={16} /> Print Document</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Legal;
