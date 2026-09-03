import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    details: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
