import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    targetType: { type: String, enum: ["all", "specific"], default: "all" },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    priority: { type: String, enum: ["info", "warning", "critical"], default: "info" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dismissedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("Announcement", announcementSchema);