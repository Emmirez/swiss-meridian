import crypto from "crypto";

// Generates a 10-digit US-style account number
export const generateAccountNumber = () => {
  let num = "";
  for (let i = 0; i < 10; i++) {
    num += Math.floor(Math.random() * 10);
  }
  return num;
};

// Generates a transaction reference like WTB-9F3K2A1B
export const generateReference = () => {
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `WTB-${random}`;
};

// Generates a 6-digit OTP
export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
