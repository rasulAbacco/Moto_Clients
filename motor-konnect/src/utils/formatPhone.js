// "917204986825" / "7204986825" / "+91 7204986825" → "+91 72049 86825"
export const formatPhone = (phone) => {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  const ten = digits.slice(-10);
  if (ten.length !== 10) return String(phone);
  return `+91 ${ten.slice(0, 5)} ${ten.slice(5)}`;
};
