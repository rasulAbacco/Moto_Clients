import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Siren, Star, CalendarCheck, HardHat, Wrench, Car, Settings, MapPin, ChevronRight } from "lucide-react";
import { RiseText } from "./PageHero";
import { IMG } from "../data/images";

const features = [
  { icon: Wrench, title: "Car Service & Repair", text: "Verified garages for all major car and bike brands", to: "/services" },
  { icon: Car, title: "Roadside Assistance 24/7 SOS", text: "Help for breakdowns, towing, battery & more", to: "/sos" },
  { icon: Settings, title: "Genuine Spare Parts", text: "Order original parts at the best prices", to: "/spare-parts" },
  { icon: MapPin, title: "Find Nearby Garages", text: "Discover trusted garages near your location", to: "/services" },
];

const Hero = () => {
  const imgRef = useRef(null);

  // Gentle parallax on the car photo
  useEffect(() => {
    let raf;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 900);
        if (imgRef.current) imgRef.current.style.transform = `translate3d(0, ${y * 0.18}px, 0) scale(${1.04 + y * 0.00008})`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="hero2">
      <style>{`
        .hero2 { position: relative; background: var(--cream); padding-bottom: 40px; }
        .hero2-stage { position: relative; min-height: 640px; overflow: hidden; }
        .hero2-bg { position: absolute; top: 0; right: 0; bottom: 0; width: 64%; overflow: hidden; }
        .hero2-bg-in { position: absolute; inset: -40px 0 0 0; animation: heroIn 1.8s var(--ease) both; }
        .hero2-bg img { width: 100%; height: 100%; object-fit: cover; object-position: 60% 50%; will-change: transform; transform: scale(1.04); }
        @keyframes heroIn { from { opacity: 0; transform: scale(1.12); filter: blur(6px); } to { opacity: 1; transform: none; filter: none; } }
        .hero2-bg::before { content: ""; position: absolute; inset: 0; z-index: 1; background: linear-gradient(90deg, var(--cream) 0%, rgba(247,241,232,.85) 14%, rgba(247,241,232,0) 46%), linear-gradient(0deg, var(--cream) 0%, rgba(247,241,232,0) 22%); }
        .hero2-grid { position: relative; z-index: 2; display: grid; grid-template-columns: 1fr 1fr; min-height: 640px; align-items: center; }
        .hero2-copy { padding: 56px 0 120px; }
        .hero2 .display { font-size: clamp(2.8rem, 5.6vw, 5.1rem); color: var(--ink); margin: 26px 0 24px; }
        .hero2 .display em { color: var(--brass); }
        .pill-new { display: inline-flex; align-items: center; gap: 10px; padding: 6px 14px 6px 6px; border-radius: 999px; background: #fff; border: 1px solid var(--line); font-size: .8rem; color: #4a443c; box-shadow: var(--shadow); transition: .3s; }
        .pill-new:hover { transform: translateX(4px); }
        .pill-new b { background: var(--copper-grad); color: #fff; padding: 4px 11px; border-radius: 999px; font-size: .66rem; letter-spacing: .12em; }
        .avatars { display: flex; }
        .avatars img, .avatars span { width: 38px; height: 38px; border-radius: 50%; border: 2px solid var(--cream); margin-left: -10px; object-fit: cover; display: grid; place-items: center; font-size: .72rem; font-weight: 800; color: #fff; background: var(--copper-grad); }
        .avatars > :first-child { margin-left: 0; }

        .h-float { position: absolute; z-index: 3; background: rgba(255,255,255,.94); backdrop-filter: blur(14px); border-radius: 16px; padding: 14px 18px; display: flex; gap: 14px; align-items: center; box-shadow: var(--shadow-lg); }
        .h-float p { margin: 0; } .h-float .t { font-weight: 800; color: var(--ink); font-size: .88rem; } .h-float .s { color: var(--muted); font-size: .76rem; }
        .hf1 { left: 51%; bottom: 150px; animation: pageIn .8s var(--ease) 1s both, float 6s ease-in-out infinite; }
        .hf2 { right: 3%; bottom: 120px; animation: pageIn .8s var(--ease) 1.2s both, float 7s ease-in-out -2s infinite; }
        .sos-live { position: absolute; z-index: 3; left: 57%; top: 40px; display: inline-flex; gap: 10px; align-items: center; background: var(--sos); color: #fff; font-weight: 800; letter-spacing: .08em; font-size: .82rem; padding: 11px 20px; border-radius: 999px; box-shadow: 0 14px 30px -10px rgba(226,52,45,.8); animation: pageIn .8s var(--ease) .9s both; }
        .sos-live i { width: 9px; height: 9px; border-radius: 50%; background: #fff; position: relative; }
        .sos-live i::after { content: ""; position: absolute; inset: -5px; border-radius: 50%; border: 2px solid #fff; animation: ping 1.6s var(--ease) infinite; }

        .seal2 { position: absolute; z-index: 3; right: 3%; top: 18px; width: 128px; height: 128px; animation: pageIn .8s var(--ease) 1.1s both; }
        .seal2 > svg { position: absolute; inset: 0; animation: spinSlow 30s linear infinite; }
        .seal2 text { font-size: 10px; font-weight: 800; letter-spacing: 2px; fill: var(--ink); text-transform: uppercase; }
        .seal2 .core { position: absolute; inset: 30px; border-radius: 50%; background: var(--ink); color: var(--brass-2); display: grid; place-items: center; }

        .fstrip { position: relative; z-index: 4; margin-top: -84px; display: grid; grid-template-columns: repeat(4, 1fr); background: #fff; border-radius: 24px; box-shadow: var(--shadow-lg); padding: 10px; }
        .fcard { display: flex; gap: 18px; padding: 26px 24px; border-radius: 18px; position: relative; transition: background .4s; }
        .fcard + .fcard::before { content: ""; position: absolute; left: 0; top: 24%; bottom: 24%; width: 1px; background: var(--line); }
        .fcard:hover { background: var(--paper); }
        .fcard .icon-box { width: 62px; height: 62px; transition: transform .6s var(--ease); }
        .fcard:hover .icon-box { transform: rotate(-12deg) scale(1.06); }
        .fcard h3 { font-family: var(--serif); font-weight: 700; font-size: 1.12rem; color: var(--ink); margin: 4px 0 8px; line-height: 1.25; }
        .fcard p { margin: 0; font-size: .84rem; color: var(--muted); line-height: 1.55; padding-right: 34px; }
        .fcard .go { position: absolute; right: 20px; bottom: 22px; width: 30px; height: 30px; border-radius: 50%; border: 1px solid var(--line); display: grid; place-items: center; color: var(--brass); transition: .4s var(--ease); }
        .fcard:hover .go { background: var(--brass); color: #fff; border-color: var(--brass); transform: translateX(4px); }

        @media (max-width: 1100px) {
          .fstrip { grid-template-columns: repeat(2, 1fr); }
          .fcard:nth-child(3)::before { display: none; }
        }
        @media (max-width: 960px) {
          .hero2-stage { min-height: 0; display: flex; flex-direction: column; }
          .hero2-stage > .wrap { order: 1; }
          .hero2-bg { order: 2; }
          .hero2-grid { grid-template-columns: 1fr; min-height: 0; }
          .hero2-copy { padding: 40px 0 24px; }
          .hero2-bg { position: relative; width: 100%; height: 420px; }
          .hero2-bg::before { background: linear-gradient(180deg, var(--cream) 0%, rgba(247,241,232,0) 25%, rgba(247,241,232,0) 70%, var(--cream) 100%); }
          .hf1 { left: 16px; bottom: 130px; } .hf2 { right: 16px; bottom: 60px; }
          .sos-live { left: auto; right: 16px; top: auto; bottom: 330px; } .seal2 { display: none; }
          .fstrip { margin-top: -40px; }
        }
        @media (max-width: 600px) { .fstrip { grid-template-columns: 1fr; } .fcard + .fcard::before { left: 24px; right: 24px; top: 0; bottom: auto; width: auto; height: 1px; } .hf2 { display: none; } }
      `}</style>

      <div className="hero2-stage">
        <div className="hero2-bg">
          <div className="hero2-bg-in"><img ref={imgRef} src={IMG.heroCar} alt="Car ready for the road after a Motor Konnect service" /></div>
        </div>

        <div className="sos-live"><i /> SOS LIVE</div>
        <div className="seal2">
          <svg viewBox="0 0 128 128" aria-hidden>
            <defs><path id="sealc" d="M64,64 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0" /></defs>
            <circle cx="64" cy="64" r="63" fill="#fff" />
            <text><textPath href="#sealc" textLength="292" lengthAdjust="spacing">Transparent · 24/7 · Verified · Trusted ·</textPath></text>
          </svg>
          <div className="core"><Wrench size={26} /></div>
        </div>
        <div className="h-float hf1">
          <span className="icon-box ink" style={{ width: 42, height: 42, borderRadius: 12 }}><HardHat size={19} /></span>
          <div><p className="t">84 Technicians Active</p><p className="s">Within 15 km of your location</p></div>
        </div>
        <div className="h-float hf2">
          <span className="icon-box soft" style={{ width: 42, height: 42, borderRadius: 12 }}><CalendarCheck size={19} /></span>
          <div><p className="t">Booking Confirmed</p><p className="s">Periodic service · Today, 4:30 PM</p></div>
        </div>

        <div className="wrap hero2-grid">
          <div className="hero2-copy">
            <Link to="/services" className="pill-new page-enter">
              <b>NEW</b><span className="dot-live" /> Real-time garage discovery is live across 180+ cities <ChevronRight size={15} />
            </Link>
            <h1 className="display">
              <RiseText text="Your complete" delay={0.1} />
              <br />
              <RiseText text="vehicle" delay={0.28} />
              <span className="rise"><span style={{ animationDelay: ".38s" }}><em>service</em></span></span>
              <br />
              <RiseText text="& SOS support." delay={0.5} />
            </h1>
            <p className="lead reveal d3" style={{ maxWidth: 500 }}>
              Find verified local garages instantly, order genuine spare parts, and get 24/7 roadside
              emergency help across 180+ cities — all with a transparent <b style={{ color: "var(--ink)" }}>"Pay at Garage"</b> model.
            </p>
            <div className="reveal d4" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 34 }}>
              <Link to="/services" className="btn btn-ink" style={{ padding: "17px 30px" }}>Explore Services <ArrowRight size={17} /></Link>
              <Link to="/sos" className="btn btn-sos-outline btn-outline" style={{ padding: "17px 30px", background: "#fff" }}><Siren size={17} /> Emergency SOS</Link>
            </div>
            <div className="reveal d5" style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 34, flexWrap: "wrap" }}>
              <div className="avatars">
                {IMG.avatars.slice(0, 3).map((a, i) => <img key={i} src={a} alt="" />)}
                <span>+</span>
              </div>
              <span className="stars">{[...Array(5)].map((_, i) => <Star key={i} size={17} fill="currentColor" />)}</span>
              <span style={{ fontSize: ".86rem", color: "var(--muted)" }}>Trusted by <b style={{ color: "var(--ink)" }}>12,000+ drivers</b> across India</span>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className="fstrip">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <Link to={f.to} key={f.title} className={`fcard reveal d${i + 1}`}>
                <span className="icon-box copper"><Icon size={26} /></span>
                <div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
                <span className="go"><ArrowRight size={14} /></span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Hero;
