import Loan, { LOAN_RATES } from "../models/Loan.js";
import User from "../models/User.js";
import Account from "../models/Account.js";
import AccountHolder from "../models/AccountHolder.js";
import Transaction from "../models/Transaction.js";
import AuditLog from "../models/AuditLog.js";
import { generateReference } from "../utils/generateIds.js";
import { notifyTransaction, notifyGeneral } from "../utils/notify.js";

// ---- USER ----

// @route GET /api/loans/rates
export const getLoanRates = async (req, res) => {
  return res.json({ rates: LOAN_RATES });
};

// @route POST /api/loans/apply
export const applyForLoan = async (req, res) => {
  try {
    const { type, principal, termMonths, purpose } = req.body;

    if (!["personal", "auto", "business", "student", "home"].includes(type)) {
      return res.status(400).json({ message: "Please select a valid loan type" });
    }
    if (!principal || principal <= 0) {
      return res.status(400).json({ message: "Please enter a valid loan amount" });
    }
    if (!termMonths || termMonths < 3 || termMonths > 84) {
      return res.status(400).json({ message: "Term must be between 3 and 84 months" });
    }
    if (!purpose) {
      return res.status(400).json({ message: "Please describe the purpose of this loan" });
    }

    const existingActive = await Loan.findOne({ user: req.user._id, status: { $in: ["pending", "approved_active"] } });
    if (existingActive) {
      return res.status(400).json({ message: `You already have a loan that is ${existingActive.status === "pending" ? "pending review" : "active"}. Pay it off before applying for another.` });
    }

    const loan = await Loan.create({
      user: req.user._id,
      type,
      purpose,
      principal,
      termMonths,
      interestRate: LOAN_RATES[type],
      status: "pending",
    });

      await notifyGeneral(req.user, {
      title: "Loan application submitted",
      message: `Your ${type} loan application for ${req.account?.currency || "your account currency"} ${principal.toLocaleString()} has been submitted for review.`,
      type: "account",
    });

    return res.status(201).json({ message: "Loan application submitted", loan });
  } catch (error) {
    console.error("Loan application error:", error);
    return res.status(500).json({ message: "Could not submit loan application" });
  }
};

// @route GET /api/loans/mine
export const getMyLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ loans });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch loans" });
  }
};

// ---- ADMIN ----

// @route GET /api/admin/loans?status=pending
export const getLoanApplications = async (req, res) => {
  try {
    const { status = "pending" } = req.query;
    const loans = await Loan.find({ status })
      .populate("user", "firstName lastName email kycEmploymentStatus kycOccupation kycAnnualIncome kycSourceOfFunds kycStatus")
      .sort({ appliedAt: -1 });

    // Attach each applicant's Account info (accountNumber, currency) since
    // those now live on Account, not User.
    const loansWithAccountInfo = await Promise.all(
      loans.map(async (loan) => {
        const holderRecord = await AccountHolder.findOne({ user: loan.user._id }).populate("account");
        return {
          ...loan.toObject(),
          user: {
            ...loan.user.toObject(),
            accountNumber: holderRecord?.account?.accountNumber,
            currency: holderRecord?.account?.currency,
          },
        };
      })
    );

    return res.json({ loans: loansWithAccountInfo });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch loan applications" });
  }
};

// @route PUT /api/admin/loans/:id/approve
export const approveLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate("user");
    if (!loan) return res.status(404).json({ message: "Loan application not found" });
    if (loan.status !== "pending") return res.status(400).json({ message: "This application has already been reviewed" });

    const holderRecord = await AccountHolder.findOne({ user: loan.user._id });
    const account = holderRecord ? await Account.findById(holderRecord.account) : null;
    if (!account) {
      return res.status(404).json({ message: "No account found for this applicant" });
    }

    const monthlyPayment = Math.round(loan.calculateMonthlyPayment() * 100) / 100;
    const totalRepayable = Math.round(monthlyPayment * loan.termMonths * 100) / 100;

    loan.monthlyPayment = monthlyPayment;
    loan.totalRepayable = totalRepayable;
    loan.remainingBalance = totalRepayable;
    loan.status = "approved_active";
    loan.reviewedAt = new Date();
    loan.disbursedAt = new Date();
    const nextPayment = new Date();
    nextPayment.setMonth(nextPayment.getMonth() + 1);
    loan.nextPaymentDate = nextPayment;
    await loan.save();

    account.balance += loan.principal;
    await account.save();

    const reference = generateReference();
    await Transaction.create({
      reference,
      type: "loan_disbursement",
      receiver: loan.user._id,
      receiverAccount: account._id,
      amount: loan.principal,
      currency: account.currency,
      balanceAfterReceiver: account.balance,
      description: `${loan.type.charAt(0).toUpperCase() + loan.type.slice(1)} loan disbursement`,
      category: "Loan",
      status: "completed",
    });

    await AuditLog.create({
      admin: req.user._id,
      action: "approve_loan",
      targetUser: loan.user._id,
      details: `Approved ${loan.type} loan of ${account.currency} ${loan.principal} at ${loan.interestRate}% over ${loan.termMonths} months`,
    });

    await notifyTransaction(loan.user, {
      action: "credited",
      amount: loan.principal,
      currency: account.currency,
      balance: account.balance,
      reference,
      date: new Date().toLocaleString("en-US"),
    });

    await notifyGeneral(loan.user, {
      title: "Loan approved",
      message: `Your ${loan.type} loan was approved. Monthly payment: ${account.currency} ${monthlyPayment.toFixed(2)}, first payment due ${nextPayment.toLocaleDateString("en-US")}.`,
      type: "account",
      email: true,
    });

    return res.json({ message: "Loan approved and disbursed", loan });
  } catch (error) {
    console.error("Approve loan error:", error);
    return res.status(500).json({ message: "Could not approve loan" });
  }
};

// @route PUT /api/admin/loans/:id/reject
export const rejectLoan = async (req, res) => {
  try {
    const { reason } = req.body;
    const loan = await Loan.findById(req.params.id).populate("user");
    if (!loan) return res.status(404).json({ message: "Loan application not found" });
    if (loan.status !== "pending") return res.status(400).json({ message: "This application has already been reviewed" });

    loan.status = "rejected";
    loan.reviewedAt = new Date();
    loan.rejectionReason = reason || "";
    await loan.save();

    await AuditLog.create({
      admin: req.user._id,
      action: "reject_loan",
      targetUser: loan.user._id,
      details: reason || "No reason provided",
    });

    await notifyGeneral(loan.user, {
      title: "Loan application declined",
      message: `Your ${loan.type} loan application was declined${reason ? `: ${reason}` : "."}`,
      type: "account",
      email: true,
    });

    return res.json({ message: "Loan application rejected", loan });
  } catch (error) {
    return res.status(500).json({ message: "Could not reject loan application" });
  }
};