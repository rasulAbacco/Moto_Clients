import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  X,
  Check,
  Plus,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";
import Hero from "../components/Hero";
import StepCards from "../components/StepCards";
import WhyChoose from "../components/WhyChoose";
import BentoSOS from "../components/BentoSOS";
import AppPromo from "../components/AppPromo";
import Testimonials from "../components/Testimonials";
import Counter from "../components/Counter";
import { CONTACT } from "../data/site";
import { IMG } from "../data/images";

const brands = [
  "Maruti Suzuki",
  "Hyundai",
  "Tata Motors",
  "Mahindra",
  "Honda",
  "Toyota",
  "Kia",
  "Renault",
  "Skoda",
  "Volkswagen",
  "Royal Enfield",
  "Bajaj",
  "TVS",
  "Hero",
  "Yamaha",
  "KTM",
];

const servicePreview = [
  {
    img: IMG.car.carGeneral,
    title: "Periodic Service",
    text: "Oil, filters, fluids and a full safety checklist.",
    tag: "From 2 hrs",
  },
  {
    img: IMG.car.carDenting,
    title: "Denting & Painting",
    text: "Factory-grade refinishing with colour matching.",
    tag: "Bodywork",
  },
  {
    img: IMG.car.carAc,
    title: "AC Service",
    text: "Gas top-up, compressor checks, cabin filters.",
    tag: "Cooling",
  },
  {
    img: IMG.car.carTyres,
    title: "Tyres & Wheels",
    text: "Alignment, balancing and tyre replacement.",
    tag: "Safety",
  },
  {
    img: IMG.car.carBattery,
    title: "Batteries",
    text: "Testing and replacement with warranty.",
    tag: "Electrical",
  },
  {
    img: IMG.car.carDetailing,
    title: "Detailing & Spa",
    text: "Ceramic coating, interior deep-clean, polish.",
    tag: "Premium",
  },
];

const stats = [
  { value: "50K+", label: "Verified Garages" },
  { value: "98%", label: "Response Rate" },
  { value: "12.5m", label: "Avg. SOS Dispatch" },
  { value: "180+", label: "Cities Covered" },
];

const faqGroups = {
  General: [
    [
      "How does the “Pay at Garage” model work?",
      "You book through Motor Konnect at no cost. Once the work is done, you inspect your vehicle at the garage and pay the garage directly. Motor Konnect adds 0% markup to your bill — the price you see from the garage is the price you pay.",
    ],
    [
      "How are garages and technicians verified?",
      "Every partner goes through the Motor Desk verification process — business documents, workshop inspection, technician background checks and ongoing customer-rating reviews. Partners that fall below our quality bar are removed from the network.",
    ],
    [
      "Which cities do you operate in?",
      "Motor Konnect operates across 180+ cities in India, with the highest garage density in metro areas. The app shows live availability before you confirm.",
    ],
    [
      "Can I cancel or reschedule a booking?",
      "Yes. You can cancel or move your slot from the app or by calling support. Please let us know as early as possible so the garage can free up the bay.",
    ],
  ],
  "SOS & Towing": [
    [
      "What does the 24/7 SOS cover?",
      "Tyre punctures, battery jump-starts, fuel delivery, wrong-fuel draining, minor on-spot repairs, OBD diagnostics, and towing (wheel-lift or flat-bed) to the nearest verified garage.",
    ],
    [
      "How do I request roadside help?",
      `Call the 24/7 SOS hotline on ${CONTACT.sosPhone} or tap SOS in the Motor Konnect app. We capture your live location and send the nearest verified technician.`,
    ],
    [
      "How quickly will help arrive?",
      "Our average dispatch time is about 12.5 minutes in cities. On highways and rural routes it depends on the nearest partner — you'll see the technician's live ETA by SMS and in the app.",
    ],
  ],
  "Spare Parts": [
    [
      "Do you sell genuine spare parts?",
      "Yes. Our Spare Parts desk sources OEM, OES and certified aftermarket parts for cars and two-wheelers, with fitment checked against your vehicle and warranty on eligible parts.",
    ],
    [
      "What's the difference between OEM, OES and aftermarket?",
      "OEM parts are made by or for your vehicle's brand. OES parts come from the same supplier under their own brand. Certified aftermarket parts are built by reputed independent brands to original specifications.",
    ],
    [
      "Can you fit the part for me?",
      "Yes. Parts can be delivered to your nearest partner garage and installed by a verified technician, with the warranty recorded against your vehicle.",
    ],
  ],
  Partners: [
    [
      "I own a garage. How do I join the network?",
      `Reach out through the Contact page or email ${CONTACT.email}. Our partner team will walk you through onboarding to Motor Desk, our CRM for garages.`,
    ],
    [
      "What does Motor Desk include?",
      "Digital job cards and invoicing, smart inventory, staff and payroll management, automated service reminders and real-time bookings from the Motor Konnect app.",
    ],
  ],
};

const Faq = () => {
  const groups = Object.keys(faqGroups);
  const [group, setGroup] = useState(groups[0]);
  const [open, setOpen] = useState(0);
  const items = faqGroups[group];

  return (
    <div className="faq-list">
      <div className="faq-tabs" role="tablist">
        {groups.map((g) => (
          <button
            key={g}
            role="tab"
            aria-selected={g === group}
            className={g === group ? "on" : ""}
            onClick={() => {
              setGroup(g);
              setOpen(0);
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* key={group} re-mounts the list so the new answers fade in */}
      <div key={group} className="faq-items">
        {items.map(([q, a], i) => {
          const isOpen = open === i;
          const id = `faq-${group.replace(/\W/g, "")}-${i}`;
          return (
            <div
              key={q}
              className={`faq-item ${isOpen ? "open" : ""}`}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <button
                className="faq-q"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                aria-controls={id}
              >
                <span className="faq-n">{String(i + 1).padStart(2, "0")}</span>
                <span className="faq-t">{q}</span>
                <span className="faq-ic">
                  <Plus size={16} />
                </span>
              </button>
              <div className="faq-a" id={id} role="region">
                <div>
                  <p>{a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Home = () => (
  <div>
    <style>{`
      .stats2 { display: grid; grid-template-columns: repeat(4, 1fr); background: var(--ink); border-radius: 24px; overflow: hidden; }
      .stats2 > div { padding: 38px 20px; text-align: center; position: relative; }
      .stats2 > div + div::before { content: ""; position: absolute; left: 0; top: 30%; bottom: 30%; width: 1px; background: rgba(255,255,255,.1); }
      .stats2 b { display: block; font-family: var(--serif); font-weight: 700; font-size: clamp(2rem, 3.6vw, 2.9rem); color: #fff; line-height: 1; }
      .stats2 > div > span { display: block; margin-top: 10px; font-size: .7rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--brass-2); }
      @media (max-width: 720px) { .stats2 { grid-template-columns: 1fr 1fr; } .stats2 > div:nth-child(3)::before { display: none; } }

      .brand-strip { padding: 30px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
      .brand-strip span { font-family: var(--serif); font-weight: 600; font-size: 1.4rem; color: #b3a898; padding: 0 30px; display: inline-flex; align-items: center; gap: 30px; white-space: nowrap; transition: color .3s; }
      .brand-strip span:hover { color: var(--brass); }
      .brand-strip span::after { content: "✦"; font-size: .7rem; color: var(--brass-2); }

      .svc-card { overflow: hidden; display: flex; flex-direction: column; }
      .svc-card .img-frame { border-radius: 0; aspect-ratio: 16/10; }
      .svc-card .body { padding: 24px 26px 26px; position: relative; }
      .svc-card h3 { color: var(--ink); font-size: 1.3rem; margin: 10px 0 6px; }
      .svc-card p { margin: 0; color: var(--muted); font-size: .9rem; line-height: 1.6; }
      .svc-card .arrow { position: absolute; right: 22px; top: -22px; width: 44px; height: 44px; border-radius: 50%; background: #fff; box-shadow: var(--shadow); display: grid; place-items: center; color: var(--ink); transition: .5s var(--ease); }
      .svc-card:hover .arrow { background: var(--copper-grad); color: #fff; transform: rotate(45deg); }

      .compare { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
      @media (max-width: 860px) { .compare { grid-template-columns: 1fr; } }
      .compare .card { padding: 44px; }
      .cmp-list { list-style: none; padding: 0; margin: 26px 0 0; display: grid; gap: 16px; }
      .cmp-list li { display: flex; gap: 14px; align-items: flex-start; line-height: 1.6; }
      .cmp-ic { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; flex-shrink: 0; margin-top: 1px; }

      .parts-band { border-radius: 28px; overflow: hidden; display: grid; grid-template-columns: 1fr 1.1fr; background: #fff; border: 1px solid var(--line); }
      @media (max-width: 900px) { .parts-band { grid-template-columns: 1fr; } }
      .parts-band .img-frame { border-radius: 0; min-height: 380px; }
      .parts-tags { display: flex; gap: 8px; flex-wrap: wrap; margin: 24px 0 30px; }

      .faq-sec { background: var(--paper); border-top: 1px solid var(--line); }
      .faq-grid { display: grid; grid-template-columns: 1fr 1.7fr; gap: 64px; align-items: start; }
      @media (max-width: 900px) { .faq-grid { grid-template-columns: 1fr; gap: 36px; } }
      .faq-side { position: sticky; top: 110px; }
      @media (max-width: 900px) { .faq-side { position: static; } }
      .faq-help { margin-top: 32px; padding: 26px; border-radius: 20px; background: #fff; border: 1px solid var(--line); display: flex; flex-direction: column; gap: 8px; }
      .faq-help b { font-family: var(--serif); font-size: 1.2rem; color: var(--ink); margin-top: 10px; }
      .faq-help p { margin: 0 0 6px; color: var(--muted); font-size: .9rem; }
      .faq-help a:not(.btn) { display: inline-flex; gap: 10px; align-items: center; font-weight: 600; font-size: .92rem; color: var(--ink); transition: color .2s; }
      .faq-help a:not(.btn) svg { color: var(--brass); }
      .faq-help a:not(.btn):hover { color: var(--brass); }

      .faq-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 22px; }
      .faq-tabs button { padding: 10px 18px; border-radius: 999px; border: 1px solid var(--line); background: #fff; font-weight: 700; font-size: .84rem; color: var(--muted); transition: .3s var(--ease); }
      .faq-tabs button:hover { border-color: var(--ink); color: var(--ink); }
      .faq-tabs button.on { background: var(--ink); border-color: var(--ink); color: #fff; }

      .faq-items { display: grid; gap: 12px; }
      .faq-item { background: #fff; border: 1px solid var(--line); border-radius: 18px; overflow: hidden; animation: pageIn .5s var(--ease) both; transition: border-color .3s, box-shadow .4s var(--ease); }
      .faq-item:hover { border-color: #dccdb8; }
      .faq-item.open { border-color: transparent; box-shadow: var(--shadow-lg); }
      .faq-q { width: 100%; display: flex; align-items: center; gap: 18px; padding: 22px 24px; background: none; border: 0; text-align: left; }
      .faq-n { font-family: var(--serif); font-weight: 700; font-size: .95rem; color: var(--brass); min-width: 24px; }
      .faq-t { flex: 1; font-family: var(--serif); font-weight: 600; font-size: 1.12rem; color: var(--ink); line-height: 1.4; }
      .faq-ic { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; display: grid; place-items: center; border: 1px solid var(--line); color: var(--ink); transition: transform .45s var(--ease), background .3s, color .3s, border-color .3s; }
      .faq-q:hover .faq-ic { border-color: var(--brass); color: var(--brass); }
      .faq-item.open .faq-ic { transform: rotate(45deg); background: var(--copper-grad); border-color: transparent; color: #fff; }
      .faq-a { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .45s var(--ease); }
      .faq-item.open .faq-a { grid-template-rows: 1fr; }
      .faq-a > div { overflow: hidden; }
      .faq-a p { margin: 0; padding: 0 24px 24px 66px; color: var(--muted); line-height: 1.75; opacity: 0; transform: translateY(-6px); transition: opacity .4s, transform .45s var(--ease); }
      .faq-item.open .faq-a p { opacity: 1; transform: none; transition-delay: .1s; }
      @media (max-width: 560px) { .faq-q { padding: 18px; gap: 12px; } .faq-a p { padding: 0 18px 20px 18px; } .faq-t { font-size: 1.02rem; } }
    `}</style>

    <Hero />
    <StepCards />
    <WhyChoose />

    {/* Stats */}
    <section className="section-sm" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <div className="stats2 reveal zoom">
          {stats.map((s) => (
            <div key={s.label}>
              <b>
                <Counter value={s.value} />
              </b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Services preview */}
    <section className="section" style={{ paddingTop: 72 }}>
      <div className="wrap">
        <div className="section-head">
          <div className="reveal">
            <span className="eyebrow">What we do</span>
            <h2 className="h2" style={{ color: "var(--ink)" }}>
              Services for <em>every</em> need
            </h2>
          </div>
          <Link to="/services" className="btn btn-outline reveal d2">
            View all 24 services <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid-3">
          {servicePreview.map((s, i) => (
            <Link
              to="/services"
              key={s.title}
              className={`card card-hover svc-card reveal d${(i % 3) + 1}`}
            >
              <div className="img-frame">
                <img
                  className="img-cover"
                  src={s.img}
                  alt={s.title}
                  loading="lazy"
                />
              </div>
              <div className="body">
                <span className="arrow">
                  <ArrowUpRight size={18} />
                </span>
                <span className="chip">{s.tag}</span>
                <h3 className="h3">{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* Brands marquee */}
    <div className="brand-strip">
      <div className="marquee">
        <div className="marquee-track">
          {[...brands, ...brands].map((b, i) => (
            <span key={i}>{b}</span>
          ))}
        </div>
      </div>
    </div>

    {/* Problem / Solution */}
    <section className="section">
      <div className="wrap">
        <div className="center-head">
          <span className="eyebrow center reveal">The Market Gap</span>
          <h2 className="h2 reveal d1" style={{ color: "var(--ink)" }}>
            Modern solutions for <em>modern drivers</em>
          </h2>
          <p className="lead reveal d2">
            Vehicle repair in India has long run on guesswork. We rebuilt it
            around transparency, accountability and speed.
          </p>
        </div>
        <div className="compare">
          <div className="card reveal from-left">
            <span className="chip chip-sos">The old way</span>
            <h3
              className="h3"
              style={{ color: "var(--ink)", marginTop: 18, fontSize: "1.8rem" }}
            >
              Frustrations of traditional repair
            </h3>
            <ul className="cmp-list">
              {[
                "Hidden markups and opaque commission models.",
                "Breakdowns on rural routes with no tracking or ETA.",
                "Zero accountability for part quality or labour.",
                "Counterfeit spare parts and no warranty records.",
                "Paper bills and lost service history.",
              ].map((t) => (
                <li key={t} className="muted">
                  <span
                    className="cmp-ic"
                    style={{ background: "#fde4e2", color: "var(--sos)" }}
                  >
                    <X size={14} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div
            className="card reveal from-right d2"
            style={{ background: "var(--ink)", borderColor: "var(--ink)" }}
          >
            <span
              className="chip"
              style={{
                background: "rgba(207,138,76,.18)",
                color: "var(--brass-2)",
              }}
            >
              The Motor Konnect way
            </span>
            <h3
              className="h3"
              style={{ color: "#fff", marginTop: 18, fontSize: "1.8rem" }}
            >
              The Motor Konnect advantage
            </h3>
            <ul className="cmp-list">
              {[
                "Direct “Pay at Garage” model with 0% platform markup.",
                "Precision GPS dispatching for 24/7 roadside SOS.",
                "Certified Motor Desk network of vetted workshops.",
                "Genuine OEM / OES parts with fitment check & warranty.",
                "Digital job cards, invoices and lifetime service history.",
              ].map((t) => (
                <li key={t} style={{ color: "#c9cfd6" }}>
                  <span
                    className="cmp-ic"
                    style={{ background: "var(--copper-grad)", color: "#fff" }}
                  >
                    <Check size={14} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>

    {/* Spare parts teaser */}
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="parts-band reveal zoom">
          <div style={{ padding: "56px 52px" }}>
            <span className="eyebrow">Spare Parts Desk</span>
            <h2 className="h2" style={{ color: "var(--ink)", marginTop: 14 }}>
              Genuine parts, <em>guaranteed fit.</em>
            </h2>
            <p className="lead" style={{ marginTop: 18 }}>
              Source OEM, OES and certified aftermarket parts for cars and
              bikes. We verify fitment against your vehicle, and our partner
              garages install them with warranty.
            </p>
            <div className="parts-tags">
              {[
                "Brake pads",
                "Filters",
                "Clutch kits",
                "Batteries",
                "Lighting",
                "Suspension",
                "Body panels",
              ].map((t) => (
                <span key={t} className="chip chip-ink">
                  {t}
                </span>
              ))}
            </div>
            <Link to="/spare-parts" className="btn btn-brass">
              Browse Spare Parts <ArrowRight size={16} />
            </Link>
          </div>
          <div className="img-frame">
            <img
              className="img-cover"
              src={IMG.spareParts}
              alt="Genuine spare parts"
              loading="lazy"
              style={{ position: "absolute", inset: 0 }}
            />
          </div>
        </div>
      </div>
    </section>

    <BentoSOS />
    <div style={{ height: 40 }} />
    <AppPromo />
    <Testimonials />

    {/* FAQ */}
    <section className="section faq-sec">
      <div className="wrap faq-grid">
        <div className="reveal from-left faq-side">
          <span className="eyebrow">FAQ</span>
          <h2 className="h2" style={{ color: "var(--ink)", marginTop: 14 }}>
            Questions, <em>answered.</em>
          </h2>
          <p className="lead" style={{ marginTop: 18 }}>
            Everything you need to know about bookings, SOS, spare parts and
            partnering with us.
          </p>
          <div className="faq-help">
            <span className="icon-box copper">
              <MessageCircle size={20} />
            </span>
            <b>Still have a question?</b>
            <p>Our support team usually replies within one working day.</p>
            <a href={`tel:${CONTACT.phoneRaw}`}>
              <Phone size={15} /> {CONTACT.phone}
            </a>
            <a href={`mailto:${CONTACT.email}`}>
              <Mail size={15} /> {CONTACT.email}
            </a>
            <Link
              to="/contact"
              className="btn btn-ink"
              style={{ marginTop: 18, width: "100%" }}
            >
              Contact Support <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        {/* reveal sits on a wrapper whose className never changes */}
        <div className="reveal d2">
          <Faq />
        </div>
      </div>
    </section>
  </div>
);

export default Home;
