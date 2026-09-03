import { useEffect, useState } from "react";
import {
  LifeBuoy,
  Plus,
  X,
  Send,
  ArrowLeft,
  Clock3,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ArrowLeftRight,
  CreditCard,
  Wallet,
  ShieldCheck,
  PlusCircle,
  TrendingUp,
} from "lucide-react";
import api from "../api/axios";
import TopBar from "../components/TopBar";
import CustomSelect from "../components/CustomSelect";
import { useUserMenu } from "../components/DashboardLayout";

const categoryOptions = [
  { value: "Account", label: "Account" },
  { value: "Transfer", label: "Transfer" },
  { value: "Security", label: "Security" },
  { value: "Other", label: "Other" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const statusConfig = {
  open: {
    label: "Open",
    color: "bg-emerald-50 text-emerald-600",
    icon: Clock3,
  },
  closed: {
    label: "Closed",
    color: "bg-slate-100 text-slate-500",
    icon: CheckCircle2,
  },
};

const faqs = [
  {
    icon: ArrowLeftRight,
    q: "How to make a transfer?",
    a: "Go to Transfer from the sidebar or Dashboard, choose Swiss Meridian, Local, International, Zelle, or PayPal, fill in the recipient details and amount, then confirm with your 4-digit transaction PIN.",
  },
  {
    icon: CreditCard,
    q: "How to apply for a card?",
    a: "Go to Cards, choose a card network (Visa, Mastercard, Verve, or Amex), and submit a request. Our team reviews every request before issuing your card details.",
  },
  {
    icon: Wallet,
    q: "How to check my balance?",
    a: "Your current balance is always shown at the top of your Dashboard. Tap the eye icon to show or hide it.",
  },
  {
    icon: ShieldCheck,
    q: "How to enable 2FA?",
    a: "Go to Settings → Two-Factor Authentication → Set Up 2FA, then scan the QR code with an authenticator app like Google Authenticator or Authy and enter the 6-digit code to confirm.",
  },
  {
    icon: PlusCircle,
    q: "How to add funds to my account?",
    a: "You can add funds to your Swiss Meridian Bank account through multiple channels. Internal transfers between Swiss Meridian accounts are instant. External transfers via ACH typically take 1-3 business days to process. You can also receive funds from approved Loans, Grants, or Tax Refund claims — all available in your dashboard menu.",
  },
  {
    icon: TrendingUp,
    q: "How to track transactions?",
    a: "Go to Transactions to see your full history, or Spending Trends for a 6-month breakdown by category. Tap any transaction for full details.",
  },
];

const Support = () => {
  const { onMenuClick } = useUserMenu();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    category: "Other",
    priority: "medium",
    message: "",
  });
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const loadTickets = () => {
    api
      .get("/support/tickets")
      .then((res) => setTickets(res.data.tickets))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const openTicket = async (id) => {
    const { data } = await api.get(`/support/tickets/${id}`);
    setSelected(data.ticket);
  };

  const submitTicket = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.subject || !form.message)
      return setError("Subject and message are required");
    setSubmitting(true);
    try {
      await api.post("/support/tickets", form);
      setForm({
        subject: "",
        category: "Other",
        priority: "medium",
        message: "",
      });
      setShowForm(false);
      loadTickets();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const sendReply = async () => {
    if (!reply.trim()) return;
    const { data } = await api.post(`/support/tickets/${selected._id}/reply`, {
      message: reply,
    });
    setSelected(data.ticket);
    setReply("");
    loadTickets();
  };

  if (selected) {
    const config = statusConfig[selected.status];
    const StatusIcon = config.icon;
    return (
      <div>
        <TopBar onMenuClick={onMenuClick} />
        <div className="px-4 md:px-8 max-w-2xl">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-1.5 text-sm text-slate-500 mb-4"
          >
            <ArrowLeft size={16} /> Back to tickets
          </button>

          <div className="card p-5 mb-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-navy-900">
                  {selected.subject}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selected.category} · Priority: {selected.priority}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${config.color}`}
              >
                <StatusIcon size={12} /> {config.label}
              </span>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {selected.messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.sender === "user" ? "bg-navy text-white" : "bg-white border border-slate-100 text-slate-700"}`}
                >
                  <p>{m.text}</p>
                  <p
                    className={`text-[10px] mt-1 ${m.sender === "user" ? "text-slate-300" : "text-slate-400"}`}
                  >
                    {m.sender === "user" ? "You" : "Swiss Meridian Support"} ·{" "}
                    {new Date(m.createdAt).toLocaleString("en-US")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              placeholder="Type a reply..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendReply()}
              className="input-field flex-1"
            />
            <button onClick={sendReply} className="btn-primary !px-4">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar onMenuClick={onMenuClick} />
      <div className="px-4 md:px-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-navy-900">
              Support Tickets
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Message our team directly about your account.
            </p>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="btn-primary flex items-center gap-2 !py-2.5 shrink-0"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}{" "}
            {showForm ? "Cancel" : "New Ticket"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={submitTicket} className="card p-5 space-y-3 mb-6">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            <input
              required
              placeholder="Subject"
              value={form.subject}
              onChange={(e) =>
                setForm((f) => ({ ...f, subject: e.target.value }))
              }
              className="input-field"
            />
            <div className="grid grid-cols-2 gap-3">
              <CustomSelect
                value={form.category}
                onChange={(v) => setForm((f) => ({ ...f, category: v }))}
                options={categoryOptions}
                placeholder="Category"
              />
              <CustomSelect
                value={form.priority}
                onChange={(v) => setForm((f) => ({ ...f, priority: v }))}
                options={priorityOptions}
                placeholder="Priority"
              />
            </div>
            <textarea
              required
              rows={4}
              placeholder="Describe your issue..."
              value={form.message}
              onChange={(e) =>
                setForm((f) => ({ ...f, message: e.target.value }))
              }
              className="input-field resize-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="btn-gold w-full"
            >
              {submitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <div className="card p-10 text-center text-slate-400 text-sm">
            <LifeBuoy size={28} className="mx-auto mb-3 text-slate-300" />
            No support tickets yet.
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => {
              const config = statusConfig[t.status];
              const StatusIcon = config.icon;
              return (
                <button
                  key={t._id}
                  onClick={() => openTicket(t._id)}
                  className="w-full card p-4 flex items-center justify-between gap-3 text-left hover:-translate-y-0.5 hover:shadow-card transition-all"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy-900 truncate">
                      {t.subject}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {t.category} · Updated{" "}
                      {new Date(t.updatedAt).toLocaleDateString("en-US")}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${config.color}`}
                  >
                    <StatusIcon size={12} /> {config.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Quick Help FAQ */}
        <div className="card p-5 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <HelpCircle size={20} />
            </div>
            <div>
              <p className="font-bold text-navy-900">Quick Help</p>
              <p className="text-xs text-slate-400">
                Find answers to common questions
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {faqs.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.q}
                  className="rounded-xl border border-slate-100 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center gap-3 px-3 py-3 text-left"
                  >
                    <div className="h-9 w-9 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                      <Icon size={16} />
                    </div>
                    <span className="flex-1 text-sm font-semibold text-navy-900">
                      {item.q}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-3 pb-3 pl-[60px] text-sm text-slate-500 leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
