export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidPassword = (password) => {
  return typeof password === "string" && password.length >= 6;
};

export const isRequired = (value) => {
  return value !== undefined && value !== null && value !== "";
};
