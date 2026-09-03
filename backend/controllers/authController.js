import crypto from "crypto";
import User from "../models/User.js";
import Account from "../models/Account.js";
import AccountHolder from "../models/AccountHolder.js";
import JointInvite from "../models/JointInvite.js";
import {
  generateAccountNumber,
  generateOtp,
  BANK_ROUTING_NUMBER,
} from "../utils/generateIds.js";
import { generateToken } from "../utils/generateToken.js";
import {
  sendEmail,
  otpEmailTemplate,
  jointInviteEmailTemplate,
} from "../utils/sendEmail.js";
import { verifyTwoFactorToken } from "../utils/twoFactor.js";
import { notifyGeneral } from "../utils/notify.js";

const hashSsn = (ssn) => crypto.createHash("sha256").update(ssn).digest("hex");

// @route POST /api/auth/register
// Creates the primary User, the Account, and links them via AccountHolder.
// If isJoint is true, also creates a pending JointInvite and emails the
// named co-holder a link to complete their own separate registration.
export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      ssn,
      address,
      password,
      transactionPin,
      accountType,
      currency,
      isJoint,
      jointHolderName,
      jointHolderEmail,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !dateOfBirth ||
      !ssn ||
      !address ||
      !password ||
      !transactionPin ||
      !accountType
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    if (!/^\d{4}$/.test(transactionPin)) {
      return res
        .status(400)
        .json({ message: "Transaction PIN must be exactly 4 digits" });
    }

    if (!/^\d{9}$/.test(ssn)) {
      return res.status(400).json({ message: "SSN must be 9 digits" });
    }

    if (isJoint) {
      if (!jointHolderName || !jointHolderEmail) {
        return res.status(400).json({
          message: "Joint account holder's name and email are required",
        });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(jointHolderEmail)) {
        return res.status(400).json({
          message:
            "Please enter a valid email address for the joint account holder",
        });
      }
      if (jointHolderEmail.toLowerCase() === email.toLowerCase()) {
        return res.status(400).json({
          message:
            "Joint holder must use a different email than the primary holder",
        });
      }
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists" });
    }

    let accountNumber = generateAccountNumber();
    while (await Account.findOne({ accountNumber })) {
      accountNumber = generateAccountNumber();
    }

    const emailOtp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // 1. Create the primary User (identity/login only)
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      dateOfBirth,
      ssnLast4: ssn.slice(-4),
      ssnHash: hashSsn(ssn),
      address,
      password,
      transactionPin,
      status: "pending",
      emailOtp,
      emailOtpExpires: otpExpires,
    });

    // 2. Create the Account (the actual bank account)
    const account = await Account.create({
      accountNumber,
      routingNumber: BANK_ROUTING_NUMBER,
      accountType,
      isJoint: !!isJoint,
      currency: currency || "USD",
      status: "pending",
    });

    // 3. Link the primary holder to the account
    await AccountHolder.create({
      account: account._id,
      user: user._id,
      role: "primary",
    });

    // 4. If joint, create an invite for the co-holder to register on their own
    let jointInvite = null;
    if (isJoint) {
      const token = JointInvite.generateToken();
      jointInvite = await JointInvite.create({
        account: account._id,
        invitedBy: user._id,
        name: jointHolderName,
        email: jointHolderEmail.toLowerCase(),
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      await sendEmail({
        to: jointInvite.email,
        toName: jointInvite.name,
        subject: `You've been invited to a joint account on Swiss Meridian Bank`,
        html: jointInviteEmailTemplate({
          inviteeName: jointInvite.name,
          primaryName: `${user.firstName} ${user.lastName}`,
          accountType,
          inviteUrl: `https://swissmeridianapp.com/joint-signup?token=${token}`,
        }),
      });
    }

    await sendEmail({
      to: user.email,
      toName: user.firstName,
      subject: "Verify your Swiss Meridian Bank account",
      html: otpEmailTemplate(user.firstName, emailOtp),
    });

    return res.status(201).json({
      message: isJoint
        ? "Registration successful. Please verify your email. Your joint holder has also been emailed an invite to join this account."
        : "Registration successful. Please verify your email.",
      userId: user._id,
      email: user.email,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong during registration" });
  }
};

// @route GET /api/auth/joint-invite/:token
// Lets the joint-signup page look up invite details before the co-holder fills out the form.
export const getJointInvite = async (req, res) => {
  try {
    const invite = await JointInvite.findOne({ token: req.params.token })
      .populate("account")
      .populate("invitedBy", "firstName lastName");
    if (!invite) return res.status(404).json({ message: "Invite not found" });
    if (invite.status !== "pending")
      return res.status(400).json({
        message: "This invite has already been used or is no longer valid",
      });
    if (invite.expiresAt < new Date()) {
      invite.status = "expired";
      await invite.save();
      return res.status(400).json({
        message:
          "This invite has expired. Please ask the primary account holder to send a new one.",
      });
    }

    return res.json({
      invite: {
        name: invite.name,
        email: invite.email,
        accountType: invite.account.accountType,
        currency: invite.account.currency,
        primaryName: `${invite.invitedBy.firstName} ${invite.invitedBy.lastName}`,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not load invite" });
  }
};

// @route POST /api/auth/joint-signup
// The invited co-holder completes their own registration — creates their own
// User (with their own password/PIN/KYC) and links them to the SAME Account.
export const jointSignup = async (req, res) => {
  try {
    const {
      token,
      phone,
      dateOfBirth,
      ssn,
      address,
      password,
      transactionPin,
    } = req.body;

    if (
      !token ||
      !phone ||
      !dateOfBirth ||
      !ssn ||
      !address ||
      !password ||
      !transactionPin
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }
    if (!/^\d{4}$/.test(transactionPin)) {
      return res
        .status(400)
        .json({ message: "Transaction PIN must be exactly 4 digits" });
    }
    if (!/^\d{9}$/.test(ssn)) {
      return res.status(400).json({ message: "SSN must be 9 digits" });
    }

    const invite = await JointInvite.findOne({ token });
    if (!invite) return res.status(404).json({ message: "Invite not found" });
    if (invite.status !== "pending")
      return res.status(400).json({
        message: "This invite has already been used or is no longer valid",
      });
    if (invite.expiresAt < new Date()) {
      invite.status = "expired";
      await invite.save();
      return res.status(400).json({ message: "This invite has expired." });
    }

    const existing = await User.findOne({ email: invite.email });
    if (existing) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists" });
    }

    const [firstName, ...rest] = invite.name.trim().split(" ");
    const lastName = rest.join(" ") || firstName;

    const emailOtp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const jointUser = await User.create({
      firstName,
      lastName,
      email: invite.email,
      phone,
      dateOfBirth,
      ssnLast4: ssn.slice(-4),
      ssnHash: hashSsn(ssn),
      address,
      password,
      transactionPin,
      status: "pending",
      emailOtp,
      emailOtpExpires: otpExpires,
    });

    await AccountHolder.create({
      account: invite.account,
      user: jointUser._id,
      role: "joint",
    });

    invite.status = "accepted";
    await invite.save();

    await sendEmail({
      to: jointUser.email,
      toName: jointUser.firstName,
      subject: "Verify your Swiss Meridian Bank account",
      html: otpEmailTemplate(jointUser.firstName, emailOtp),
    });

    return res.status(201).json({
      message: "Registration successful. Please verify your email.",
      userId: jointUser._id,
      email: jointUser.email,
    });
  } catch (error) {
    console.error("Joint signup error:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong during registration" });
  }
};

// @route POST /api/auth/verify-email
export const verifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId).select(
      "+emailOtp +emailOtpExpires",
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.emailOtp !== otp || user.emailOtpExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    user.isEmailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;
    await user.save();

    return res.json({
      message: "Email verified successfully",
      isEmailVerified: true,
    });
  } catch (error) {
    return res.status(500).json({ message: "Verification failed" });
  }
};

// @route POST /api/auth/verify-phone
// export const verifyPhone = async (req, res) => {
//   try {
//     const { userId, otp } = req.body;
//     const user = await User.findById(userId).select(
//       "+phoneOtp +phoneOtpExpires",
//     );
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (user.phoneOtp !== otp || user.phoneOtpExpires < new Date()) {
//       return res.status(400).json({ message: "Invalid or expired code" });
//     }

//     user.isPhoneVerified = true;
//     user.phoneOtp = undefined;
//     user.phoneOtpExpires = undefined;
//     await user.save();

//     // Once both verifications are done, notify admins a new application is ready for review
//     if (user.isEmailVerified) {
//       await notifyGeneral(user, {
//         title: "Application under review",
//         message:
//           "Your identity has been verified. Our team is now reviewing your account application.",
//         type: "account",
//       });
//     }

//     return res.json({
//       message: "Phone verified successfully",
//       isPhoneVerified: true,
//     });
//   } catch (error) {
//     return res.status(500).json({ message: "Verification failed" });
//   }
// };

// @route POST /api/auth/resend-otp
export const resendOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOtp();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    user.emailOtp = otp;
    user.emailOtpExpires = expires;
    await user.save();
    await sendEmail({
      to: user.email,
      toName: user.firstName,
      subject: "Your new Swiss Meridian Bank verification code",
      html: otpEmailTemplate(user.firstName, otp),
    });

    return res.json({ message: "Verification code resent" });
  } catch (error) {
    return res.status(500).json({ message: "Could not resend code" });
  }
};

// @route POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
        userId: user._id,
        needsVerification: true,
      });
    }

    if (user.status === "pending") {
      return res
        .status(403)
        .json({ message: "Your account is pending admin approval" });
    }
    if (user.status === "rejected") {
      return res.status(403).json({
        message: "Your account application was not approved. Contact support.",
      });
    }
    if (user.status === "suspended") {
      return res.status(403).json({
        message: "Your account is currently suspended. Contact support.",
      });
    }

    if (user.twoFactorEnabled) {
      return res.json({ needsTwoFactor: true, userId: user._id });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user._id);
    const holderRecord = await AccountHolder.findOne({
      user: user._id,
    }).populate("account");
    const account = holderRecord?.account;

    return res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        accountRole: holderRecord?.role,
        accountType: account?.accountType,
        accountNumber: account?.accountNumber,
        currency: account?.currency,
        balance: account?.balance,
        isJoint: account?.isJoint,
        accountStatus: account?.status,
        status: user.status,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};

// @route POST /api/auth/verify-2fa-login
export const verifyTwoFactorLogin = async (req, res) => {
  try {
    const { userId, token } = req.body;
    const user = await User.findById(userId).select("+twoFactorSecret");
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({
        message: "Two-factor authentication is not enabled for this account",
      });
    }

    const isValid = verifyTwoFactorToken(token, user.twoFactorSecret);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid authentication code" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const jwtToken = generateToken(user._id);
    const holderRecord = await AccountHolder.findOne({
      user: user._id,
    }).populate("account");
    const account = holderRecord?.account;

    return res.json({
      token: jwtToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        accountRole: holderRecord?.role,
        accountType: account?.accountType,
        accountNumber: account?.accountNumber,
        currency: account?.currency,
        balance: account?.balance,
        isJoint: account?.isJoint,
        accountStatus: account?.status,
        status: user.status,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Verification failed" });
  }
};

// @route GET /api/auth/me
export const getMe = async (req, res) => {
  return res.json({ user: req.user });
};

// @route POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    // Always return the same response whether or not the email exists,
    // so this endpoint can't be used to check which emails are registered.
    if (!user) {
      return res.json({
        message:
          "If an account exists with that email, a reset code has been sent.",
      });
    }

    const otp = generateOtp();
    user.emailOtp = otp;
    user.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail({
      to: user.email,
      toName: user.firstName,
      subject: "Reset your Swiss Meridian Bank password",
      html: otpEmailTemplate(user.firstName, otp),
    });

    return res.json({
      message:
        "If an account exists with that email, a reset code has been sent.",
      userId: user._id,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Could not process request" });
  }
};

// @route POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    if (!userId || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters" });
    }

    const user = await User.findById(userId).select(
      "+emailOtp +emailOtpExpires",
    );
    if (!user) return res.status(404).json({ message: "Invalid request" });

    if (user.emailOtp !== otp || user.emailOtpExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    user.password = newPassword; // pre-save hook re-hashes it
    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;
    await user.save();

    await notifyGeneral(user, {
      title: "Password reset",
      message:
        "Your account password was just reset. If this wasn't you, contact support immediately.",
      type: "security",
      email: true,
    });

    return res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Could not reset password" });
  }
};

// @route POST /api/users/account/invite-joint-holder
// Lets an EXISTING primary/joint holder invite someone new to their account,
// reusing the same JointInvite + email flow as registration-time joint setup.
export const inviteJointHolder = async (req, res) => {
  try {
    const { name, email } = req.body;
    const account = req.account;

    if (!account) {
      return res
        .status(404)
        .json({ message: "No account found for your login" });
    }
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    }
    if (email.toLowerCase() === req.user.email.toLowerCase()) {
      return res.status(400).json({ message: "You cannot invite yourself" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(409)
        .json({
          message: "A Well Trust Bank account already exists with that email",
        });
    }

    const existingInvite = await JointInvite.findOne({
      account: account._id,
      email: email.toLowerCase(),
      status: "pending",
    });
    if (existingInvite) {
      return res
        .status(400)
        .json({
          message:
            "There's already a pending invite sent to that email for this account",
        });
    }

    const token = JointInvite.generateToken();
    const invite = await JointInvite.create({
      account: account._id,
      invitedBy: req.user._id,
      name,
      email: email.toLowerCase(),
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Mark the account as joint now that an invite has gone out — this
    // reflects intent immediately rather than waiting for acceptance.
    if (!account.isJoint) {
      account.isJoint = true;
      await account.save();
    }

    await sendEmail({
      to: invite.email,
      toName: invite.name,
      subject: `You've been invited to a joint account on Well Trust Bank`,
      html: jointInviteEmailTemplate({
        inviteeName: invite.name,
        primaryName: `${req.user.firstName} ${req.user.lastName}`,
        accountType: account.accountType,
        inviteUrl: `https://welltrustapp.com/joint-signup?token=${token}`,
      }),
    });

    return res.status(201).json({ message: "Invite sent", invite });
  } catch (error) {
    console.error("Invite joint holder error:", error);
    return res.status(500).json({ message: "Could not send invite" });
  }
};

// @route GET /api/users/account/holders
// Lists everyone currently attached to the logged-in user's account.
export const getAccountHolders = async (req, res) => {
  try {
    if (!req.account) {
      return res
        .status(404)
        .json({ message: "No account found for your login" });
    }
    const holders = await AccountHolder.find({
      account: req.account._id,
    }).populate("user", "firstName lastName email kycStatus");
    const pendingInvites = await JointInvite.find({
      account: req.account._id,
      status: "pending",
    });

    return res.json({
      holders: holders.map((h) => ({ user: h.user, role: h.role })),
      pendingInvites: pendingInvites.map((i) => ({
        name: i.name,
        email: i.email,
        expiresAt: i.expiresAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch account holders" });
  }
};
