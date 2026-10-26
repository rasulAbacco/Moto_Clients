import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

/**
 * Header used at the top of every inner page — same look as the home hero:
 * cream background, bold serif title, photo bleeding off the right edge.
 * `aside` (e.g. a form or stat cards) floats over the photo.
 */
const PageHero = ({ crumb, eyebrow, title, lead, children, aside, image }) => (
  <section className={`ph ${image ? "has-img" : ""}`}>
    <style>{`
      .ph { position: relative; overflow: hidden; background: var(--cream); padding: 64px 0 96px; border-bottom: 1px solid var(--line); }
      .ph::before { content: ""; position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(22,27,34,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(22,27,34,.04) 1px, transparent 1px); background-size: 64px 64px; mask-image: radial-gradient(ellipse at 20% 40%, #000 10%, transparent 65%); }
      .ph-img { position: absolute; top: 0; right: 0; bottom: 0; width: 52%; overflow: hidden; }
      .ph-img img { width: 100%; height: 100%; object-fit: cover; animation: heroIn2 1.6s var(--ease) both; }
      @keyframes heroIn2 { from { opacity: 0; transform: scale(1.1); } to { opacity: 1; transform: none; } }
      .ph-img::before { content: ""; position: absolute; inset: 0; z-index: 1; background: linear-gradient(90deg, var(--cream) 0%, rgba(247,241,232,.7) 18%, rgba(247,241,232,0) 55%); }
      .ph-grid { position: relative; z-index: 2; display: grid; grid-template-columns: 1.15fr 1fr; gap: 56px; align-items: center; }
      .ph .display { color: var(--ink); font-size: clamp(2.5rem, 5vw, 4.4rem); margin-top: 20px; }
      .ph .lead { max-width: 540px; margin-top: 20px; }
      .ph .crumbs { color: var(--muted); }
      .ph .crumbs a:hover { color: var(--brass); }
      .ph-aside { position: relative; z-index: 2; }
      @media (max-width: 1024px) {
        .ph-grid { grid-template-columns: 1fr; }
        .ph.has-img { padding-bottom: 48px; }
        .ph-img { position: relative; width: 100%; height: 300px; margin-top: 36px; }
        .ph-img::before { background: linear-gradient(180deg, var(--cream) 0%, rgba(247,241,232,0) 35%); }
      }
    `}</style>
    <div className="wrap" style={{ position: "relative", zIndex: 2 }}>
      <div className="crumbs page-enter">
        <Link to="/">Home</Link>
        <ChevronRight size={14} />
        <span style={{ color: "var(--ink)", fontWeight: 600 }}>{crumb}</span>
      </div>
      <div className="ph-grid">
        <div>
          <span className="eyebrow page-enter">{eyebrow}</span>
          <h1 className="display">{title}</h1>
          {lead && <p className="lead page-enter" style={{ animationDelay: ".2s" }}>{lead}</p>}
          {children}
        </div>
        {aside && <div className="ph-aside page-enter" style={{ animationDelay: ".35s" }}>{aside}</div>}
      </div>
    </div>
    {image && <div className="ph-img"><img src={image} alt="" /></div>}
  </section>
);

/** Splits a string into words that rise in one after another. */
export const RiseText = ({ text, delay = 0, step = 0.08 }) =>
  text.split(" ").map((w, i) => (
    <span className="rise" key={i}>
      <span style={{ animationDelay: `${delay + i * step}s` }}>{w}&nbsp;</span>
    </span>
  ));

export default PageHero;
