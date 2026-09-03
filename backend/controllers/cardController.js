import Card from "../models/Card.js";
import User from "../models/User.js";
import AccountHolder from "../models/AccountHolder.js";
import AuditLog from "../models/AuditLog.js";
import {
  generateCardNumber,
  generateCvv,
  generateExpiry,
} from "../utils/generateCard.js";
import { notifyGeneral } from "../utils/notify.js";

// ---- USER ----

// @route GET /api/users/card
export const getMyCard = async (req, res) => {
  try {
    const card = await Card.findOne({ user: req.user._id });
    return res.json({ card });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch card" });
  }
};

// @route POST /api/users/card/request
export const requestCard = async (req, res) => {
  try {
    const { network } = req.body;
    const validNetworks = ["visa", "mastercard", "verve", "amex"];
    if (!validNetworks.includes(network)) {
      return res
        .status(400)
        .json({ message: "Please select a valid card network" });
    }

    const existing = await Card.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({
        message: `You already have a card (status: ${existing.status})`,
      });
    }

    const card = await Card.create({
      user: req.user._id,
      network,
      status: "pending",
      cardHolderName: `${req.user.firstName} ${req.user.lastName}`,
    });

    await notifyGeneral(req.user, {
      title: "Card request submitted",
      message:
        "Your debit card request has been submitted and is awaiting review by our team.",
      type: "account",
    });

    return res.status(201).json({ message: "Card requested", card });
  } catch (error) {
    console.error("Card request error:", error);
    return res.status(500).json({ message: "Could not request card" });
  }
};

// @route PUT /api/users/card/settings
export const updateCardSettings = async (req, res) => {
  try {
    const {
      onlinePayments,
      internationalTransactions,
      atmWithdrawals,
      contactlessPayments,
    } = req.body;
    const card = await Card.findOne({ user: req.user._id });
    if (!card || card.status !== "approved") {
      return res.status(400).json({ message: "No active card found" });
    }

    if (onlinePayments !== undefined)
      card.settings.onlinePayments = onlinePayments;
    if (internationalTransactions !== undefined)
      card.settings.internationalTransactions = internationalTransactions;
    if (atmWithdrawals !== undefined)
      card.settings.atmWithdrawals = atmWithdrawals;
    if (contactlessPayments !== undefined)
      card.settings.contactlessPayments = contactlessPayments;
    await card.save();

    return res.json({ card });
  } catch (error) {
    return res.status(500).json({ message: "Could not update card settings" });
  }
};

// @route PUT /api/users/card/freeze
export const toggleFreeze = async (req, res) => {
  try {
    const card = await Card.findOne({ user: req.user._id });
    if (!card || (card.status !== "approved" && card.status !== "frozen")) {
      return res.status(400).json({ message: "No active card found" });
    }

    card.status = card.status === "frozen" ? "approved" : "frozen";
    await card.save();

    return res.json({ card });
  } catch (error) {
    return res.status(500).json({ message: "Could not update card" });
  }
};

// ---- ADMIN ----

// @route GET /api/admin/cards?status=pending
export const getCardRequests = async (req, res) => {
  try {
    const { status = "pending" } = req.query;
    const cards = await Card.find({ status })
      .populate("user", "firstName lastName email")
      .sort({ requestedAt: -1 });

    // Attach each cardholder's Account details (accountNumber, type, currency)
    // since those now live on Account, not User.
    const cardsWithAccountInfo = await Promise.all(
      cards.map(async (card) => {
        const holderRecord = await AccountHolder.findOne({ user: card.user._id }).populate("account");
        return {
          ...card.toObject(),
          user: {
            ...card.user.toObject(),
            accountNumber: holderRecord?.account?.accountNumber,
            accountType: holderRecord?.account?.accountType,
            currency: holderRecord?.account?.currency,
          },
        };
      })
    );

    return res.json({ cards: cardsWithAccountInfo });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch card requests" });
  }
};

// @route PUT /api/admin/cards/:id/approve
export const approveCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id).populate("user");
    if (!card)
      return res.status(404).json({ message: "Card request not found" });

    const { expiryMonth, expiryYear } = generateExpiry();
    card.cardNumber = generateCardNumber(card.network);
    card.cvv = generateCvv(card.network);
    card.expiryMonth = expiryMonth;
    card.expiryYear = expiryYear;
    card.status = "approved";
    card.reviewedAt = new Date();
    await card.save();

    await AuditLog.create({
      admin: req.user._id,
      action: "approve_card",
      targetUser: card.user._id,
      details: `Issued debit card ending in ${card.cardNumber.slice(-4)}`,
    });

    await notifyGeneral(card.user, {
      title: "Debit card approved",
      message:
        "Your debit card has been approved and is now active. View it from the Cards page.",
      type: "account",
      email: true,
    });

    return res.json({ message: "Card approved and issued", card });
  } catch (error) {
    console.error("Approve card error:", error);
    return res.status(500).json({ message: "Could not approve card" });
  }
};

// @route PUT /api/admin/cards/:id/reject
export const rejectCard = async (req, res) => {
  try {
    const { reason } = req.body;
    const card = await Card.findById(req.params.id).populate("user");
    if (!card)
      return res.status(404).json({ message: "Card request not found" });

    card.status = "rejected";
    card.reviewedAt = new Date();
    card.rejectionReason = reason || "";
    await card.save();

    await AuditLog.create({
      admin: req.user._id,
      action: "reject_card",
      targetUser: card.user._id,
      details: reason || "No reason provided",
    });

    await notifyGeneral(card.user, {
      title: "Debit card request declined",
      message: `Your card request was declined${reason ? `: ${reason}` : "."} You can request again from the Cards page.`,
      type: "account",
      email: true,
    });

    return res.json({ message: "Card request rejected", card });
  } catch (error) {
    return res.status(500).json({ message: "Could not reject card request" });
  }
};
