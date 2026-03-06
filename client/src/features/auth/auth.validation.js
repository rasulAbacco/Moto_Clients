export const validateLogin = ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and password required");
  }
};

export const validateRegister = ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new Error("All fields required");
  }
};
