import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: [
        "transfer_internal",
        "transfer_external",
        "transfer_international",
        "transfer_zelle",
        "transfer_paypal",
        "bill_payment",
        "loan_disbursement",
        "loan_payment",
        "deposit",
        "withdrawal",
        "adjustment_credit",
        "adjustment_debit",
      ],
      required: true,
    },
    // sender/receiver = the PERSON who initiated/received (for display/attribution)
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // senderAccount/receiverAccount = the actual Account whose balance moved.
    // Required for joint accounts, where two different Users share one Account.
    senderAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    receiverAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },

    // For external transfers where receiver isn't a platform user
    externalBankName: { type: String },
    externalAccountName: { type: String },
    externalAccountNumber: { type: String },
    externalRoutingNumber: { type: String },

    // For international transfers
    externalCountry: { type: String },
    externalSwiftCode: { type: String },
    externalIban: { type: String },
    externalBankAddress: { type: String },

    // For Zelle/PayPal-style transfers (recipient looked up by email/phone)
    p2pIdentifier: { type: String },

    // For bill payments
    billerName: { type: String },
    billerCategory: { type: String },
    billerAccountNumber: { type: String },

    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    fee: { type: Number, default: 0 },

    // Cross-currency conversion details (populated when sender and
    // receiver hold accounts in different currencies)
    convertedAmount: { type: Number },
    convertedCurrency: { type: String },
    exchangeRate: { type: Number },

    balanceAfterSender: { type: Number },
    balanceAfterReceiver: { type: Number },

    description: { type: String, default: "" },
    category: { type: String, default: "Transfer" },

    status: {
      type: String,
      enum: ["pending", "completed", "failed", "reversed"],
      default: "completed",
    },

    performedByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default mongoose.model("Transaction", transactionSchema);
