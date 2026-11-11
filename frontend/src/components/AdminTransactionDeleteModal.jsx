import { useState } from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";
import api from "../api/axios";

const AdminTransactionDeleteModal = ({ transaction, onClose, onDeleted }) => {
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const isCompleted = transaction.status === "completed";

  const confirmDelete = async () => {
    setError("");
    setDeleting(true);
    try {
      const { data } = await api.delete(
        `/admin/transactions/${transaction._id}`,
      );
      onDeleted(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete transaction");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-navy-900/40 backdrop-blur-sm px-0 sm:px-4">
      <div className="bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-3xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-navy-900">Delete Transaction</p>
          <button
            onClick={onClose}
            disabled={deleting}
            className="text-slate-400 hover:text-navy transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center text-center mb-5">
          <div className="h-14 w-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-3">
            <AlertTriangle size={26} />
          </div>
          <p className="text-lg font-bold text-navy-900">
            {transaction.currency} {transaction.amount?.toFixed(2)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Ref: {transaction.reference}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {transaction.description || transaction.category}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <div className="bg-slate-50 rounded-xl px-4 py-3 mb-5 text-xs text-slate-500 leading-relaxed">
          {isCompleted
            ? "This transaction is completed, so deleting it will reverse its effect on every affected balance — debits are refunded and credits are removed."
            : `This transaction is ${transaction.status}, so it never moved money. Deleting it won't change any balance.`}{" "}
          This can't be undone.
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 size={15} /> {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactionDeleteModal;