import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Car, Bike, Wrench, Paintbrush, Snowflake, Sparkles, Disc3, Gem, BatteryCharging, ClipboardCheck, Cog, Lightbulb,
  Waves, FileCheck2, Gauge, Fuel, OctagonAlert, Zap, Droplets, Search, ArrowRight, Check, CreditCard, CheckCircle2,
  ShieldCheck, Clock, Package, Siren,
} from "lucide-react";
import PageHero, { RiseText } from "../components/PageHero";
import Testimonials from "../components/Testimonials";
import { IMG } from "../data/images";

const carServices = [
  { img: IMG.car.carGeneral, icon: Wrench, title: "Car Services", tag: "Comprehensive", desc: "Full-vehicle diagnostics including fluids, filters, and safety checkpoints for peak performance." },
  { img: IMG.car.carDenting, icon: Paintbrush, title: "Denting & Painting", tag: "Bodywork", desc: "Premium refinishing using colour-matching technology and factory-grade paint booth systems." },
  { img: IMG.car.carAc, icon: Snowflake, title: "AC Service & Repair", tag: "Cooling", desc: "Gas recharging, compressor diagnostics, and cabin filter cleaning for optimal temperature control." },
  { img: IMG.car.carSpa, icon: Droplets, title: "Car Spa & Cleaning", tag: "Hygiene", desc: "Deep interior sanitisation and multi-stage exterior washing using eco-friendly foam." },
  { img: IMG.car.carTyres, icon: Disc3, title: "Tyres & Wheel Care", tag: "Safety", desc: "Precision balancing, 3D alignment, and high-performance tyre replacements for maximum grip." },
  { img: IMG.car.carDetailing, icon: Gem, title: "Detailing Services", tag: "Elite", desc: "Ceramic coating, paint protection films, and leather restoration for showroom-quality finishes." },
  { img: IMG.car.carBattery, icon: BatteryCharging, title: "Batteries", tag: "Electrical", desc: "Voltage testing and authorised battery replacements with nationwide warranty coverage." },
  { img: IMG.car.carInspection, icon: ClipboardCheck, title: "Car Inspections", tag: "Audit", desc: "Thorough 150-point pre-purchase or safety inspections with detailed digital reports." },
  { img: IMG.car.carClutch, icon: Cog, title: "Clutch & Body Parts", tag: "Mechanical", desc: "Expert assembly and repair of transmission systems and external structural components." },
  { img: IMG.car.carWindshield, icon: Lightbulb, title: "Windshield & Lights", tag: "Visibility", desc: "Crystal-clear glass replacement and LED/halogen illumination alignment and repair." },
  { img: IMG.car.carSuspension, icon: Waves, title: "Suspension & Fitments", tag: "Chassis", desc: "Shock absorber replacement and bush diagnostics for a smooth, vibration-free ride." },
  { img: IMG.car.carInsurance, icon: FileCheck2, title: "Insurance Claims", tag: "Support", desc: "End-to-end cashless claim facilitation through our Motor Desk network partners." },
];

const bikeServices = [
  { img: IMG.bike.bikeEngine, icon: Gauge, title: "Engine Maintenance", tag: "Core", desc: "Optimised oil changes and valve adjustments for maximum power delivery and longevity." },
  { img: IMG.bike.bikeClutch, icon: Cog, title: "Transmission & Clutch", tag: "Drive", desc: "Chain lubrication, sprocket replacement, and clutch plate calibration for smooth shifting." },
  { img: IMG.bike.bikeFuel, icon: Fuel, title: "Fuel System", tag: "Combustion", desc: "Carburettor cleaning or injector diagnostics for improved mileage and throttle response." },
  { img: IMG.bike.bikeBrakes, icon: OctagonAlert, title: "Brake System", tag: "Safety", desc: "Brake pad replacement and hydraulic fluid bleeding for instant stopping power." },
  { img: IMG.bike.bikeElectrical, icon: Zap, title: "Electrical System", tag: "Wiring", desc: "Harness diagnostics, spark plug replacement, and lighting circuit repairs." },
  { img: IMG.bike.bikeSuspension, icon: Waves, title: "Suspension", tag: "Stability", desc: "Fork oil replacement and rear mono-shock adjustment for improved cornering stability." },
  { img: IMG.bike.bikeRepair, icon: Wrench, title: "Engine Repair", tag: "Major", desc: "Complete engine overhaul and precision re-boring using certified genuine parts." },
  { img: IMG.bike.bikeCleaning, icon: Droplets, title: "Exterior Cleaning", tag: "Care", desc: "Pressure washing and chain-safe degreasing to maintain aesthetics and part life." },
  { img: IMG.bike.bikeDetailing, icon: Sparkles, title: "Premium Detailing", tag: "Premium", desc: "Teflon coating and buffing to prevent oxidation and road-grime build-up." },
  { img: IMG.bike.bikeBattery, icon: BatteryCharging, title: "Battery Service", tag: "Power", desc: "Charging-system analysis and heavy-duty battery installations for high-cc engines." },
  { img: IMG.bike.bikeTyre, icon: Disc3, title: "Tyre Service", tag: "Grip", desc: "Performance tyre fitment and nitrogen inflation for better high-speed heat management." },
  { img: IMG.bike.bikeInspection, icon: ClipboardCheck, title: "General Inspection", tag: "Standard", desc: "Quick check for daily commuters ensuring lights, brakes, and fluids are safe." },
];

const packages = [
  { name: "Essential", for: "Every 5,000 km / 6 months", items: ["Engine oil replacement", "Oil filter replacement", "Air filter cleaning", "Coolant & brake fluid top-up", "15-point safety check"] },
  { name: "Standard", for: "Every 10,000 km / 1 year", featured: true, items: ["Everything in Essential", "Air & cabin filter replacement", "Spark plug check / replace", "Brake pad cleaning", "Wheel alignment check", "Battery health report"] },
  { name: "Comprehensive", for: "Every 40,000 km / 2 years", items: ["Everything in Standard", "Fuel filter replacement", "Gearbox & coolant flush", "Suspension inspection", "AC system check", "150-point digital report"] },
];

const Services = () => {
  const [tab, setTab] = useState("car");
  const [q, setQ] = useState("");
  const list = (tab === "car" ? carServices : bikeServices).filter((s) =>
    `${s.title} ${s.tag} ${s.desc}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <style>{`
        .tabs { display: inline-flex; padding: 6px; border-radius: 999px; background: #fff; border: 1px solid var(--line); position: relative; }
        .tab { position: relative; z-index: 1; display: inline-flex; gap: 10px; align-items: center; padding: 13px 26px; border: 0; background: none; border-radius: 999px; font-weight: 700; font-size: .82rem; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); transition: color .4s; }
        .tab.on { color: #fff; }
        .tab-ind { position: absolute; top: 6px; bottom: 6px; width: calc(50% - 6px); border-radius: 999px; background: var(--ink); transition: transform .5s var(--ease); }
        .toolbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 40px; }
        .search { position: relative; min-width: 280px; flex: 0 1 360px; }
        .search svg { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: var(--muted); }
        .search .input { padding-left: 48px; border-radius: 999px; background: #fff; }

        .svc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        @media (max-width: 1024px) { .svc-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .svc-grid { grid-template-columns: 1fr; } }
        .svc { padding: 0 28px 28px; position: relative; overflow: hidden; }
        .svc-img { margin: 0 -28px; border-radius: 0; aspect-ratio: 16/9; }
        .svc-ic { width: 50px; height: 50px; margin-top: -25px; position: relative; z-index: 2; border: 4px solid #fff; box-sizing: content-box; }
        .svc .num { position: absolute; right: 18px; top: 14px; font-family: var(--serif); font-weight: 700; font-size: 1rem; color: #fff; background: rgba(22,27,34,.45); backdrop-filter: blur(6px); padding: 4px 10px; border-radius: 99px; }
        .svc h3 { color: var(--ink); margin: 18px 0 10px; font-size: 1.45rem; }
        .svc p { margin: 0 0 22px; color: var(--muted); font-size: .92rem; line-height: 1.65; }
        .svc .more { display: inline-flex; gap: 8px; align-items: center; font-size: .8rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--ink); }
        .svc .more svg { transition: transform .4s var(--ease); }
        .svc:hover .more svg { transform: translateX(6px); }
        .svc::after { content: ""; position: absolute; left: 0; bottom: 0; height: 3px; width: 100%; background: var(--brass); transform: scaleX(0); transform-origin: left; transition: transform .6s var(--ease); }
        .svc:hover::after { transform: scaleX(1); }

        .pkg { padding: 40px; display: flex; flex-direction: column; }
        .pkg.featured { background: var(--ink); border-color: var(--ink); color: #fff; transform: translateY(-12px); }
        .pkg ul { list-style: none; padding: 0; margin: 28px 0 32px; display: grid; gap: 14px; }
        .pkg li { display: flex; gap: 12px; align-items: center; font-size: .93rem; }
        .pkg li svg { color: var(--brass); flex-shrink: 0; }
        @media (max-width: 1024px) { .pkg.featured { transform: none; } }

        .trust { border-radius: 36px; background: var(--ink); padding: 72px 56px; display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; color: #fff; position: relative; overflow: hidden; }
        @media (max-width: 960px) { .trust { grid-template-columns: 1fr; padding: 48px 28px; } }
        .tf { display: flex; gap: 18px; padding: 22px; border-radius: 18px; background: rgba(255,255,255,.04); border: 1px solid var(--line-dark); margin-top: 14px; transition: .4s var(--ease); }
        .tf:hover { background: rgba(255,255,255,.07); transform: translateX(6px); }
        .tf b { color: #fff; display: block; } .tf span { color: #a8b3c0; font-size: .9rem; }
        .desk-card { border-radius: 28px; padding: 48px; background: linear-gradient(150deg, var(--brass), #8a6a35); position: relative; overflow: hidden; }
        .desk-card::before { content: ""; position: absolute; width: 300px; height: 300px; border-radius: 50%; border: 40px solid rgba(255,255,255,.08); right: -100px; bottom: -120px; }
      `}</style>

      <PageHero
        crumb="Services"
        eyebrow="Network Capabilities"
        title={<><RiseText text="Expert solutions for" /><br /><RiseText text="every" delay={0.3} /><span className="rise"><span style={{ animationDelay: ".4s" }}><em>component.</em></span></span></>}
        lead="24 car and two-wheeler services delivered by verified Motor Konnect partner garages — with transparent estimates, genuine parts and pay-at-garage billing."
        image={IMG.servicesHero}
        aside={
          <div className="grid-2" style={{ gap: 14 }}>
            {[["24", "Services"], ["50K+", "Garages"], ["150", "Point checks"], ["0%", "Markup"]].map(([v, l]) => (
              <div key={l} style={{ padding: 22, borderRadius: 18, background: "rgba(255,255,255,.92)", backdropFilter: "blur(10px)", boxShadow: "var(--shadow-lg)" }}>
                <div style={{ fontFamily: "var(--serif)", fontWeight: 700, fontSize: "2rem", color: "var(--brass)" }}>{v}</div>
                <div style={{ fontSize: ".7rem", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)", marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        }
      />

      {/* Service catalogue */}
      <section className="section">
        <div className="wrap">
          <div className="toolbar reveal">
            <div className="tabs">
              <span className="tab-ind" style={{ transform: tab === "car" ? "translateX(0)" : "translateX(100%)" }} />
              <button className={`tab ${tab === "car" ? "on" : ""}`} onClick={() => setTab("car")}><Car size={17} /> Car Services</button>
              <button className={`tab ${tab === "bike" ? "on" : ""}`} onClick={() => setTab("bike")}><Bike size={17} /> Bike Services</button>
            </div>
            <div className="search">
              <Search size={17} />
              <input className="input" placeholder="Search a service…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>

          <div className="svc-grid" key={tab}>
            {list.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className={`card card-hover svc reveal d${(i % 3) + 1}`}>
                  <div className="img-frame svc-img"><img className="img-cover" src={s.img} alt={s.title} loading="lazy" /><span className="num">{String(i + 1).padStart(2, "0")}</span></div>
                  <span className="icon-box copper svc-ic"><Icon size={20} /></span>
                  <h3 className="h3">{s.title}</h3>
                  <p>{s.desc}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="chip">{s.tag}</span>
                    <Link to="/contact" className="more">Book <ArrowRight size={14} /></Link>
                  </div>
                </div>
              );
            })}
          </div>
          {list.length === 0 && (
            <p className="muted" style={{ textAlign: "center", padding: 40 }}>
              No services match “{q}”. Try another word, or <Link to="/contact" style={{ color: "var(--brass)", fontWeight: 700 }}>ask our team</Link>.
            </p>
          )}
        </div>
      </section>

      {/* Packages */}
      <section className="section bg-white">
        <div className="wrap">
          <div className="center-head">
            <span className="eyebrow center reveal">Scheduled Maintenance</span>
            <h2 className="h2 reveal d1" style={{ color: "var(--ink)" }}>Service <em>packages</em></h2>
            <p className="lead reveal d2">Pick a plan by mileage. Your partner garage shares a written estimate before any work begins — you pay only after inspecting the job.</p>
          </div>
          <div className="grid-3" style={{ alignItems: "stretch" }}>
            {packages.map((p, i) => (
              <div key={p.name} className={`card pkg reveal d${i + 1} ${p.featured ? "featured" : ""}`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 className="h3" style={{ color: p.featured ? "#fff" : "var(--ink)", fontSize: "1.9rem" }}>{p.name}</h3>
                  {p.featured && <span className="chip">Most chosen</span>}
                </div>
                <p style={{ margin: "8px 0 0", fontSize: ".85rem", color: p.featured ? "#a8b3c0" : "var(--muted)" }}>{p.for}</p>
                <ul>
                  {p.items.map((it) => <li key={it} style={{ color: p.featured ? "#dfe6ee" : "var(--text)" }}><Check size={16} />{it}</li>)}
                </ul>
                <div style={{ marginTop: "auto" }}>
                  <p style={{ fontSize: ".78rem", color: p.featured ? "#a8b3c0" : "var(--muted)", margin: "0 0 16px" }}>Estimate shared by garage · Pay at garage</p>
                  <Link to="/contact" className={`btn ${p.featured ? "btn-brass" : "btn-outline"}`} style={{ width: "100%" }}>Request this package <ArrowRight size={16} /></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="section-sm">
        <div className="wrap grid-4">
          {[
            [ShieldCheck, "Workmanship warranty", "On eligible jobs at partner garages."],
            [Package, "Genuine parts", "OEM / OES parts with invoices."],
            [Clock, "On-time delivery", "Live ETA and status updates."],
            [Siren, "SOS backup", "24/7 roadside help if anything fails."],
          ].map(([Icon, t, s], i) => (
            <div key={t} className={`reveal d${i + 1}`} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <span className="icon-box ink"><Icon size={20} /></span>
              <div><b style={{ color: "var(--ink)" }}>{t}</b><p className="muted" style={{ margin: "4px 0 0", fontSize: ".9rem" }}>{s}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust centre */}
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className="trust reveal zoom">
            <div>
              <span className="eyebrow" style={{ color: "var(--brass-2)" }}>Trust Centre</span>
              <h2 className="h2" style={{ color: "#fff", marginTop: 14 }}>Direct booking.<br /><em>Direct trust.</em></h2>
              <p className="lead" style={{ marginTop: 18 }}>Our Pay-at-Garage model eliminates hidden markups. We connect verified hubs and drivers — and step out of the way of your bill.</p>
              <div className="tf"><CheckCircle2 color="var(--brass-2)" size={22} /><div><b>0% user markup</b><span>Standardised estimates with zero platform commission for users.</span></div></div>
              <div className="tf"><CreditCard color="var(--brass-2)" size={22} /><div><b>Post-service payment</b><span>Inspect the results at the garage before settling your bill directly.</span></div></div>
            </div>
            <div className="desk-card">
              <span className="icon-box" style={{ background: "rgba(255,255,255,.18)", color: "#fff" }}><Gauge size={24} /></span>
              <h3 className="h2" style={{ color: "#fff", fontSize: "2.1rem", margin: "24px 0 14px" }}>Motor Desk integration</h3>
              <p style={{ color: "#fbf3e4", lineHeight: 1.7, margin: "0 0 32px", position: "relative" }}>
                Real-time bay availability and technician dispatching through our proprietary CRM layer — so your slot is a real slot.
              </p>
              <Link to="/contact" className="btn" style={{ background: "#fff", color: "var(--ink)", position: "relative" }}>Explore Partner Hubs <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
      </section>

      <Testimonials title="Loved by drivers across India" />
      <div style={{ height: 60 }} />
    </div>
  );
};

export default Services;
