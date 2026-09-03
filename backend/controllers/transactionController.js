import User from "../models/User.js";
import Account from "../models/Account.js";
import AccountHolder from "../models/AccountHolder.js";
import Transaction from "../models/Transaction.js";
import Beneficiary from "../models/Beneficiary.js";
import { generateReference } from "../utils/generateIds.js";
import { notifyTransaction } from "../utils/notify.js";
import { checkTransferLimits } from "../utils/transferLimits.js";
import { convertCurrency } from "../utils/exchangeRates.js";

const CONVERSION_FEE_RATE = 0.01; // 1%
const CONVERSION_FEE_MIN = 5;
const CONVERSION_FEE_MAX = 50;

// The primary holder is used for attribution on the Transaction record and
// as the "main" person notified. All holders get notified of activity.
const getPrimaryHolderUser = async (accountId) => {
  const holder = await AccountHolder.findOne({ account: accountId, role: "primary" }).populate("user");
  return holder?.user;
};

const getAllHolderUsers = async (accountId) => {
  const holders = await AccountHolder.find({ account: accountId }).populate("user");
  return holders.map((h) => h.user).filter(Boolean);
};

// @route POST /api/transactions/transfer/internal
// body: { receiverAccountNumber, amount, pin, description }
export const transferInternal = async (req, res) => {
  try {
    const sender = await User.findById(req.user._id).select("+transactionPin");
    const senderAccount = req.account; // attached by protect middleware
    const { receiverAccountNumber, amount, pin, description } = req.body;

    if (!senderAccount) {
      return res.status(404).json({ message: "No account found for your login" });
    }
    if (!receiverAccountNumber || !amount || !pin) {
      return res.status(400).json({ message: "Recipient account, amount, and PIN are required" });
    }
    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }
    if (!(await sender.comparePin(pin))) {
      return res.status(400).json({ message: "Incorrect transaction PIN" });
    }

    const receiverAccount = await Account.findOne({ accountNumber: receiverAccountNumber });
    if (!receiverAccount) {
      return res.status(404).json({ message: "Recipient account not found" });
    }
    if (receiverAccount._id.equals(senderAccount._id)) {
      return res.status(400).json({ message: "You cannot transfer to your own account" });
    }

    const isCrossCurrency = receiverAccount.currency !== senderAccount.currency;
    const fee = isCrossCurrency
      ? Math.min(Math.max(amount * CONVERSION_FEE_RATE, CONVERSION_FEE_MIN), CONVERSION_FEE_MAX)
      : 0;
    const totalDebit = amount + fee;

    if (senderAccount.balance < totalDebit) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const limitError = await checkTransferLimits(senderAccount, amount);
    if (limitError) return res.status(400).json({ message: limitError });

    let convertedAmount = amount;
    let exchangeRate = 1;
    if (isCrossCurrency) {
      convertedAmount = await convertCurrency(amount, senderAccount.currency, receiverAccount.currency);
      exchangeRate = Math.round((convertedAmount / amount) * 1000000) / 1000000;
    }

    senderAccount.balance -= totalDebit;
    receiverAccount.balance += convertedAmount;
    await senderAccount.save();
    await receiverAccount.save();

    const receiverPrimary = await getPrimaryHolderUser(receiverAccount._id);

    const reference = generateReference();
    const tx = await Transaction.create({
      reference,
      type: "transfer_internal",
      sender: sender._id,
      receiver: receiverPrimary?._id,
      senderAccount: senderAccount._id,
      receiverAccount: receiverAccount._id,
      amount,
      currency: senderAccount.currency,
      fee,
      convertedAmount: isCrossCurrency ? convertedAmount : undefined,
      convertedCurrency: isCrossCurrency ? receiverAccount.currency : undefined,
      exchangeRate: isCrossCurrency ? exchangeRate : undefined,
      balanceAfterSender: senderAccount.balance,
      balanceAfterReceiver: receiverAccount.balance,
      description: description || "Internal transfer",
      category: "Transfer",
      status: "completed",
    });

    const date = new Date().toLocaleString("en-US");

    // Notify every holder on the sending account (covers joint accounts)
    const senderHolders = await getAllHolderUsers(senderAccount._id);
    for (const holder of senderHolders) {
      await notifyTransaction(holder, {
        action: "debited",
        amount: totalDebit,
        currency: senderAccount.currency,
        balance: senderAccount.balance,
        reference,
        date,
      });
    }

    // Notify every holder on the receiving account
    const receiverHolders = await getAllHolderUsers(receiverAccount._id);
    for (const holder of receiverHolders) {
      await notifyTransaction(holder, {
        action: "credited",
        amount: convertedAmount,
        currency: receiverAccount.currency,
        balance: receiverAccount.balance,
        reference,
        date,
      });
    }

    const txWithReceiverName = {
      ...tx.toObject(),
      receiverName: receiverPrimary ? `${receiverPrimary.firstName} ${receiverPrimary.lastName}` : undefined,
    };

    return res.status(201).json({ message: "Transfer successful", transaction: txWithReceiverName });
  } catch (error) {
    console.error("Internal transfer error:", error);
    return res.status(500).json({ message: "Transfer failed" });
  }
};

// @route POST /api/transactions/transfer/external
// Simulated external bank transfer (no real rails — for portfolio realism)
export const transferExternal = async (req, res) => {
  try {
    const sender = await User.findById(req.user._id).select("+transactionPin");
    const senderAccount = req.account;
    const { bankName, accountName, accountNumber, routingNumber, amount, pin, description } = req.body;

    if (!senderAccount) {
      return res.status(404).json({ message: "No account found for your login" });
    }
    if (!bankName || !accountName || !accountNumber || !routingNumber || !amount || !pin) {
      return res.status(400).json({ message: "All transfer fields and PIN are required" });
    }
    if (!/^\d{9}$/.test(routingNumber)) {
      return res.status(400).json({ message: "Routing number must be exactly 9 digits" });
    }
    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }
    if (!(await sender.comparePin(pin))) {
      return res.status(400).json({ message: "Incorrect transaction PIN" });
    }
    if (senderAccount.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const limitError = await checkTransferLimits(senderAccount, amount);
    if (limitError) return res.status(400).json({ message: limitError });

    senderAccount.balance -= amount;
    await senderAccount.save();

    const reference = generateReference();
    const tx = await Transaction.create({
      reference,
      type: "transfer_external",
      sender: sender._id,
      senderAccount: senderAccount._id,
      externalBankName: bankName,
      externalAccountName: accountName,
      externalAccountNumber: accountNumber,
      externalRoutingNumber: routingNumber,
      amount,
      currency: senderAccount.currency,
      balanceAfterSender: senderAccount.balance,
      description: description || `Transfer to ${accountName}`,
      category: "Transfer",
      status: "completed",
    });

    const date = new Date().toLocaleString("en-US");
    const senderHolders = await getAllHolderUsers(senderAccount._id);
    for (const holder of senderHolders) {
      await notifyTransaction(holder, {
        action: "debited",
        amount,
        currency: senderAccount.currency,
        balance: senderAccount.balance,
        reference,
        date,
      });
    }

    return res.status(201).json({ message: "External transfer submitted", transaction: tx });
  } catch (error) {
    console.error("External transfer error:", error);
    return res.status(500).json({ message: "Transfer failed" });
  }
};

// @route POST /api/transactions/transfer/international
export const transferInternational = async (req, res) => {
  try {
    const sender = await User.findById(req.user._id).select("+transactionPin");
    const senderAccount = req.account;
    const { country, bankName, accountName, swiftCode, iban, bankAddress, amount, pin, description } = req.body;

    if (!senderAccount) {
      return res.status(404).json({ message: "No account found for your login" });
    }
    if (!country || !bankName || !accountName || !swiftCode || !iban || !amount || !pin) {
      return res.status(400).json({ message: "All international transfer fields and PIN are required" });
    }
    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }
    if (!/^[A-Z0-9]{8,11}$/i.test(swiftCode)) {
      return res.status(400).json({ message: "Please enter a valid SWIFT/BIC code (8-11 characters)" });
    }
    if (!(await sender.comparePin(pin))) {
      return res.status(400).json({ message: "Incorrect transaction PIN" });
    }

    const limitError = await checkTransferLimits(senderAccount, amount);
    if (limitError) return res.status(400).json({ message: limitError });

    const fee = Math.min(Math.max(amount * 0.01, 5), 50);
    const totalDebit = amount + fee;

    if (senderAccount.balance < totalDebit) {
      return res.status(400).json({
        message: `Insufficient balance. This transfer requires ${senderAccount.currency} ${totalDebit.toFixed(2)} including a ${senderAccount.currency} ${fee.toFixed(2)} international transfer fee.`,
      });
    }

    senderAccount.balance -= totalDebit;
    await senderAccount.save();

    const reference = generateReference();
    const tx = await Transaction.create({
      reference,
      type: "transfer_international",
      sender: sender._id,
      senderAccount: senderAccount._id,
      externalCountry: country,
      externalBankName: bankName,
      externalAccountName: accountName,
      externalSwiftCode: swiftCode.toUpperCase(),
      externalIban: iban,
      externalBankAddress: bankAddress,
      amount,
      fee,
      currency: senderAccount.currency,
      balanceAfterSender: senderAccount.balance,
      description: description || `International transfer to ${accountName}`,
      category: "International Transfer",
      status: "completed",
    });

    const date = new Date().toLocaleString("en-US");
    const senderHolders = await getAllHolderUsers(senderAccount._id);
    for (const holder of senderHolders) {
      await notifyTransaction(holder, {
        action: "debited",
        amount: totalDebit,
        currency: senderAccount.currency,
        balance: senderAccount.balance,
        reference,
        date,
      });
    }

    return res.status(201).json({ message: "International transfer submitted", transaction: tx });
  } catch (error) {
    console.error("International transfer error:", error);
    return res.status(500).json({ message: "Transfer failed" });
  }
};

// @route POST /api/transactions/transfer/zelle
// @route POST /api/transactions/transfer/paypal
const transferP2P = async (req, res, method) => {
  try {
    const sender = await User.findById(req.user._id).select("+transactionPin");
    const senderAccount = req.account;
    const { identifier, amount, pin, description } = req.body;
    const label = method === "paypal" ? "PayPal" : "Zelle";

    if (!senderAccount) {
      return res.status(404).json({ message: "No account found for your login" });
    }
    if (!identifier || !amount || !pin) {
      return res.status(400).json({
        message: `Recipient ${method === "paypal" ? "email" : "email or phone number"}, amount, and PIN are required`,
      });
    }
    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }
    if (method === "paypal" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    if (method === "zelle") {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      const isPhone = /^\+?[\d\s-]{7,15}$/.test(identifier);
      if (!isEmail && !isPhone) {
        return res.status(400).json({ message: "Please enter a valid email address or phone number" });
      }
    }
    if (!(await sender.comparePin(pin))) {
      return res.status(400).json({ message: "Incorrect transaction PIN" });
    }

    // Look up the recipient PERSON by email/phone, then find THEIR account
    const receiverUser = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
    });

    let receiverAccount = null;
    if (receiverUser) {
      const holderRecord = await AccountHolder.findOne({ user: receiverUser._id });
      receiverAccount = holderRecord ? await Account.findById(holderRecord.account) : null;
      if (receiverAccount && receiverAccount._id.equals(senderAccount._id)) {
        return res.status(400).json({ message: "You cannot send money to yourself" });
      }
    }

    const isCrossCurrency = receiverAccount && receiverAccount.currency !== senderAccount.currency;
    const fee = isCrossCurrency
      ? Math.min(Math.max(amount * CONVERSION_FEE_RATE, CONVERSION_FEE_MIN), CONVERSION_FEE_MAX)
      : 0;
    const totalDebit = amount + fee;

    if (senderAccount.balance < totalDebit) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const limitError = await checkTransferLimits(senderAccount, amount);
    if (limitError) return res.status(400).json({ message: limitError });

    let convertedAmount = amount;
    let exchangeRate = 1;
    if (isCrossCurrency) {
      convertedAmount = await convertCurrency(amount, senderAccount.currency, receiverAccount.currency);
      exchangeRate = Math.round((convertedAmount / amount) * 1000000) / 1000000;
    }

    const reference = generateReference();
    const date = new Date().toLocaleString("en-US");

    senderAccount.balance -= totalDebit;
    await senderAccount.save();

    if (receiverAccount) {
      receiverAccount.balance += convertedAmount;
      await receiverAccount.save();
    }

    const tx = await Transaction.create({
      reference,
      type: method === "paypal" ? "transfer_paypal" : "transfer_zelle",
      sender: sender._id,
      receiver: receiverUser?._id,
      senderAccount: senderAccount._id,
      receiverAccount: receiverAccount?._id,
      p2pIdentifier: identifier,
      amount,
      currency: senderAccount.currency,
      fee,
      convertedAmount: isCrossCurrency ? convertedAmount : undefined,
      convertedCurrency: isCrossCurrency ? receiverAccount.currency : undefined,
      exchangeRate: isCrossCurrency ? exchangeRate : undefined,
      balanceAfterSender: senderAccount.balance,
      balanceAfterReceiver: receiverAccount ? receiverAccount.balance : undefined,
      description: description || `${label} transfer to ${identifier}`,
      category: label,
      status: "completed",
    });

    const senderHolders = await getAllHolderUsers(senderAccount._id);
    for (const holder of senderHolders) {
      await notifyTransaction(holder, {
        action: "debited",
        amount: totalDebit,
        currency: senderAccount.currency,
        balance: senderAccount.balance,
        reference,
        date,
      });
    }

    if (receiverAccount) {
      const receiverHolders = await getAllHolderUsers(receiverAccount._id);
      for (const holder of receiverHolders) {
        await notifyTransaction(holder, {
          action: "credited",
          amount: convertedAmount,
          currency: receiverAccount.currency,
          balance: receiverAccount.balance,
          reference,
          date,
        });
      }
    }

    return res.status(201).json({ message: `${label} transfer successful`, transaction: tx });
  } catch (error) {
    console.error(`${method} transfer error:`, error);
    return res.status(500).json({ message: "Transfer failed" });
  }
};

export const transferZelle = (req, res) => transferP2P(req, res, "zelle");
export const transferPaypal = (req, res) => transferP2P(req, res, "paypal");

// @route GET /api/transactions/me?page=1&limit=20
// Shows transactions for the whole ACCOUNT (both holders on a joint account
// see each other's activity), not just the logged-in person's own actions.
export const getMyTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const accountId = req.account?._id;
    const filter = {
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id },
        ...(accountId ? [{ senderAccount: accountId }, { receiverAccount: accountId }] : []),
      ],
    };

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("sender", "firstName lastName")
      .populate("receiver", "firstName lastName");

    const total = await Transaction.countDocuments(filter);

    return res.json({ transactions, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch transactions" });
  }
};

// @route GET /api/transactions/:id
export const getTransactionById = async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id)
      .populate("sender", "firstName lastName")
      .populate("receiver", "firstName lastName");
    if (!tx) return res.status(404).json({ message: "Transaction not found" });

    const accountId = req.account?._id;
    const isParticipant =
      (tx.sender && tx.sender._id.equals(req.user._id)) ||
      (tx.receiver && tx.receiver._id.equals(req.user._id)) ||
      (accountId && tx.senderAccount?.equals(accountId)) ||
      (accountId && tx.receiverAccount?.equals(accountId));

    if (!isParticipant && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this transaction" });
    }

    return res.json({ transaction: tx });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch transaction" });
  }
};

// --- Beneficiaries (unchanged — these belong to the PERSON, not the account) ---

export const addBeneficiary = async (req, res) => {
  try {
    const {
      nickname, accountHolderName, accountNumber, bankName, routingNumber,
      isInternational, country, swiftCode, iban, bankAddress,
      street, city, state, zip, benCountry,
    } = req.body;

    const internalAccount = await Account.findOne({ accountNumber });

    const beneficiary = await Beneficiary.create({
      owner: req.user._id,
      nickname,
      accountHolderName,
      accountNumber,
      bankName,
      routingNumber,
      isInternal: !!internalAccount,
      isInternational: !!isInternational,
      country: isInternational ? country : undefined,
      swiftCode: isInternational ? swiftCode : undefined,
      iban: isInternational ? iban : undefined,
      bankAddress: isInternational ? bankAddress : undefined,
      beneficiaryAddress:
        isInternational && (street || city || state || zip || benCountry)
          ? { street, city, state, zip, country: benCountry }
          : undefined,
    });

    return res.status(201).json({ beneficiary });
  } catch (error) {
    return res.status(500).json({ message: "Could not save beneficiary" });
  }
};

export const getBeneficiaries = async (req, res) => {
  try {
    const beneficiaries = await Beneficiary.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return res.json({ beneficiaries });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch beneficiaries" });
  }
};

export const deleteBeneficiary = async (req, res) => {
  try {
    await Beneficiary.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    return res.json({ message: "Beneficiary removed" });
  } catch (error) {
    return res.status(500).json({ message: "Could not remove beneficiary" });
  }
};