import { useEffect, useRef, useState } from "react";

/** Counts up to a value like "50K+", "98%", "12.5m" when it scrolls into view. */
const Counter = ({ value, duration = 1800 }) => {
  const match = String(value).match(/^([\d.]+)(.*)$/);
  const target = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : value;
  const decimals = match && match[1].includes(".") ? match[1].split(".")[1].length : 0;
  const [n, setN] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!match) return;
    let raf;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (t) => {
        const p = Math.min((t - start) / duration, 1);
        setN(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    if (ref.current) io.observe(ref.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!match) return <span>{value}</span>;
  return (
    <span ref={ref}>
      {n.toFixed(decimals)}
      {suffix}
    </span>
  );
};

export default Counter;
