import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    accountNumber: { type: String, required: true, unique: true },
    routingNumber: { type: String },
    accountType: {
      type: String,
      enum: ["checking", "savings", "business", "money_market"],
      required: true,
    },
    isJoint: { type: Boolean, default: false },
    currency: { type: String, required: true },
    balance: { type: Number, default: 0 },

    kycStatus: { type: String, enum: ["not_submitted", "pending", "approved", "rejected"], default: "not_submitted" },
    kycReviewedAt: { type: Date },
    kycNote: { type: String },

    limits: {
      dailyLimit: { type: Number, default: 500000 },
      weeklyLimit: { type: Number, default: 1000000 },
      monthlyLimit: { type: Number, default: 5000000 },
      perTransactionLimit: { type: Number, default: 250000 },
    },

    status: {
      type: String,
      enum: ["pending", "active", "suspended", "frozen", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Account", accountSchema);