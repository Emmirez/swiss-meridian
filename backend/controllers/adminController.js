import User from "../models/User.js";
import Account from "../models/Account.js";
import AccountHolder from "../models/AccountHolder.js";
import Transaction from "../models/Transaction.js";
import AuditLog from "../models/AuditLog.js";
import { generateReference } from "../utils/generateIds.js";
import { notifyGeneral, notifyTransaction } from "../utils/notify.js";
import { sendEmail, approvalEmailTemplate } from "../utils/sendEmail.js";

// Helper: find the Account a given User belongs to (as primary or joint holder)
const getAccountForUser = async (userId) => {
  const holderRecord = await AccountHolder.findOne({ user: userId });
  return holderRecord ? await Account.findById(holderRecord.account) : null;
};

// @route GET /api/admin/stats
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const pendingApprovals = await User.countDocuments({
      role: "user",
      status: "pending",
    });
    const activeUsers = await User.countDocuments({
      role: "user",
      status: "active",
    });
    const suspendedUsers = await User.countDocuments({
      role: "user",
      status: { $in: ["suspended", "frozen"] },
    });

    const totalTransactions = await Transaction.countDocuments();
    const totalVolumeAgg = await Transaction.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: "$currency", total: { $sum: "$amount" } } },
    ]);

    return res.json({
      totalUsers,
      pendingApprovals,
      activeUsers,
      suspendedUsers,
      totalTransactions,
      totalVolumeByCurrency: totalVolumeAgg,
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not load admin stats" });
  }
};

// @route GET /api/admin/users?status=pending&search=john&page=1
export const getAllUsers = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = { role: "user" };
    if (status) filter.status = status;
    if (search) {
      const matchingAccounts = await Account.find({
        accountNumber: { $regex: search, $options: "i" },
      });
      const matchingUserIds = matchingAccounts.length
        ? (
            await AccountHolder.find({
              account: { $in: matchingAccounts.map((a) => a._id) },
            })
          ).map((h) => h.user)
        : [];

      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { _id: { $in: matchingUserIds } },
      ];
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    const usersWithAccountInfo = await Promise.all(
      users.map(async (user) => {
        const holderRecord = await AccountHolder.findOne({
          user: user._id,
        }).populate("account");
        return {
          ...user.toObject(),
          accountNumber: holderRecord?.account?.accountNumber,
          accountType: holderRecord?.account?.accountType,
          currency: holderRecord?.account?.currency,
          isJoint: holderRecord?.account?.isJoint,
          accountRole: holderRecord?.role,
        };
      }),
    );

    return res.json({
      users: usersWithAccountInfo,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch users" });
  }
};

// @route GET /api/admin/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("+ssnLast4");
    if (!user) return res.status(404).json({ message: "User not found" });

    const holderRecord = await AccountHolder.findOne({
      user: user._id,
    }).populate("account");
    const account = holderRecord?.account;

    // Show every holder on this account (for joint accounts, both people)
    const coHolders = account
      ? await AccountHolder.find({ account: account._id }).populate(
          "user",
          "firstName lastName email",
        )
      : [];

    const transactions = account
      ? await Transaction.find({
          $or: [
            { sender: user._id },
            { receiver: user._id },
            { senderAccount: account._id },
            { receiverAccount: account._id },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(20)
      : [];

    return res.json({
      user: {
        ...user.toObject(),
        accountNumber: account?.accountNumber,
        routingNumber: account?.routingNumber,
        accountType: account?.accountType,
        currency: account?.currency,
        balance: account?.balance,
        isJoint: account?.isJoint,
        accountRole: holderRecord?.role,
        accountStatus: account?.status,
      },
      account,
      coHolders: coHolders.map((h) => ({ user: h.user, role: h.role })),
      transactions,
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch user" });
  }
};

// @route PUT /api/admin/users/:id/approve
export const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = "active";
    await user.save();

    // Also activate the linked Account — a person being approved should
    // activate the account they're on (for a joint account, approving
    // EITHER holder activates the shared account for both).
    const account = await getAccountForUser(user._id);
    if (account && account.status === "pending") {
      account.status = "active";
      await account.save();
    }

    await AuditLog.create({
      admin: req.user._id,
      action: "approve_user",
      targetUser: user._id,
      details: `Approved account application for ${user.email}`,
    });

    await notifyGeneral(user, {
      title: "Account approved",
      message:
        "Your Swiss Meridian Bank account has been approved. You can now log in and start banking.",
      type: "account",
    });

    await sendEmail({
      to: user.email,
      toName: user.firstName,
      subject: "Your Swiss Meridian Bank account is approved",
      html: approvalEmailTemplate(user.firstName, "active"),
    });

    return res.json({ message: "User approved", user, account });
  } catch (error) {
    return res.status(500).json({ message: "Could not approve user" });
  }
};

// @route PUT /api/admin/users/:id/reject
export const rejectUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = "rejected";
    user.kycNote = reason || "";
    await user.save();

    await AuditLog.create({
      admin: req.user._id,
      action: "reject_user",
      targetUser: user._id,
      details: reason || "No reason provided",
    });

    await sendEmail({
      to: user.email,
      toName: user.firstName,
      subject: "Update on your Swiss Meridian Bank application",
      html: approvalEmailTemplate(user.firstName, "rejected"),
    });

    return res.json({ message: "User rejected", user });
  } catch (error) {
    return res.status(500).json({ message: "Could not reject user" });
  }
};

// @route PUT /api/admin/users/:id/status  body: { status: "suspended" | "frozen" | "active" }
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["active", "suspended", "frozen"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = status;
    await user.save();

    await AuditLog.create({
      admin: req.user._id,
      action: `set_status_${status}`,
      targetUser: user._id,
      details: `Status changed to ${status}`,
    });

    await notifyGeneral(user, {
      title: "Account status updated",
      message: `Your account status has been changed to "${status}". Contact support if you have questions.`,
      type: "account",
      email: true,
    });

    return res.json({ message: `User status updated to ${status}`, user });
  } catch (error) {
    return res.status(500).json({ message: "Could not update status" });
  }
};

// @route POST /api/admin/users/:id/adjust  body: { type: "credit"|"debit", amount, note }
export const adjustBalance = async (req, res) => {
  try {
    const { type, amount, note } = req.body;
    if (!["credit", "debit"].includes(type) || !amount || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Valid type and amount are required" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const account = await getAccountForUser(user._id);
    if (!account)
      return res
        .status(404)
        .json({ message: "No account found for this user" });

    if (type === "debit" && account.balance < amount) {
      return res
        .status(400)
        .json({ message: "Insufficient balance for debit adjustment" });
    }

    account.balance =
      type === "credit" ? account.balance + amount : account.balance - amount;
    await account.save();

    const reference = generateReference();
    await Transaction.create({
      reference,
      type: type === "credit" ? "adjustment_credit" : "adjustment_debit",
      receiver: type === "credit" ? user._id : undefined,
      sender: type === "debit" ? user._id : undefined,
      receiverAccount: type === "credit" ? account._id : undefined,
      senderAccount: type === "debit" ? account._id : undefined,
      amount,
      currency: account.currency,
      balanceAfterReceiver: type === "credit" ? account.balance : undefined,
      balanceAfterSender: type === "debit" ? account.balance : undefined,
      description: note || `Admin ${type} adjustment`,
      category: "Admin Adjustment",
      status: "completed",
      performedByAdmin: req.user._id,
    });

    await AuditLog.create({
      admin: req.user._id,
      action: `balance_${type}`,
      targetUser: user._id,
      details: `${type} of ${account.currency} ${amount} — ${note || "no note"}`,
    });

    // Notify every holder on this account, not just the one admin looked up
    const allHolders = await AccountHolder.find({
      account: account._id,
    }).populate("user");
    for (const holder of allHolders) {
      await notifyTransaction(holder.user, {
        action: type === "credit" ? "credited" : "debited",
        amount,
        currency: account.currency,
        balance: account.balance,
        reference,
        date: new Date().toLocaleString("en-US"),
        category: "Admin Adjustment",
      });
    }

    return res.json({ message: "Balance adjusted", user, account });
  } catch (error) {
    console.error("Adjust balance error:", error);
    return res.status(500).json({ message: "Could not adjust balance" });
  }
};

const formatAddress = (a) =>
  a
    ? [a.street, a.city, [a.state, a.zip].filter(Boolean).join(" "), a.country]
        .filter(Boolean)
        .join(", ")
    : "none";

// @route PUT /api/admin/users/:id/address
// body: { street, city, state?, zip?, country }
// Address belongs to the PERSON (User), so on a joint account each holder
// keeps their own address.
export const updateUserAddress = async (req, res) => {
  try {
    const { street, city, state, zip, country } = req.body;

    if (!street?.trim() || !city?.trim() || !country) {
      return res
        .status(400)
        .json({ message: "Street, city and country are required" });
    }
    if (
      ["United States", "Canada"].includes(country) &&
      (!state?.trim() || !zip?.trim())
    ) {
      return res.status(400).json({
        message:
          country === "Canada"
            ? "Province and postal code are required"
            : "State and ZIP code are required",
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const oldAddress = formatAddress(user.address);

    user.address = {
      street: street.trim(),
      city: city.trim(),
      state: state?.trim() || undefined,
      zip: zip?.trim() || undefined,
      country,
    };
    await user.save();

    await AuditLog.create({
      admin: req.user._id,
      action: "update_address",
      targetUser: user._id,
      details: `Address changed from "${oldAddress}" to "${formatAddress(user.address)}"`,
    });

    await notifyGeneral(user, {
      title: "Address updated",
      message:
        "The address on your account was updated by our team. If you didn't request this change, contact support immediately.",
      type: "account",
      email: true,
    });

    return res.json({ message: "Address updated", user });
  } catch (error) {
    console.error("Update address error:", error);
    return res.status(500).json({ message: "Could not update address" });
  }
};

// @route PUT /api/admin/users/:id/limits
export const updateUserLimits = async (req, res) => {
  try {
    const { dailyLimit, weeklyLimit, monthlyLimit, perTransactionLimit } =
      req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const account = await getAccountForUser(user._id);
    if (!account)
      return res
        .status(404)
        .json({ message: "No account found for this user" });

    if (dailyLimit !== undefined) account.limits.dailyLimit = dailyLimit;
    if (weeklyLimit !== undefined) account.limits.weeklyLimit = weeklyLimit;
    if (monthlyLimit !== undefined) account.limits.monthlyLimit = monthlyLimit;
    if (perTransactionLimit !== undefined)
      account.limits.perTransactionLimit = perTransactionLimit;
    await account.save();

    await AuditLog.create({
      admin: req.user._id,
      action: "update_limits",
      targetUser: user._id,
      details: `Updated account limits: daily ${account.limits.dailyLimit}, weekly ${account.limits.weeklyLimit}, monthly ${account.limits.monthlyLimit}, per-transaction ${account.limits.perTransactionLimit}`,
    });

    // Notify every holder on the account, since limits are shared
    const allHolders = await AccountHolder.find({
      account: account._id,
    }).populate("user");
    for (const holder of allHolders) {
      await notifyGeneral(holder.user, {
        title: "Account limits updated",
        message: "Your account transfer limits have been updated by our team.",
        type: "account",
      });
    }

    return res.json({ message: "Limits updated", account });
  } catch (error) {
    return res.status(500).json({ message: "Could not update limits" });
  }
};

// Resolves the Account id for one side of a transaction. Uses the stored
// account if present; falls back to the person's account for older
// transactions that were saved before senderAccount/receiverAccount existed.
const resolveAccountId = async (accountId, userId) => {
  if (accountId) return accountId.toString();
  if (!userId) return null;
  const account = await getAccountForUser(userId);
  return account ? account._id.toString() : null;
};

// How much a transaction affects each ACCOUNT's balance, keyed by account id.
// Only "completed" transactions have any real balance effect.
const getAccountEffects = ({
  senderAccount,
  receiverAccount,
  amount,
  status,
}) => {
  const effects = {};
  if (status !== "completed") return effects;
  if (senderAccount) {
    effects[senderAccount] = (effects[senderAccount] || 0) - amount;
  }
  if (receiverAccount) {
    effects[receiverAccount] = (effects[receiverAccount] || 0) + amount;
  }
  return effects;
};

// Types that have a natural opposite when switching debit <-> credit
const OPPOSITE_TYPE = {
  adjustment_credit: "adjustment_debit",
  adjustment_debit: "adjustment_credit",
  deposit: "withdrawal",
  withdrawal: "deposit",
};

// Loads every affected Account and checks no balance would go negative.
// Returns { accounts } on success or { error } if blocked. Does NOT save.
const prepareAccountChanges = async (oldEffects, newEffects) => {
  const accountIds = [
    ...new Set([...Object.keys(oldEffects), ...Object.keys(newEffects)]),
  ];
  const accounts = [];
  for (const aid of accountIds) {
    const account = await Account.findById(aid);
    if (!account) continue;
    const delta = (newEffects[aid] || 0) - (oldEffects[aid] || 0);
    const projected = account.balance + delta;
    if (delta < 0 && projected < 0) {
      return {
        error: `This change would make account ${account.accountNumber}'s balance negative (${account.currency} ${projected.toFixed(2)}).`,
      };
    }
    accounts.push({ account, delta });
  }
  return { accounts };
};

// @route PUT /api/admin/transactions/:id
// body: { amount?, status?, description?, category?, createdAt?, flipDirection? }
export const updateTransaction = async (req, res) => {
  try {
    const { amount, status, description, category, createdAt, flipDirection } =
      req.body;

    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ message: "Transaction not found" });

    if (createdAt && isNaN(new Date(createdAt).getTime())) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const validStatuses = ["pending", "completed", "failed", "reversed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    if (amount !== undefined && amount <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be greater than zero" });
    }
    if (flipDirection && tx.type === "loan_disbursement") {
      return res.status(400).json({
        message: "Loan disbursements can't be switched to a debit.",
      });
    }

    const oldSenderAccount = await resolveAccountId(tx.senderAccount, tx.sender);
    const oldReceiverAccount = await resolveAccountId(
      tx.receiverAccount,
      tx.receiver,
    );

    const newAmount = amount !== undefined ? amount : tx.amount;
    const newStatus = status || tx.status;
    const newSenderAccount = flipDirection ? oldReceiverAccount : oldSenderAccount;
    const newReceiverAccount = flipDirection
      ? oldSenderAccount
      : oldReceiverAccount;

    const oldEffects = getAccountEffects({
      senderAccount: oldSenderAccount,
      receiverAccount: oldReceiverAccount,
      amount: tx.amount,
      status: tx.status,
    });
    const newEffects = getAccountEffects({
      senderAccount: newSenderAccount,
      receiverAccount: newReceiverAccount,
      amount: newAmount,
      status: newStatus,
    });

    // Check everything first, then apply — so nothing is half-saved
    const { accounts, error } = await prepareAccountChanges(
      oldEffects,
      newEffects,
    );
    if (error) return res.status(400).json({ message: error });

    for (const { account, delta } of accounts) {
      if (delta !== 0) {
        account.balance += delta;
        await account.save();
      }
    }

    const balanceOf = (aid) =>
      aid
        ? accounts.find((a) => a.account._id.toString() === aid)?.account
            .balance
        : undefined;

    if (flipDirection) {
      const oldSender = tx.sender;
      tx.sender = tx.receiver;
      tx.receiver = oldSender;
      if (OPPOSITE_TYPE[tx.type]) tx.type = OPPOSITE_TYPE[tx.type];
    }
    // Store resolved accounts (also backfills older transactions)
    tx.senderAccount = newSenderAccount || undefined;
    tx.receiverAccount = newReceiverAccount || undefined;

    tx.amount = newAmount;
    tx.status = newStatus;
    if (description !== undefined) tx.description = description;
    if (category !== undefined) tx.category = category;
    tx.balanceAfterSender = newSenderAccount
      ? balanceOf(newSenderAccount)
      : undefined;
    tx.balanceAfterReceiver = newReceiverAccount
      ? balanceOf(newReceiverAccount)
      : undefined;
    await tx.save();

    await AuditLog.create({
      admin: req.user._id,
      action: flipDirection ? "flip_transaction" : "edit_transaction",
      targetUser: tx.sender || tx.receiver,
      details: `Edited transaction ${tx.reference}${flipDirection ? " (switched debit/credit)" : ""} — ${tx.currency} ${tx.amount}, ${tx.status}`,
    });

    // Bypass Mongoose's schema/timestamps layer entirely — go straight to
    // the native MongoDB driver collection, which has no knowledge of
    // { timestamps: true } and cannot silently override this field.
    let finalTx = tx;
    if (createdAt) {
      await Transaction.collection.updateOne(
        { _id: tx._id },
        { $set: { createdAt: new Date(createdAt) } },
      );
      finalTx = await Transaction.findById(tx._id);
    }

    return res.json({ message: "Transaction updated", transaction: finalTx });
  } catch (error) {
    console.error("Update transaction error:", error);
    return res.status(500).json({ message: "Could not update transaction" });
  }
};

// @route DELETE /api/admin/transactions/:id
// Reverses the transaction's effect on every affected account, then deletes it
export const deleteTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ message: "Transaction not found" });

    const oldEffects = getAccountEffects({
      senderAccount: await resolveAccountId(tx.senderAccount, tx.sender),
      receiverAccount: await resolveAccountId(tx.receiverAccount, tx.receiver),
      amount: tx.amount,
      status: tx.status,
    });

    const { accounts, error } = await prepareAccountChanges(oldEffects, {});
    if (error) return res.status(400).json({ message: error });

    for (const { account, delta } of accounts) {
      if (delta !== 0) {
        account.balance += delta;
        await account.save();
      }
    }

    await tx.deleteOne();

    await AuditLog.create({
      admin: req.user._id,
      action: "delete_transaction",
      targetUser: tx.sender || tx.receiver,
      details: `Deleted transaction ${tx.reference} (${tx.currency} ${tx.amount}, ${tx.status})${tx.status === "completed" ? " — balance reversed" : ""}`,
    });

    return res.json({
      message:
        tx.status === "completed"
          ? "Transaction deleted and balance reversed"
          : "Transaction deleted",
    });
  } catch (error) {
    console.error("Delete transaction error:", error);
    return res.status(500).json({ message: "Could not delete transaction" });
  }
};

// @route GET /api/admin/transactions
export const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 25, type, status } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("sender", "firstName lastName")
      .populate("receiver", "firstName lastName")
      .populate("senderAccount", "accountNumber")
      .populate("receiverAccount", "accountNumber");

    const total = await Transaction.countDocuments(filter);

    return res.json({
      transactions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch transactions" });
  }
};

// @route GET /api/admin/kyc?status=pending
export const getKycSubmissions = async (req, res) => {
  try {
    const { status = "pending" } = req.query;
    const users = await User.find({ kycStatus: status })
      .select(
        "firstName lastName email accountNumber kycStatus kycDocumentType kycDocumentNumber " +
          "kycFrontIdUrl kycBackIdUrl kycSelfieUrl kycFullName kycDateOfBirth kycNationality kycGender " +
          "kycAddress kycEmploymentStatus kycOccupation kycEmployerName kycAnnualIncome kycSourceOfFunds kycSubmittedAt",
      )
      .sort({ kycSubmittedAt: -1 });
    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch KYC submissions" });
  }
};

// @route PUT /api/admin/kyc/:id/approve
export const approveKyc = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.kycStatus = "approved";
    user.kycReviewedAt = new Date();
    user.kycNote = "";
    await user.save();

    await AuditLog.create({
      admin: req.user._id,
      action: "approve_kyc",
      targetUser: user._id,
      details: `Approved KYC document (${user.idDocumentType})`,
    });

    await notifyGeneral(user, {
      title: "Identity verified",
      message: "Your identity document has been reviewed and approved.",
      type: "account",
      email: true,
    });

    return res.json({ message: "KYC approved", user });
  } catch (error) {
    return res.status(500).json({ message: "Could not approve KYC" });
  }
};

// @route PUT /api/admin/kyc/:id/reject
export const rejectKyc = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.kycStatus = "rejected";
    user.kycReviewedAt = new Date();
    user.kycNote = reason || "Document did not meet verification requirements";
    await user.save();

    await AuditLog.create({
      admin: req.user._id,
      action: "reject_kyc",
      targetUser: user._id,
      details: reason || "No reason provided",
    });

    await notifyGeneral(user, {
      title: "Identity document rejected",
      message: `We couldn't verify your identity document. Reason: ${user.kycNote}. Please resubmit from your Profile page.`,
      type: "account",
      email: true,
    });

    return res.json({ message: "KYC rejected", user });
  } catch (error) {
    return res.status(500).json({ message: "Could not reject KYC" });
  }
};

// @route GET /api/admin/audit-logs
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("admin", "firstName lastName email")
      .populate("targetUser", "firstName lastName email");
    return res.json({ logs });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch audit logs" });
  }
};
