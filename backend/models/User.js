import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, default: "United States" },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    ssnLast4: { type: String, required: true, select: false },
    ssnHash: { type: String, required: true, select: false },
    address: { type: addressSchema, required: true },

    password: { type: String, required: true, select: false },
    transactionPin: { type: String, required: true, select: false },

    // Status / role — this is the PERSON's own login/verification status,
    // separate from the Account's own status (which lives on the Account model).
    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: {
      type: String,
      enum: ["pending", "active", "suspended", "rejected", "frozen"],
      default: "pending",
    },

    // Verification
    isEmailVerified: { type: Boolean, default: false },
    emailOtp: { type: String, select: false },
    emailOtpExpires: { type: Date, select: false },

    // KYC verification — this is the PERSON's identity verification.
    // Both a primary and joint holder each complete their own KYC.
    kycStatus: {
      type: String,
      enum: ["not_submitted", "pending", "approved", "rejected"],
      default: "not_submitted",
    },
    kycDocumentType: {
      type: String,
      enum: ["drivers_license", "passport", "national_id", "state_id"],
    },
    kycDocumentNumber: { type: String },
    kycFrontIdUrl: { type: String },
    kycBackIdUrl: { type: String },
    kycSelfieUrl: { type: String },
    kycFullName: { type: String },
    kycDateOfBirth: { type: Date },
    kycNationality: { type: String },
    kycGender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    kycAddress: { type: addressSchema },
    kycEmploymentStatus: {
      type: String,
      enum: ["employed", "self_employed", "unemployed", "student", "retired"],
    },
    kycOccupation: { type: String },
    kycEmployerName: { type: String },
    kycAnnualIncome: { type: Number },
    kycSourceOfFunds: { type: String },
    kycSubmittedAt: { type: Date },
    kycReviewedAt: { type: Date },
    kycNote: { type: String },

    // Preferences
    notificationPrefs: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
    },

    avatarUrl: { type: String, default: "" },
    lastLoginAt: { type: Date },

    // Two-factor authentication (TOTP / authenticator app)
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    twoFactorTempSecret: { type: String, select: false },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.isModified("transactionPin")) {
    this.transactionPin = await bcrypt.hash(this.transactionPin, 10);
  }
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.comparePin = function (candidate) {
  return bcrypt.compare(candidate, this.transactionPin);
};

userSchema.methods.fullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

export default mongoose.model("User", userSchema);