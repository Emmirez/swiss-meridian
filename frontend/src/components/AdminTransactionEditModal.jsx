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

const AdminTransactionEditModal = ({ transaction, onClose, onSaved }) => {
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
