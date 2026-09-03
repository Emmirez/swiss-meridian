import mongoose from "mongoose";

const billerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    nickname: { type: String, required: true },
    category: {
      type: String,
      enum: ["Electricity", "Water", "Internet", "Phone", "Insurance", "Cable", "Other"],
      required: true,
    },
    accountNumber: { type: String, required: true }, // the biller-side account/reference number
    providerName: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Biller", billerSchema);