import express from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  verifyEmail,
  resendOtp,
  login,
  getMe,
  verifyTwoFactorLogin,
  forgotPassword,
  resetPassword,
  getJointInvite,
  jointSignup,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    message: "Too many code requests. Please wait before trying again.",
  },
});

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", otpLimiter, resendOtp);
router.post("/login", loginLimiter, login);
router.post("/verify-2fa-login", loginLimiter, verifyTwoFactorLogin);
router.post("/forgot-password", otpLimiter, forgotPassword);
router.post("/reset-password", loginLimiter, resetPassword);
router.get("/me", protect, getMe);
router.get("/joint-invite/:token", getJointInvite);
router.post("/joint-signup", jointSignup);

export default router;
