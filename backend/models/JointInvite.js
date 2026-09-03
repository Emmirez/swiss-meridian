import mongoose from "mongoose";
import crypto from "crypto";

const jointInviteSchema = new mongoose.Schema(
  {
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    token: { type: String, required: true, unique: true },
    status: { type: String, enum: ["pending", "accepted", "expired"], default: "pending" },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

jointInviteSchema.statics.generateToken = () => crypto.randomBytes(32).toString("hex");

export default mongoose.model("JointInvite", jointInviteSchema);