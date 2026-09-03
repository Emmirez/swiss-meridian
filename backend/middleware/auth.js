import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AccountHolder from "../models/AccountHolder.js";
import Account from "../models/Account.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user;

    // Resolve which Account this user belongs to (as primary or joint holder).
    // Admins have no account, so this is skipped for them.
    if (user.role !== "admin") {
      const holderRecord = await AccountHolder.findOne({ user: user._id }).populate("account");
      if (holderRecord) {
        req.account = holderRecord.account;
        req.accountRole = holderRecord.role; // "primary" or "joint"
      }
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, invalid or expired token" });
  }
};

export const requireActive = (req, res, next) => {
  // Frozen accounts can still view their dashboard/history — only pending,
  // rejected, and suspended user statuses are locked out of everything.
  if (req.user.status !== "active" && req.user.status !== "frozen") {
    return res.status(403).json({
      message: `Your account is currently ${req.user.status}. Please contact support.`,
    });
  }
  // Also check the Account itself isn't suspended/rejected (frozen is allowed to view).
  if (req.account && req.account.status !== "active" && req.account.status !== "frozen") {
    return res.status(403).json({
      message: `This account is currently ${req.account.status}. Please contact support.`,
    });
  }
  next();
};

export const requireNotFrozen = (req, res, next) => {
  if (req.user.status === "frozen" || req.account?.status === "frozen") {
    return res.status(403).json({
      message: "Your account is frozen and cannot send money, request funds, or open new applications. Contact support to resolve this.",
    });
  }
  if (req.user.status !== "active") {
    return res.status(403).json({
      message: `Your account is currently ${req.user.status}. Please contact support.`,
    });
  }
  if (req.account && req.account.status !== "active") {
    return res.status(403).json({
      message: `This account is currently ${req.account.status}. Please contact support.`,
    });
  }
  next();
};

export const requireKycApproved = (req, res, next) => {
  if (req.user.kycStatus !== "approved") {
    return res.status(403).json({
      message: "Please complete identity verification before sending or requesting money. Go to Profile → KYC Verification to get started.",
      needsKyc: true,
    });
  }
  next();
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};