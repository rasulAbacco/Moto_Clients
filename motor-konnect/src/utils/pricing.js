// src/utils/pricing.js
//
// The ONE place price math happens. Replaces the near-duplicate logic that
// used to live in:
//   - GarageList.jsx        (getLowestPrice)
//   - app/services/[id].jsx (getServicePrice)
//   - app/sub-service/[id].jsx (getServicePrice)
//
// Every screen should import this instead of writing its own version.

/**
 * Resolves the final price for a single service-like object against a
 * vehicle type, handling both pricing-tier arrays and flat price fields.
 *
 * @param {object} item - a service/sub-service object. May have either:
 *   - item.pricing: [{ carType, price, discount, discountType }]
 *   - item.price + item.discountValue + item.discountType
 * @param {string} vehicleType - e.g. "SEDAN", "SUV", "LUXURY"
 * @returns {{ final: number, original: number }}
 */
export function getServicePrice(item, vehicleType) {
  const typeKey = (vehicleType || "SEDAN").toUpperCase();

  const applyDiscount = (price, discount, discountType) => {
    if (discountType === "PERCENTAGE") return price - (price * discount) / 100;
    if (discountType === "FLAT") return price - discount;
    // Legacy fallback: no explicit discountType, infer from magnitude
    if (discount > 0 && discount <= 100)
      return price - (price * discount) / 100;
    return price - discount;
  };

  // 1) Car-type specific pricing tiers
  if (item?.pricing?.length) {
    const match = item.pricing.find((p) => p.carType === typeKey);
    if (match) {
      const price = parseFloat(match.price || 0);
      const discount = parseFloat(match.discount || 0);
      const final = applyDiscount(price, discount, match.discountType);
      return { final: Math.max(final, 0), original: price };
    }
  }

  // 2) Flat service-level pricing
  if (item?.price != null) {
    const price = parseFloat(item.price || 0);
    const discount = parseFloat(item.discountValue || 0);
    const final = applyDiscount(price, discount, item.discountType);
    return { final: Math.max(final, 0), original: price };
  }

  // 3) Fallback — lowest tier available, any car type
  if (item?.pricing?.length) {
    const prices = item.pricing.map((p) => {
      const price = parseFloat(p.price || 0);
      const discount = parseFloat(p.discount || 0);
      return Math.max(applyDiscount(price, discount, p.discountType), 0);
    });
    const final = Math.min(...prices);
    return { final, original: final };
  }

  return { final: 0, original: 0 };
}

/**
 * Convenience for garage cards ("EST. STARTING ₹X") — walks a garage's
 * full nested services -> sections -> services tree and returns the
 * cheapest final price for the given vehicle type.
 */
export function getLowestPriceForGarage(garage, vehicleType) {
  if (!garage?.services?.length) return null;

  let lowest = null;
  garage.services.forEach((main) => {
    main.sections?.forEach((section) => {
      section.services?.forEach((svc) => {
        const { final } = getServicePrice(svc, vehicleType);
        if (final > 0 && (lowest === null || final < lowest)) lowest = final;
      });
    });
  });
  return lowest;
}
