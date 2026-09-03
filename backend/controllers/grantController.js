import Grant, { GRANT_CATEGORIES } from "../models/Grant.js";
import User from "../models/User.js";
import Account from "../models/Account.js";
import AccountHolder from "../models/AccountHolder.js";
import Transaction from "../models/Transaction.js";
import AuditLog from "../models/AuditLog.js";
import { generateReference } from "../utils/generateIds.js";
import { notifyTransaction, notifyGeneral } from "../utils/notify.js";

// ---- USER ----

// @route GET /api/grants/categories
export const getGrantCategories = async (req, res) => {
  return res.json({ categories: GRANT_CATEGORIES });
};

// @route POST /api/grants/apply
export const applyForGrant = async (req, res) => {
  try {
    const { category, amountRequested, proposal } = req.body;

    if (!GRANT_CATEGORIES.includes(category)) {
      return res
        .status(400)
        .json({ message: "Please select a valid grant category" });
    }
    if (!amountRequested || amountRequested <= 0) {
      return res.status(400).json({ message: "Please enter a valid amount" });
    }
    if (!proposal || proposal.trim().length < 20) {
      return res.status(400).json({
        message:
          "Please provide a proposal of at least 20 characters explaining your request",
      });
    }

    const existingActive = await Grant.findOne({
      user: req.user._id,
      status: "pending",
    });
    if (existingActive) {
      return res.status(400).json({
        message: "You already have a grant application pending review.",
      });
    }

    const grant = await Grant.create({
      user: req.user._id,
      category,
      amountRequested,
      proposal,
      status: "pending",
    });

    await notifyGeneral(req.user, {
      title: "Grant application submitted",
      message: `Your ${category} grant application for ${req.account?.currency || "your account currency"} ${amountRequested.toLocaleString()} has been submitted for review.`,
      type: "account",
    });

    return res
      .status(201)
      .json({ message: "Grant application submitted", grant });
  } catch (error) {
    console.error("Grant application error:", error);
    return res
      .status(500)
      .json({ message: "Could not submit grant application" });
  }
};

// @route GET /api/grants/mine
export const getMyGrants = async (req, res) => {
  try {
    const grants = await Grant.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    return res.json({ grants });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch grants" });
  }
};

// ---- ADMIN ----

// @route GET /api/admin/grants?status=pending
export const getGrantApplications = async (req, res) => {
  try {
    const { status = "pending" } = req.query;
    const grants = await Grant.find({ status })
      .populate(
        "user",
        "firstName lastName email kycEmploymentStatus kycOccupation kycAnnualIncome kycSourceOfFunds kycStatus",
      )
      .sort({ appliedAt: -1 });

    const grantsWithAccountInfo = await Promise.all(
      grants.map(async (grant) => {
        const holderRecord = await AccountHolder.findOne({
          user: grant.user._id,
        }).populate("account");
        return {
          ...grant.toObject(),
          user: {
            ...grant.user.toObject(),
            accountNumber: holderRecord?.account?.accountNumber,
            currency: holderRecord?.account?.currency,
          },
        };
      }),
    );

    return res.json({ grants: grantsWithAccountInfo });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Could not fetch grant applications" });
  }
};

// @route PUT /api/admin/grants/:id/approve
export const approveGrant = async (req, res) => {
  try {
    const grant = await Grant.findById(req.params.id).populate("user");
    if (!grant)
      return res.status(404).json({ message: "Grant application not found" });
    if (grant.status !== "pending")
      return res
        .status(400)
        .json({ message: "This application has already been reviewed" });

    const holderRecord = await AccountHolder.findOne({ user: grant.user._id });
    const account = holderRecord
      ? await Account.findById(holderRecord.account)
      : null;
    if (!account) {
      return res
        .status(404)
        .json({ message: "No account found for this applicant" });
    }

    grant.status = "approved";
    grant.reviewedAt = new Date();
    grant.disbursedAt = new Date();
    await grant.save();

    account.balance += grant.amountRequested;
    await account.save();

    const reference = generateReference();
    await Transaction.create({
      reference,
      type: "adjustment_credit",
      receiver: grant.user._id,
      receiverAccount: account._id,
      amount: grant.amountRequested,
      currency: account.currency,
      balanceAfterReceiver: account.balance,
      description: `${grant.category} grant disbursement`,
      category: "Grant",
      status: "completed",
    });

    await AuditLog.create({
      admin: req.user._id,
      action: "approve_grant",
      targetUser: grant.user._id,
      details: `Approved ${grant.category} grant of ${account.currency} ${grant.amountRequested}`,
    });

    await notifyTransaction(grant.user, {
      action: "credited",
      amount: grant.amountRequested,
      currency: account.currency,
      balance: account.balance,
      reference,
      date: new Date().toLocaleString("en-US"),
    });

    await notifyGeneral(grant.user, {
      title: "Grant approved",
      message: `Your ${grant.category} grant for ${account.currency} ${grant.amountRequested.toLocaleString()} has been approved and disbursed to your account.`,
      type: "account",
      email: true,
    });

    return res.json({ message: "Grant approved and disbursed", grant });
  } catch (error) {
    console.error("Approve grant error:", error);
    return res.status(500).json({ message: "Could not approve grant" });
  }
};

// @route PUT /api/admin/grants/:id/reject
export const rejectGrant = async (req, res) => {
  try {
    const { reason } = req.body;
    const grant = await Grant.findById(req.params.id).populate("user");
    if (!grant)
      return res.status(404).json({ message: "Grant application not found" });
    if (grant.status !== "pending")
      return res
        .status(400)
        .json({ message: "This application has already been reviewed" });

    grant.status = "rejected";
    grant.reviewedAt = new Date();
    grant.rejectionReason = reason || "";
    await grant.save();

    await AuditLog.create({
      admin: req.user._id,
      action: "reject_grant",
      targetUser: grant.user._id,
      details: reason || "No reason provided",
    });

    await notifyGeneral(grant.user, {
      title: "Grant application declined",
      message: `Your ${grant.category} grant application was declined${reason ? `: ${reason}` : "."}`,
      type: "account",
      email: true,
    });

    return res.json({ message: "Grant application rejected", grant });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Could not reject grant application" });
  }
};
