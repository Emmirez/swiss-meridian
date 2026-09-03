import mongoose from "mongoose";

const moneyRequestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // person asking for money
    payer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // person being asked to pay
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    note: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "declined", "cancelled"],
      default: "pending",
    },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("MoneyRequest", moneyRequestSchema);