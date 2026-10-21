// ₹1,416 / ₹1,416.50 — Indian digit grouping, no trailing .00
export const formatPrice = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "Price on request";
  }
  const n = Number(value);
  return (
    "₹" +
    n.toLocaleString("en-IN", {
      minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
      maximumFractionDigits: 2,
    })
  );
};
