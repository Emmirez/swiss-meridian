import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  X,
  Send,
  Clock3,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import api from "../api/axios";

const kycStatusConfig = {
  approved: {
    label: "Verified",
    color: "bg-emerald-50 text-emerald-600",
    icon: ShieldCheck,
  },
  pending: {
    label: "Pending",
    color: "bg-gold-50 text-gold-700",
    icon: Clock3,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-50 text-red-500",
    icon: ShieldAlert,
  },
  not_submitted: {
    label: "Not Verified",
    color: "bg-slate-100 text-slate-500",
    icon: ShieldAlert,
  },
};

const AccountHoldersCard = () => {
  const [holders, setHolders] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api
      .get("/users/account/holders")
      .then((res) => {
        setHolders(res.data.holders);
        setPendingInvites(res.data.pendingInvites);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.name || !form.email)
      return setError("Please provide both name and email");
    setSubmitting(true);
    try {
      await api.post("/users/account/invite-joint-holder", form);
      setSuccess(`Invite sent to ${form.email}`);
      setForm({ name: "", email: "" });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not send invite");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-6 text-sm text-slate-400">
        Loading account holders...
      </div>
    );
  }

  const isJoint = holders.length > 1;

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-navy-50 text-navy flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="font-semibold text-navy-900">Account Holders</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {isJoint
                ? "This is a joint account"
                : "Only you have access to this account"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="btn-secondary !py-2 !px-3 text-sm flex items-center gap-1.5 shrink-0"
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}{" "}
          {showForm ? "Cancel" : "Invite"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-3">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 text-emerald-600 text-sm rounded-xl px-4 py-3 mb-3">
          {success}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={submit}
          className="bg-slate-50 rounded-xl p-4 space-y-3 mb-4"
        >
          <p className="text-xs text-slate-500">
            Invite someone to become a joint holder on this account. They'll
            complete their own registration with full access.
          </p>
          <input
            required
            placeholder="Their full name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input-field"
          />
          <input
            required
            type="email"
            placeholder="Their email address"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="input-field"
          />
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
          >
            <Send size={15} /> {submitting ? "Sending..." : "Send Invite"}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {holders.map(({ user, role }) => {
          const config =
            kycStatusConfig[user.kycStatus] || kycStatusConfig.not_submitted;
          const StatusIcon = config.icon;
          return (
            <div
              key={user._id}
              className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-navy-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${role === "primary" ? "bg-gold-50 text-gold-700" : "bg-slate-100 text-slate-500"}`}
                >
                  {role}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${config.color}`}
                >
                  <StatusIcon size={10} /> {config.label}
                </span>
              </div>
            </div>
          );
        })}

        {pendingInvites.map((invite) => (
          <div
            key={invite.email}
            className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
          >
            <div>
              <p className="text-sm font-medium text-navy-900">{invite.name}</p>
              <p className="text-xs text-slate-400">{invite.email}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full shrink-0">
              <Clock3 size={10} /> Invite Pending
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountHoldersCard;
