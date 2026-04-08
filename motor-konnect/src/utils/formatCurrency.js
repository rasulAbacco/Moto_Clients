export default function formatCurrency(amount, currency = "INR") {
  if (typeof amount !== "number") return "₹ 0";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}
