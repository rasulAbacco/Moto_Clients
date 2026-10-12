// utils/generateToken.js
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

import {
  jwtSecret,
  jwtRefreshSecret,
  jwtExpiresIn,
  jwtRefreshExpiresIn,
} from "../config/jwt.js";

export const generateToken = (payload) => {
  // Sign without `expiresIn` so token does not carry an exp claim
  return jwt.sign(payload, env.JWT_SECRET);
};

export const generateAccessToken = (user) =>
  // Create an access token without an expiry so it remains valid until logout
  jwt.sign({ id: user.id, role: user.role }, jwtSecret);
export const generateRefreshToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, jwtRefreshSecret, {
    expiresIn: jwtRefreshExpiresIn,
  });
