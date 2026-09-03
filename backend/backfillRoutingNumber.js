// backend/backfillRoutingNumber.js — run once, then delete
import "dotenv/config";
import connectDB from "./config/db.js";
import Account from "./models/Account.js";
import { BANK_ROUTING_NUMBER } from "./utils/generateIds.js";

const run = async () => {
  await connectDB();
  const result = await Account.updateMany(
    { routingNumber: { $exists: false } },
    { $set: { routingNumber: BANK_ROUTING_NUMBER } }
  );
  console.log(`Updated ${result.modifiedCount} account(s) with routing number.`);
  process.exit(0);
};

run().catch((err) => { console.error(err); process.exit(1); });