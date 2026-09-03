import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Notification from "../models/Notification.js";
import { notifyGeneral } from "../utils/notify.js";
import {
  generateTwoFactorSecret,
  generateQrCode,
  verifyTwoFactorToken,
} from "../utils/twoFactor.js";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";
import { getLimitUsage } from "../utils/transferLimits.js";
import { generateStatementPdf } from "../utils/generateStatement.js";

const DEBIT_TYPES = [
  "transfer_internal",
  "transfer_external",
  "transfer_international",
  "transfer_zelle",
  "transfer_paypal",
  "adjustment_debit",
];

// @route GET /api/users/dashboard
export const getDashboard = async (req, res) => {
  try {
    const user = req.user;
    const account = req.account; // attached by protect middleware

    if (!account) {
      return res
        .status(404)
        .json({ message: "No account found for this user" });
    }

    const recentTransactions = await Transaction.find({
      $or: [{ sender: user._id }, { receiver: user._id }],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("sender", "firstName lastName")
      .populate("receiver", "firstName lastName");

    // Spending overview for the current month (money out, grouped by category)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const spending = await Transaction.aggregate([
      {
        $match: {
          sender: user._id,
          createdAt: { $gte: startOfMonth },
          status: "completed",
        },
      },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    const unreadCount = await Notification.countDocuments({
      user: user._id,
      read: false,
    });

    return res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        accountRole: req.accountRole,
        accountNumber: account.accountNumber,
        routingNumber: account.routingNumber,
        accountType: account.accountType,
        isJoint: account.isJoint,
        currency: account.currency,
        balance: account.balance,
        avatarUrl: user.avatarUrl,
      },
      recentTransactions,
      spending,
      unreadNotifications: unreadCount,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({ message: "Could not load dashboard" });
  }
};

// @route PUT /api/users/profile
export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "firstName",
      "lastName",
      "phone",
      "address",
      "avatarUrl",
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    return res.json({ message: "Profile updated", user });
  } catch (error) {
    return res.status(500).json({ message: "Could not update profile" });
  }
};

// @route PUT /api/users/notification-preferences
export const updateNotificationPrefs = async (req, res) => {
  try {
    const { email, sms, inApp } = req.body;
    const user = await User.findById(req.user._id);
    if (email !== undefined) user.notificationPrefs.email = email;
    if (sms !== undefined) user.notificationPrefs.sms = sms;
    if (inApp !== undefined) user.notificationPrefs.inApp = inApp;
    await user.save();
    return res.json({
      message: "Preferences updated",
      notificationPrefs: user.notificationPrefs,
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not update preferences" });
  }
};

// @route GET /api/users/notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json({ notifications });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch notifications" });
  }
};

// @route PUT /api/users/notifications/:id/read
export const markNotificationRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
    );
    return res.json({ message: "Marked as read" });
  } catch (error) {
    return res.status(500).json({ message: "Could not update notification" });
  }
};

// @route PUT /api/users/notifications/read-all
export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true },
    );
    return res.json({ message: "All notifications marked as read" });
  } catch (error) {
    return res.status(500).json({ message: "Could not update notifications" });
  }
};

// @route DELETE /api/users/notifications/:id
export const deleteNotification = async (req, res) => {
  try {
    const result = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!result)
      return res.status(404).json({ message: "Notification not found" });
    return res.json({ message: "Notification deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Could not delete notification" });
  }
};

// @route DELETE /api/users/notifications
export const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    return res.json({ message: "All notifications deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Could not delete notifications" });
  }
};

// @route GET /api/users/kyc
export const getKycStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.json({
      kycStatus: user.kycStatus,
      kycDocumentType: user.kycDocumentType,
      kycDocumentNumber: user.kycDocumentNumber,
      kycFrontIdUrl: user.kycFrontIdUrl,
      kycBackIdUrl: user.kycBackIdUrl,
      kycSelfieUrl: user.kycSelfieUrl,
      kycFullName: user.kycFullName,
      kycDateOfBirth: user.kycDateOfBirth,
      kycNationality: user.kycNationality,
      kycGender: user.kycGender,
      kycAddress: user.kycAddress,
      kycEmploymentStatus: user.kycEmploymentStatus,
      kycOccupation: user.kycOccupation,
      kycEmployerName: user.kycEmployerName,
      kycAnnualIncome: user.kycAnnualIncome,
      kycSourceOfFunds: user.kycSourceOfFunds,
      kycSubmittedAt: user.kycSubmittedAt,
      kycNote: user.kycNote,
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch KYC status" });
  }
};

// @route PUT /api/users/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password are required" });
    }
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword; // pre-save hook re-hashes it
    await user.save();

    await notifyGeneral(user, {
      title: "Password changed",
      message:
        "Your account password was just changed. If this wasn't you, contact support immediately.",
      type: "security",
      email: true,
    });

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Could not update password" });
  }
};

// @route PUT /api/users/change-pin
export const changePin = async (req, res) => {
  try {
    const { currentPassword, newPin, confirmPin } = req.body;
    if (!currentPassword || !newPin || !confirmPin) {
      return res
        .status(400)
        .json({ message: "Password and new PIN are required" });
    }
    if (!/^\d{4}$/.test(newPin)) {
      return res.status(400).json({ message: "PIN must be exactly 4 digits" });
    }
    if (newPin !== confirmPin) {
      return res.status(400).json({ message: "PINs do not match" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    user.transactionPin = newPin; // pre-save hook re-hashes it
    await user.save();

    await notifyGeneral(user, {
      title: "Transaction PIN changed",
      message:
        "Your transaction PIN was just changed. If this wasn't you, contact support immediately.",
      type: "security",
      email: true,
    });

    return res.json({ message: "Transaction PIN updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Could not update PIN" });
  }
};

// @route GET /api/users/2fa/status
export const getTwoFactorStatus = async (req, res) => {
  return res.json({ twoFactorEnabled: req.user.twoFactorEnabled });
};

// @route POST /api/users/2fa/setup
// Generates a new secret + QR code. Not enabled until verified via /2fa/verify-setup.
export const setupTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { secret, otpauth } = generateTwoFactorSecret(user.email);
    const qrCodeDataUrl = await generateQrCode(otpauth);

    user.twoFactorTempSecret = secret;
    await user.save();

    return res.json({ qrCodeDataUrl, secret });
  } catch (error) {
    return res.status(500).json({ message: "Could not start 2FA setup" });
  }
};

// @route POST /api/users/2fa/verify-setup
export const verifyTwoFactorSetup = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user._id).select(
      "+twoFactorTempSecret",
    );
    if (!user.twoFactorTempSecret) {
      return res.status(400).json({
        message: "No 2FA setup in progress. Please start setup again.",
      });
    }

    const isValid = verifyTwoFactorToken(token, user.twoFactorTempSecret);
    if (!isValid) {
      return res.status(400).json({
        message:
          "Invalid code. Please check your authenticator app and try again.",
      });
    }

    user.twoFactorSecret = user.twoFactorTempSecret;
    user.twoFactorTempSecret = undefined;
    user.twoFactorEnabled = true;
    await user.save();

    await notifyGeneral(user, {
      title: "Two-factor authentication enabled",
      message:
        "2FA has been turned on for your account. You'll need your authenticator app to log in from now on.",
      type: "security",
      email: true,
    });

    return res.json({
      message: "Two-factor authentication enabled",
      twoFactorEnabled: true,
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not verify 2FA setup" });
  }
};

// @route POST /api/users/2fa/disable
export const disableTwoFactor = async (req, res) => {
  try {
    const { currentPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    await notifyGeneral(user, {
      title: "Two-factor authentication disabled",
      message:
        "2FA has been turned off for your account. If this wasn't you, contact support immediately.",
      type: "security",
      email: true,
    });

    return res.json({
      message: "Two-factor authentication disabled",
      twoFactorEnabled: false,
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not disable 2FA" });
  }
};

// @route POST /api/users/kyc
// Accepts the full 4-step wizard submission: documents + personal info + address + employment
export const uploadKyc = async (req, res) => {
  try {
    const {
      documentType,
      documentNumber,
      fullName,
      dateOfBirth,
      nationality,
      gender,
      street,
      city,
      state,
      zip,
      country,
      employmentStatus,
      occupation,
      employerName,
      annualIncome,
      sourceOfFunds,
    } = req.body;

    if (
      !["drivers_license", "passport", "national_id", "state_id"].includes(
        documentType,
      )
    ) {
      return res
        .status(400)
        .json({ message: "Please select a valid document type" });
    }
    if (!documentNumber) {
      return res.status(400).json({ message: "Document number is required" });
    }
    if (!req.files?.frontId) {
      return res.status(400).json({ message: "Front of ID is required" });
    }
    if (!req.files?.selfie) {
      return res.status(400).json({ message: "Selfie with ID is required" });
    }
    if (!fullName || !dateOfBirth || !nationality) {
      return res
        .status(400)
        .json({ message: "Please complete all required personal info fields" });
    }
    if (!street || !city || !state || !zip || !country) {
      return res.status(400).json({ message: "Please complete your address" });
    }
    if (!employmentStatus || !sourceOfFunds) {
      return res
        .status(400)
        .json({ message: "Please complete all required employment fields" });
    }

    const userId = req.user._id;

    const frontResult = await uploadBufferToCloudinary(
      req.files.frontId[0].buffer,
      {
        folder: "swissmeridianbank/kyc",
        publicId: `${userId}-front-${Date.now()}`,
        isPdf: false,
      },
    );

    let backUrl;
    if (req.files?.backId) {
      const backResult = await uploadBufferToCloudinary(
        req.files.backId[0].buffer,
        {
          folder: "swissmeridianbank/kyc",
          publicId: `${userId}-back-${Date.now()}`,
          isPdf: false,
        },
      );
      backUrl = backResult.secure_url;
    }

    const selfieResult = await uploadBufferToCloudinary(
      req.files.selfie[0].buffer,
      {
        folder: "swissmeridianbank/kyc",
        publicId: `${userId}-selfie-${Date.now()}`,
        isPdf: false,
      },
    );

    const user = await User.findById(userId);
    user.kycDocumentType = documentType;
    user.kycDocumentNumber = documentNumber;
    user.kycFrontIdUrl = frontResult.secure_url;
    if (backUrl) user.kycBackIdUrl = backUrl;
    user.kycSelfieUrl = selfieResult.secure_url;

    user.kycFullName = fullName;
    user.kycDateOfBirth = dateOfBirth;
    user.kycNationality = nationality;
    user.kycGender = gender || undefined;

    user.kycAddress = { street, city, state, zip, country };

    user.kycEmploymentStatus = employmentStatus;
    user.kycOccupation = occupation;
    user.kycEmployerName = employerName;
    user.kycAnnualIncome = annualIncome ? parseFloat(annualIncome) : undefined;
    user.kycSourceOfFunds = sourceOfFunds;

    user.kycStatus = "pending";
    user.kycSubmittedAt = new Date();
    user.kycNote = "";
    await user.save();

    await notifyGeneral(user, {
      title: "Identity verification submitted",
      message:
        "Your KYC information has been submitted and is awaiting review by our team.",
      type: "account",
    });

    return res
      .status(201)
      .json({ message: "KYC submitted for review", kycStatus: user.kycStatus });
  } catch (error) {
    console.error("KYC upload error:", error);
    return res
      .status(500)
      .json({ message: "Could not submit KYC information" });
  }
};

// @route POST /api/users/avatar
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Please choose an image to upload" });
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "swissmeridianbank/avatars",
      publicId: `${req.user._id}-avatar-${Date.now()}`,
      isPdf: false,
    });

    const user = await User.findById(req.user._id);
    user.avatarUrl = result.secure_url;
    await user.save();

    return res.json({
      message: "Profile photo updated",
      avatarUrl: user.avatarUrl,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return res.status(500).json({ message: "Could not upload profile photo" });
  }
};

// @route GET /api/users/limits
export const getAccountLimits = async (req, res) => {
  try {
    if (!req.account) {
      return res
        .status(404)
        .json({ message: "No account found for this user" });
    }
    // NOTE: usage is currently calculated only against transactions this
    // specific person initiated (req.user._id), not the shared account as a
    // whole. Once Transaction records the Account directly, this should sum
    // usage across BOTH holders on a joint account.
    const usage = await getLimitUsage(req.account._id);
    return res.json({ limits: req.account.limits, usage });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch account limits" });
  }
};

// @route GET /api/users/spending-trends
export const getSpendingTrends = async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const raw = await Transaction.aggregate([
      {
        $match: {
          sender: req.user._id,
          type: { $in: DEBIT_TYPES },
          status: "completed",
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            category: "$category",
          },
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Determine top 4 categories by total spend across the period; everything else -> "Other"
    const categoryTotals = {};
    raw.forEach((r) => {
      categoryTotals[r._id.category] =
        (categoryTotals[r._id.category] || 0) + r.total;
    });
    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([cat]) => cat);

    // Build the last 6 months, in order, each with a $0 baseline for every top category + "Other"
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth() + 1}`,
        label: d.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        year: d.getFullYear(),
        month: d.getMonth() + 1,
      });
    }

    const result = months.map(({ key, label, year, month }) => {
      const row = { month: label };
      let otherTotal = 0;
      topCategories.forEach((cat) => {
        row[cat] = 0;
      });

      raw
        .filter((r) => r._id.year === year && r._id.month === month)
        .forEach((r) => {
          if (topCategories.includes(r._id.category)) {
            row[r._id.category] = r.total;
          } else {
            otherTotal += r.total;
          }
        });

      row.Other = otherTotal;
      return row;
    });

    return res.json({
      trends: result,
      categories: [...topCategories, "Other"],
    });
  } catch (error) {
    console.error("Spending trends error:", error);
    return res.status(500).json({ message: "Could not fetch spending trends" });
  }
};

// @route GET /api/users/statement?month=7&year=2026
export const downloadStatement = async (req, res) => {
  try {
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);
    if (!month || !year || month < 1 || month > 12) {
      return res
        .status(400)
        .json({ message: "Valid month (1-12) and year are required" });
    }

    const user = req.user;
    const account = req.account;
    if (!account) {
      return res
        .status(404)
        .json({ message: "No account found for this user" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const filter = {
      $or: [{ sender: user._id }, { receiver: user._id }],
      status: "completed",
      createdAt: { $gte: startDate, $lt: endDate },
    };

    const transactions = await Transaction.find(filter).sort({ createdAt: 1 });

    // Reconstruct the balance as it stood at the END of this period by
    // undoing every transaction that happened AFTER the period.
    // NOTE: same limitation as above — only counts this person's own
    // transactions, not the joint holder's, until Transaction references
    // the Account directly.
    const laterTx = await Transaction.find({
      $or: [{ sender: user._id }, { receiver: user._id }],
      status: "completed",
      createdAt: { $gte: endDate },
    });

    let closingBalance = account.balance;
    laterTx.forEach((tx) => {
      const isCreditToUser =
        tx.receiver?.toString() === user._id.toString() ||
        tx.type === "adjustment_credit" ||
        tx.type === "loan_disbursement";
      closingBalance += isCreditToUser ? -tx.amount : tx.amount;
    });

    // Now reconstruct the balance at the START of the period by additionally
    // undoing every transaction that happened DURING the period itself.
    let openingBalance = closingBalance;
    transactions.forEach((tx) => {
      const isCreditToUser =
        tx.receiver?.toString() === user._id.toString() ||
        tx.type === "adjustment_credit" ||
        tx.type === "loan_disbursement";
      openingBalance += isCreditToUser ? -tx.amount : tx.amount;
    });

    const periodLabel = startDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    const filename = `swissmeridianbank-Statement-${year}-${String(month).padStart(2, "0")}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    generateStatementPdf({
      res,
      user,
      account,
      transactions,
      periodLabel,
      openingBalance,
      closingBalance,
    });
  } catch (error) {
    console.error("Statement generation error:", error);
    return res.status(500).json({ message: "Could not generate statement" });
  }
};
