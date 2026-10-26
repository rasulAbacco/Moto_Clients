import { Link } from "react-router-dom";
import { ShieldCheck, Activity, ScanSearch, Truck, MapPin, ArrowRight, BellRing, Navigation, BadgeCheck, Zap } from "lucide-react";

const BentoSOS = () => (
  <section className="section bg-ink" style={{ overflow: "hidden" }}>
    <style>{`
      .bento { margin-top: 0; }
      .bento .card-dark { padding: 40px; position: relative; overflow: hidden; transition: transform .5s var(--ease), border-color .4s; }
      .bento .card-dark:hover { transform: translateY(-6px); border-color: rgba(201,164,100,.45); }
      .bento h3 { color: #fff; margin: 22px 0 12px; }
      .bento p { color: #a8b3c0; line-height: 1.75; margin: 0; }
      .b-hero { background: linear-gradient(150deg, #8f2a1f 0%, var(--sos) 55%, #d85a3f 100%) !important; border: 0 !important; }
      .b-hero p { color: #fde3df !important; max-width: 440px; }
      .b-hero .bolt { position: absolute; right: -40px; top: -40px; opacity: .1; color: #fff; }
      .bar { height: 8px; border-radius: 99px; background: rgba(255,255,255,.08); overflow: hidden; }
      .bar i { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--brass), var(--brass-2)); transform-origin: left; transform: scaleX(0); }
      .reveal.in .bar i { animation: fillX 1.6s var(--ease) .4s forwards; }
      .row-stat { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-radius: 14px; background: rgba(255,255,255,.04); border: 1px solid var(--line-dark); margin-top: 10px; font-size: .92rem; color: #eef2f6; }
      .radar { position: relative; width: 120px; height: 120px; border-radius: 50%; border: 1px solid rgba(201,164,100,.25); display: grid; place-items: center; flex-shrink: 0;
        background: radial-gradient(circle, rgba(201,164,100,.08), transparent 70%); }
      .radar::before, .radar::after { content: ""; position: absolute; inset: 0; border-radius: 50%; border: 1px solid var(--brass-2); animation: radar 2.6s ease-out infinite; }
      .radar::after { animation-delay: 1.3s; }
      .radar-sweep { position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(from 0deg, rgba(201,164,100,.35), transparent 25%); animation: spinSlow 4s linear infinite; }
      .feat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px; margin-top: 88px; padding-top: 64px; border-top: 1px solid var(--line-dark); }
      @media (max-width: 900px) { .feat-row { grid-template-columns: 1fr; gap: 32px; } }
      .feat-row h4 { color: #fff; font-size: 1.1rem; margin: 0 0 8px; font-weight: 700; }
      .feat-row p { color: #a8b3c0; margin: 0; line-height: 1.7; font-size: .94rem; }
    `}</style>

    <div className="wrap">
      <div className="section-head">
        <div className="reveal">
          <span className="eyebrow" style={{ color: "var(--brass-2)" }}>Emergency Infrastructure</span>
          <h2 className="h2" style={{ color: "#fff" }}>Command centre <em>response</em></h2>
        </div>
        <span className="chip chip-ok reveal d2" style={{ padding: "10px 18px", fontSize: ".72rem" }}>
          <span className="dot-live" /> Priority response · 14 min
        </span>
      </div>

      <div className="grid-12 bento">
        <div className="card-dark b-hero reveal" style={{ gridColumn: "span 7" }}>
          <Zap className="bolt" size={300} />
          <span className="icon-box" style={{ background: "rgba(255,255,255,.18)", color: "#fff" }}><ShieldCheck size={24} /></span>
          <h3 className="h2" style={{ fontSize: "2.2rem" }}>Critical roadside recovery</h3>
          <p>
            Battery restoration, emergency tyre changes and fuel delivery — dispatched to your exact
            coordinates by the nearest verified technician in the Motor Konnect network.
          </p>
          <Link to="/sos" className="btn" style={{ background: "#fff", color: "var(--sos)", marginTop: 32 }}>
            Activate SOS <ArrowRight size={16} />
          </Link>
        </div>

        <div className="card-dark reveal d2" style={{ gridColumn: "span 5" }}>
          <span className="icon-box dark"><Activity size={24} /></span>
          <h3 className="h3">Real-time grid</h3>
          <p style={{ marginBottom: 26 }}>84 Motor Desk–certified technicians active within your immediate radius.</p>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".72rem", fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "#8b97a5", marginBottom: 10 }}>
            <span>Network capacity</span><span style={{ color: "#5fd39b" }}>Healthy · 72%</span>
          </div>
          <div className="bar"><i style={{ width: "72%" }} /></div>
          {[["Tyre & battery hubs", "12 nearby", "#5fd39b"], ["Recovery units", "5 active", "var(--brass-2)"]].map(([l, c, col]) => (
            <div className="row-stat" key={l}>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: col }} />{l}</span>
              <span style={{ color: "#8b97a5", fontWeight: 700 }}>{c}</span>
            </div>
          ))}
        </div>

        <div className="card-dark reveal d1" style={{ gridColumn: "span 4" }}>
          <span className="icon-box dark"><ScanSearch size={24} /></span>
          <h3 className="h3">Mobile diagnostics</h3>
          <p>OBD scanning on the spot to check roadworthiness and decide between a roadside fix or a tow.</p>
        </div>
        <div className="card-dark reveal d2" style={{ gridColumn: "span 4" }}>
          <span className="icon-box dark"><Truck size={24} /></span>
          <h3 className="h3">Premium towing</h3>
          <p>Flat-bed and wheel-lift transport with live GPS tracking — safe for premium and low-clearance vehicles.</p>
        </div>
        <div className="card-dark reveal d3" style={{ gridColumn: "span 4", display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 150 }}>
            <span className="icon-box dark"><MapPin size={24} /></span>
            <h3 className="h3">Precise location</h3>
            <p>Pinpoints you on unnamed highways and rural corridors.</p>
          </div>
          <div className="radar"><div className="radar-sweep" /><MapPin size={26} color="var(--brass-2)" /></div>
        </div>
      </div>

      <div className="feat-row">
        {[
          [BellRing, "Live alerts", "SMS and in-app updates with your technician's name, contact and live ETA."],
          [Navigation, "Precision mapping", "Location tech engineered for highway recovery and rural roadside dispatch."],
          [BadgeCheck, "Vetted technicians", "Every responder is background-verified and Motor Konnect certified."],
        ].map(([Icon, t, b], i) => (
          <div key={t} className={`reveal d${i + 1}`} style={{ display: "flex", gap: 18 }}>
            <span className="icon-box dark" style={{ width: 46, height: 46 }}><Icon size={20} /></span>
            <div><h4>{t}</h4><p>{b}</p></div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default BentoSOS;
