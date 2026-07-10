// src/services/search.service.js
//
// Category filtering (CAR/BIKE/WASHING) — history of what was tried and
// why, confirmed against real garage data via debug logging:
//   1. Per-service field (vehicleType/category) — doesn't exist at all.
//   2. pricing[].carType (SEDAN/SUV/etc) — DISPROVEN as a signal: a main
//      group literally named "Bike Services" showed the exact same
//      carType values (SEDAN, SUV, HATCHBACK...) as car groups. This is
//      almost certainly the CRM's "add service" form reusing one fixed
//      pricing-tier template regardless of category — not filterable.
//   3. Garage company name ("Car Garage7") — works for SOME garages, but
//      2 of 4 real test garages ("ajay garage", "Pramod Tech") have
//      generic names with no hint at all.
//   4. Main-service GROUP name ("Bike Services") — the one place we've
//      seen an explicit, human-written category. Used as the PRIMARY
//      signal now, with garage name as a secondary fallback, since
//      together they cover the two real working cases we've found.
//
// ⚠️ HONEST LIMITATION: most garages only use a generic main-group name
// ("AC Services & Repair") with no vehicle hint anywhere. Those rows will
// keep showing under every category filter, because there's genuinely no
// data telling us otherwise. This needs a real fix upstream — either
// garage owners tag a category when creating a service group, or the
// CRM's "add service" form sends a real category field through the API.

import api from "./apiClient";

/**
 * Catalog search — generic service types (AC repair, tyres, etc), NOT
 * tied to a specific garage or live price. Not used for Home's default
 * listing or anything that leads to "Add to Cart" (no garageId on these
 * rows) — kept here only in case you want a non-bookable "browse
 * categories" feature elsewhere later.
 */
export const searchCatalog = async ({ query, vehicleType }) => {
  if (!query || query.trim().length < 2) return [];
  const res = await api.get("/services/search", {
    params: { q: query.trim(), vehicleType },
  });
  return Array.isArray(res.data) ? res.data : [];
};

const CATEGORY_KEYWORDS = {
  BIKE: ["bike", "motorcycle", "scooter"],
  WASHING: ["wash", "clean", "detailing"],
  CAR: ["car"], // checked last — "car" is a common substring, keep it lowest priority
};

const textMatchesCategory = (text, category) => {
  const lower = (text || "").toLowerCase();
  return (CATEGORY_KEYWORDS[category] || []).some((kw) => lower.includes(kw));
};

/** First choice: a real field on the service itself, if your CRM ever populates one. */
const getServiceCategory = (svc) => {
  const raw =
    svc.vehicleType?.name ??
    svc.vehicleTypeName ??
    (typeof svc.vehicleType === "string" ? svc.vehicleType : null) ??
    svc.category ??
    null;
  return raw ? String(raw).toUpperCase() : null;
};

const matchesCategory = (svc, mainName, garage, category) => {
  if (!category) return true;
  const target = category.toUpperCase();

  const svcCategory = getServiceCategory(svc);
  if (svcCategory) return svcCategory === target;

  // Primary real signal: the main-service group's own name
  // ("Bike Services" confirmed working in your data).
  if (textMatchesCategory(mainName, target)) return true;
  // If it clearly matches a DIFFERENT category by name, hide it.
  const otherCategories = Object.keys(CATEGORY_KEYWORDS).filter(
    (c) => c !== target,
  );
  if (otherCategories.some((c) => textMatchesCategory(mainName, c)))
    return false;

  // Secondary fallback: garage company name ("Car Garage7").
  const garageName = garage.companyName || garage.name || "";
  if (textMatchesCategory(garageName, target)) return true;
  if (otherCategories.some((c) => textMatchesCategory(garageName, c)))
    return false;

  return true; // truly unknown — show rather than silently hide
};

/**
 * Walks one garage's nested services -> sections -> services tree and
 * returns every sub-service as a flat row carrying that garage's
 * metadata (including verification status), deduped by
 * (serviceId, garageId). Shared by search, Home's default listing, and
 * the single-garage "full services" screen.
 */
export const flattenGarage = (
  garage,
  seen = new Set(),
  { category = null } = {},
) => {
  const garageId = garage.id ?? garage.userId;
  const garageName = garage.companyName || garage.name || "Unknown Garage";
  const garageRating = garage.avgRating ?? 4.5;
  const garageVerified = !!garage.isVerified;
  const rows = [];

  garage.services?.forEach((main) => {
    main.sections?.forEach((section) => {
      section.services?.forEach((svc) => {
        if (!matchesCategory(svc, main.name, garage, category)) return;

        const dedupeKey = `${svc.id}-${garageId}`;
        if (seen.has(dedupeKey)) return;
        seen.add(dedupeKey);

        rows.push({
          ...svc,
          serviceId: svc.id,
          serviceName: svc.name,
          garageId,
          garageName,
          garageRating,
          garageVerified,
        });
      });
    });
  });

  return rows;
};

/**
 * Garage-comparison search — flattens every matching nested service
 * across all loaded garages into rows carrying real garageId/garageName.
 * This is the ONLY source with real per-garage pricing + garage
 * attribution, because garages live entirely outside Prisma right now.
 */
export const flattenGarageMatches = (garages, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const seen = new Set();
  const rows = [];
  garages.forEach((garage) => {
    flattenGarage(garage, seen).forEach((row) => {
      const haystack = `${row.serviceName || ""}`.toLowerCase();
      if (haystack.includes(q)) rows.push(row);
    });
  });
  return rows;
};

/**
 * Home's default "browse services" listing — every real, garage-linked,
 * ACTIVE service across all loaded garages, filtered by the selected
 * CAR/BIKE/WASHING button. Capped with `limit` since Home shouldn't
 * render every service from every garage at once.
 */
export const flattenAllGarageServices = (
  garages,
  { limit = 20, category = null } = {},
) => {
  const seen = new Set();
  const rows = [];
  for (const garage of garages) {
    if (rows.length >= limit) break;
    flattenGarage(garage, seen, { category }).forEach((row) => {
      if (rows.length < limit) rows.push(row);
    });
  }
  return rows;
};
