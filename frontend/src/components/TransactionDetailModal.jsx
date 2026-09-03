import { useEffect, useState } from "react";
import {
  X,
  ArrowDownRight,
  ArrowUpRight,
  Globe2,
  Building2,
  Landmark,
} from "lucide-react";
import api from "../api/axios";

const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount || 0,
  );

const typeLabels = {
  transfer_internal: "Swiss Meridian Transfer",
  transfer_external: "External Bank Transfer",
  transfer_international: "International Transfer",
  adjustment_credit: "Credit",
  adjustment_debit: "Debit",
  deposit: "Deposit",
  withdrawal: "Withdrawal",
};

const Row = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-sm font-medium text-navy-900 text-right">
        {value}
      </span>
    </div>
  );
};

const TransactionDetailModal = ({ transactionId, currentUserId, onClose }) => {
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!transactionId) return;
    setLoading(true);
    api
      .get(`/transactions/${transactionId}`)
      .then((res) => setTx(res.data.transaction))
      .catch(() => setError("Could not load transaction details"))
      .finally(() => setLoading(false));
  }, [transactionId]);

  if (!transactionId) return null;

  const isCredit =
    tx?.receiver?._id === currentUserId || tx?.type === "adjustment_credit";
  const modeIcon =
    tx?.type === "transfer_international"
      ? Globe2
      : tx?.type === "transfer_external"
        ? Building2
        : Landmark;
  const ModeIcon = modeIcon;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-navy-900/40 backdrop-blur-sm px-0 sm:px-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white">
          <p className="font-semibold text-navy-900">Transaction Details</p>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-navy transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <p className="text-sm text-slate-400 text-center py-10">
              Loading...
            </p>
          ) : error ? (
            <p className="text-sm text-red-500 text-center py-10">{error}</p>
          ) : tx ? (
            <>
              {/* Amount hero */}
              <div className="text-center py-4">
                <div
                  className={`h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-3 ${isCredit ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
                >
                  {isCredit ? (
                    <ArrowDownRight size={24} />
                  ) : (
                    <ArrowUpRight size={24} />
                  )}
                </div>
                <p
                  className={`text-2xl font-bold ${isCredit ? "text-emerald-600" : "text-red-500"}`}
                >
                  {isCredit ? "+" : "-"}
                  {formatMoney(tx.amount, tx.currency)}
                </p>
                {tx.fee > 0 && (
                  <p className="text-xs text-slate-400 mt-1">
                    + {formatMoney(tx.fee, tx.currency)} transfer fee · Total{" "}
                    {formatMoney(tx.amount + tx.fee, tx.currency)}
                  </p>
                )}
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full mt-3">
                  <ModeIcon size={12} /> {typeLabels[tx.type] || tx.type}
                </span>
              </div>

              {/* Core details */}
              <div className="mt-2">
                <Row label="Reference" value={tx.reference} />
                <Row
                  label="Status"
                  value={<span className="capitalize">{tx.status}</span>}
                />
                <Row label="Category" value={tx.category} />
                <Row
                  label="Date"
                  value={new Date(tx.createdAt).toLocaleString("en-US")}
                />
                <Row label="Description" value={tx.description} />
              </div>

              {/* Internal transfer parties */}
              {tx.type === "transfer_internal" && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                    Transfer Details
                  </p>
                  <Row
                    label="From"
                    value={
                      tx.sender
                        ? `${tx.sender.firstName} ${tx.sender.lastName}`
                        : "—"
                    }
                  />
                  <Row
                    label="To"
                    value={
                      tx.receiver
                        ? `${tx.receiver.firstName} ${tx.receiver.lastName}`
                        : "—"
                    }
                  />
                  <Row label="To Account" value={tx.receiver?.accountNumber} />
                </div>
              )}

              {/* External bank transfer */}
              {tx.type === "transfer_external" && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                    Recipient Bank
                  </p>
                  <Row label="Bank Name" value={tx.externalBankName} />
                  <Row label="Account Holder" value={tx.externalAccountName} />
                  <Row
                    label="Account Number"
                    value={tx.externalAccountNumber}
                  />
                  <Row
                    label="Routing Number"
                    value={tx.externalRoutingNumber}
                  />
                </div>
              )}

              {/* International transfer */}
              {tx.type === "transfer_international" && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                    International Wire Details
                  </p>
                  <Row label="Destination Country" value={tx.externalCountry} />
                  <Row label="Recipient Name" value={tx.externalAccountName} />
                  <Row label="Bank Name" value={tx.externalBankName} />
                  <Row
                    label="SWIFT / BIC"
                    value={
                      <span className="tracking-wide">
                        {tx.externalSwiftCode}
                      </span>
                    }
                  />
                  <Row label="IBAN / Account No." value={tx.externalIban} />
                  <Row label="Bank Address" value={tx.externalBankAddress} />
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;
