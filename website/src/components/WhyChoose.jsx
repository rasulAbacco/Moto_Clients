import { ShieldCheck, Headphones, Settings, FileText, MapPin, CalendarCheck } from "lucide-react";

const items = [
  { icon: ShieldCheck, title: "Verified Garages", text: "Trusted & rated by real users" },
  { icon: Headphones, title: "24/7 SOS Support", text: "Always here when you need help" },
  { icon: Settings, title: "Genuine Spare Parts", text: "Original parts at best prices" },
  { icon: FileText, title: "Transparent Pricing", text: "No hidden charges, ever" },
  { icon: MapPin, title: "Wide Coverage", text: "Available in 180+ cities" },
  { icon: CalendarCheck, title: "Easy Booking", text: "Quick and hassle-free" },
];

const WhyChoose = () => (
  <section className="section-sm" style={{ paddingTop: 40 }}>
    <style>{`
      .why2 { display: grid; grid-template-columns: 1fr 2.3fr; gap: 56px; align-items: center; padding-top: 56px; border-top: 1px solid var(--line); }
      @media (max-width: 1024px) { .why2 { grid-template-columns: 1fr; gap: 36px; } }
      .why2-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px 28px; }
      @media (max-width: 760px) { .why2-grid { grid-template-columns: 1fr 1fr; } }
      @media (max-width: 480px) { .why2-grid { grid-template-columns: 1fr; } }
      .why2-item { display: flex; gap: 16px; align-items: flex-start; padding: 14px; margin: -14px; border-radius: 16px; transition: background .4s, transform .4s var(--ease); }
      .why2-item:hover { background: #fff; transform: translateY(-3px); box-shadow: var(--shadow); }
      .why2-item .icon-box { width: 50px; height: 50px; background: transparent; border: 1.5px solid var(--brass-2); }
      .why2-item:hover .icon-box { background: var(--copper-grad); color: #fff; border-color: transparent; }
      .why2-item h4 { margin: 2px 0 4px; font-family: var(--serif); font-weight: 700; font-size: 1.05rem; color: var(--ink); }
      .why2-item p { margin: 0; font-size: .85rem; color: var(--muted); }
    `}</style>
    <div className="wrap why2">
      <div className="reveal from-left">
        <h2 className="h2" style={{ color: "var(--ink)" }}>Why Choose<br /><em style={{ fontStyle: "normal" }}>Motor Konnect?</em></h2>
        <p className="lead" style={{ marginTop: 14 }}>A smarter, safer and more transparent way to take care of your vehicle.</p>
      </div>
      <div className="why2-grid">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <div key={it.title} className={`why2-item reveal d${(i % 3) + 1}`}>
              <span className="icon-box soft"><Icon size={22} /></span>
              <div><h4>{it.title}</h4><p>{it.text}</p></div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default WhyChoose;
