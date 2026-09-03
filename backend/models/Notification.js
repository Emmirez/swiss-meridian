import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["transaction", "account", "security", "admin", "general"],
      default: "general",
    },
    read: { type: Boolean, default: false },
    channels: {
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
      inApp: { type: Boolean, default: true },
    },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
