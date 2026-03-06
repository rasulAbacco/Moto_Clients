export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const capitalize = (value = "") =>
  value.charAt(0).toUpperCase() + value.slice(1);

export const isEmptyObject = (obj) => obj && Object.keys(obj).length === 0;
