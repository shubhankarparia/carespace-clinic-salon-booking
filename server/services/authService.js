
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return process.env.JWT_SECRET;
};

export const hashPassword = async (password) => {
  if (typeof password !== "string" || password.length < 8) {
    throw new Error("Password must contain at least 8 characters.");
  }

  return bcrypt.hash(password, 12);
};

export const comparePassword = async (password, hashedPassword) => {
  if (!password || !hashedPassword) return false;

  return bcrypt.compare(password, hashedPassword);
};

export const generateAuthToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      issuer: "carespace-api",
    }
  );
};

export const verifyAuthToken = (token) => {
  return jwt.verify(token, getJwtSecret(), {
    issuer: "carespace-api",
  });
};

export const generatePasswordResetToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      purpose: "password-reset",
    },
    getJwtSecret(),
    {
      expiresIn: "15m",
      issuer: "carespace-api",
    }
  );
};

export const verifyPasswordResetToken = (token) => {
  const decoded = jwt.verify(token, getJwtSecret(), {
    issuer: "carespace-api",
  });

  if (decoded.purpose !== "password-reset") {
    throw new Error("Invalid password reset token.");
  }

  return decoded;
};

export const getSafeUser = (user) => {
  if (!user) return null;

  const data = user.toObject ? user.toObject() : { ...user };

  delete data.password;
  delete data.__v;

  return data;
};

export const createAuthResponse = (user) => {
  return {
    token: generateAuthToken(user),
    user: getSafeUser(user),
  };
};
