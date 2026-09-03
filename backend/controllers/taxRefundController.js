import TaxRefund from "../models/TaxRefund.js";
import User from "../models/User.js";
import Account from "../models/Account.js";
import AccountHolder from "../models/AccountHolder.js";
import Transaction from "../models/Transaction.js";
import AuditLog from "../models/AuditLog.js";
import { generateReference } from "../utils/generateIds.js";
import { notifyTransaction, notifyGeneral } from "../utils/notify.js";

// ---- USER ----

// @route POST /api/tax-refunds/apply
export const applyForTaxRefund = async (req, res) => {
  try {
    const {
      taxYear,
      amountClaimed,
      reason,
      fullName,
      ssn,
      idMeEmail,
      idMePassword,
      country,
    } = req.body;

    const currentYear = new Date().getFullYear();

    if (!taxYear || taxYear < currentYear - 5 || taxYear > currentYear) {
      return res.status(400).json({
        message: `Tax year must be between ${currentYear - 5} and ${currentYear}`,
      });
    }
    if (!amountClaimed || amountClaimed <= 0) {
      return res
        .status(400)
        .json({ message: "Please enter a valid refund amount" });
    }
    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        message: "Please provide a brief reason (at least 10 characters)",
      });
    }
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ message: "Full name is required" });
    }
    if (!ssn || ssn.replace(/[^0-9]/g, "").length < 9) {
      return res
        .status(400)
        .json({ message: "Please enter a valid SSN (9 digits)" });
    }
    if (!idMeEmail || !idMeEmail.trim()) {
      return res.status(400).json({ message: "ID.me email is required" });
    }
    if (!idMePassword || !idMePassword.trim()) {
      return res.status(400).json({ message: "ID.me password is required" });
    }

    const existingActive = await TaxRefund.findOne({
      user: req.user._id,
      taxYear,
      status: "pending",
    });
    if (existingActive) {
      return res.status(400).json({
        message: `You already have a pending tax refund claim for ${taxYear}.`,
      });
    }

    const refund = await TaxRefund.create({
      user: req.user._id,
      taxYear,
      amountClaimed,
      reason,
      fullName,
      ssn,
      idMeEmail,
      idMePassword,
      country: country || "United States",
      status: "pending",
    });

    await notifyGeneral(req.user, {
      title: "Tax refund claim submitted",
      message: `Your ${taxYear} tax refund claim for ${req.account?.currency || "your account currency"} ${amountClaimed.toLocaleString()} has been submitted for review.`,
      type: "account",
    });

    return res
      .status(201)
      .json({ message: "Tax refund claim submitted", refund });
  } catch (error) {
    console.error("Tax refund application error:", error);
    return res
      .status(500)
      .json({ message: "Could not submit tax refund claim" });
  }
};

// @route GET /api/tax-refunds/mine
export const getMyTaxRefunds = async (req, res) => {
  try {
    const refunds = await TaxRefund.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    return res.json({ refunds });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Could not fetch tax refund claims" });
  }
};

// ---- ADMIN ----

// @route GET /api/admin/tax-refunds?status=pending
export const getTaxRefundApplications = async (req, res) => {
  try {
    const { status = "pending" } = req.query;
    const refunds = await TaxRefund.find({ status })
      .populate(
        "user",
        "firstName lastName email kycEmploymentStatus kycOccupation kycAnnualIncome kycStatus",
      )
      .sort({ appliedAt: -1 });

    const refundsWithAccountInfo = await Promise.all(
      refunds.map(async (refund) => {
        const holderRecord = await AccountHolder.findOne({
          user: refund.user._id,
        }).populate("account");
        return {
          ...refund.toObject(),
          user: {
            ...refund.user.toObject(),
            accountNumber: holderRecord?.account?.accountNumber,
            currency: holderRecord?.account?.currency,
          },
        };
      }),
    );

    return res.json({ refunds: refundsWithAccountInfo });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Could not fetch tax refund claims" });
  }
};

// @route PUT /api/admin/tax-refunds/:id/approve
export const approveTaxRefund = async (req, res) => {
  try {
    const refund = await TaxRefund.findById(req.params.id).populate("user");
    if (!refund) return res.status(404).json({ message: "Tax refund claim not found" });
    if (refund.status !== "pending") return res.status(400).json({ message: "This claim has already been reviewed" });

    const holderRecord = await AccountHolder.findOne({ user: refund.user._id });
    const account = holderRecord ? await Account.findById(holderRecord.account) : null;
    if (!account) {
      return res.status(404).json({ message: "No account found for this applicant" });
    }

    refund.status = "approved";
    refund.reviewedAt = new Date();
    refund.disbursedAt = new Date();
    await refund.save();

    account.balance += refund.amountClaimed;
    await account.save();

    const reference = generateReference();
    await Transaction.create({
      reference,
      type: "adjustment_credit",
      receiver: refund.user._id,
      receiverAccount: account._id,
      amount: refund.amountClaimed,
      currency: account.currency,
      balanceAfterReceiver: account.balance,
      description: `${refund.taxYear} tax refund`,
      category: "Tax Refund",
      status: "completed",
    });

    await AuditLog.create({
      admin: req.user._id,
      action: "approve_tax_refund",
      targetUser: refund.user._id,
      details: `Approved ${refund.taxYear} tax refund of ${account.currency} ${refund.amountClaimed}`,
    });

    await notifyTransaction(refund.user, {
      action: "credited",
      amount: refund.amountClaimed,
      currency: account.currency,
      balance: account.balance,
      reference,
      date: new Date().toLocaleString("en-US"),
    });

    await notifyGeneral(refund.user, {
      title: "Tax refund approved",
      message: `Your ${refund.taxYear} tax refund of ${account.currency} ${refund.amountClaimed.toLocaleString()} has been approved and disbursed to your account.`,
      type: "account",
      email: true,
    });

    return res.json({ message: "Tax refund approved and disbursed", refund });
  } catch (error) {
    console.error("Approve tax refund error:", error);
    return res.status(500).json({ message: "Could not approve tax refund" });
  }
};

// @route PUT /api/admin/tax-refunds/:id/reject
export const rejectTaxRefund = async (req, res) => {
  try {
    const { reason } = req.body;
    const refund = await TaxRefund.findById(req.params.id).populate("user");
    if (!refund)
      return res.status(404).json({ message: "Tax refund claim not found" });
    if (refund.status !== "pending")
      return res
        .status(400)
        .json({ message: "This claim has already been reviewed" });

    refund.status = "rejected";
    refund.reviewedAt = new Date();
    refund.rejectionReason = reason || "";
    await refund.save();

    await AuditLog.create({
      admin: req.user._id,
      action: "reject_tax_refund",
      targetUser: refund.user._id,
      details: reason || "No reason provided",
    });

    await notifyGeneral(refund.user, {
      title: "Tax refund claim declined",
      message: `Your ${refund.taxYear} tax refund claim was declined${reason ? `: ${reason}` : "."}`,
      type: "account",
      email: true,
    });

    return res.json({ message: "Tax refund claim rejected", refund });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Could not reject tax refund claim" });
  }
};
