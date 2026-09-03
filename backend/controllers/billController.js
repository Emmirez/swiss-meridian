import User from "../models/User.js";
import Biller from "../models/Biller.js";
import Transaction from "../models/Transaction.js";
import { generateReference } from "../utils/generateIds.js";
import { notifyTransaction } from "../utils/notify.js";
import { checkTransferLimits } from "../utils/transferLimits.js";

// ---- Billers (saved payees) ----

// @route GET /api/bills/billers
export const getBillers = async (req, res) => {
  try {
    const billers = await Biller.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ billers });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch billers" });
  }
};

// @route POST /api/bills/billers
export const addBiller = async (req, res) => {
  try {
    const { nickname, category, accountNumber, providerName } = req.body;
    if (!nickname || !category || !accountNumber || !providerName) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const validCategories = ["Electricity", "Water", "Internet", "Phone", "Insurance", "Cable", "Other"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const biller = await Biller.create({
      user: req.user._id,
      nickname,
      category,
      accountNumber,
      providerName,
    });

    return res.status(201).json({ biller });
  } catch (error) {
    return res.status(500).json({ message: "Could not save biller" });
  }
};

// @route DELETE /api/bills/billers/:id
export const deleteBiller = async (req, res) => {
  try {
    await Biller.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    return res.json({ message: "Biller removed" });
  } catch (error) {
    return res.status(500).json({ message: "Could not remove biller" });
  }
};

// ---- Payment ----

// @route POST /api/bills/pay
// body: { billerId?, providerName, category, accountNumber, amount, pin, description }
// billerId is optional — user can pay a saved biller, or a one-off payee not saved
export const payBill = async (req, res) => {
  try {
    const sender = await User.findById(req.user._id).select("+transactionPin");
    const senderAccount = req.account;
    const { billerId, providerName, category, accountNumber, amount, pin, description } = req.body;

    if (!senderAccount) {
      return res.status(404).json({ message: "No account found for your login" });
    }

    let billerName = providerName;
    let billerCategory = category;
    let billerAccountNumber = accountNumber;

    if (billerId) {
      const biller = await Biller.findOne({ _id: billerId, user: req.user._id });
      if (!biller) return res.status(404).json({ message: "Biller not found" });
      billerName = biller.providerName;
      billerCategory = biller.category;
      billerAccountNumber = biller.accountNumber;
    }

    if (!billerName || !billerCategory || !billerAccountNumber || !amount || !pin) {
      return res.status(400).json({ message: "All fields and PIN are required" });
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
      type: "bill_payment",
      sender: sender._id,
      senderAccount: senderAccount._id,
      billerName,
      billerCategory,
      billerAccountNumber,
      amount,
      currency: senderAccount.currency,
      balanceAfterSender: senderAccount.balance,
      description: description || `Bill payment to ${billerName}`,
      category: `Bill Payment · ${billerCategory}`,
      status: "completed",
    });

    await notifyTransaction(sender, {
      action: "debited",
      amount,
      currency: senderAccount.currency,
      balance: senderAccount.balance,
      reference,
      date: new Date().toLocaleString("en-US"),
    });

    return res.status(201).json({ message: "Bill payment successful", transaction: tx });
  } catch (error) {
    console.error("Bill payment error:", error);
    return res.status(500).json({ message: "Payment failed" });
  }
};