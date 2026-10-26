import { Link } from "react-router-dom";
import {
  Phone, MapPin, ShieldAlert, Zap, Droplets, ScanSearch, Truck, OctagonAlert, Fuel, ChevronRight, Activity,
  BellRing, Radio, Disc3, KeyRound, Cog, Gauge, TriangleAlert, Smartphone, ArrowRight,
} from "lucide-react";
import { CONTACT } from "../data/site";
import { IMG } from "../data/images";
import { RiseText } from "../components/PageHero";

const roadside = [
  { title: "Tyre Puncture", icon: Disc3, d: "Spare change or on-spot puncture repair" },
  { title: "Fuel Assistance", icon: Fuel, d: "Emergency fuel delivered to your location" },
  { title: "Battery Jump-start", icon: Zap, d: "Jump-start or replacement on the spot" },
  { title: "Wrong Fuel", icon: OctagonAlert, d: "Tank drain and flush — don't start the engine", red: true },
  { title: "Key Lockout", icon: KeyRound, d: "Safe vehicle entry by trained technicians" },
  { title: "Minor Repairs", icon: Cog, d: "Belts, hoses, fuses and quick fixes" },
];

const mechanical = [
  { icon: Droplets, t: "Fluid Leak" }, { icon: ScanSearch, t: "OBD Scan" }, { icon: Zap, t: "Starter" },
  { icon: Cog, t: "Clutch" }, { icon: OctagonAlert, t: "Brakes" }, { icon: Gauge, t: "Dashboard" },
];

const SOS = () => (
  <div>
    <style>{`
      .sos-hero { position: relative; overflow: hidden; background: #0d0f14; color: #fff; padding: 110px 0 170px; }
      .sos-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .35; animation: heroIn 1.8s var(--ease) both; }
      .sos-hero::before { content: ""; position: absolute; inset: 0; z-index: 1; background: linear-gradient(90deg, #0d0f14 20%, rgba(13,15,20,.6) 70%, rgba(13,15,20,.3)), radial-gradient(700px 420px at 85% 30%, rgba(226,52,45,.35), transparent 65%); }
      .sos-hero .wrap { z-index: 2; }
      @keyframes heroIn { from { opacity: 0; transform: scale(1.1); } to { opacity: .35; transform: none; } }
      .sos-hero .radio-bg { position: absolute; right: -6%; top: 6%; opacity: .05; }
      .sos-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 56px; align-items: end; position: relative; }
      @media (max-width: 960px) { .sos-grid { grid-template-columns: 1fr; } }
      .call-card { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); border-radius: 28px; padding: 30px; backdrop-filter: blur(10px); }
      .call-btn { display: flex; align-items: center; gap: 20px; background: var(--sos); padding: 22px 26px; border-radius: 20px; box-shadow: 0 24px 50px -16px rgba(192,57,43,.8); transition: .4s var(--ease); position: relative; }
      .call-btn:hover { transform: translateY(-4px); background: var(--sos-2); }
      .call-ring { position: relative; width: 58px; height: 58px; border-radius: 50%; background: rgba(255,255,255,.18); display: grid; place-items: center; flex-shrink: 0; }
      .call-ring::before, .call-ring::after { content: ""; position: absolute; inset: 0; border-radius: 50%; border: 2px solid #fff; animation: radar 2s ease-out infinite; }
      .call-ring::after { animation-delay: 1s; }
      .call-ring svg { animation: shake 2.4s ease-in-out infinite; }
      @keyframes shake { 0%,60%,100% { transform: rotate(0); } 65%,75%,85% { transform: rotate(-14deg); } 70%,80%,90% { transform: rotate(14deg); } }

      .sos-body { margin-top: -100px; position: relative; z-index: 2; }
      .sos-card { padding: 40px; height: 100%; }
      .rs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      @media (max-width: 560px) { .rs-grid { grid-template-columns: 1fr; } }
      .rs { display: flex; gap: 14px; align-items: center; padding: 18px; border-radius: 18px; border: 1px solid var(--line); background: var(--paper); text-align: left; transition: .4s var(--ease); }
      .rs:hover { border-color: var(--ink); background: #fff; transform: translateY(-3px); box-shadow: var(--shadow); }
      .rs b { display: block; color: var(--ink); font-size: .95rem; }
      .rs small { color: var(--muted); font-size: .8rem; }
      .mech { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
      .mech a { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 22px 10px; border-radius: 18px; border: 1px solid var(--line); background: var(--paper); font-weight: 700; font-size: .82rem; color: var(--ink); transition: .4s var(--ease); }
      .mech a:hover { background: var(--ink); color: #fff; transform: translateY(-3px); }
      .mech a svg { color: var(--brass); }
      .recovery-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-radius: 14px; background: rgba(255,255,255,.1); margin-bottom: 10px; font-weight: 600; transition: .35s var(--ease); }
      .recovery-row:hover { background: rgba(255,255,255,.18); transform: translateX(6px); }
      .safety { counter-reset: s; display: grid; gap: 14px; }
      .safety li { list-style: none; display: flex; gap: 16px; align-items: flex-start; padding: 18px 20px; border-radius: 16px; background: #fff; border: 1px solid var(--line); }
      .safety li::before { counter-increment: s; content: counter(s); width: 32px; height: 32px; border-radius: 50%; background: var(--sos); color: #fff; font-weight: 800; display: grid; place-items: center; flex-shrink: 0; font-size: .85rem; }
      .safety b { color: var(--ink); display: block; margin-bottom: 3px; }
      .safety span { color: var(--muted); font-size: .9rem; line-height: 1.6; }
    `}</style>

    {/* Hero */}
    <section className="sos-hero">
      <img className="sos-hero-img" src={IMG.sosRoadside} alt="" />
      <Radio className="radio-bg" size={520} color="#fff" />
      <div className="wrap sos-grid">
        <div>
          <span className="eyebrow page-enter" style={{ color: "#f3b2a9" }}><span className="dot-live red" /> Emergency Command Centre · Live</span>
          <h1 className="display" style={{ color: "#fff", margin: "22px 0 22px" }}>
            <RiseText text="Breakdown support," /><br />
            <span className="rise"><span style={{ animationDelay: ".3s", color: "#f07d6e" }}><em style={{ color: "inherit" }}>priority.</em></span></span>
          </h1>
          <p className="lead page-enter" style={{ color: "#a8b3c0", maxWidth: 520, animationDelay: ".3s" }}>
            One call puts the nearest verified technician on the way to your exact location — day or night,
            city road or highway, across 180+ cities.
          </p>
        </div>
        <div className="call-card page-enter" style={{ animationDelay: ".4s" }}>
          <a href={`tel:${CONTACT.sosRaw}`} className="call-btn">
            <span className="call-ring"><Phone size={24} fill="#fff" /></span>
            <span>
              <span style={{ display: "block", fontSize: ".7rem", fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", opacity: .85 }}>24/7 Emergency Hotline</span>
              <span style={{ fontSize: "1.7rem", fontWeight: 800 }}>{CONTACT.sosPhone}</span>
            </span>
          </a>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 18, textAlign: "center" }}>
            {[["12.5m", "Avg. dispatch"], ["84", "Techs nearby"], ["24/7", "Always on"]].map(([v, l]) => (
              <div key={l} style={{ padding: "12px 6px", borderRadius: 14, background: "rgba(255,255,255,.04)" }}>
                <b style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: "1.4rem" }}>{v}</b>
                <div style={{ fontSize: ".66rem", color: "#8b97a5", letterSpacing: ".12em", textTransform: "uppercase" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* Body grid */}
    <div className="wrap sos-body">
      <div className="grid-12">
        <div className="reveal" style={{ gridColumn: "span 8" }}>
          <div className="card sos-card" style={{ boxShadow: "var(--shadow-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <h2 className="h3" style={{ color: "var(--ink)", fontSize: "1.9rem" }}>Roadside essentials</h2>
              <span className="chip">On-spot fix</span>
            </div>
            <div className="rs-grid">
              {roadside.map((r) => {
                const Icon = r.icon;
                return (
                  <a key={r.title} href={`tel:${CONTACT.sosRaw}`} className="rs">
                    <span className="icon-box" style={r.red ? { background: "#fbe6e3", color: "var(--sos)", width: 46, height: 46 } : { width: 46, height: 46 }}><Icon size={20} /></span>
                    <span><b>{r.title}</b><small>{r.d}</small></span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="reveal d2" style={{ gridColumn: "span 4" }}>
          <div className="card sos-card" style={{ background: "var(--ink)", borderColor: "var(--ink)", color: "#fff", boxShadow: "var(--shadow-lg)" }}>
            <span className="icon-box dark"><Activity size={22} /></span>
            <h3 className="h3" style={{ color: "#fff", margin: "22px 0 8px" }}>Live network</h3>
            <p style={{ color: "#a8b3c0", margin: "0 0 28px", lineHeight: 1.6 }}>84 technicians active within 15 km of your location.</p>
            <div style={{ background: "rgba(255,255,255,.05)", padding: 20, borderRadius: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".66rem", fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 10 }}>
                <span style={{ color: "#8b97a5" }}>System load</span><span style={{ color: "#5fd39b" }}>Optimised</span>
              </div>
              <div className="bar" style={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
                <i style={{ display: "block", height: "100%", width: "65%", background: "linear-gradient(90deg,var(--brass),var(--brass-2))", animation: "fillX 1.6s var(--ease) .6s both", transformOrigin: "left" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 22, color: "#a8b3c0", fontSize: ".85rem" }}>
              <Smartphone size={16} color="var(--brass-2)" /> Or tap SOS in the Motor Konnect app
            </div>
          </div>
        </div>

        <div className="reveal" style={{ gridColumn: "span 7" }}>
          <div className="card sos-card">
            <h2 className="h3" style={{ color: "var(--ink)", fontSize: "1.9rem", marginBottom: 28 }}>Mechanical & technical</h2>
            <div className="mech">
              {mechanical.map(({ icon: Icon, t }) => (
                <a key={t} href={`tel:${CONTACT.sosRaw}`}><Icon size={22} />{t}</a>
              ))}
            </div>
          </div>
        </div>

        <div className="reveal d2" style={{ gridColumn: "span 5" }}>
          <div className="card sos-card" style={{ background: "linear-gradient(150deg,#8f2a1f,var(--sos))", border: 0, color: "#fff" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
              <Truck size={24} /><h2 className="h3" style={{ color: "#fff", fontSize: "1.9rem" }}>Recovery units</h2>
            </div>
            {["Wheel-lift towing", "Flat-bed recovery", "Flood assistance", "Accident recovery"].map((t) => (
              <a key={t} href={`tel:${CONTACT.sosRaw}`} className="recovery-row">{t}<ChevronRight size={16} /></a>
            ))}
            <p style={{ margin: "18px 0 0", padding: 14, borderRadius: 12, border: "1px dashed rgba(255,255,255,.35)", fontSize: ".8rem", fontStyle: "italic", color: "#fde3df" }}>
              Flat-bed towing is strongly recommended for premium, automatic and low-clearance vehicles.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* What to do */}
    <section className="section">
      <div className="wrap grid-2" style={{ gap: 64, alignItems: "start" }}>
        <div className="reveal">
          <span className="eyebrow" style={{ color: "var(--sos)" }}>Stay safe</span>
          <h2 className="h2" style={{ color: "var(--ink)", marginTop: 14 }}>What to do while <em>help arrives</em></h2>
          <p className="lead" style={{ marginTop: 18 }}>A few simple steps keep you and others safe until our technician reaches you. Your safety comes before your vehicle.</p>
          <div style={{ display: "flex", gap: 14, marginTop: 30, flexWrap: "wrap" }}>
            <a href={`tel:${CONTACT.sosRaw}`} className="btn btn-sos"><Phone size={16} /> Call SOS now</a>
            <a href="tel:112" className="btn btn-outline">National Emergency 112</a>
          </div>
        </div>
        <ol className="safety reveal d2" style={{ padding: 0, margin: 0 }}>
          <li><div><b>Move to safety</b><span>If you can, steer to the far left shoulder and switch on hazard lights.</span></div></li>
          <li><div><b>Make yourself visible</b><span>Place a warning triangle ~50 m behind the vehicle. Step away from traffic.</span></div></li>
          <li><div><b>Share your location</b><span>Call the hotline or tap SOS in the app — we'll capture your live GPS position.</span></div></li>
          <li><div><b>Don't attempt risky fixes</b><span>Avoid restarting after wrong fuel, and never work under a vehicle on a highway.</span></div></li>
          <li><div><b>Track your technician</b><span>You'll get an SMS with the technician's name, contact and live ETA.</span></div></li>
        </ol>
      </div>
    </section>

    {/* Features */}
    <section className="section bg-white">
      <div className="wrap grid-3">
        {[
          [BellRing, "Real-time alerts", "Encrypted SMS updates with technician GPS coordinates and contact details."],
          [MapPin, "Precise location", "Locates your vehicle accurately, even on unnamed rural routes."],
          [ShieldAlert, "Verified partners", "Every SOS responder is background-checked and Motor Konnect certified."],
        ].map(([Icon, h, p], i) => (
          <div key={h} className={`reveal d${i + 1}`}>
            <span className="icon-box ink"><Icon size={22} /></span>
            <h3 className="h3" style={{ color: "var(--ink)", margin: "22px 0 10px" }}>{h}</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>{p}</p>
          </div>
        ))}
      </div>
      <div className="wrap" style={{ marginTop: 72 }}>
        <div className="card reveal" style={{ padding: "28px 34px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap", background: "var(--brass-soft)", borderColor: "transparent" }}>
          <span style={{ display: "flex", gap: 14, alignItems: "center", color: "var(--ink)", fontWeight: 600 }}>
            <TriangleAlert size={20} color="var(--brass)" /> Not an emergency? Book a regular service instead.
          </span>
          <Link to="/services" className="btn btn-ink">Explore Services <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>
  </div>
);

export default SOS;
