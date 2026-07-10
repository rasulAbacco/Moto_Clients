// src/services/search.service.js
//
// REVISED after seeing the real backend. There is currently no single
// "merged service+garage" endpoint confirmed to exist — see two sources
// below. Once you send marketplace.controller.js / marketplace.service.js,
// if GET /api/marketplace/services already does this merge server-side,
// delete `flattenGarageMatches` entirely and just call that endpoint —
// it'll be faster and more correct than filtering on-device.

import api from "./apiClient";

/**
 * Catalog search — generic service types (AC repair, tyres, etc), NOT
 * tied to a specific garage or live price. Good for "what kind of
 * service am I looking for" autocomplete/browsing.
 *
 * Response shape from service.controller.js: a raw array (not wrapped
 * in { data: [] }) — res.status(200).json(data).
 */
export const searchCatalog = async ({ query, vehicleType }) => {
  if (!query || query.trim().length < 2) return [];
  const res = await api.get("/services/search", {
    params: { q: query.trim(), vehicleType },
  });
  return Array.isArray(res.data) ? res.data : [];
};

/**
 * Garage-comparison search — walks garages already loaded from the CRM
 * (/external/users, fetched once in HomeScreen) and flattens every
 * matching nested service into a row carrying its parent garage's
 * metadata. This is the ONLY source that currently has real per-garage
 * pricing, because garages live entirely outside Prisma right now.
 *
 * TODO: replace this with a real backend call once marketplace.service.js
 * is confirmed to do the same join server-side — this on-device version
 * only searches garages the app has already fetched (first page / all
 * loaded garages), not your full garage database.
 */
export const flattenGarageMatches = (garages, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const rows = [];
  garages.forEach((garage) => {
    const garageId = garage.id ?? garage.userId;
    const garageName = garage.companyName || garage.name || "Unknown Garage";
    const garageRating = garage.avgRating ?? 4.5;

    garage.services?.forEach((main) => {
      main.sections?.forEach((section) => {
        section.services?.forEach((svc) => {
          const haystack =
            `${svc.name || ""} ${section.name || ""} ${main.name || ""}`.toLowerCase();
          if (haystack.includes(q)) {
            rows.push({
              ...svc,
              serviceId: svc.id,
              serviceName: svc.name,
              garageId,
              garageName,
              garageRating,
            });
          }
        });
      });
    });
  });
  return rows;
};
