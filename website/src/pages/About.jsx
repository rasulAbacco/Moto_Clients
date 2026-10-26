import { Link } from "react-router-dom";
import { ArrowRight, Eye, Target, HeartHandshake, ShieldCheck, Scale, Users, Sparkles, MapPin, Quote } from "lucide-react";
import PageHero, { RiseText } from "../components/PageHero";
import Ecosystem from "../components/Ecosystem";
import Testimonials from "../components/Testimonials";
import Counter from "../components/Counter";
import { IMG } from "../data/images";

const values = [
  { icon: Scale, title: "Transparency first", text: "Clear estimates, pay-at-garage billing and zero platform markup — always." },
  { icon: ShieldCheck, title: "Safety always", text: "Every partner and technician is verified before they ever touch your vehicle." },
  { icon: HeartHandshake, title: "Fair to partners", text: "Garages keep what they earn and get tools that help their business grow." },
  { icon: Sparkles, title: "Craft & care", text: "We celebrate good workmanship and hold every job to a high standard." },
];

const timeline = [
  ["The idea", "Frustrated by hidden charges and unreliable roadside help, our founding team set out to fix vehicle care in India."],
  ["Motor Desk", "We built a CRM for garages first, so partners could manage bookings, staff and inventory digitally."],
  ["Motor Konnect app", "Drivers got one app to discover verified garages, book slots and pay directly at the garage."],
  ["24/7 SOS & parts", "Roadside assistance and a Spare Parts Desk joined the network — now live across 180+ cities."],
];

const About = () => (
  <div>
    <style>{`
      .story { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
      @media (max-width: 960px) { .story { grid-template-columns: 1fr; gap: 40px; } }
      .story-imgs { position: relative; padding: 0 0 60px 0; }
      .story-imgs .a { aspect-ratio: 4/3.2; border-radius: 26px; }
      .story-imgs .b { position: absolute; width: 48%; right: -18px; bottom: 0; aspect-ratio: 1; border-radius: 22px; border: 8px solid var(--cream); box-shadow: var(--shadow-lg); }
      .story-badge { position: absolute; left: 24px; bottom: 30px; background: #fff; border-radius: 18px; padding: 18px 22px; box-shadow: var(--shadow-lg); animation: float 6s ease-in-out infinite; }
      .story-badge b { font-family: var(--serif); font-size: 2rem; color: var(--brass); display: block; line-height: 1; }
      .mv { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; }
      @media (max-width: 560px) { .mv { grid-template-columns: 1fr; } }
      .mv .card { padding: 24px; }
      .mv h4 { margin: 14px 0 6px; font-family: var(--serif); font-size: 1.15rem; color: var(--ink); }
      .mv p { margin: 0; font-size: .9rem; color: var(--muted); line-height: 1.6; }
      .num-band { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
      .num-band > div { padding: 44px 20px; text-align: center; }
      .num-band > div + div { border-left: 1px solid var(--line); }
      .num-band b { font-family: var(--serif); font-weight: 700; font-size: clamp(2.2rem, 4vw, 3.2rem); color: var(--ink); display: block; line-height: 1; }
      .num-band > div > span { font-size: .72rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--muted); margin-top: 10px; display: block; }
      @media (max-width: 720px) { .num-band { grid-template-columns: 1fr 1fr; } .num-band > div:nth-child(3) { border-left: 0; } .num-band > div:nth-child(n+3) { border-top: 1px solid var(--line); } }
      .val { padding: 32px; }
      .val h3 { color: var(--ink); margin: 20px 0 10px; font-size: 1.3rem; }
      .val p { margin: 0; color: var(--muted); line-height: 1.65; font-size: .92rem; }
      .tl { position: relative; display: grid; gap: 0; max-width: 820px; margin: 0 auto; }
      .tl::before { content: ""; position: absolute; left: 23px; top: 10px; bottom: 10px; width: 2px; background: linear-gradient(var(--brass-2), var(--line)); }
      .tl-item { display: flex; gap: 28px; padding: 0 0 40px; position: relative; }
      .tl-item:last-child { padding-bottom: 0; }
      .tl-dot { width: 48px; height: 48px; border-radius: 50%; background: var(--copper-grad); color: #fff; display: grid; place-items: center; flex-shrink: 0; font-weight: 800; position: relative; z-index: 1; box-shadow: 0 0 0 6px var(--cream); }
      .tl-item h4 { margin: 10px 0 8px; font-family: var(--serif); font-size: 1.35rem; color: var(--ink); }
      .tl-item p { margin: 0; color: var(--muted); line-height: 1.7; }
      .quote-band { border-radius: 28px; background: var(--ink); color: #fff; padding: 64px 56px; display: grid; grid-template-columns: auto 1fr; gap: 40px; align-items: center; position: relative; overflow: hidden; }
      .quote-band::after { content: ""; position: absolute; width: 420px; height: 420px; border-radius: 50%; right: -140px; top: -180px; background: radial-gradient(circle, rgba(207,138,76,.3), transparent 65%); }
      @media (max-width: 760px) { .quote-band { grid-template-columns: 1fr; padding: 44px 28px; } }
    `}</style>

    <PageHero
      crumb="About"
      eyebrow="Our Story"
      title={<><RiseText text="Driving India" /><br /><span className="rise"><span style={{ animationDelay: ".25s" }}><em>with confidence.</em></span></span></>}
      lead="Motor Konnect is building India's most trusted automotive network — connecting vehicle owners with verified garages, genuine spare parts and round-the-clock roadside help, all under one transparent roof."
      image={IMG.aboutTeam}
    >
      <div className="page-enter" style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap", animationDelay: ".35s" }}>
        <Link to="/services" className="btn btn-ink">Our Services <ArrowRight size={16} /></Link>
        <Link to="/contact" className="btn btn-outline">Partner With Us</Link>
      </div>
    </PageHero>

    {/* Story */}
    <section className="section">
      <div className="wrap story">
        <div className="story-imgs reveal from-left">
          <div className="img-frame a"><img className="img-cover" src={IMG.aboutWorkshop} alt="A Motor Konnect partner workshop" loading="lazy" /></div>
          <div className="img-frame b"><img className="img-cover" src={IMG.garagePartner} alt="Garage partner at work" loading="lazy" /></div>
          <div className="story-badge"><b><Counter value="50K+" /></b><span className="muted" style={{ fontSize: ".82rem" }}>Verified garage partners</span></div>
        </div>
        <div className="reveal from-right d2">
          <span className="eyebrow">Who we are</span>
          <h2 className="h2" style={{ color: "var(--ink)", marginTop: 14 }}>Built by drivers, <em>for drivers.</em></h2>
          <p className="lead" style={{ marginTop: 18 }}>
            We started Motor Konnect because getting a car or bike fixed in India shouldn't feel like a gamble.
            Hidden markups, fake parts and long waits on the roadside were the norm — we knew technology could change that.
          </p>
          <p className="lead" style={{ marginTop: 14 }}>
            Today our platform connects thousands of drivers every day with garages that have been inspected,
            rated and held accountable — and pays those garages fairly for honest work.
          </p>
          <div className="mv">
            <div className="card card-hover"><span className="icon-box copper"><Target size={20} /></span><h4>Our mission</h4><p>Make vehicle care transparent, reliable and accessible for every driver in India.</p></div>
            <div className="card card-hover"><span className="icon-box copper"><Eye size={20} /></span><h4>Our vision</h4><p>A nationwide network where every garage is trusted and help is always minutes away.</p></div>
          </div>
        </div>
      </div>
    </section>

    {/* Numbers */}
    <section className="section-sm" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="num-band reveal">
          {[["50K+", "Verified garages"], ["180+", "Cities covered"], ["12K+", "Happy drivers"], ["24/7", "SOS support"]].map(([v, l]) => (
            <div key={l}><b><Counter value={v} /></b><span>{l}</span></div>
          ))}
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="section">
      <div className="wrap">
        <div className="center-head">
          <span className="eyebrow center reveal">What we stand for</span>
          <h2 className="h2 reveal d1" style={{ color: "var(--ink)" }}>Our <em>values</em></h2>
        </div>
        <div className="grid-4">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className={`card card-hover val reveal d${i + 1}`}>
                <span className="icon-box copper"><Icon size={22} /></span>
                <h3 className="h3">{v.title}</h3>
                <p>{v.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>

    {/* Journey */}
    <section className="section bg-white">
      <div className="wrap">
        <div className="center-head">
          <span className="eyebrow center reveal">Our journey</span>
          <h2 className="h2 reveal d1" style={{ color: "var(--ink)" }}>How we <em>got here</em></h2>
        </div>
        <div className="tl">
          {timeline.map(([t, p], i) => (
            <div key={t} className={`tl-item reveal d${i + 1}`}>
              <span className="tl-dot">{i + 1}</span>
              <div><h4>{t}</h4><p>{p}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <Ecosystem />

    {/* Quote */}
    <section className="section-sm">
      <div className="wrap">
        <div className="quote-band reveal zoom">
          <Quote size={64} color="var(--brass-2)" fill="var(--brass-2)" strokeWidth={0} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.3rem, 2.4vw, 1.9rem)", lineHeight: 1.45, margin: 0 }}>
              “Every driver deserves to know exactly what's being done to their vehicle, what it costs, and that help
              is one call away. That's the promise behind Motor Konnect.”
            </p>
            <p style={{ margin: "20px 0 0", color: "#b9c2cc", display: "flex", gap: 8, alignItems: "center" }}>
              <Users size={16} color="var(--brass-2)" /> The Motor Konnect team · <MapPin size={15} color="var(--brass-2)" /> Bangalore
            </p>
          </div>
        </div>
      </div>
    </section>

    <Testimonials />
    <div style={{ height: 60 }} />
  </div>
);

export default About;
