import User from "../models/User.js";
import Account from "../models/Account.js";
import AccountHolder from "../models/AccountHolder.js";
import MoneyRequest from "../models/MoneyRequest.js";
import Transaction from "../models/Transaction.js";
import { generateReference } from "../utils/generateIds.js";
import { notifyTransaction, notifyGeneral } from "../utils/notify.js";
import { checkTransferLimits } from "../utils/transferLimits.js";
import { convertCurrency } from "../utils/exchangeRates.js";

const CONVERSION_FEE_RATE = 0.01;
const CONVERSION_FEE_MIN = 5;
const CONVERSION_FEE_MAX = 50;

// @route POST /api/requests
// body: { identifier (email/phone of who you're requesting from), amount, note }
export const createMoneyRequest = async (req, res) => {
  try {
    const { identifier, amount, note } = req.body;
    const requesterAccount = req.account;

    if (!requesterAccount) {
      return res
        .status(404)
        .json({ message: "No account found for your login" });
    }
    if (!identifier || !amount) {
      return res
        .status(400)
        .json({ message: "Recipient email/phone and amount are required" });
    }
    if (amount <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be greater than zero" });
    }

    const payer = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
    });
    if (!payer) {
      return res.status(404).json({
        message:
          "No Swiss Meridian Bank account found with that email or phone number",
      });
    }
    if (payer._id.equals(req.user._id)) {
      return res
        .status(400)
        .json({ message: "You cannot request money from yourself" });
    }

    const request = await MoneyRequest.create({
      requester: req.user._id,
      payer: payer._id,
      amount,
      currency: requesterAccount.currency,
      note,
      status: "pending",
    });

    await notifyGeneral(payer, {
      title: "Money request received",
      message: `${req.user.firstName} ${req.user.lastName} is requesting ${requesterAccount.currency} ${amount} from you.`,
      type: "account",
      email: true,
    });

    return res.status(201).json({ message: "Request sent", request });
  } catch (error) {
    console.error("Create money request error:", error);
    return res.status(500).json({ message: "Could not send request" });
  }
};

// @route GET /api/requests/sent
export const getSentRequests = async (req, res) => {
  try {
    const requests = await MoneyRequest.find({ requester: req.user._id })
      .populate("payer", "firstName lastName email")
      .sort({ createdAt: -1 });
    return res.json({ requests });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch requests" });
  }
};

// @route GET /api/requests/received
export const getReceivedRequests = async (req, res) => {
  try {
    const requests = await MoneyRequest.find({ payer: req.user._id })
      .populate("requester", "firstName lastName email")
      .sort({ createdAt: -1 });
    return res.json({ requests });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch requests" });
  }
};

// @route POST /api/requests/:id/approve
// body: { pin }
export const approveMoneyRequest = async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin)
      return res.status(400).json({ message: "Transaction PIN is required" });

    const request = await MoneyRequest.findOne({
      _id: req.params.id,
      payer: req.user._id,
    }).populate("requester");
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== "pending")
      return res
        .status(400)
        .json({ message: "This request has already been resolved" });

    const payer = await User.findById(req.user._id).select("+transactionPin");
    const payerAccount = req.account;
    if (!payerAccount) {
      return res
        .status(404)
        .json({ message: "No account found for your login" });
    }
    if (!(await payer.comparePin(pin))) {
      return res.status(400).json({ message: "Incorrect transaction PIN" });
    }

    const requesterHolder = await AccountHolder.findOne({
      user: request.requester._id,
    });
    const requesterAccount = requesterHolder
      ? await Account.findById(requesterHolder.account)
      : null;
    if (!requesterAccount) {
      return res
        .status(404)
        .json({ message: "No account found for the original requester" });
    }

    const isCrossCurrency = requesterAccount.currency !== payerAccount.currency;
    const fee = isCrossCurrency
      ? Math.min(
          Math.max(request.amount * CONVERSION_FEE_RATE, CONVERSION_FEE_MIN),
          CONVERSION_FEE_MAX,
        )
      : 0;
    const totalDebit = request.amount + fee;

    if (payerAccount.balance < totalDebit) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const limitError = await checkTransferLimits(payerAccount, request.amount);
    if (limitError) return res.status(400).json({ message: limitError });

    let convertedAmount = request.amount;
    let exchangeRate = 1;
    if (isCrossCurrency) {
      convertedAmount = await convertCurrency(
        request.amount,
        payerAccount.currency,
        requesterAccount.currency,
      );
      exchangeRate =
        Math.round((convertedAmount / request.amount) * 1000000) / 1000000;
    }

    payerAccount.balance -= totalDebit;
    requesterAccount.balance += convertedAmount;
    await payerAccount.save();
    await requesterAccount.save();

    const reference = generateReference();
    const date = new Date().toLocaleString("en-US");

    await Transaction.create({
      reference,
      type: "transfer_internal",
      sender: payer._id,
      receiver: request.requester._id,
      senderAccount: payerAccount._id,
      receiverAccount: requesterAccount._id,
      amount: request.amount,
      currency: payerAccount.currency,
      fee,
      convertedAmount: isCrossCurrency ? convertedAmount : undefined,
      convertedCurrency: isCrossCurrency
        ? requesterAccount.currency
        : undefined,
      exchangeRate: isCrossCurrency ? exchangeRate : undefined,
      balanceAfterSender: payerAccount.balance,
      balanceAfterReceiver: requesterAccount.balance,
      description:
        request.note ||
        `Money request payment to ${request.requester.firstName} ${request.requester.lastName}`,
      category: "Money Request",
      status: "completed",
    });

    request.status = "approved";
    request.resolvedAt = new Date();
    await request.save();

    await notifyTransaction(payer, {
      action: "debited",
      amount: totalDebit,
      currency: payerAccount.currency,
      balance: payerAccount.balance,
      reference,
      date,
    });
    await notifyTransaction(request.requester, {
      action: "credited",
      amount: convertedAmount,
      currency: requesterAccount.currency,
      balance: requesterAccount.balance,
      reference,
      date,
    });

    return res.json({ message: "Request approved and paid", request });
  } catch (error) {
    console.error("Approve money request error:", error);
    return res.status(500).json({ message: "Could not approve request" });
  }
};

// @route POST /api/requests/:id/decline
export const declineMoneyRequest = async (req, res) => {
  try {
    const request = await MoneyRequest.findOne({
      _id: req.params.id,
      payer: req.user._id,
    }).populate("requester");
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== "pending")
      return res
        .status(400)
        .json({ message: "This request has already been resolved" });

    request.status = "declined";
    request.resolvedAt = new Date();
    await request.save();

    await notifyGeneral(request.requester, {
      title: "Money request declined",
      message: `${req.user.firstName} ${req.user.lastName} declined your request for ${request.currency} ${request.amount}.`,
      type: "account",
    });

    return res.json({ message: "Request declined", request });
  } catch (error) {
    return res.status(500).json({ message: "Could not decline request" });
  }
};

// @route POST /api/requests/:id/cancel
export const cancelMoneyRequest = async (req, res) => {
  try {
    const request = await MoneyRequest.findOne({
      _id: req.params.id,
      requester: req.user._id,
    });
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== "pending")
      return res
        .status(400)
        .json({ message: "This request has already been resolved" });

    request.status = "cancelled";
    request.resolvedAt = new Date();
    await request.save();

    return res.json({ message: "Request cancelled", request });
  } catch (error) {
    return res.status(500).json({ message: "Could not cancel request" });
  }
};
