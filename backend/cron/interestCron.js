import cron from "node-cron";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import { generateReference } from "../utils/generateIds.js";
import { notifyTransaction } from "../utils/notify.js";

// Runs once a day at midnight — applies a small daily interest accrual to
// active savings accounts. Purely illustrative for portfolio purposes.
const DAILY_RATE = 0.00005; // ~1.8% APY equivalent, simplified

cron.schedule("0 0 * * *", async () => {
  try {
    const savers = await User.find({ accountType: "savings", status: "active", balance: { $gt: 0 } });

    for (const user of savers) {
      const interest = Math.round(user.balance * DAILY_RATE * 100) / 100;
      if (interest <= 0) continue;

      user.balance += interest;
      await user.save();

      const reference = generateReference();
      await Transaction.create({
        reference,
        type: "adjustment_credit",
        receiver: user._id,
        amount: interest,
        currency: user.currency,
        balanceAfterReceiver: user.balance,
        description: "Daily savings interest",
        category: "Interest",
        status: "completed",
      });

      await notifyTransaction(user, {
        action: "credited",
        amount: interest,
        currency: user.currency,
        balance: user.balance,
        reference,
        date: new Date().toLocaleString("en-US"),
      });
    }

    console.log(`Interest cron: processed ${savers.length} savings accounts`);
  } catch (error) {
    console.error("Interest cron error:", error.message);
  }
});
