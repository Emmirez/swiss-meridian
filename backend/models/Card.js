import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    network: {
      type: String,
      enum: ["visa", "mastercard", "verve", "amex"],
      default: "visa",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "frozen"],
      default: "pending",
    },
    cardNumber: { type: String },
    cvv: { type: String },
    expiryMonth: { type: String },
    expiryYear: { type: String },
    cardHolderName: { type: String },
    settings: {
      onlinePayments: { type: Boolean, default: true },
      internationalTransactions: { type: Boolean, default: true },
      atmWithdrawals: { type: Boolean, default: true },
      contactlessPayments: { type: Boolean, default: true },
    },
    requestedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Card", cardSchema);