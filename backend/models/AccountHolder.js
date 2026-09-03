import mongoose from "mongoose";

const accountHolderSchema = new mongoose.Schema(
  {
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["primary", "joint"], required: true },
  },
  { timestamps: true }
);

accountHolderSchema.index({ account: 1, user: 1 }, { unique: true });

export default mongoose.model("AccountHolder", accountHolderSchema);