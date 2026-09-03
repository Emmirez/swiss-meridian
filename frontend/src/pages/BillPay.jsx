import { useEffect, useState } from "react";
import {
  Zap, Droplet, Wifi, Phone, ShieldCheck, Tv, Receipt,
  Plus, Trash2, X, KeyRound, ArrowRight, CheckCircle2,
} from "lucide-react";
import api from "../api/axios";
import TopBar from "../components/TopBar";
import CustomSelect from "../components/CustomSelect";
import { useUserMenu } from "../components/DashboardLayout";

const categoryConfig = {
  Electricity: { icon: Zap, color: "bg-gold-50 text-gold-700" },
  Water: { icon: Droplet, color: "bg-blue-50 text-blue-600" },
  Internet: { icon: Wifi, color: "bg-purple-50 text-purple-600" },
  Phone: { icon: Phone, color: "bg-emerald-50 text-emerald-600" },
  Insurance: { icon: ShieldCheck, color: "bg-navy-50 text-navy" },
  Cable: { icon: Tv, color: "bg-red-50 text-red-500" },
  Other: { icon: Receipt, color: "bg-slate-100 text-slate-500" },
};

const categoryOptions = Object.keys(categoryConfig).map((c) => ({ value: c, label: c }));

const BillPay = () => {
  const { onMenuClick } = useUserMenu();
  const [billers, setBillers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ nickname: "", category: "Electricity", accountNumber: "", providerName: "" });
  const [addError, setAddError] = useState("");

  const [payingBiller, setPayingBiller] = useState(null); // biller object or null
  const [payForm, setPayForm] = useState({ amount: "", pin: "", description: "" });
  const [payError, setPayError] = useState("");
  const [paySuccess, setPaySuccess] = useState(null);
  const [paying, setPaying] = useState(false);

  const load = () => {
    api.get("/bills/billers").then((res) => setBillers(res.data.billers)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submitAddBiller = async (e) => {
    e.preventDefault();
    setAddError("");
    try {
      await api.post("/bills/billers", addForm);
      setAddForm({ nickname: "", category: "Electricity", accountNumber: "", providerName: "" });
      setShowAddForm(false);
      load();
    } catch (err) {
      setAddError(err.response?.data?.message || "Could not save biller");
    }
  };

  const removeBiller = async (id) => {
    await api.delete(`/bills/billers/${id}`);
    load();
  };

  const openPay = (biller) => {
    setPayingBiller(biller);
    setPayForm({ amount: "", pin: "", description: "" });
    setPayError("");
    setPaySuccess(null);
  };

  const submitPay = async (e) => {
    e.preventDefault();
    setPayError("");
    setPaying(true);
    try {
      const { data } = await api.post("/bills/pay", {
        billerId: payingBiller._id,
        amount: parseFloat(payForm.amount),
        pin: payForm.pin,
        description: payForm.description,
      });
      setPaySuccess(data.transaction);
    } catch (err) {
      setPayError(err.response?.data?.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div>
      <TopBar onMenuClick={onMenuClick} />

      <div className="px-4 md:px-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-navy-900">Bill Pay</h1>
            <p className="text-sm text-slate-400 mt-0.5">Pay your saved billers directly from your account.</p>
          </div>
          <button onClick={() => setShowAddForm((s) => !s)} className="btn-primary flex items-center gap-2 !py-2.5 shrink-0">
            {showAddForm ? <X size={16} /> : <Plus size={16} />} {showAddForm ? "Cancel" : "Add Biller"}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={submitAddBiller} className="card p-5 space-y-3 mb-6">
            {addError && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{addError}</div>}
            <input
              required
              placeholder="Nickname (e.g. Home Electric Bill)"
              value={addForm.nickname}
              onChange={(e) => setAddForm((f) => ({ ...f, nickname: e.target.value }))}
              className="input-field"
            />
            <input
              required
              placeholder="Provider name (e.g. Pacific Gas & Electric)"
              value={addForm.providerName}
              onChange={(e) => setAddForm((f) => ({ ...f, providerName: e.target.value }))}
              className="input-field"
            />
            <CustomSelect
              value={addForm.category}
              onChange={(v) => setAddForm((f) => ({ ...f, category: v }))}
              options={categoryOptions}
              placeholder="Category"
            />
            <input
              required
              placeholder="Your account/reference number with this biller"
              value={addForm.accountNumber}
              onChange={(e) => setAddForm((f) => ({ ...f, accountNumber: e.target.value }))}
              className="input-field"
            />
            <button type="submit" className="btn-gold w-full">Save Biller</button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Loading billers...</p>
        ) : billers.length === 0 ? (
          <div className="card p-10 text-center text-slate-400 text-sm">
            <Receipt size={28} className="mx-auto mb-3 text-slate-300" />
            No saved billers yet — add one to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {billers.map((b) => {
              const config = categoryConfig[b.category] || categoryConfig.Other;
              const Icon = config.icon;
              return (
                <div key={b._id} className="card p-4 flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${config.color}`}>
                    <Icon size={19} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy-900">{b.nickname}</p>
                    <p className="text-xs text-slate-400">{b.providerName} · {b.category} · Acct {b.accountNumber}</p>
                  </div>
                  <button onClick={() => openPay(b)} className="btn-primary !py-2 !px-3 text-sm shrink-0">Pay</button>
                  <button onClick={() => removeBiller(b._id)} className="text-slate-300 hover:text-red-500 transition shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Pay modal */}
        {payingBiller && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-navy-900/40 backdrop-blur-sm px-0 sm:px-4">
            <div className="bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-3xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-navy-900">Pay {payingBiller.nickname}</p>
                <button onClick={() => setPayingBiller(null)} className="text-slate-400 hover:text-navy transition">
                  <X size={20} />
                </button>
              </div>

              {paySuccess ? (
                <div className="text-center py-4">
                  <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={26} />
                  </div>
                  <p className="font-bold text-navy-900">Payment successful</p>
                  <p className="text-sm text-slate-500 mt-2">
                    {paySuccess.currency} {paySuccess.amount} paid · Ref: {paySuccess.reference}
                  </p>
                  <button onClick={() => setPayingBiller(null)} className="btn-secondary w-full mt-6">Done</button>
                </div>
              ) : (
                <form onSubmit={submitPay} className="space-y-3">
                  {payError && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{payError}</div>}
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Amount"
                    value={payForm.amount}
                    onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))}
                    className="input-field"
                  />
                  <input
                    placeholder="Note (optional)"
                    value={payForm.description}
                    onChange={(e) => setPayForm((f) => ({ ...f, description: e.target.value }))}
                    className="input-field"
                  />
                  <div className="relative">
                    <KeyRound size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      required
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="4-digit transaction PIN"
                      value={payForm.pin}
                      onChange={(e) => setPayForm((f) => ({ ...f, pin: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                      className="input-field !pl-10 tracking-widest"
                    />
                  </div>
                  <button type="submit" disabled={paying} className="btn-primary w-full flex items-center justify-center gap-2">
                    {paying ? "Processing..." : "Pay Bill"} <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillPay;