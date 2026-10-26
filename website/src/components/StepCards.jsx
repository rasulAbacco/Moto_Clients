import { Search, ListChecks, CalendarDays, Wallet } from "lucide-react";

const steps = [
  { icon: Search, title: "Search", text: "Find verified garages near you" },
  { icon: ListChecks, title: "Choose", text: "Compare services, prices and reviews" },
  { icon: CalendarDays, title: "Book", text: "Schedule your service or request SOS" },
  { icon: Wallet, title: "Pay at Garage", text: "Pay directly at the garage after service" },
];

/** "How Motor Konnect Works?" — four steps joined by an animated dotted line. */
const StepCards = () => (
  <section className="section-sm" style={{ paddingTop: 88 }}>
    <style>{`
      .how { display: grid; grid-template-columns: 1fr 2.3fr; gap: 56px; align-items: center; }
      @media (max-width: 1024px) { .how { grid-template-columns: 1fr; gap: 40px; } }
      .how-steps { display: grid; grid-template-columns: repeat(4, 1fr); position: relative; }
      .how-line { position: absolute; top: 33px; left: 12.5%; right: 12.5%; height: 2px;
        background: repeating-linear-gradient(90deg, var(--brass-2) 0 5px, transparent 5px 11px);
        transform-origin: left; transform: scaleX(0); transition: transform 1.8s var(--ease) .3s; }
      .reveal.in .how-line { transform: scaleX(1); }
      .how-step { text-align: left; position: relative; padding: 0 10px; opacity: 0; transform: translateY(22px); transition: opacity .8s var(--ease), transform .8s var(--ease); }
      .reveal.in .how-step { opacity: 1; transform: none; }
      .how-step .icon-box { width: 66px; height: 66px; margin-bottom: 22px; position: relative; z-index: 1; border: 6px solid var(--cream); box-sizing: content-box; transition: transform .6s var(--ease), background .4s, color .4s; }
      .how-step:hover .icon-box { background: var(--copper-grad); color: #fff; transform: translateY(-6px); }
      .how-step h3 { display: flex; align-items: center; gap: 10px; font-family: var(--serif); font-weight: 700; font-size: 1.2rem; color: var(--ink); margin: 0 0 8px; }
      .how-step h3 b { width: 24px; height: 24px; border-radius: 50%; background: var(--ink); color: #fff; font-family: var(--sans); font-size: .72rem; display: grid; place-items: center; flex-shrink: 0; }
      .how-step p { margin: 0; color: var(--muted); font-size: .88rem; line-height: 1.6; padding-left: 34px; }
      @media (max-width: 720px) { .how-steps { grid-template-columns: 1fr 1fr; row-gap: 36px; } .how-line { display: none; } }
    `}</style>
    <div className="wrap how">
      <div className="reveal from-left">
        <h2 className="h2" style={{ color: "var(--ink)" }}>How <em style={{ fontStyle: "normal" }}>Motor Konnect</em> Works?</h2>
        <p className="lead" style={{ marginTop: 14 }}>Get complete vehicle care in just a few simple steps.</p>
      </div>
      <div className="how-steps reveal">
        <div className="how-line" />
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="how-step" style={{ transitionDelay: `${0.3 + i * 0.18}s` }}>
              <span className="icon-box soft"><Icon size={26} /></span>
              <h3><b>{i + 1}</b>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default StepCards;
