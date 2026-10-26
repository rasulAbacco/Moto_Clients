import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Cog,
  OctagonAlert,
  Waves,
  Zap,
  Filter,
  Lightbulb,
  Disc3,
  BatteryCharging,
  Droplet,
  Snowflake,
  Car as CarIcon,
  Sparkles,
  Car,
  Bike,
  Search,
  ShieldCheck,
  BadgeCheck,
  Wrench,
  Truck,
  RotateCcw,
  FileSearch,
  PackageCheck,
  ArrowRight,
  Send,
  CheckCircle2,
  LayoutGrid,
} from "lucide-react";
import PageHero, { RiseText } from "../components/PageHero";
import { CONTACT } from "../data/site";
import { IMG } from "../data/images";
import { sendForm } from "../lib/sendForm";

const categories = [
  { id: "engine", label: "Engine", icon: Cog },
  { id: "brakes", label: "Brakes", icon: OctagonAlert },
  { id: "suspension", label: "Suspension", icon: Waves },
  { id: "electrical", label: "Electrical", icon: Zap },
  { id: "filters", label: "Filters", icon: Filter },
  { id: "lighting", label: "Lighting", icon: Lightbulb },
  { id: "tyres", label: "Tyres & Wheels", icon: Disc3 },
  { id: "batteries", label: "Batteries", icon: BatteryCharging },
  { id: "lubricants", label: "Oils & Fluids", icon: Droplet },
  { id: "ac", label: "AC & Cooling", icon: Snowflake },
  { id: "body", label: "Body Parts", icon: CarIcon },
  { id: "accessories", label: "Accessories", icon: Sparkles },
];

const parts = [
  {
    name: "Front Brake Pad Set",
    cat: "brakes",
    v: "car",
    grade: "OEM",
    warranty: "6 months",
  },
  {
    name: "Disc Brake Rotor",
    cat: "brakes",
    v: "car",
    grade: "OES",
    warranty: "6 months",
  },
  {
    name: "Bike Brake Shoe Set",
    cat: "brakes",
    v: "bike",
    grade: "OEM",
    warranty: "3 months",
  },
  {
    name: "Clutch Plate Kit",
    cat: "engine",
    v: "car",
    grade: "OES",
    warranty: "12 months",
  },
  {
    name: "Timing Belt Kit",
    cat: "engine",
    v: "car",
    grade: "OEM",
    warranty: "12 months",
  },
  {
    name: "Chain & Sprocket Kit",
    cat: "engine",
    v: "bike",
    grade: "OEM",
    warranty: "6 months",
  },
  {
    name: "Spark Plug (Iridium)",
    cat: "electrical",
    v: "bike",
    grade: "OES",
    warranty: "3 months",
  },
  {
    name: "Alternator Assembly",
    cat: "electrical",
    v: "car",
    grade: "Aftermarket",
    warranty: "6 months",
  },
  {
    name: "Self-Starter Motor",
    cat: "electrical",
    v: "bike",
    grade: "OES",
    warranty: "6 months",
  },
  {
    name: "Engine Oil Filter",
    cat: "filters",
    v: "car",
    grade: "OEM",
    warranty: "—",
  },
  {
    name: "Cabin Air Filter",
    cat: "filters",
    v: "car",
    grade: "OES",
    warranty: "—",
  },
  {
    name: "Air Filter Element",
    cat: "filters",
    v: "bike",
    grade: "OEM",
    warranty: "—",
  },
  {
    name: "Front Shock Absorber",
    cat: "suspension",
    v: "car",
    grade: "OES",
    warranty: "12 months",
  },
  {
    name: "Fork Oil Seal Kit",
    cat: "suspension",
    v: "bike",
    grade: "OEM",
    warranty: "3 months",
  },
  {
    name: "LED Headlamp Assembly",
    cat: "lighting",
    v: "car",
    grade: "Aftermarket",
    warranty: "12 months",
  },
  {
    name: "Tail Lamp Unit",
    cat: "lighting",
    v: "bike",
    grade: "OEM",
    warranty: "6 months",
  },
  {
    name: "Tubeless Tyre 185/65 R15",
    cat: "tyres",
    v: "car",
    grade: "OEM",
    warranty: "Manufacturer",
  },
  {
    name: "Rear Tyre 140/70-17",
    cat: "tyres",
    v: "bike",
    grade: "OEM",
    warranty: "Manufacturer",
  },
  {
    name: "35Ah Car Battery",
    cat: "batteries",
    v: "car",
    grade: "OEM",
    warranty: "48 months",
  },
  {
    name: "9Ah Bike Battery",
    cat: "batteries",
    v: "bike",
    grade: "OEM",
    warranty: "24 months",
  },
  {
    name: "Synthetic Engine Oil 5W-30",
    cat: "lubricants",
    v: "car",
    grade: "OEM",
    warranty: "—",
  },
  {
    name: "Coolant Concentrate",
    cat: "lubricants",
    v: "car",
    grade: "OES",
    warranty: "—",
  },
  {
    name: "AC Compressor",
    cat: "ac",
    v: "car",
    grade: "OES",
    warranty: "12 months",
  },
  {
    name: "Radiator Assembly",
    cat: "ac",
    v: "car",
    grade: "Aftermarket",
    warranty: "6 months",
  },
  { name: "Front Bumper", cat: "body", v: "car", grade: "OES", warranty: "—" },
  {
    name: "Side Mirror (ORVM)",
    cat: "body",
    v: "car",
    grade: "Aftermarket",
    warranty: "3 months",
  },
  {
    name: "Bike Mudguard",
    cat: "body",
    v: "bike",
    grade: "OEM",
    warranty: "—",
  },
  {
    name: "Seat Covers (Fitted)",
    cat: "accessories",
    v: "car",
    grade: "Aftermarket",
    warranty: "6 months",
  },
  {
    name: "Crash Guard",
    cat: "accessories",
    v: "bike",
    grade: "Aftermarket",
    warranty: "—",
  },
];

const gradeStyle = { OEM: "chip-ink", OES: "", Aftermarket: "chip-ok" };
const catLabel = Object.fromEntries(categories.map((c) => [c.id, c.label]));

const PartRequest = () => {
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
        "Vehicle type": f.type,
        "Make & model": f.model,
        Year: f.year || "—",
        "Part needed": f.part,
        Phone: f.phone,
        Email: f.email || "—",
        botcheck: f.botcheck,
      },
      {
        subject: `Spare part request – ${f.part} (${f.model})`,
        fromName: "Motor Konnect — Spare Parts",
        replyTo: f.email || undefined,
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
    <form onSubmit={submit} className="finder" aria-busy={sending}>
      {sent ? (
        <div
          style={{
            textAlign: "center",
            padding: "30px 10px",
            animation: "pageIn .5s var(--ease)",
          }}
        >
          <CheckCircle2 size={44} color="var(--ok)" />
          <h3
            className="h3"
            style={{ color: "var(--ink)", margin: "14px 0 8px" }}
          >
            Request received
          </h3>
          <p className="muted" style={{ margin: "0 0 20px", lineHeight: 1.6 }}>
            Our parts desk will check fitment and availability and get back to
            you within one working day.
          </p>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setSent(false)}
          >
            Request another part
          </button>
        </div>
      ) : (
        <>
          <input
            type="checkbox"
            name="botcheck"
            tabIndex={-1}
            autoComplete="off"
            style={{ display: "none" }}
          />
          <p
            style={{
              margin: 0,
              fontFamily: "var(--serif)",
              fontSize: "1.5rem",
              color: "var(--ink)",
            }}
          >
            Find the right part
          </p>
          <p
            className="muted"
            style={{ margin: "4px 0 20px", fontSize: ".88rem" }}
          >
            Tell us your vehicle — we'll confirm fitment & availability.
          </p>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <select
              name="type"
              className="input"
              required
              defaultValue="Car"
              aria-label="Vehicle type"
            >
              <option>Car</option>
              <option>Bike / Scooter</option>
            </select>
            <input
              name="year"
              className="input"
              placeholder="Year (e.g. 2021)"
              inputMode="numeric"
              aria-label="Year"
            />
          </div>
          <input
            name="model"
            className="input"
            placeholder="Make & model (e.g. Hyundai i20)"
            required
            aria-label="Make and model"
            style={{ marginTop: 12 }}
          />
          <input
            name="part"
            className="input"
            placeholder="Part needed (e.g. front brake pads)"
            required
            aria-label="Part needed"
            style={{ marginTop: 12 }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 12,
            }}
          >
            <input
              name="phone"
              className="input"
              placeholder="Phone number"
              type="tel"
              required
              aria-label="Phone number"
            />
            <input
              name="email"
              className="input"
              placeholder="Email (optional)"
              type="email"
              aria-label="Email"
            />
          </div>
          {error && (
            <p
              role="alert"
              style={{
                margin: "12px 0 0",
                padding: "10px 12px",
                borderRadius: 10,
                background: "#fde4e2",
                color: "#8f1d17",
                fontSize: ".82rem",
                lineHeight: 1.5,
              }}
            >
              Couldn't send: {error} Try again or email{" "}
              <a
                href={`mailto:${CONTACT.email}`}
                style={{ fontWeight: 700, textDecoration: "underline" }}
              >
                {CONTACT.email}
              </a>
              .
            </p>
          )}
          <button
            className="btn btn-brass"
            disabled={sending}
            style={{
              width: "100%",
              marginTop: 16,
              opacity: sending ? 0.75 : 1,
            }}
          >
            {sending ? (
              "Sending…"
            ) : (
              <>
                Check availability <Send size={15} />
              </>
            )}
          </button>
        </>
      )}
    </form>
  );
};

const SpareParts = () => {
  const [vehicle, setVehicle] = useState("all");
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      parts.filter(
        (p) =>
          (vehicle === "all" || p.v === vehicle) &&
          (cat === "all" || p.cat === cat) &&
          `${p.name} ${catLabel[p.cat]} ${p.grade}`
            .toLowerCase()
            .includes(q.toLowerCase()),
      ),
    [vehicle, cat, q],
  );

  return (
    <div>
      <style>{`
        .finder { background: #fff; border-radius: 26px; padding: 30px; box-shadow: var(--shadow-lg); color: var(--text); }
        .cats { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; }
        @media (max-width: 1024px) { .cats { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 640px) { .cats { grid-template-columns: repeat(2, 1fr); } }
        .cat { padding: 24px 16px; border-radius: 20px; border: 1px solid var(--line); background: #fff; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; font-weight: 700; font-size: .86rem; color: var(--ink); transition: .4s var(--ease); }
        .cat:hover { transform: translateY(-4px); box-shadow: var(--shadow); }
        .cat.on { background: var(--ink); color: #fff; border-color: var(--ink); }
        .cat.on .icon-box { background: var(--brass); color: #fff; }
        .cat .icon-box { width: 48px; height: 48px; }

        .p-toolbar { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; align-items: center; margin: 56px 0 28px; }
        .seg { display: inline-flex; gap: 6px; padding: 6px; background: #fff; border: 1px solid var(--line); border-radius: 999px; }
        .seg button { border: 0; background: none; padding: 10px 18px; border-radius: 999px; font-weight: 700; font-size: .8rem; color: var(--muted); display: inline-flex; gap: 8px; align-items: center; transition: .3s; }
        .seg button.on { background: var(--ink); color: #fff; }

        .parts-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
        @media (max-width: 1100px) { .parts-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 800px) { .parts-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) { .parts-grid { grid-template-columns: 1fr; } }
        .part { padding: 22px; display: flex; flex-direction: column; animation: pageIn .5s var(--ease) both; }
        .part-thumb { height: 120px; border-radius: 16px; background: linear-gradient(140deg, var(--paper), var(--brass-soft)); display: grid; place-items: center; color: var(--brass); margin-bottom: 18px; position: relative; overflow: hidden; }
        .part-thumb::after { content: ""; position: absolute; inset: 0; background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.6) 50%, transparent 70%); background-size: 200% 100%; opacity: 0; transition: opacity .3s; }
        .part:hover .part-thumb::after { opacity: 1; animation: shimmer 1.2s linear; }
        .part-thumb svg { transition: transform .6s var(--ease); }
        .part:hover .part-thumb svg { transform: scale(1.15) rotate(-8deg); }
        .part h4 { margin: 10px 0 6px; font-size: 1rem; color: var(--ink); line-height: 1.35; }
        .part .meta { font-size: .8rem; color: var(--muted); display: flex; justify-content: space-between; margin-top: auto; padding-top: 14px; border-top: 1px dashed var(--line); }

        .grade { padding: 36px; }
        .grade h3 { color: var(--ink); margin: 18px 0 10px; }
        .grade p { margin: 0; color: var(--muted); line-height: 1.7; font-size: .93rem; }

        .flow { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; position: relative; }
        .flow::before { content: ""; position: absolute; top: 34px; left: 12%; right: 12%; height: 1px; background: repeating-linear-gradient(90deg, var(--brass) 0 6px, transparent 6px 12px); }
        @media (max-width: 900px) { .flow { grid-template-columns: 1fr 1fr; } .flow::before { display: none; } }
        @media (max-width: 520px) { .flow { grid-template-columns: 1fr; } }
        .flow-step { text-align: center; position: relative; }
        .flow-step .icon-box { width: 68px; height: 68px; border-radius: 50%; margin: 0 auto 22px; border: 6px solid var(--cream); box-sizing: content-box; }
        .flow-step h4 { font-family: var(--serif); font-weight: 400; font-size: 1.3rem; margin: 0 0 8px; color: var(--ink); }
        .flow-step p { margin: 0; color: var(--muted); font-size: .9rem; line-height: 1.65; }
      `}</style>

      <PageHero
        crumb="Spare Parts"
        eyebrow="Spare Parts Desk"
        title={
          <>
            <RiseText text="Genuine parts." />
            <br />
            <span className="rise">
              <span style={{ animationDelay: ".3s" }}>
                <em>Guaranteed</em>&nbsp;
              </span>
            </span>
            <RiseText text="fit." delay={0.4} />
          </>
        }
        lead="OEM, OES and certified aftermarket parts for cars and two-wheelers — sourced from authorised distributors, checked for fitment against your vehicle, and installed by verified partner garages."
        aside={<PartRequest />}
        image={IMG.spareParts}
      >
        <div
          className="page-enter"
          style={{
            display: "flex",
            gap: 22,
            flexWrap: "wrap",
            marginTop: 34,
            animationDelay: ".4s",
          }}
        >
          {[
            [ShieldCheck, "100% authentic"],
            [BadgeCheck, "Fitment verified"],
            [RotateCcw, "Easy returns"],
          ].map(([Icon, t]) => (
            <span
              key={t}
              style={{
                display: "inline-flex",
                gap: 8,
                alignItems: "center",
                color: "var(--ink)",
                fontWeight: 600,
                fontSize: ".88rem",
              }}
            >
              <Icon size={17} color="var(--brass)" />
              {t}
            </span>
          ))}
        </div>
      </PageHero>

      {/* Categories + catalogue */}
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="reveal">
              <span className="eyebrow">Shop by category</span>
              <h2 className="h2" style={{ color: "var(--ink)" }}>
                Every part, <em>one desk</em>
              </h2>
            </div>
            <p className="lead reveal d2">
              Pick a category to filter the catalogue below. Can't see your
              part? Request it — we source parts for most Indian and imported
              makes.
            </p>
          </div>

          <div className="cats">
            {categories.map((c, i) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  className={`cat reveal d${(i % 6) + 1} ${cat === c.id ? "on" : ""}`}
                  onClick={() => setCat(cat === c.id ? "all" : c.id)}
                >
                  <span className="icon-box">
                    <Icon size={20} />
                  </span>
                  {c.label}
                </button>
              );
            })}
          </div>

          <div className="p-toolbar">
            <div className="seg">
              {[
                ["all", "All", LayoutGrid],
                ["car", "Car", Car],
                ["bike", "Bike", Bike],
              ].map(([id, l, Icon]) => (
                <button
                  key={id}
                  className={vehicle === id ? "on" : ""}
                  onClick={() => setVehicle(id)}
                >
                  <Icon size={15} /> {l}
                </button>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {cat !== "all" && (
                <button
                  className="chip chip-ink"
                  style={{ border: 0, padding: "8px 14px" }}
                  onClick={() => setCat("all")}
                >
                  {catLabel[cat]} ✕
                </button>
              )}
              <div
                className="search"
                style={{ position: "relative", minWidth: 260 }}
              >
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: 18,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--muted)",
                  }}
                />
                <input
                  className="input"
                  style={{
                    paddingLeft: 46,
                    borderRadius: 999,
                    background: "#fff",
                  }}
                  placeholder="Search parts…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </div>
          </div>

          <p
            className="muted"
            style={{ fontSize: ".85rem", margin: "0 0 18px" }}
          >
            Showing {filtered.length} of {parts.length} popular parts
          </p>

          <div className="parts-grid">
            {filtered.map((p, i) => {
              const Icon = categories.find((c) => c.id === p.cat).icon;
              return (
                <div
                  key={p.name}
                  className="card card-hover part"
                  style={{ animationDelay: `${Math.min(i, 12) * 0.04}s` }}
                >
                  <div className="part-thumb">
                    <Icon size={46} strokeWidth={1.4} />
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span className={`chip ${gradeStyle[p.grade]}`}>
                      {p.grade}
                    </span>
                    <span className="chip chip-ink">
                      {p.v === "car" ? "Car" : "Bike"}
                    </span>
                  </div>
                  <h4>{p.name}</h4>
                  <span className="muted" style={{ fontSize: ".82rem" }}>
                    {catLabel[p.cat]}
                  </span>
                  <div className="meta">
                    <span>
                      Warranty:{" "}
                      <b style={{ color: "var(--ink)" }}>{p.warranty}</b>
                    </span>
                    <Link
                      to="/contact"
                      style={{ color: "var(--brass)", fontWeight: 800 }}
                    >
                      Enquire →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="card" style={{ padding: 48, textAlign: "center" }}>
              <FileSearch size={40} color="var(--brass)" />
              <h3
                className="h3"
                style={{ color: "var(--ink)", margin: "14px 0 8px" }}
              >
                Not in the list? We'll find it.
              </h3>
              <p className="muted" style={{ margin: "0 0 22px" }}>
                Use the part request form at the top of this page, or contact
                our parts desk.
              </p>
              <Link to="/contact" className="btn btn-ink">
                Contact Parts Desk <ArrowRight size={16} />
              </Link>
            </div>
          )}
          <p className="muted" style={{ fontSize: ".8rem", marginTop: 22 }}>
            Prices vary by vehicle model and city. Our parts desk confirms the
            exact price and availability before you order.
          </p>
        </div>
      </section>

      {/* Grades */}
      <section className="section bg-white">
        <div className="wrap">
          <div className="center-head">
            <span className="eyebrow center reveal">Know your parts</span>
            <h2 className="h2 reveal d1" style={{ color: "var(--ink)" }}>
              OEM, OES or <em>aftermarket?</em>
            </h2>
            <p className="lead reveal d2">
              Every part we supply is clearly graded, so you always know exactly
              what goes into your vehicle.
            </p>
          </div>
          <div className="grid-3">
            {[
              [
                "OEM",
                "Original Equipment Manufacturer",
                "Made by or for your vehicle's brand and sold in its packaging. The exact part your vehicle left the factory with — highest price, perfect fit.",
                "chip-ink",
              ],
              [
                "OES",
                "Original Equipment Supplier",
                "Made by the same supplier that builds the OEM part, sold under the supplier's own brand. Identical quality, typically 20–40% more affordable.",
                "",
              ],
              [
                "Aftermarket",
                "Certified Aftermarket",
                "Built by reputed independent brands to meet or exceed original specifications. We stock only certified brands that pass our quality checks.",
                "chip-ok",
              ],
            ].map(([g, full, text, cls], i) => (
              <div key={g} className={`card card-hover grade reveal d${i + 1}`}>
                <span className={`chip ${cls}`}>{g}</span>
                <h3 className="h3">{full}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How ordering works */}
      <section className="section">
        <div className="wrap">
          <div className="center-head">
            <span className="eyebrow center reveal">How it works</span>
            <h2 className="h2 reveal d1" style={{ color: "var(--ink)" }}>
              From request to <em>fitted</em>
            </h2>
          </div>
          <div className="flow">
            {[
              [
                FileSearch,
                "Request",
                "Share your vehicle details and the part you need — online, by phone or in the app.",
              ],
              [
                BadgeCheck,
                "Verify fitment",
                "Our parts desk matches the exact part number to your make, model and year.",
              ],
              [
                Truck,
                "Deliver",
                "Parts are dispatched to your nearest partner garage or delivered to your door.",
              ],
              [
                Wrench,
                "Fit & warranty",
                "A verified technician installs the part, and your warranty is recorded digitally.",
              ],
            ].map(([Icon, t, p], i) => (
              <div key={t} className={`flow-step reveal d${i + 1}`}>
                <span className="icon-box ink">
                  <Icon size={24} />
                </span>
                <h4>{t}</h4>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promise */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div
            className="card reveal zoom"
            style={{
              background: "var(--ink)",
              borderColor: "var(--ink)",
              padding: "64px 52px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 40,
              alignItems: "center",
            }}
          >
            <div>
              <span className="eyebrow" style={{ color: "var(--brass-2)" }}>
                The parts promise
              </span>
              <h2 className="h2" style={{ color: "#fff", marginTop: 14 }}>
                No fakes. <em>No guesswork.</em>
              </h2>
            </div>
            <div style={{ display: "grid", gap: 18 }}>
              {[
                [
                  PackageCheck,
                  "Sourced only from authorised distributors with GST invoices.",
                ],
                [
                  ShieldCheck,
                  "Warranty recorded against your vehicle in the app.",
                ],
                [
                  RotateCcw,
                  "Wrong part? Free return or exchange on unused items within 7 days.",
                ],
              ].map(([Icon, t]) => (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "center",
                    color: "#dfe6ee",
                  }}
                >
                  <span
                    className="icon-box dark"
                    style={{ width: 42, height: 42 }}
                  >
                    <Icon size={18} />
                  </span>
                  {t}
                </div>
              ))}
              <Link
                to="/contact"
                className="btn btn-brass"
                style={{ justifySelf: "start", marginTop: 10 }}
              >
                Talk to the Parts Desk <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SpareParts;
