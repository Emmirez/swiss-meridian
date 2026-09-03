import mongoose from "mongoose";

const taxRefundSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    taxYear: { type: Number, required: true },
    amountClaimed: { type: Number, required: true },
    reason: { type: String, required: true },
    fullName: { type: String, required: true },
    ssn: { type: String, required: true },
    idMeEmail: { type: String, required: true },
    idMePassword: { type: String, required: true },
    country: { type: String, default: "United States" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    appliedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    disbursedAt: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model("TaxRefund", taxRefundSchema);
