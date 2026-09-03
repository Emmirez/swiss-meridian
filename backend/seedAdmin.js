// One-time script to create the first admin account.
// Run with: node seedAdmin.js
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import { generateAccountNumber } from "./utils/generateIds.js";

dotenv.config();

const run = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || "admin@swissmeridianapp.com";
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  const admin = await User.create({
    firstName: "Swiss Meridian",
    lastName: "Admin",
    email,
    phone: "+10000000000",
    dateOfBirth: new Date("1990-01-01"),
    ssnLast4: "0000",
    ssnHash: "seeded-admin-no-ssn",
    address: {
      street: "1 Bank Plaza",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "United States",
    },
    password: process.env.ADMIN_PASSWORD || "ChangeMe123!",
    transactionPin: "0000",
    accountType: "checking",
    currency: "USD",
    accountNumber: generateAccountNumber(),
    role: "admin",
    status: "active",
    isEmailVerified: true,
    isPhoneVerified: true,
  });

  console.log(
    `Admin created: ${admin.email} (password: ${process.env.ADMIN_PASSWORD || "ChangeMe123!"})`,
  );
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
