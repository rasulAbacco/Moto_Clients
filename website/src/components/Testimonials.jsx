import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star, Quote, BadgeCheck } from "lucide-react";
import { REVIEWS } from "../data/reviews";

const avg = (REVIEWS.reduce((a, r) => a + r.rating, 0) / REVIEWS.length).toFixed(1);

/** Auto-sliding customer reviews with arrows, dots and a rating summary. */
const Testimonials = ({ title = "What Our Customers Say", subtitle = "Real stories from drivers who trust Motor Konnect." }) => {
  const track = useRef(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const [paused, setPaused] = useState(false);

  // Page by whole cards: step = card width + gap
  const geometry = () => {
    const el = track.current;
    const card = el?.firstElementChild;
    if (!el || !card) return null;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const step = card.offsetWidth + gap;
    const perView = Math.max(1, Math.round((el.clientWidth + gap) / step));
    const total = Math.max(1, Math.ceil(el.children.length / perView));
    return { el, step, perView, total };
  };

  const measure = () => {
    const g = geometry();
    if (!g) return;
    setPages(g.total);
    setPage(Math.min(g.total - 1, Math.round(g.el.scrollLeft / (g.step * g.perView))));
  };

  const scrollTo = (p) => {
    const g = geometry();
    if (!g) return;
    const next = (p + g.total) % g.total;
    g.el.scrollTo({ left: next * g.step * g.perView, behavior: "smooth" });
  };

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (paused) return undefined;
    const t = setInterval(() => scrollTo(page + 1), 5000);
    return () => clearInterval(t);
  }, [page, paused]);

  return (
    <section className="section-sm" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <style>{`
        .rv-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; flex-wrap: wrap; margin-bottom: 32px; }
        .rv-summary { display: inline-flex; align-items: center; gap: 14px; padding: 10px 16px; background: #fff; border: 1px solid var(--line); border-radius: 14px; }
        .rv-summary b { font-family: var(--serif); font-size: 1.6rem; color: var(--ink); }
        .rv-arrows { display: flex; gap: 10px; }
        .rv-arrows button { width: 46px; height: 46px; border-radius: 50%; border: 1px solid var(--line); background: #fff; color: var(--ink); display: grid; place-items: center; transition: .3s var(--ease); }
        .rv-arrows button:hover { background: var(--ink); color: #fff; border-color: var(--ink); transform: scale(1.06); }
        .rv-track { display: grid; grid-auto-flow: column; grid-auto-columns: calc((100% - 48px) / 3); gap: 24px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; padding: 6px 2px 18px; }
        .rv-track::-webkit-scrollbar { display: none; }
        @media (max-width: 1024px) { .rv-track { grid-auto-columns: calc((100% - 24px) / 2); } }
        @media (max-width: 640px) { .rv-track { grid-auto-columns: 100%; } }
        .rv { scroll-snap-align: start; background: #fff; border: 1px solid var(--line); border-radius: 20px; padding: 28px; position: relative; display: flex; flex-direction: column; gap: 14px; transition: transform .5s var(--ease), box-shadow .5s var(--ease); }
        .rv:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); }
        .rv-top { display: flex; gap: 14px; align-items: center; }
        .rv-top img { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; }
        .rv-top b { display: block; color: var(--ink); font-size: .98rem; }
        .rv-top small { color: var(--muted); font-size: .78rem; }
        .rv .q { position: absolute; right: 24px; top: 22px; color: var(--line); transition: color .4s, transform .5s var(--ease); }
        .rv:hover .q { color: var(--brass-soft); transform: rotate(-8deg) scale(1.1); }
        .rv p { margin: 0; font-family: var(--serif); font-size: 1.02rem; line-height: 1.65; color: #3a342c; }
        .rv-foot { margin-top: auto; display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px dashed var(--line); font-size: .78rem; color: var(--muted); }
        .rv-dots { display: flex; justify-content: center; gap: 8px; margin-top: 10px; }
        .rv-dots button { width: 8px; height: 8px; border-radius: 99px; border: 0; background: var(--line); transition: .4s var(--ease); padding: 0; }
        .rv-dots button.on { width: 28px; background: var(--brass); }
      `}</style>
      <div className="wrap">
        <div className="rv-head">
          <div className="reveal">
            <h2 className="h2" style={{ color: "var(--ink)" }}>{title}</h2>
            <p className="lead" style={{ marginTop: 8 }}>{subtitle}</p>
          </div>
          <div className="reveal d2" style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div className="rv-summary">
              <b>{avg}</b>
              <div>
                <span className="stars">{[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</span>
                <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>Average customer rating</div>
              </div>
            </div>
            <div className="rv-arrows">
              <button onClick={() => scrollTo(page - 1)} aria-label="Previous reviews"><ChevronLeft size={20} /></button>
              <button onClick={() => scrollTo(page + 1)} aria-label="Next reviews"><ChevronRight size={20} /></button>
            </div>
          </div>
        </div>

        <div className="rv-track reveal" ref={track} onScroll={measure}>
          {REVIEWS.map((r) => (
            <article key={r.name} className="rv">
              <Quote className="q" size={44} fill="currentColor" strokeWidth={0} />
              <div className="rv-top">
                <img src={r.avatar} alt={r.name} />
                <div>
                  <b>{r.name}</b>
                  <span className="stars">{[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < r.rating ? "currentColor" : "none"} />)}</span>
                </div>
              </div>
              <p>“{r.text}”</p>
              <div className="rv-foot">
                <span>{r.vehicle} · {r.city}</span>
                <span className="chip" style={{ gap: 4 }}><BadgeCheck size={12} /> {r.tag}</span>
              </div>
            </article>
          ))}
        </div>
        <div className="rv-dots">
          {[...Array(pages)].map((_, i) => (
            <button key={i} className={i === page ? "on" : ""} onClick={() => scrollTo(i)} aria-label={`Go to page ${i + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
