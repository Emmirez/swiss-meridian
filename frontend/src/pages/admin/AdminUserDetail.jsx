import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Snowflake,
  Ban,
  PlayCircle,
  Wallet,
  Gauge,
  Pencil,
} from "lucide-react";
import api from "../../api/axios";
import TopBar from "../../components/TopBar";
import AdminTransactionEditModal from "../../components/AdminTransactionEditModal";
import { useAdminMenu } from "../../components/AdminLayout";

const AdminUserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [adjustType, setAdjustType] = useState("credit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [limitsForm, setLimitsForm] = useState({
    dailyLimit: "",
    weeklyLimit: "",
    monthlyLimit: "",
    perTransactionLimit: "",
  });
  const [editingTx, setEditingTx] = useState(null);
  const { onMenuClick } = useAdminMenu();

  const [coHolders, setCoHolders] = useState([]);

  const load = () => {
    api
      .get(`/admin/users/${id}`)
      .then((res) => {
        setUser(res.data.user);
        setTransactions(res.data.transactions);
        setCoHolders(res.data.coHolders || []);
        const limits = res.data.account?.limits;
        setLimitsForm({
          dailyLimit: limits?.dailyLimit ?? 500000,
          weeklyLimit: limits?.weeklyLimit ?? 1000000,
          monthlyLimit: limits?.monthlyLimit ?? 5000000,
          perTransactionLimit: limits?.perTransactionLimit ?? 250000,
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const setStatus = async (status) => {
    await api.put(`/admin/users/${id}/status`, { status });
    setMessage(`Status updated to ${status}`);
    load();
  };

  const approve = async () => {
    await api.put(`/admin/users/${id}/approve`);
    setMessage("User approved");
    load();
  };
  const reject = async () => {
    await api.put(`/admin/users/${id}/reject`, {});
    setMessage("User rejected");
    load();
  };

  const adjust = async (e) => {
    e.preventDefault();
    await api.post(`/admin/users/${id}/adjust`, {
      type: adjustType,
      amount: parseFloat(amount),
      note,
    });
    setAmount("");
    setNote("");
    setMessage(`Balance ${adjustType}ed`);
    load();
  };

  const saveLimits = async (e) => {
    e.preventDefault();
    await api.put(`/admin/users/${id}/limits`, {
      dailyLimit: parseFloat(limitsForm.dailyLimit),
      weeklyLimit: parseFloat(limitsForm.weeklyLimit),
      monthlyLimit: parseFloat(limitsForm.monthlyLimit),
      perTransactionLimit: parseFloat(limitsForm.perTransactionLimit),
    });
    setMessage("Account limits updated");
    load();
  };

  if (loading)
    return <div className="p-8 text-slate-400 text-sm">Loading user...</div>;
  if (!user)
    return <div className="p-8 text-slate-400 text-sm">User not found.</div>;

  return (
    <div>
      <TopBar
        notificationsHref="/admin/notifications"
        onMenuClick={onMenuClick}
        profileHref={null}
      />

      <div className="px-4 md:px-8 space-y-6 pb-6 min-w-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-navy-900">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">{user.email}</p>
        </div>

        {message && (
          <div className="bg-emerald-50 text-emerald-600 text-sm rounded-xl px-4 py-3">
            {message}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-5">
          <div className="card p-5">
            <p className="text-xs text-slate-400 mb-1">Account Number</p>
            <p className="font-semibold text-navy-900">{user.accountNumber}</p>
            <p className="text-xs text-slate-400 mt-3 mb-1">Type / Currency</p>
            <p className="font-semibold text-navy-900 capitalize">
              {user.accountType?.replace("_", " ")} · {user.currency}
              {user.isJoint && (
                <span className="ml-2 text-[10px] font-semibold bg-navy-50 text-navy px-2 py-0.5 rounded-full align-middle">
                  Joint
                </span>
              )}
            </p>
            <p className="text-xs text-slate-400 mt-3 mb-1">Balance</p>
            <p className="font-semibold text-navy-900">
              {user.currency} {user.balance?.toFixed(2)}
            </p>
            <p className="text-xs text-slate-400 mt-3 mb-1">Status</p>
            <p className="font-semibold text-navy-900 capitalize">
              {user.status}
            </p>

            {user.isJoint && coHolders.length > 1 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-2">Account Holders</p>
                <div className="space-y-1.5">
                  {coHolders.map(({ user: holder, role }) => (
                    <div
                      key={holder._id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-navy-900">
                        {holder.firstName} {holder.lastName}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${role === "primary" ? "bg-gold-50 text-gold-700" : "bg-slate-100 text-slate-500"}`}
                      >
                        {role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card p-5">
            <p className="text-sm font-semibold text-navy-900 mb-3">
              Account Actions
            </p>
            <div className="flex flex-col gap-2">
              {user.status === "pending" && (
                <>
                  <button
                    onClick={approve}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-2 text-sm font-medium flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={15} /> Approve Account
                  </button>
                  <button
                    onClick={reject}
                    className="bg-red-50 hover:bg-red-100 text-red-500 rounded-xl py-2 text-sm font-medium flex items-center justify-center gap-1.5"
                  >
                    <XCircle size={15} /> Reject Application
                  </button>
                </>
              )}
              {user.status === "active" && (
                <>
                  <button
                    onClick={() => setStatus("suspended")}
                    className="btn-secondary flex items-center justify-center gap-1.5 text-sm"
                  >
                    <Ban size={15} /> Suspend Account
                  </button>
                  <button
                    onClick={() => setStatus("frozen")}
                    className="btn-secondary flex items-center justify-center gap-1.5 text-sm"
                  >
                    <Snowflake size={15} /> Freeze Account
                  </button>
                </>
              )}
              {(user.status === "suspended" || user.status === "frozen") && (
                <button
                  onClick={() => setStatus("active")}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-2 text-sm font-medium flex items-center justify-center gap-1.5"
                >
                  <PlayCircle size={15} /> Reactivate Account
                </button>
              )}
            </div>
          </div>

          <form onSubmit={adjust} className="card p-5">
            <p className="text-sm font-semibold text-navy-900 mb-3 flex items-center gap-2">
              <Wallet size={16} /> Manual Balance Adjustment
            </p>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setAdjustType("credit")}
                className={`flex-1 py-2 rounded-xl text-sm font-medium ${adjustType === "credit" ? "bg-navy text-white" : "bg-slate-100 text-slate-500"}`}
              >
                Credit
              </button>
              <button
                type="button"
                onClick={() => setAdjustType("debit")}
                className={`flex-1 py-2 rounded-xl text-sm font-medium ${adjustType === "debit" ? "bg-navy text-white" : "bg-slate-100 text-slate-500"}`}
              >
                Debit
              </button>
            </div>
            <input
              required
              type="number"
              step="0.01"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field mb-2"
            />
            <input
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input-field mb-3"
            />
            <button type="submit" className="btn-gold w-full">
              Apply Adjustment
            </button>
          </form>

          <form onSubmit={saveLimits} className="card p-5">
            <p className="text-sm font-semibold text-navy-900 mb-3 flex items-center gap-2">
              <Gauge size={16} /> Account Limits
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-slate-400">Daily Limit</label>
                <input
                  type="number"
                  value={limitsForm.dailyLimit}
                  onChange={(e) =>
                    setLimitsForm((f) => ({ ...f, dailyLimit: e.target.value }))
                  }
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Weekly Limit</label>
                <input
                  type="number"
                  value={limitsForm.weeklyLimit}
                  onChange={(e) =>
                    setLimitsForm((f) => ({
                      ...f,
                      weeklyLimit: e.target.value,
                    }))
                  }
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Monthly Limit</label>
                <input
                  type="number"
                  value={limitsForm.monthlyLimit}
                  onChange={(e) =>
                    setLimitsForm((f) => ({
                      ...f,
                      monthlyLimit: e.target.value,
                    }))
                  }
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">
                  Per-Transaction Limit
                </label>
                <input
                  type="number"
                  value={limitsForm.perTransactionLimit}
                  onChange={(e) =>
                    setLimitsForm((f) => ({
                      ...f,
                      perTransactionLimit: e.target.value,
                    }))
                  }
                  className="input-field mt-1"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full">
              Save Limits
            </button>
          </form>
        </div>

        <div className="card p-5">
          <p className="text-sm font-semibold text-navy-900 mb-4">
            Recent Transactions
          </p>
          {transactions.length === 0 ? (
            <p className="text-sm text-slate-400">No transactions yet.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {transactions.map((tx) => (
                <div
                  key={tx._id}
                  className="flex justify-between items-center py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-navy-900">
                      {tx.description || tx.category}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(tx.createdAt).toLocaleString("en-US")} ·{" "}
                      {tx.reference}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-navy-900">
                      {tx.currency} {tx.amount?.toFixed(2)}
                    </p>
                    <button
                      onClick={() => setEditingTx(tx)}
                      className="text-navy hover:text-gold-700 transition"
                    >
                      <Pencil size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editingTx && (
        <AdminTransactionEditModal
          transaction={editingTx}
          onClose={() => setEditingTx(null)}
          onSaved={() => {
            setEditingTx(null);
            load();
          }}
        />
      )}
    </div>
  );
};

export default AdminUserDetail;
