import { authenticator } from "otplib";
import QRCode from "qrcode";

authenticator.options = { window: 1 }; // allow 1 step of clock drift (~30s) either side

export const generateTwoFactorSecret = (email) => {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(email, "Swiss Meridian Bank", secret);
  return { secret, otpauth };
};

export const generateQrCode = async (otpauth) => {
  return QRCode.toDataURL(otpauth);
};

export const verifyTwoFactorToken = (token, secret) => {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
};
