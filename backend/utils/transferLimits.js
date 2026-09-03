import Transaction from "../models/Transaction.js";

const DEBIT_TYPES = [
  "transfer_internal", "transfer_external", "transfer_international",
  "transfer_zelle", "transfer_paypal",
];

const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const startOfWeek = (d) => { const x = startOfDay(d); x.setDate(x.getDate() - x.getDay()); return x; };
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);

// Usage is tracked per ACCOUNT, not per person — a joint account shares one
// pool of limits regardless of which holder initiates the transfer, matching
// how real joint accounts work.
export const getLimitUsage = async (accountId) => {
  const now = new Date();

  const sumSince = async (since) => {
    const result = await Transaction.aggregate([
      { $match: { senderAccount: accountId, type: { $in: DEBIT_TYPES }, status: "completed", createdAt: { $gte: since } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    return result[0]?.total || 0;
  };

  const [daily, weekly, monthly] = await Promise.all([
    sumSince(startOfDay(now)),
    sumSince(startOfWeek(now)),
    sumSince(startOfMonth(now)),
  ]);

  return { daily, weekly, monthly };
};

/**
 * Checks a proposed transfer amount against the ACCOUNT's per-transaction,
 * daily, weekly, and monthly limits. Returns null if allowed, or a
 * human-readable error message if it would exceed a limit.
 */
export const checkTransferLimits = async (account, amount) => {
  const limits = account.limits || {};
  const perTx = limits.perTransactionLimit ?? 250000;
  const dailyLimit = limits.dailyLimit ?? 500000;
  const weeklyLimit = limits.weeklyLimit ?? 1000000;
  const monthlyLimit = limits.monthlyLimit ?? 5000000;

  if (amount > perTx) {
    return `This transfer exceeds your per-transaction limit of ${perTx.toLocaleString()}.`;
  }

  const usage = await getLimitUsage(account._id);

  if (usage.daily + amount > dailyLimit) {
    return `This transfer would exceed your daily limit. You have ${(dailyLimit - usage.daily).toLocaleString()} remaining today.`;
  }
  if (usage.weekly + amount > weeklyLimit) {
    return `This transfer would exceed your weekly limit. You have ${(weeklyLimit - usage.weekly).toLocaleString()} remaining this week.`;
  }
  if (usage.monthly + amount > monthlyLimit) {
    return `This transfer would exceed your monthly limit. You have ${(monthlyLimit - usage.monthly).toLocaleString()} remaining this month.`;
  }

  return null;
};