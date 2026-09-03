import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ["user", "admin"], required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const supportTicketSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    category: {
      type: String,
      enum: ["Account", "Transfer", "Security", "Other"],
      default: "Other",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    messages: [messageSchema],
    lastReplyBy: { type: String, enum: ["user", "admin"] },
  },
  { timestamps: true }
);

export default mongoose.model("SupportTicket", supportTicketSchema);