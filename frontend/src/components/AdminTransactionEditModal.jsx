import { useState } from "react";
import { X, Save } from "lucide-react";
import api from "../api/axios";
import CustomSelect from "./CustomSelect";

const statusEditOptions = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "reversed", label: "Reversed" },
];

const categoryEditOptions = [
  { value: "Transfer", label: "Local Transfer" },
  { value: "International Transfer", label: "International Transfer" },
  { value: "Zelle", label: "Zelle" },
  { value: "PayPal", label: "PayPal" },
  { value: "Bill Payment", label: "Bill Payment" },
  { value: "Loan", label: "Loan" },
  { value: "Grant", label: "Grant" },
  { value: "Tax Refund", label: "Tax Refund" },
  { value: "Interest", label: "Interest" },
  { value: "Other", label: "Other" },
];

// Formats a Date/ISO string into the value <input type="datetime-local"> expects
const toDatetimeLocal = (value) => {
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Accepts a populated object ({ _id, ... }) or a plain id; returns the id as a string
const idOf = (v) => (v ? String(v._id || v) : null);

const AdminTransactionEditModal = ({
  transaction,
  onClose,
  onSaved,
  contextAccountId,
  contextUserId,
}) => {
  const senderAcc = idOf(transaction.senderAccount);
  const receiverAcc = idOf(transaction.receiverAccount);
  const senderUser = idOf(transaction.sender);
  const receiverUser = idOf(transaction.receiver);
  const hasSender = Boolean(senderAcc || senderUser);
  const hasReceiver = Boolean(receiverAcc || receiverUser);
  const isTwoParty = hasSender && hasReceiver;

  // Debit/credit relative to the ACCOUNT being viewed (so joint holders see
  // the right direction for each other's transactions). Falls back to the
  // user for older transactions without account ids. With no context:
  // sender only = debit, receiver only = credit, two parties = relative to sender.
  const isContextSender =
    contextAccountId && (senderAcc || receiverAcc)
      ? senderAcc === String(contextAccountId)
      : contextUserId
        ? senderUser === String(contextUserId)
        : null;

  const originalDirection =
    isContextSender !== null
      ? isContextSender
        ? "debit"
        : "credit"
      : hasSender
        ? "debit"
        : "credit";

  const senderName = transaction.sender?.firstName
    ? `${transaction.sender.firstName} ${transaction.sender.lastName}`
    : null;

  const canFlip = transaction.type !== "loan_disbursement";
  const [direction, setDirection] = useState(originalDirection);
  const isFlipped = direction !== originalDirection;
  const hasContext = Boolean(contextAccountId || contextUserId);

  const [form, setForm] = useState({
    amount: transaction.amount,
    status: transaction.status,
    description: transaction.description || "",
    category: transaction.category || "",
    createdAt: toDatetimeLocal(transaction.createdAt),
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        amount: parseFloat(form.amount),
        status: form.status,
        description: form.description,
        category: form.category,
        createdAt: new Date(form.createdAt).toISOString(),
        flipDirection: isFlipped,
      };

      const res = await api.put(
        `/admin/transactions/${transaction._id}`,
        payload,
      );

      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update transaction");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-navy-900/40 backdrop-blur-sm px-0 sm:px-4">
      <div className="bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-3xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-navy-900">Edit Transaction</p>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-navy transition"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Ref: {transaction.reference}
        </p>

        <form onSubmit={save} className="space-y-3">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <input
            required
            type="number"
            step="0.01"
            placeholder="Amount"
            value={form.amount}
                       onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            className="input-field"
          />

          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Direction
              {isTwoParty && !hasContext && senderName
                ? ` (for ${senderName})`
                : ""}
            </label>
            <div className="flex gap-2">
              {["debit", "credit"].map((d) => (
                <button
                  key={d}
                  type="button"
                  disabled={!canFlip}
                  onClick={() => setDirection(d)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition disabled:opacity-50 ${
                    direction === d
                      ? d === "credit"
                        ? "bg-emerald-500 text-white"
                        : "bg-red-500 text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            {!canFlip && (
              <p className="text-[11px] text-slate-400 mt-1.5">
                Loan disbursements can't be switched to a debit.
              </p>
            )}
            {isFlipped && (
              <p className="text-[11px] text-gold-700 bg-gold-50 rounded-lg px-3 py-2 mt-2">
                Switching to {direction} moves the balance by twice the amount
                (undo the {originalDirection}, then apply the {direction})
                {isTwoParty ? " for both accounts in this transfer" : ""}.
              </p>
            )}
          </div>

          <CustomSelect
            value={form.status}
            onChange={(v) => setForm((f) => ({ ...f, status: v }))}
            options={statusEditOptions}
            placeholder="Status"
          />
          <CustomSelect
            value={form.category}
            onChange={(v) => setForm((f) => ({ ...f, category: v }))}
            options={categoryEditOptions}
            placeholder="Category"
          />
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="input-field"
          />
          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Transaction Date & Time
            </label>
            <input
              required
              type="datetime-local"
              value={form.createdAt}
              onChange={(e) =>
                setForm((f) => ({ ...f, createdAt: e.target.value }))
              }
              className="input-field"
            />
          </div>

          <p className="text-[11px] text-slate-400">
            Changing the amount or status will automatically adjust the affected
            user's balance to stay consistent.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminTransactionEditModal;
