
import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET must be configured with at least 32 characters."
    );
  }

  return secret;
};

export const generateToken = (
  payload,
  expiresIn = process.env.JWT_EXPIRES_IN || "7d"
) => {
  if (!payload) {
    throw new Error("Token payload is required.");
  }

  const tokenPayload =
    typeof payload === "string"
      ? { id: payload }
      : payload;

  return jwt.sign(tokenPayload, getJwtSecret(), {
    expiresIn,
    issuer: "carespace-api",
  });
};

export const verifyToken = (token) => {
  if (!token) {
    throw new Error("Authentication token is required.");
  }

  return jwt.verify(token, getJwtSecret(), {
    issuer: "carespace-api",
  });
};

export const decodeToken = (token) => {
  if (!token) return null;

  return jwt.decode(token);
};

export default generateToken;
