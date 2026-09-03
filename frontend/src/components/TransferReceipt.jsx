import { CheckCircle2, Printer, Copy, Check, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount || 0,
  );

const modeLabels = {
  internal: "Swiss Meridian Transfer",
  external: "Local Bank Transfer",
  international: "International Wire",
  zelle: "Zelle",
  paypal: "PayPal",
};

const Row = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2 border-b border-dashed border-slate-200 last:border-0">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-sm font-medium text-navy-900 text-right">
        {value}
      </span>
    </div>
  );
};

const TransferReceipt = ({ mode, transaction, recipient, onNewTransfer }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyDetails = () => {
    const text = [
      `Swiss Meridian Bank — Transfer Receipt`,
      `Reference: ${transaction.reference}`,
      `Amount: ${formatMoney(transaction.amount, transaction.currency)}`,
      recipient ? `Recipient: ${recipient}` : null,
      `Method: ${modeLabels[mode]}`,
      `Status: ${transaction.status}`,
      `Date: ${new Date(transaction.createdAt || Date.now()).toLocaleString("en-US")}`,
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      <div id="receipt-print-area" className="card p-6">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={30} />
          </div>
          <h3 className="text-xl font-bold text-navy-900">
            Transfer Successful
          </h3>
          <p className="text-3xl font-bold text-navy-900 mt-3">
            {formatMoney(transaction.amount, transaction.currency)}
          </p>
          {transaction.fee > 0 && (
            <p className="text-xs text-slate-400 mt-1">
              + {formatMoney(transaction.fee, transaction.currency)} fee · Total{" "}
              {formatMoney(
                transaction.amount + transaction.fee,
                transaction.currency,
              )}
            </p>
          )}
          {transaction.convertedAmount && transaction.convertedCurrency && (
            <p className="text-xs text-slate-400 mt-1">
              Recipient receives{" "}
              {formatMoney(
                transaction.convertedAmount,
                transaction.convertedCurrency,
              )}{" "}
              (rate: 1 {transaction.currency} = {transaction.exchangeRate}{" "}
              {transaction.convertedCurrency})
            </p>
          )}
          <span className="inline-block text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full mt-3">
            {modeLabels[mode]}
          </span>
        </div>

        <div className="my-5 border-t border-dashed border-slate-200" />

        <div>
          <Row label="Reference" value={transaction.reference} />
          <Row
            label="From"
            value={`${user?.firstName} ${user?.lastName} (${user?.accountNumber})`}
          />
          <Row label="To" value={recipient} />
          <Row
            label="Status"
            value={<span className="capitalize">{transaction.status}</span>}
          />
          <Row
            label="Date"
            value={new Date(transaction.createdAt || Date.now()).toLocaleString(
              "en-US",
            )}
          />
          {transaction.description && (
            <Row label="Note" value={transaction.description} />
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-dashed border-slate-200 text-center">
          <p className="text-[11px] text-slate-400">
            Swiss Meridian Bank · Keep this receipt for your records
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
        >
          <Printer size={15} /> Print
        </button>
        <button
          onClick={copyDetails}
          className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
        >
          {copied ? (
            <Check size={15} className="text-emerald-500" />
          ) : (
            <Copy size={15} />
          )}{" "}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <button
        onClick={onNewTransfer}
        className="btn-primary w-full mt-3 flex items-center justify-center gap-2 print:hidden"
      >
        Make Another Transfer <ArrowRight size={16} />
      </button>
    </div>
  );
};

export default TransferReceipt;
