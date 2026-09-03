import mongoose from "mongoose";

const loanTypeRates = {
  personal: 8,
  auto: 5,
  business: 10,
  student: 4,
  home: 6,
};

const paymentLogSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    paidAt: { type: Date, default: Date.now },
    onTime: { type: Boolean, default: true },
  },
  { _id: false }
);

const loanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["personal", "auto", "business", "student", "home"],
      required: true,
    },
    purpose: { type: String, required: true },
    principal: { type: Number, required: true },
    termMonths: { type: Number, required: true },
    interestRate: { type: Number, required: true }, // annual %, fixed per type

    monthlyPayment: { type: Number },
    totalRepayable: { type: Number },
    remainingBalance: { type: Number },
    nextPaymentDate: { type: Date },

    status: {
      type: String,
      enum: ["pending", "approved_active", "rejected", "paid_off"],
      default: "pending",
    },

    payments: [paymentLogSchema],

    appliedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    disbursedAt: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

loanSchema.statics.getRateForType = function (type) {
  return loanTypeRates[type];
};

// Standard amortization formula
loanSchema.methods.calculateMonthlyPayment = function () {
  const r = this.interestRate / 100 / 12;
  const n = this.termMonths;
  if (r === 0) return this.principal / n;
  return (this.principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

export const LOAN_RATES = loanTypeRates;
export default mongoose.model("Loan", loanSchema);