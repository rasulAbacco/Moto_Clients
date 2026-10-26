import { Smartphone, Monitor, Zap, ShieldCheck, History, Package, Users, Repeat, BarChart3, Check, MapPin, Star } from "lucide-react";

const PhoneMock = () => (
  <div className="phone float">
    <div className="phone-notch" />
    <div className="phone-screen">
      <p style={{ fontSize: 10, color: "#8b97a5", margin: 0 }}>Good evening, Rahul</p>
      <p style={{ fontFamily: "var(--serif)", fontSize: 17, color: "#fff", margin: "2px 0 12px" }}>Garages near you</p>
      {[["Sri Sai Auto Works", "1.2 km", "4.8"], ["Precision Motors", "2.4 km", "4.7"], ["Royal Bike Care", "3.1 km", "4.9"]].map(([n, d, r], i) => (
        <div key={n} className="phone-row" style={{ animationDelay: `${0.4 + i * 0.2}s` }}>
          <span className="phone-ic"><MapPin size={11} /></span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 10.5, color: "#fff", fontWeight: 700 }}>{n}</p>
            <p style={{ margin: 0, fontSize: 9, color: "#8b97a5" }}>{d} · Verified</p>
          </div>
          <span style={{ fontSize: 9.5, color: "var(--brass-2)", display: "flex", alignItems: "center", gap: 2 }}><Star size={9} fill="currentColor" />{r}</span>
        </div>
      ))}
      <div className="phone-cta">Book a slot</div>
      <div className="phone-sos">SOS</div>
    </div>
  </div>
);

const Ecosystem = () => (
  <section className="section">
    <style>{`
      .eco-app { padding: 52px 52px 0; overflow: hidden; display: flex; flex-direction: column; }
      .eco-desk { padding: 52px; background: var(--ink); border: 0; color: #eef2f6; display: flex; flex-direction: column; }
      .mini-feats { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; margin: 30px 0 44px; }
      .mini-feats b { display: flex; gap: 8px; align-items: center; font-size: .92rem; color: var(--ink); }
      .mini-feats b svg { color: var(--brass); }
      .mini-feats span { font-size: .85rem; color: var(--muted); display: block; margin-top: 4px; line-height: 1.5; }
      .phone-stage { margin-top: auto; height: 300px; border-radius: 24px 24px 0 0; background: linear-gradient(180deg, var(--brass-soft), #fff); display: flex; justify-content: center; align-items: flex-end; position: relative; overflow: hidden; }
      .phone-stage::before { content: ""; position: absolute; width: 380px; height: 380px; border-radius: 50%; border: 1px dashed rgba(176,138,74,.4); top: 40px; animation: spinSlow 60s linear infinite; }
      .phone { width: 210px; height: 290px; background: var(--ink); border-radius: 32px 32px 0 0; padding: 10px 10px 0; position: relative; box-shadow: 0 -10px 40px -10px rgba(11,31,51,.4); }
      .phone-notch { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); width: 60px; height: 14px; border-radius: 99px; background: #000; z-index: 2; }
      .phone-screen { background: #0f2740; height: 100%; border-radius: 24px 24px 0 0; padding: 36px 14px 0; position: relative; }
      .phone-row { display: flex; gap: 8px; align-items: center; padding: 8px; border-radius: 10px; background: rgba(255,255,255,.05); margin-bottom: 6px; opacity: 0; animation: pageIn .6s var(--ease) forwards; }
      .phone-ic { width: 22px; height: 22px; border-radius: 7px; background: rgba(201,164,100,.18); color: var(--brass-2); display: grid; place-items: center; }
      .phone-cta { margin-top: 10px; background: var(--brass); color: #fff; font-size: 10px; font-weight: 800; text-align: center; padding: 8px; border-radius: 10px; letter-spacing: .06em; }
      .phone-sos { position: absolute; right: 12px; top: 34px; background: var(--sos); color: #fff; font-size: 8px; font-weight: 800; padding: 3px 7px; border-radius: 6px; letter-spacing: .1em; }
      .desk-list { list-style: none; padding: 0; margin: 30px 0 40px; display: grid; gap: 16px; }
      .desk-list li { display: flex; gap: 14px; align-items: center; color: #dfe6ee; font-size: .95rem; }
      .chart { margin-top: auto; background: rgba(255,255,255,.04); border: 1px solid var(--line-dark); border-radius: 20px; padding: 22px; }
      .chart-bars { height: 90px; display: flex; align-items: flex-end; gap: 8px; margin-top: 16px; }
      .chart-bars i { flex: 1; border-radius: 6px 6px 2px 2px; background: rgba(255,255,255,.1); transform-origin: bottom; transform: scaleY(0); }
      .reveal.in .chart-bars i { animation: growBar 1.2s var(--ease) forwards; }
      .chart-bars i.hi { background: linear-gradient(180deg, var(--brass-2), var(--brass)); }
      .sync-bar { grid-column: span 12; padding: 30px 40px; display: flex; justify-content: space-between; align-items: center; gap: 24px; flex-wrap: wrap; background: var(--brass-soft); border-color: transparent; }
    `}</style>

    <div className="wrap">
      <div className="center-head">
        <span className="eyebrow center reveal">Integrated Ecosystem</span>
        <h2 className="h2 reveal d1" style={{ color: "var(--ink)" }}>One unified <em>network.</em></h2>
        <p className="lead reveal d2">
          Two products, one real-time data layer — connecting vehicle owners and service providers with
          complete transparency at every step.
        </p>
      </div>

      <div className="grid-12">
        <div className="card eco-app reveal from-left" style={{ gridColumn: "span 7" }}>
          <span className="chip chip-ink" style={{ alignSelf: "flex-start" }}><Smartphone size={12} /> For drivers</span>
          <h3 className="h2" style={{ color: "var(--ink)", marginTop: 18, fontSize: "2.4rem" }}>Motor Konnect</h3>
          <p className="lead" style={{ marginTop: 14, maxWidth: 460 }}>
            The digital companion for every vehicle owner — real-time booking, automated service
            history, genuine parts and instant SOS dispatch.
          </p>
          <div className="mini-feats">
            {[
              [Zap, "Instant SOS", "GPS-linked recovery in minutes."],
              [ShieldCheck, "Verified hubs", "Vetted, high-rated partners only."],
              [History, "Service history", "Every job & invoice, saved digitally."],
              [Package, "Genuine parts", "OEM & OES parts with warranty."],
            ].map(([Icon, t, s]) => (
              <div key={t}><b><Icon size={16} /> {t}</b><span>{s}</span></div>
            ))}
          </div>
          <div className="phone-stage"><PhoneMock /></div>
        </div>

        <div className="card eco-desk reveal from-right d2" style={{ gridColumn: "span 5" }}>
          <span className="chip chip-dark" style={{ alignSelf: "flex-start" }}><Monitor size={12} /> For garages</span>
          <h3 className="h2" style={{ color: "#fff", marginTop: 18, fontSize: "2.4rem" }}>Motor Desk</h3>
          <p className="lead" style={{ marginTop: 14 }}>
            A professional CRM built for garage owners to streamline workflow, manage teams and grow revenue.
          </p>
          <ul className="desk-list">
            {[
              [Package, "Smart inventory & parts control"],
              [Users, "Staff & payroll management"],
              [Repeat, "Automated service reminders"],
              [Check, "Digital job cards & invoicing"],
            ].map(([Icon, t]) => (
              <li key={t}><span className="icon-box dark" style={{ width: 36, height: 36, borderRadius: 10 }}><Icon size={16} /></span>{t}</li>
            ))}
          </ul>
          <div className="chart">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: ".8rem", color: "#a8b3c0", fontWeight: 600 }}>Weekly bookings</span>
              <BarChart3 size={16} color="var(--brass-2)" />
            </div>
            <div className="chart-bars">
              {[35, 60, 40, 85, 55, 75, 95].map((h, i) => (
                <i key={i} className={i === 6 ? "hi" : ""} style={{ height: `${h}%`, animationDelay: `${0.3 + i * 0.08}s` }} />
              ))}
            </div>
          </div>
        </div>

        <div className="card sync-bar reveal">
          <div>
            <h4 className="h3" style={{ color: "var(--ink)" }}>Real-time sync, always on</h4>
            <p className="muted" style={{ margin: "6px 0 0" }}>Bookings made in the app appear in the garage's Motor Desk CRM in under 2 seconds.</p>
          </div>
          <span className="chip chip-ok" style={{ padding: "10px 18px", background: "#fff" }}><span className="dot-live" /> All systems operational</span>
        </div>
      </div>
    </div>
  </section>
);

export default Ecosystem;
