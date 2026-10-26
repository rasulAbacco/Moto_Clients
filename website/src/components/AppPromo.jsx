import { Zap, Bell, MapPin, Settings } from "lucide-react";
import { IMG } from "../data/images";
import { APPS } from "../data/site";

const perks = [
  { icon: Zap, title: "Faster Booking", text: "Save time with instant access" },
  { icon: Bell, title: "Real-time SOS", text: "Get help with one tap" },
  {
    icon: MapPin,
    title: "Live Tracking",
    text: "Track your service in real-time",
  },
  {
    icon: Settings,
    title: "Exclusive Offers",
    text: "Get special deals in the app",
  },
];

const StoreBadge = ({ store }) => {
  const app = store === "google" ? APPS.android : APPS.ios;
  return (
    <div className="store-wrap">
      <a
        href={app.url}
        target="_blank"
        rel="noopener noreferrer"
        className="store"
        aria-label={`${app.app} — ${store === "google" ? "Get it on Google Play" : "Download on the App Store"}`}
      >
        {store === "google" ? (
          <svg width="26" height="28" viewBox="0 0 26 28" aria-hidden>
            <path
              d="M1 1.5 14.5 14 1 26.5c-.6-.3-1-1-1-1.8V3.3c0-.8.4-1.5 1-1.8Z"
              fill="#00d7fe"
            />
            <path
              d="m18.8 9.7-4.3 4.3L1 1.5c.3-.2.7-.2 1.1 0l16.7 8.2Z"
              fill="#00f076"
            />
            <path
              d="M18.8 18.3 2.1 26.5c-.4.2-.8.2-1.1 0L14.5 14l4.3 4.3Z"
              fill="#ff3a44"
            />
            <path
              d="m24.6 15.2-5.8 3.1-4.3-4.3 4.3-4.3 5.8 3.1c1 .5 1 1.9 0 2.4Z"
              fill="#ffd500"
            />
          </svg>
        ) : (
          <svg
            width="24"
            height="28"
            viewBox="0 0 384 512"
            fill="#fff"
            aria-hidden
          >
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
          </svg>
        )}
        <span>
          <small>{store === "google" ? "GET IT ON" : "Download on the"}</small>
          {store === "google" ? "Google Play" : "App Store"}
        </span>
      </a>
      <span className="store-app">
        {app.app} · {store === "google" ? "Android" : "iOS"}
      </span>
    </div>
  );
};

const AppPromo = () => (
  <section className="section-sm">
    <style>{`
      .app { position: relative; overflow: hidden; border-radius: 28px; background: radial-gradient(600px 320px at 60% 100%, rgba(207,138,76,.22), transparent 70%), linear-gradient(120deg, #1a2029, #232b36 60%, #1a2029); color: #fff;
        display: grid; grid-template-columns: 1.05fr 1.1fr .95fr; align-items: center; gap: 24px; padding: 0 44px; min-height: 340px; }
      .app::before { content: ""; position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px); background-size: 48px 48px; pointer-events: none; }
      .app-copy { padding: 48px 0; position: relative; }
      .app-copy h2 { color: #fff; font-size: clamp(1.9rem, 3vw, 2.5rem); }
      .app-copy p { color: #b9c2cc; line-height: 1.7; margin: 18px 0 28px; }
      .store { display: inline-flex; align-items: center; gap: 12px; padding: 10px 18px; border-radius: 12px; background: #000; border: 1px solid rgba(255,255,255,.35); color: #fff; transition: .35s var(--ease); }
      .store:hover { transform: translateY(-3px); border-color: #fff; box-shadow: 0 14px 28px -12px rgba(0,0,0,.7); }
      .store-wrap { display: flex; flex-direction: column; gap: 8px; }
      .store-app { font-size: .72rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--brass-2); padding-left: 4px; }
      .store span { display: flex; flex-direction: column; font-size: 1.2rem; font-weight: 600; line-height: 1.1; }
      .store small { font-size: .62rem; font-weight: 500; letter-spacing: .04em; }
      .app-phones { position: relative; align-self: end; height: 100%; min-height: 340px; display: flex; align-items: flex-end; justify-content: center; }
      .app-phones::before { content: ""; position: absolute; bottom: -60px; width: 80%; height: 70%; border-radius: 40px; background: rgba(255,255,255,.05); transform: rotate(-8deg); }
      .app-phones img { position: relative; width: 112%; max-width: 520px; margin-bottom: -14px; filter: drop-shadow(0 30px 40px rgba(0,0,0,.5)); animation: float 7s ease-in-out infinite; }
      .app-perks { position: relative; display: grid; gap: 22px; padding: 40px 0 40px 28px; border-left: 1px solid rgba(255,255,255,.1); }
      .perk { display: flex; gap: 16px; align-items: center; }
      .perk .icon-box { width: 46px; height: 46px; }
      .perk b { display: block; font-size: .95rem; } .perk span { font-size: .82rem; color: #b9c2cc; }
      @media (max-width: 1024px) { .app { grid-template-columns: 1fr 1fr; padding: 0 32px; } .app-perks { grid-column: span 2; border-left: 0; border-top: 1px solid rgba(255,255,255,.1); padding: 28px 0 36px; grid-template-columns: 1fr 1fr; } }
      @media (max-width: 680px) { .app { grid-template-columns: 1fr; padding: 0 22px; } .app-perks { grid-column: auto; grid-template-columns: 1fr; } .app-phones { min-height: 260px; } }
    `}</style>
    <div className="wrap">
      <div className="app reveal zoom">
        <div className="app-copy">
          <h2 className="h2">
            Take Motor Konnect
            <br />
            With You Everywhere
          </h2>
          <p>
            Book services, request SOS, order spare parts and more — all from
            the Motor Konnect app.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <StoreBadge store="google" />
            <StoreBadge store="apple" />
          </div>
        </div>
        <div className="app-phones">
          <img src={IMG.appPhones} alt="Motor Konnect mobile app screens" />
        </div>
        <div className="app-perks">
          {perks.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className={`perk reveal from-right d${i + 1}`}>
                <span className="icon-box copper">
                  <Icon size={20} />
                </span>
                <div>
                  <b>{p.title}</b>
                  <span>{p.text}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </section>
);

export default AppPromo;
