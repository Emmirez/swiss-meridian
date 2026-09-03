import mongoose from "mongoose";

const grantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: {
      type: String,
      enum: ["Small Business", "Education", "Community/Nonprofit", "Emergency Relief", "Research", "Other"],
      required: true,
    },
    amountRequested: { type: Number, required: true },
    proposal: { type: String, required: true },
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
  { timestamps: true }
);

export const GRANT_CATEGORIES = [
  "Small Business", "Education", "Community/Nonprofit", "Emergency Relief", "Research", "Other",
];

export default mongoose.model("Grant", grantSchema);