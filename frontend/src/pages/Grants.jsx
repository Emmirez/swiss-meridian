import { useEffect, useState } from "react";
import {
  Gift, Briefcase, GraduationCap, Users, ShieldAlert, FlaskConical, HelpCircle,
  Plus, X, Send, Clock3, CheckCircle2, XCircle,
} from "lucide-react";
import api from "../api/axios";
import TopBar from "../components/TopBar";
import CustomSelect from "../components/CustomSelect";
import { useAuth } from "../context/AuthContext";
import { useUserMenu } from "../components/DashboardLayout";

const categoryConfig = {
  "Small Business": { icon: Briefcase, color: "bg-gold-50 text-gold-700" },
  "Education": { icon: GraduationCap, color: "bg-blue-50 text-blue-600" },
  "Community/Nonprofit": { icon: Users, color: "bg-emerald-50 text-emerald-600" },
  "Emergency Relief": { icon: ShieldAlert, color: "bg-red-50 text-red-500" },
  "Research": { icon: FlaskConical, color: "bg-purple-50 text-purple-600" },
  "Other": { icon: HelpCircle, color: "bg-slate-100 text-slate-500" },
};

const statusConfig = {
  pending: { label: "Pending Review", color: "bg-gold-50 text-gold-700", icon: Clock3 },
  approved: { label: "Approved", color: "bg-emerald-50 text-emerald-600", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-50 text-red-500", icon: XCircle },
};

const categoryOptions = Object.keys(categoryConfig).map((c) => ({ value: c, label: c }));

const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount || 0);

const Grants = () => {
  const { user } = useAuth();
  const { onMenuClick } = useUserMenu();
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: "Small Business", amountRequested: "", proposal: "" });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api.get("/grants/mine").then((res) => setGrants(res.data.grants)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const hasPending = grants.some((g) => g.status === "pending");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.amountRequested || !form.proposal) return setError("Please complete all fields");
    if (form.proposal.trim().length < 20) return setError("Your proposal should be at least 20 characters");
    if (!agreed) return setError("Please agree to the terms to continue");
    setSubmitting(true);
    try {
      await api.post("/grants/apply", {
        category: form.category,
        amountRequested: parseFloat(form.amountRequested),
        proposal: form.proposal,
      });
      setForm({ category: "Small Business", amountRequested: "", proposal: "" });
      setAgreed(false);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <TopBar onMenuClick={onMenuClick} />

      <div className="px-4 md:px-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-navy-900">Grants</h1>
            <p className="text-sm text-slate-400 mt-0.5">Apply for a grant — no repayment required.</p>
          </div>
          {!hasPending && (
            <button onClick={() => setShowForm((s) => !s)} className="btn-primary flex items-center gap-2 !py-2.5 shrink-0">
              {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Cancel" : "Apply"}
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={submit} className="card p-5 space-y-3 mb-6">
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}
            <CustomSelect
              value={form.category}
              onChange={(v) => setForm((f) => ({ ...f, category: v }))}
              options={categoryOptions}
              placeholder="Grant category"
            />
            <input
              required
              type="number"
              placeholder={`Amount requested (${user?.currency || "USD"})`}
              value={form.amountRequested}
              onChange={(e) => setForm((f) => ({ ...f, amountRequested: e.target.value }))}
              className="input-field"
            />
            <textarea
              required
              rows={5}
              placeholder="Describe your proposal — what is this grant for, and why should it be approved?"
              value={form.proposal}
              onChange={(e) => setForm((f) => ({ ...f, proposal: e.target.value }))}
              className="input-field resize-none"
            />
            <p className="text-[11px] text-slate-400 -mt-1">{form.proposal.length} characters (minimum 20)</p>

            <label className="flex items-start gap-3 bg-slate-50 rounded-xl px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="h-4 w-4 mt-0.5 accent-navy shrink-0"
              />
              <span className="text-sm">
                <span className="font-semibold text-navy-900">I agree to the terms and conditions</span>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  By submitting this application, I confirm that all information provided is accurate and complete, and that this grant will be used for the stated purpose.
                </p>
              </span>
            </label>

            <button type="submit" disabled={submitting || !agreed} className="btn-primary w-full flex items-center justify-center gap-2">
              <Send size={16} /> {submitting ? "Submitting..." : "Submit Grant Application"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary w-full flex items-center justify-center gap-2">
              <X size={16} /> Cancel
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Loading grants...</p>
        ) : grants.length === 0 ? (
          <div className="card p-10 text-center text-slate-400 text-sm">
            <Gift size={28} className="mx-auto mb-3 text-slate-300" />
            No grant applications yet — apply above to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {grants.map((grant) => {
              const cat = categoryConfig[grant.category] || categoryConfig.Other;
              const status = statusConfig[grant.status];
              const CatIcon = cat.icon;
              const StatusIcon = status.icon;

              return (
                <div key={grant._id} className="card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${cat.color}`}>
                        <CatIcon size={19} />
                      </div>
                      <div>
                        <p className="font-semibold text-navy-900">{grant.category} Grant</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatMoney(grant.amountRequested, user?.currency)} · Applied {new Date(grant.appliedAt).toLocaleDateString("en-US")}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${status.color}`}>
                      <StatusIcon size={12} /> {status.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed">"{grant.proposal}"</p>
                  {grant.status === "rejected" && grant.rejectionReason && (
                    <p className="text-xs text-red-500 mt-2">{grant.rejectionReason}</p>
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

export default Grants;