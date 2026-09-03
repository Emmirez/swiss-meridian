import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import api from "../../api/axios";
import TopBar from "../../components/TopBar";
import CustomSelect from "../../components/CustomSelect";
import AdminTransactionEditModal from "../../components/AdminTransactionEditModal";
import { useAdminMenu } from "../../components/AdminLayout";

const typeOptions = [
  { value: "", label: "All types" },
  { value: "transfer_internal", label: "Internal Transfer" },
  { value: "transfer_external", label: "External Transfer" },
  { value: "transfer_international", label: "International Transfer" },
  { value: "transfer_zelle", label: "Zelle" },
  { value: "transfer_paypal", label: "PayPal" },
  { value: "bill_payment", label: "Bill Payment" },
  { value: "loan_disbursement", label: "Loan Disbursement" },
  { value: "loan_payment", label: "Loan Payment" },
  { value: "adjustment_credit", label: "Admin Credit" },
  { value: "adjustment_debit", label: "Admin Debit" },
];

const AdminTransactions = () => {
  const { onMenuClick } = useAdminMenu();
  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const loadTransactions = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (type) params.set("type", type);
    api
      .get(`/admin/transactions?${params}`)
      .then((res) => {
        setTransactions(res.data.transactions);
        setPages(res.data.pages || 1);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTransactions();
  }, [type, page]);

  return (
    <div>
      <TopBar
        title="All Transactions"
        subtitle="Platform-wide transaction monitoring."
        notificationsHref="/admin/notifications"
        onMenuClick={onMenuClick}
      />

      <div className="px-4 md:px-8">
        <div className="sm:w-56 mb-5">
          <CustomSelect
            value={type}
            onChange={(v) => {
              setType(v);
              setPage(1);
            }}
            options={typeOptions}
            placeholder="All types"
          />
        </div>

        <div className="card overflow-x-auto">
          {loading ? (
            <p className="text-sm text-slate-400 p-8 text-center">
              Loading transactions...
            </p>
          ) : (
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="text-left text-xs text-slate-400 uppercase border-b border-slate-100">
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">To</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-slate-500">{tx.reference}</td>
                    <td className="px-4 py-3 capitalize text-slate-500">
                      {tx.type.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 text-navy-900">
                      {tx.sender
                        ? `${tx.sender.firstName} ${tx.sender.lastName}`
                        : tx.externalAccountName || "—"}
                    </td>
                    <td className="px-4 py-3 text-navy-900">
                      {tx.receiver
                        ? `${tx.receiver.firstName} ${tx.receiver.lastName}`
                        : tx.externalBankName || "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-navy-900">
                      {tx.currency} {tx.amount?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-500">
                      {tx.status}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditing(tx)}
                        className="text-navy hover:text-gold-700 transition"
                      >
                        <Pencil size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-5">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="btn-secondary !p-2 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-slate-500">
              Page {page} of {pages}
            </span>
            <button
              disabled={page === pages}
              onClick={() => setPage((p) => p + 1)}
              className="btn-secondary !p-2 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {editing && (
        <AdminTransactionEditModal
          transaction={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            loadTransactions();
          }}
        />
      )}
    </div>
  );
};

export default AdminTransactions;
