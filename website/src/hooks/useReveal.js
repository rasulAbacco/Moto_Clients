import { useEffect } from "react";

/**
 * Adds the `in` class to every `.reveal` element once it scrolls into view.
 *
 * - A MutationObserver picks up elements that mount later (tabs, filters, etc.).
 * - Revealed elements are marked with `data-revealed`. If React later re-renders
 *   the element's className (e.g. an accordion toggling "open"), the `in` class
 *   gets wiped — so we put it straight back, before the browser paints.
 */
export default function useReveal(key) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            e.target.setAttribute("data-revealed", "");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    const scan = () =>
      document
        .querySelectorAll(".reveal:not(.in):not([data-revealed])")
        .forEach((el) => io.observe(el));

    const mo = new MutationObserver((mutations) => {
      let added = false;
      for (const m of mutations) {
        if (m.type === "childList") added = true;
        // Restore `in` on already-revealed elements whose className React replaced
        if (
          m.type === "attributes" &&
          m.target.hasAttribute?.("data-revealed") &&
          !m.target.classList.contains("in")
        ) {
          m.target.classList.add("in");
        }
      }
      if (added) scan();
    });

    scan();
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [key]);
}
