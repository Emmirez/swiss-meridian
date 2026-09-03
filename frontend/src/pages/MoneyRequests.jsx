import { useEffect, useState } from "react";
import {
  HandCoins,
  Plus,
  X,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock3,
  Ban,
} from "lucide-react";
import api from "../api/axios";
import TopBar from "../components/TopBar";
import { useUserMenu } from "../components/DashboardLayout";

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-gold-50 text-gold-700",
    icon: Clock3,
  },
  approved: {
    label: "Paid",
    color: "bg-emerald-50 text-emerald-600",
    icon: CheckCircle2,
  },
  declined: {
    label: "Declined",
    color: "bg-red-50 text-red-500",
    icon: XCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-slate-100 text-slate-500",
    icon: Ban,
  },
};

const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount || 0,
  );

const MoneyRequests = () => {
  const { onMenuClick } = useUserMenu();
  const [tab, setTab] = useState("received");
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ identifier: "", amount: "", note: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [approving, setApproving] = useState(null); // request being approved (needs PIN)
  const [pin, setPin] = useState("");
  const [approveError, setApproveError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/requests/received"), api.get("/requests/sent")])
      .then(([r1, r2]) => {
        setReceived(r1.data.requests);
        setSent(r2.data.requests);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const submitRequest = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await api.post("/requests", form);
      setForm({ identifier: "", amount: "", note: "" });
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not send request");
    } finally {
      setSubmitting(false);
    }
  };

  const decline = async (id) => {
    await api.post(`/requests/${id}/decline`);
    load();
  };

  const cancel = async (id) => {
    await api.post(`/requests/${id}/cancel`);
    load();
  };

  const submitApprove = async (e) => {
    e.preventDefault();
    setApproveError("");
    try {
      await api.post(`/requests/${approving._id}/approve`, { pin });
      setApproving(null);
      setPin("");
      load();
    } catch (err) {
      setApproveError(
        err.response?.data?.message || "Could not approve request",
      );
    }
  };

  const list = tab === "received" ? received : sent;

  return (
    <div>
      <TopBar onMenuClick={onMenuClick} />

      <div className="px-4 md:px-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-navy-900">
              Request Money
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Ask another Swiss Meridian Bank user to send you money.
            </p>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="btn-primary flex items-center gap-2 !py-2.5 shrink-0"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}{" "}
            {showForm ? "Cancel" : "New Request"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={submitRequest} className="card p-5 space-y-3 mb-6">
            {formError && (
              <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
                {formError}
              </div>
            )}
            <input
              required
              placeholder="Their email or phone number"
              value={form.identifier}
              onChange={(e) =>
                setForm((f) => ({ ...f, identifier: e.target.value }))
              }
              className="input-field"
            />
            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: e.target.value }))
              }
              className="input-field"
            />
            <input
              placeholder="What's this for? (optional)"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              className="input-field"
            />
            <button
              type="submit"
              disabled={submitting}
              className="btn-gold w-full"
            >
              {submitting ? "Sending..." : "Send Request"}
            </button>
          </form>
        )}

        <div className="flex gap-2 mb-5 bg-white rounded-2xl p-1.5 shadow-soft w-fit">
          <button
            onClick={() => setTab("received")}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition ${tab === "received" ? "bg-navy text-white" : "text-slate-500"}`}
          >
            Received
          </button>
          <button
            onClick={() => setTab("sent")}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition ${tab === "sent" ? "bg-navy text-white" : "text-slate-500"}`}
          >
            Sent
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading requests...</p>
        ) : list.length === 0 ? (
          <div className="card p-10 text-center text-slate-400 text-sm">
            <HandCoins size={28} className="mx-auto mb-3 text-slate-300" />
            {tab === "received"
              ? "No money requests received yet."
              : "You haven't sent any requests yet."}
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((r) => {
              const config = statusConfig[r.status];
              const StatusIcon = config.icon;
              const otherPerson = tab === "received" ? r.requester : r.payer;
              return (
                <div key={r._id} className="card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-navy-900 text-sm">
                        {tab === "received"
                          ? `${otherPerson?.firstName} ${otherPerson?.lastName} requested`
                          : `You requested from ${otherPerson?.firstName} ${otherPerson?.lastName}`}
                      </p>
                      {r.note && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {r.note}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(r.createdAt).toLocaleDateString("en-US")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-navy-900">
                        {formatMoney(r.amount, r.currency)}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${config.color}`}
                      >
                        <StatusIcon size={11} /> {config.label}
                      </span>
                    </div>
                  </div>

                  {tab === "received" && r.status === "pending" && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          setApproving(r);
                          setPin("");
                          setApproveError("");
                        }}
                        className="btn-primary !py-2 flex-1 text-sm"
                      >
                        Pay
                      </button>
                      <button
                        onClick={() => decline(r._id)}
                        className="btn-secondary !py-2 flex-1 text-sm"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                  {tab === "sent" && r.status === "pending" && (
                    <button
                      onClick={() => cancel(r._id)}
                      className="btn-secondary !py-2 w-full text-sm mt-3"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Approve (pay) modal */}
      {approving && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-navy-900/40 backdrop-blur-sm px-0 sm:px-4">
          <div className="bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-navy-900">Confirm Payment</p>
              <button
                onClick={() => setApproving(null)}
                className="text-slate-400 hover:text-navy transition"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Pay {formatMoney(approving.amount, approving.currency)} to{" "}
              {approving.requester?.firstName} {approving.requester?.lastName}?
            </p>
            <form onSubmit={submitApprove} className="space-y-3">
              {approveError && (
                <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
                  {approveError}
                </div>
              )}
              <div className="relative">
                <KeyRound
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  required
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="4-digit transaction PIN"
                  value={pin}
                  onChange={(e) =>
                    setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  className="input-field !pl-10 tracking-widest"
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Confirm Payment <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoneyRequests;
