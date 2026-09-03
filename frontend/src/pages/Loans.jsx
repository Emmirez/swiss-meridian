import { useEffect, useState } from "react";
import {
  Landmark,
  Car,
  Briefcase,
  GraduationCap,
  Home,
  Plus,
  X,
  Clock3,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Send,
} from "lucide-react";
import api from "../api/axios";
import TopBar from "../components/TopBar";
import CustomSelect from "../components/CustomSelect";
import { useAuth } from "../context/AuthContext";
import { useUserMenu } from "../components/DashboardLayout";

const typeConfig = {
  personal: {
    icon: Landmark,
    label: "Personal Loan",
    color: "bg-navy-50 text-navy",
  },
  auto: { icon: Car, label: "Auto Loan", color: "bg-blue-50 text-blue-600" },
  business: {
    icon: Briefcase,
    label: "Business Loan",
    color: "bg-gold-50 text-gold-700",
  },
  student: {
    icon: GraduationCap,
    label: "Student Loan",
    color: "bg-purple-50 text-purple-600",
  },
  home: {
    icon: Home,
    label: "Home Loan",
    color: "bg-emerald-50 text-emerald-600",
  },
};

const statusConfig = {
  pending: {
    label: "Pending Review",
    color: "bg-gold-50 text-gold-700",
    icon: Clock3,
  },
  approved_active: {
    label: "Active",
    color: "bg-emerald-50 text-emerald-600",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-50 text-red-500",
    icon: XCircle,
  },
  paid_off: {
    label: "Paid Off",
    color: "bg-slate-100 text-slate-500",
    icon: CheckCircle2,
  },
};

const termOptions = [6, 12, 24, 36, 48, 60, 72, 84].map((m) => ({
  value: m,
  label: `${m} months`,
}));
const typeOptions = Object.entries(typeConfig).map(([value, { label }]) => ({
  value,
  label,
}));

const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount || 0,
  );

const Loans = () => {
  const { user } = useAuth();
  const { onMenuClick } = useUserMenu();
  const [loans, setLoans] = useState([]);
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: "personal",
    principal: "",
    termMonths: 12,
    purpose: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    Promise.all([api.get("/loans/mine"), api.get("/loans/rates")])
      .then(([l, r]) => {
        setLoans(l.data.loans);
        setRates(r.data.rates);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const hasActiveOrPending = loans.some(
    (l) => l.status === "pending" || l.status === "approved_active",
  );

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.principal || !form.purpose)
      return setError("Please complete all fields");
    if (!agreed)
      return setError("Please agree to the terms and conditions to continue");
    setSubmitting(true);
    try {
      await api.post("/loans/apply", {
        type: form.type,
        principal: parseFloat(form.principal),
        termMonths: form.termMonths,
        purpose: form.purpose,
      });
      setForm({ type: "personal", principal: "", termMonths: 12, purpose: "" });
      setAgreed(false);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit application");
    } finally {
      setSubmitting(false);
    }
  };

  // Live estimate for the form
  const estimatedRate = rates[form.type];
  const estimatedMonthly =
    form.principal && estimatedRate
      ? (() => {
          const r = estimatedRate / 100 / 12;
          const n = form.termMonths;
          const p = parseFloat(form.principal);
          return r === 0
            ? p / n
            : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        })()
      : null;

  return (
    <div>
      <TopBar onMenuClick={onMenuClick} />

      <div className="px-4 md:px-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-navy-900">
              Loans
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Apply for a loan and track repayment.
            </p>
          </div>
          {!hasActiveOrPending && (
            <button
              onClick={() => setShowForm((s) => !s)}
              className="btn-primary flex items-center gap-2 !py-2.5 shrink-0"
            >
              {showForm ? <X size={16} /> : <Plus size={16} />}{" "}
              {showForm ? "Cancel" : "Apply"}
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={submit} className="card p-5 space-y-3 mb-6">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            <CustomSelect
              value={form.type}
              onChange={(v) => setForm((f) => ({ ...f, type: v }))}
              options={typeOptions}
              placeholder="Loan type"
            />
            <input
              required
              type="number"
              placeholder={`Loan amount (${user?.currency || "USD"})`}
              value={form.principal}
              onChange={(e) =>
                setForm((f) => ({ ...f, principal: e.target.value }))
              }
              className="input-field"
            />
            <CustomSelect
              value={form.termMonths}
              onChange={(v) => setForm((f) => ({ ...f, termMonths: v }))}
              options={termOptions}
              placeholder="Repayment term"
            />
            <textarea
              required
              rows={3}
              placeholder="What's this loan for?"
              value={form.purpose}
              onChange={(e) =>
                setForm((f) => ({ ...f, purpose: e.target.value }))
              }
              className="input-field resize-none"
            />

            {estimatedMonthly && (
              <div className="bg-navy-50 rounded-xl px-4 py-3 text-sm">
                <p className="text-navy-900 font-semibold flex items-center gap-1.5">
                  <TrendingUp size={14} /> Estimated payment
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  {estimatedRate}% APR ·{" "}
                  {formatMoney(estimatedMonthly, user?.currency)} / month for{" "}
                  {form.termMonths} months
                </p>
              </div>
            )}

            <label className="flex items-start gap-3 bg-slate-50 rounded-xl px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="h-4 w-4 mt-0.5 accent-navy shrink-0"
              />
              <span className="text-sm">
                <span className="font-semibold text-navy-900">
                  I agree to the terms and conditions
                </span>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  By submitting this application, I confirm that all information
                  provided is accurate and complete. I authorize Swiss Meridian
                  Bank to verify my information and credit history.
                </p>
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting || !agreed}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Send size={16} />{" "}
              {submitting ? "Submitting..." : "Submit Loan Application"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <X size={16} /> Cancel
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Loading loans...</p>
        ) : loans.length === 0 ? (
          <div className="card p-10 text-center text-slate-400 text-sm">
            <Landmark size={28} className="mx-auto mb-3 text-slate-300" />
            No loans yet — apply above to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {loans.map((loan) => {
              const type = typeConfig[loan.type];
              const status = statusConfig[loan.status];
              const TypeIcon = type.icon;
              const StatusIcon = status.icon;
              const progress = loan.totalRepayable
                ? Math.round(
                    ((loan.totalRepayable - loan.remainingBalance) /
                      loan.totalRepayable) *
                      100,
                  )
                : 0;

              return (
                <div key={loan._id} className="card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${type.color}`}
                      >
                        <TypeIcon size={19} />
                      </div>
                      <div>
                        <p className="font-semibold text-navy-900">
                          {type.label}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatMoney(loan.principal, user?.currency)} ·{" "}
                          {loan.interestRate}% APR · {loan.termMonths} months
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${status.color}`}
                    >
                      <StatusIcon size={12} /> {status.label}
                    </span>
                  </div>

                  {loan.status === "rejected" && loan.rejectionReason && (
                    <p className="text-xs text-red-500 mt-3">
                      {loan.rejectionReason}
                    </p>
                  )}

                  {(loan.status === "approved_active" ||
                    loan.status === "paid_off") && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                        <span>
                          {formatMoney(
                            loan.totalRepayable - loan.remainingBalance,
                            user?.currency,
                          )}{" "}
                          paid
                        </span>
                        <span>
                          {formatMoney(loan.remainingBalance, user?.currency)}{" "}
                          remaining
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      {loan.status === "approved_active" && (
                        <div className="flex justify-between text-xs text-slate-400 mt-2">
                          <span>
                            Monthly payment:{" "}
                            {formatMoney(loan.monthlyPayment, user?.currency)}
                          </span>
                          <span>
                            Next due:{" "}
                            {new Date(loan.nextPaymentDate).toLocaleDateString(
                              "en-US",
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Loans;
