import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  User,
  MessageSquare,
  ExternalLink,
  Shield,
  Tag,
  CheckCircle2,
  Siren,
  Package,
  Handshake,
  Headphones,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";
import PageHero, { RiseText } from "../components/PageHero";
import { CONTACT, mapsEmbed, mapsLink } from "../data/site";
import { IMG } from "../data/images";
import { sendForm } from "../lib/sendForm";

const topics = [
  "General enquiry",
  "Service booking",
  "Spare parts",
  "Partner / garage onboarding",
  "Billing or complaint",
  "Other",
];

const Window = ({ icon: Icon, title, children, className = "" }) => (
  <div className={`win ${className}`}>
    <div className="win-bar">
      <i style={{ background: "#ff5f57" }} />
      <i style={{ background: "#febc2e" }} />
      <i style={{ background: "#28c840" }} />
    </div>
    <div className="win-body">
      <p className="win-title">
        <Icon size={16} /> {title}
      </p>
      {children}
    </div>
  </div>
);

const CopyBtn = ({ text }) => {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="copy"
      aria-label="Copy"
      onClick={() => {
        navigator.clipboard?.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
};

const Contact = () => {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = Object.fromEntries(new FormData(form));
    setSending(true);
    setError("");

    const res = await sendForm(
      {
        Name: f.name,
        Email: f.email,
        Phone: f.phone || "—",
        Topic: f.topic,
        Message: f.message,
        botcheck: f.botcheck,
      },
      {
        subject: `[${f.topic}] New message from ${f.name}`,
        fromName: "Motor Konnect — Contact Form",
        replyTo: f.email,
      },
    );

    setSending(false);
    if (res.ok) {
      form.reset();
      setSent(true);
    } else {
      setError(res.message);
    }
  };

  return (
    <div>
      <style>{`
        .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: -48px; position: relative; z-index: 2; }
        @media (max-width: 960px) { .contact-grid { grid-template-columns: 1fr; } }
        .win { background: #fff; border: 1px solid var(--line); border-radius: 26px; overflow: hidden; box-shadow: var(--shadow-lg); }
        .win-bar { height: 40px; display: flex; gap: 7px; align-items: center; padding: 0 18px; border-bottom: 1px solid var(--line); background: var(--paper); }
        .win-bar i { width: 10px; height: 10px; border-radius: 50%; display: block; }
        .win-body { padding: 36px; }
        @media (max-width: 560px) { .win-body { padding: 26px 22px; } }
        .win-title { display: flex; gap: 12px; align-items: center; margin: 0 0 30px; font-size: .74rem; font-weight: 800; letter-spacing: .3em; text-transform: uppercase; color: var(--ink); }
        .win-title svg { color: var(--brass); }

        .ci { display: flex; gap: 18px; align-items: flex-start; padding: 16px; margin: 0 -16px 6px; border-radius: 18px; transition: background .3s; }
        .ci:hover { background: var(--paper); }
        .ci-ic { width: 50px; height: 50px; border-radius: 15px; background: var(--copper-grad); color: #fff; display: grid; place-items: center; flex-shrink: 0; box-shadow: 0 10px 20px -10px rgba(11,31,51,.7); transition: transform .45s var(--ease), background .3s; }
        .ci:hover .ci-ic { transform: rotate(-8deg) scale(1.05); }
        .ci-l { font-size: .66rem; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: var(--muted); margin: 2px 0 6px; }
        .ci-v { font-weight: 700; color: var(--ink); line-height: 1.55; font-size: .98rem; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .copy { width: 28px; height: 28px; border-radius: 8px; border: 1px solid var(--line); background: #fff; color: var(--muted); display: inline-grid; place-items: center; opacity: 0; transition: .3s; }
        .ci:hover .copy { opacity: 1; }
        .copy:hover { color: var(--brass); border-color: var(--brass); }

        .map { position: relative; margin-top: 18px; border-radius: 20px; overflow: hidden; border: 1px solid var(--line); height: 240px; }
        .map iframe { width: 100%; height: 100%; border: 0; filter: grayscale(.25) contrast(1.05); }
        .map-btn { position: absolute; left: 12px; top: 12px; background: #fff; border-radius: 10px; padding: 8px 12px; font-size: .8rem; font-weight: 700; color: #1a56db; display: inline-flex; gap: 6px; align-items: center; box-shadow: var(--shadow); }

        .form { display: grid; gap: 20px; }
        .form-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 560px) { .form-2 { grid-template-columns: 1fr; } }
        .topic-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .topic-chips label { cursor: pointer; }
        .topic-chips input { position: absolute; opacity: 0; pointer-events: none; }
        .topic-chips span { display: inline-block; padding: 9px 14px; border-radius: 999px; border: 1px solid var(--line); font-size: .8rem; font-weight: 600; color: var(--muted); transition: .3s; }
        .topic-chips input:checked + span { background: var(--ink); color: #fff; border-color: var(--ink); }
        .topic-chips span:hover { border-color: var(--ink); }
        .send { width: 100%; padding: 18px; border-radius: 16px; letter-spacing: .3em; text-transform: uppercase; font-size: .78rem; }
        .form-error { padding: 14px 16px; border-radius: 12px; background: #fde4e2; color: #8f1d17; font-size: .86rem; line-height: 1.55; animation: pageIn .4s var(--ease); }
        .form-error a { font-weight: 700; text-decoration: underline; }
        .send:disabled { opacity: .75; cursor: wait; }
        .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.35); border-top-color: #fff; border-radius: 50%; animation: spinSlow .7s linear infinite; }
        .success { text-align: center; padding: 40px 10px; animation: pageIn .6s var(--ease); }
        .success-ic { width: 84px; height: 84px; border-radius: 50%; background: #e3f4ec; color: var(--ok); display: grid; place-items: center; margin: 0 auto 22px; position: relative; }
        .success-ic::after { content: ""; position: absolute; inset: -8px; border-radius: 50%; border: 2px solid #e3f4ec; animation: ping 1.8s var(--ease) infinite; }

        .channel { padding: 32px; display: flex; flex-direction: column; gap: 14px; }
        .channel h3 { color: var(--ink); font-size: 1.35rem; }
        .channel p { margin: 0; color: var(--muted); font-size: .9rem; line-height: 1.65; }
        .channel a.lnk { margin-top: auto; padding-top: 8px; font-weight: 800; color: var(--ink); display: inline-flex; gap: 8px; align-items: center; font-size: .9rem; }
        .channel a.lnk:hover { color: var(--brass); }

        .hours { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid var(--line); border-radius: 24px; overflow: hidden; background: #fff; }
        @media (max-width: 760px) { .hours { grid-template-columns: 1fr; } }
        .hours > div { padding: 44px; }
        .hrow { display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px dashed var(--line); font-size: .95rem; }
        .hrow:last-child { border-bottom: 0; }
      `}</style>

      <PageHero
        crumb="Contact"
        eyebrow="Get in touch"
        title={
          <>
            <RiseText text="Let's keep you" />
            <br />
            <span className="rise">
              <span style={{ animationDelay: ".3s" }}>
                <em>moving.</em>
              </span>
            </span>
          </>
        }
        lead="Questions about a booking, spare parts or partnering with us? Our team in Bangalore usually replies within one working day. For breakdowns, call the 24/7 SOS hotline."
        image={IMG.contactOffice}
      />

      <section style={{ paddingBottom: 100 }}>
        <div className="wrap contact-grid">
          {/* Info window */}
          <Window
            icon={Shield}
            title="Head Office"
            className="reveal from-left"
          >
            <a href={`tel:${CONTACT.phoneRaw}`} className="ci">
              <span className="ci-ic">
                <Phone size={19} />
              </span>
              <div>
                <p className="ci-l">Operational Phone</p>
                <p className="ci-v" style={{ margin: 0 }}>
                  {CONTACT.phone} <CopyBtn text={CONTACT.phoneRaw} />
                </p>
              </div>
            </a>
            <a href={`mailto:${CONTACT.email}`} className="ci">
              <span className="ci-ic">
                <Mail size={19} />
              </span>
              <div>
                <p className="ci-l">Support Email</p>
                <p className="ci-v" style={{ margin: 0 }}>
                  {CONTACT.email} <CopyBtn text={CONTACT.email} />
                </p>
              </div>
            </a>
            <a href={mapsLink} target="_blank" rel="noreferrer" className="ci">
              <span className="ci-ic">
                <MapPin size={19} />
              </span>
              <div>
                <p className="ci-l">Office Address</p>
                <p className="ci-v" style={{ margin: 0 }}>
                  {CONTACT.address}
                </p>
              </div>
            </a>
            <div className="map">
              <iframe
                title="Motor Konnect office location"
                src={mapsEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href={mapsLink}
                target="_blank"
                rel="noreferrer"
                className="map-btn"
              >
                Open in Maps <ExternalLink size={13} />
              </a>
            </div>
          </Window>

          {/* Form window */}
          <Window
            icon={Send}
            title="Send a Message"
            className="reveal from-right d2"
          >
            {sent ? (
              <div className="success">
                <div className="success-ic">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="h3" style={{ color: "var(--ink)" }}>
                  Message sent — thank you!
                </h3>
                <p
                  className="muted"
                  style={{
                    lineHeight: 1.7,
                    margin: "12px auto 26px",
                    maxWidth: 360,
                  }}
                >
                  Our team has received your message and will reply to your
                  email within one working day. For breakdowns, call the 24/7
                  SOS hotline on{" "}
                  <a
                    href={`tel:${CONTACT.sosRaw}`}
                    style={{ color: "var(--sos)", fontWeight: 700 }}
                  >
                    {CONTACT.sosPhone}
                  </a>
                  .
                </p>
                <button
                  className="btn btn-outline"
                  onClick={() => setSent(false)}
                >
                  Write another message
                </button>
              </div>
            ) : (
              <form className="form" onSubmit={submit} aria-busy={sending}>
                {/* Honeypot — hidden from people, catches spam bots */}
                <input
                  type="checkbox"
                  name="botcheck"
                  tabIndex={-1}
                  autoComplete="off"
                  style={{ display: "none" }}
                />
                <div className="form-2">
                  <div className="field">
                    <label className="label" htmlFor="name">
                      <User size={13} /> Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      className="input"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="field">
                    <label className="label" htmlFor="phone">
                      <Phone size={13} /> Phone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="input"
                      placeholder="+91"
                    />
                  </div>
                </div>
                <div className="field">
                  <label className="label" htmlFor="email">
                    <Mail size={13} /> Return Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="input"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="field">
                  <span className="label">
                    <Tag size={13} /> Topic
                  </span>
                  <div className="topic-chips">
                    {topics.map((t, i) => (
                      <label key={t}>
                        <input
                          type="radio"
                          name="topic"
                          value={t}
                          defaultChecked={i === 0}
                        />
                        <span>{t}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label className="label" htmlFor="message">
                    <MessageSquare size={13} /> Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    className="input"
                    placeholder="Write your message…"
                    required
                  />
                </div>
                {error && (
                  <div className="form-error" role="alert">
                    <b>Sorry, your message couldn't be sent.</b> {error} Please
                    try again, or email us directly at{" "}
                    <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.
                  </div>
                )}
                <button className="btn btn-ink send" disabled={sending}>
                  {sending ? (
                    <>
                      <span className="spinner" /> Sending…
                    </>
                  ) : (
                    <>
                      Send Message <Send size={15} />
                    </>
                  )}
                </button>
                <p
                  className="muted"
                  style={{ fontSize: ".78rem", margin: 0, textAlign: "center" }}
                >
                  By sending, you agree to our{" "}
                  <Link to="/privacy" style={{ color: "var(--brass)" }}>
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            )}
          </Window>
        </div>
      </section>

      {/* Channels */}
      <section className="section bg-white">
        <div className="wrap">
          <div className="center-head">
            <span className="eyebrow center reveal">Reach the right team</span>
            <h2 className="h2 reveal d1" style={{ color: "var(--ink)" }}>
              How can we <em>help?</em>
            </h2>
          </div>
          <div className="grid-4">
            <div
              className="card card-hover channel reveal d1"
              style={{ borderColor: "#f3c9c3" }}
            >
              <span
                className="icon-box"
                style={{ background: "#fbe6e3", color: "var(--sos)" }}
              >
                <Siren size={22} />
              </span>
              <h3 className="h3">Breakdown / SOS</h3>
              <p>
                Stuck on the road? Our command centre is open 24 hours, every
                day of the year.
              </p>
              <a
                className="lnk"
                href={`tel:${CONTACT.sosRaw}`}
                style={{ color: "var(--sos)" }}
              >
                {CONTACT.sosPhone} <ArrowRight size={15} />
              </a>
            </div>
            <div className="card card-hover channel reveal d2">
              <span className="icon-box">
                <Headphones size={22} />
              </span>
              <h3 className="h3">Customer Support</h3>
              <p>
                Bookings, rescheduling, invoices, app help and feedback about a
                garage visit.
              </p>
              <a className="lnk" href={`mailto:${CONTACT.email}`}>
                Email support <ArrowRight size={15} />
              </a>
            </div>
            <div className="card card-hover channel reveal d3">
              <span className="icon-box">
                <Package size={22} />
              </span>
              <h3 className="h3">Spare Parts Desk</h3>
              <p>
                Availability, fitment checks, pricing and warranty on OEM / OES
                parts.
              </p>
              <Link className="lnk" to="/spare-parts">
                Request a part <ArrowRight size={15} />
              </Link>
            </div>
            <div className="card card-hover channel reveal d4">
              <span className="icon-box">
                <Handshake size={22} />
              </span>
              <h3 className="h3">Partner With Us</h3>
              <p>
                Own a garage or recovery fleet? Join the network and get Motor
                Desk CRM.
              </p>
              <a
                className="lnk"
                href={`mailto:${CONTACT.email}?subject=${encodeURIComponent("Partnership enquiry")}`}
              >
                Become a partner <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Hours */}
      <section className="section">
        <div className="wrap">
          <div className="hours reveal zoom">
            <div style={{ background: "var(--ink)", color: "#fff" }}>
              <span className="eyebrow" style={{ color: "var(--brass-2)" }}>
                Visit us
              </span>
              <h2
                className="h2"
                style={{ color: "#fff", margin: "14px 0 18px" }}
              >
                Our Bangalore <em>office</em>
              </h2>
              <p
                style={{
                  color: "#a8b3c0",
                  lineHeight: 1.75,
                  margin: "0 0 28px",
                }}
              >
                {CONTACT.address}
              </p>
              <a
                href={mapsLink}
                target="_blank"
                rel="noreferrer"
                className="btn btn-brass"
              >
                Get Directions <ArrowRight size={16} />
              </a>
            </div>
            <div>
              <p
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  margin: "0 0 18px",
                  fontWeight: 800,
                  color: "var(--ink)",
                }}
              >
                <Clock size={18} color="var(--brass)" /> Working hours
              </p>
              {[
                ["Monday – Friday", "9:00 AM – 7:00 PM"],
                ["Saturday", "9:00 AM – 7:00 PM"],
                ["Sunday", "Closed"],
                ["SOS Hotline", "24 × 7 × 365"],
              ].map(([d, h]) => (
                <div className="hrow" key={d}>
                  <span className="muted">{d}</span>
                  <b
                    style={{
                      color: d === "SOS Hotline" ? "var(--sos)" : "var(--ink)",
                    }}
                  >
                    {h}
                  </b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
