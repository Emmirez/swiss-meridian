import cron from "node-cron";
import Loan from "../models/Loan.js";
import User from "../models/User.js";
import Account from "../models/Account.js";
import AccountHolder from "../models/AccountHolder.js";
import Transaction from "../models/Transaction.js";
import { generateReference } from "../utils/generateIds.js";
import { notifyTransaction, notifyGeneral } from "../utils/notify.js";

// Runs once a day — checks for active loans whose next payment is due today or overdue
cron.schedule("0 1 * * *", async () => {
  try {
    const dueLoans = await Loan.find({
      status: "approved_active",
      nextPaymentDate: { $lte: new Date() },
    }).populate("user");

    for (const loan of dueLoans) {
      const user = await User.findById(loan.user._id);
      const holderRecord = await AccountHolder.findOne({ user: user._id });
      const account = holderRecord ? await Account.findById(holderRecord.account) : null;

      if (!account) {
        console.warn(`Loan repayment cron: no account found for user ${user._id}, skipping loan ${loan._id}`);
        continue;
      }

      const installment = Math.min(loan.monthlyPayment, loan.remainingBalance);

      if (account.balance >= installment) {
        account.balance -= installment;
        await account.save();

        loan.remainingBalance = Math.round((loan.remainingBalance - installment) * 100) / 100;
        loan.payments.push({ amount: installment, paidAt: new Date(), onTime: true });

        const reference = generateReference();
        await Transaction.create({
          reference,
          type: "loan_payment",
          sender: user._id,
          senderAccount: account._id,
          amount: installment,
          currency: account.currency,
          balanceAfterSender: account.balance,
          description: `${loan.type.charAt(0).toUpperCase() + loan.type.slice(1)} loan payment`,
          category: "Loan",
          status: "completed",
        });

        await notifyTransaction(user, {
          action: "debited",
          amount: installment,
          currency: account.currency,
          balance: account.balance,
          reference,
          date: new Date().toLocaleString("en-US"),
        });

        if (loan.remainingBalance <= 0) {
          loan.status = "paid_off";
          await notifyGeneral(user, {
            title: "Loan paid off",
            message: `Congratulations — your ${loan.type} loan has been fully paid off.`,
            type: "account",
            email: true,
          });
        } else {
          const next = new Date(loan.nextPaymentDate);
          next.setMonth(next.getMonth() + 1);
          loan.nextPaymentDate = next;
        }
      } else {
        // Insufficient funds — log a missed payment, don't advance the due date
        loan.payments.push({ amount: 0, paidAt: new Date(), onTime: false });
        await notifyGeneral(user, {
          title: "Loan payment failed",
          message: `Your ${loan.type} loan payment of ${account.currency} ${installment.toFixed(2)} could not be processed due to insufficient balance. Please add funds as soon as possible.`,
          type: "account",
          email: true,
        });
      }

      await loan.save();
    }

    console.log(`Loan repayment cron: processed ${dueLoans.length} due loans`);
  } catch (error) {
    console.error("Loan repayment cron error:", error.message);
  }
});