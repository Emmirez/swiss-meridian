import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Search, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api/axios";
import TopBar from "../components/TopBar";
import { useAuth } from "../context/AuthContext";
import { useUserMenu } from "../components/DashboardLayout";
import TransactionDetailModal from "../components/TransactionDetailModal";

const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount || 0);

const Transactions = () => {
  const { user } = useAuth();
  const { onMenuClick } = useUserMenu();
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/transactions/me?page=${page}&limit=15`)
      .then((res) => {
        setTransactions(res.data.transactions);
        setPages(res.data.pages || 1);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const filtered = transactions.filter((tx) =>
    (tx.description || tx.category || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <TopBar onMenuClick={onMenuClick} />

      <div className="px-4 md:px-8">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-navy-900">Transaction History</h1>
          <p className="text-sm text-slate-400 mt-0.5">Every transfer, deposit, and adjustment on your account.</p>
        </div>

        <div className="relative mb-5 max-w-md">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field !pl-10"
          />
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <p className="text-sm text-slate-400 p-8 text-center">Loading transactions...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-400 p-8 text-center">No transactions found.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map((tx) => {
                const isCredit = tx.receiver?._id === user?.id || tx.type === "adjustment_credit";
                return (
                  <button
                    key={tx._id}
                    onClick={() => setSelectedId(tx._id)}
                    className="w-full flex items-center gap-3 px-4 md:px-6 py-4 text-left hover:bg-slate-50/60 transition-colors"
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${isCredit ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                      {isCredit ? <ArrowDownRight size={17} /> : <ArrowUpRight size={17} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy-900 truncate">{tx.description || tx.category}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(tx.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        {" · "}{tx.reference}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${isCredit ? "text-emerald-600" : "text-red-500"}`}>
                        {isCredit ? "+" : "-"}{formatMoney(tx.amount, tx.currency)}
                      </p>
                      <p className="text-[11px] text-slate-400 capitalize">{tx.status}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-5">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary !p-2 disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-slate-500">Page {page} of {pages}</span>
            <button disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="btn-secondary !p-2 disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <TransactionDetailModal
        transactionId={selectedId}
        currentUserId={user?.id}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
};

export default Transactions;