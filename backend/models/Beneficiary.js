import mongoose from "mongoose";

const beneficiarySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nickname: { type: String },
    accountHolderName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    bankName: { type: String, required: true },
    routingNumber: { type: String },
    isInternal: { type: Boolean, default: false }, // true if it's another Swiss Meridian Bank user
    internalUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // International wire details (optional — only needed for international beneficiaries)
    isInternational: { type: Boolean, default: false },
    country: { type: String },
    swiftCode: { type: String },
    iban: { type: String },
    bankAddress: { type: String },

    // Beneficiary's own address (some wires require this)
    beneficiaryAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zip: { type: String },
      country: { type: String },
    },
  },
  { timestamps: true },
);

export default mongoose.model("Beneficiary", beneficiarySchema);
