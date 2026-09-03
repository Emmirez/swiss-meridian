import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Landmark, X, Send } from "lucide-react";
import api from "../api/axios";
import TopBar from "../components/TopBar";
import { useUserMenu } from "../components/DashboardLayout";

const Beneficiaries = () => {
  const { onMenuClick } = useUserMenu();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nickname: "",
    accountHolderName: "",
    accountNumber: "",
    bankName: "",
    routingNumber: "",
    isInternational: false,
    country: "",
    swiftCode: "",
    iban: "",
    bankAddress: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    benCountry: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    api
      .get("/transactions/beneficiaries")
      .then((res) => setList(res.data.beneficiaries))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/transactions/beneficiaries", form);
      setForm({
        nickname: "",
        accountHolderName: "",
        accountNumber: "",
        bankName: "",
        routingNumber: "",
        isInternational: false,
        country: "",
        swiftCode: "",
        iban: "",
        bankAddress: "",
        street: "",
        city: "",
        state: "",
        zip: "",
        benCountry: "",
      });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save beneficiary");
    }
  };

  const remove = async (id) => {
    await api.delete(`/transactions/beneficiaries/${id}`);
    load();
  };

  const sendTo = (b) => {
    if (b.isInternal) {
      navigate(`/dashboard/transfer?mode=internal&account=${b.accountNumber}`);
    } else if (b.isInternational) {
      const params = new URLSearchParams({
        mode: "international",
        bank: b.bankName,
        name: b.accountHolderName,
        country: b.country || "",
        swift: b.swiftCode || "",
        iban: b.iban || "",
        bankAddress: b.bankAddress || "",
      });
      navigate(`/dashboard/transfer?${params}`);
    } else {
      const params = new URLSearchParams({
        mode: "external",
        bank: b.bankName,
        name: b.accountHolderName,
        account: b.accountNumber,
        routing: b.routingNumber || "",
      });
      navigate(`/dashboard/transfer?${params}`);
    }
  };

  return (
    <div>
      <TopBar onMenuClick={onMenuClick} />

      <div className="px-4 md:px-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-navy-900">
            Beneficiaries
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Saved recipients for faster transfers.
          </p>
        </div>

        <button
          onClick={() => setShowForm((s) => !s)}
          className="btn-primary flex items-center gap-2 mb-6"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}{" "}
          {showForm ? "Cancel" : "Add Beneficiary"}
        </button>

        {showForm && (
          <form onSubmit={submit} className="card p-5 space-y-3 mb-6">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            <input
              placeholder="Nickname (optional)"
              value={form.nickname}
              onChange={(e) => update("nickname", e.target.value)}
              className="input-field"
            />
            <input
              required
              placeholder="Account holder name"
              value={form.accountHolderName}
              onChange={(e) => update("accountHolderName", e.target.value)}
              className="input-field"
            />
            <input
              required
              placeholder="Account number / IBAN"
              value={form.accountNumber}
              onChange={(e) => update("accountNumber", e.target.value)}
              className="input-field"
            />
            <input
              required
              placeholder="Bank name"
              value={form.bankName}
              onChange={(e) => update("bankName", e.target.value)}
              className="input-field"
            />
            <input
              placeholder="Routing number (US domestic, optional)"
              value={form.routingNumber}
              onChange={(e) => update("routingNumber", e.target.value)}
              className="input-field"
            />

            <label className="flex items-center gap-2.5 text-sm text-slate-600 py-1">
              <input
                type="checkbox"
                checked={form.isInternational}
                onChange={(e) => update("isInternational", e.target.checked)}
                className="h-4 w-4 accent-navy"
              />
              This is an international beneficiary
            </label>

            {form.isInternational && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  International Wire Details
                </p>
                <input
                  required
                  placeholder="Destination country"
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  className="input-field"
                />
                <input
                  required
                  placeholder="SWIFT/BIC code (e.g. DEUTDEFF)"
                  value={form.swiftCode}
                  onChange={(e) =>
                    update("swiftCode", e.target.value.toUpperCase())
                  }
                  className="input-field uppercase"
                />
                <input
                  required
                  placeholder="IBAN"
                  value={form.iban}
                  onChange={(e) => update("iban", e.target.value)}
                  className="input-field"
                />
                <input
                  placeholder="Bank address (optional)"
                  value={form.bankAddress}
                  onChange={(e) => update("bankAddress", e.target.value)}
                  className="input-field"
                />

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 pt-2">
                  Beneficiary's Address (optional)
                </p>
                <input
                  placeholder="Street address"
                  value={form.street}
                  onChange={(e) => update("street", e.target.value)}
                  className="input-field"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    className="input-field"
                  />
                  <input
                    placeholder="State/Province"
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="ZIP/Postal code"
                    value={form.zip}
                    onChange={(e) => update("zip", e.target.value)}
                    className="input-field"
                  />
                  <input
                    placeholder="Country"
                    value={form.benCountry}
                    onChange={(e) => update("benCountry", e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn-gold w-full">
              Save Beneficiary
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Loading beneficiaries...</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-slate-400">No saved beneficiaries yet.</p>
        ) : (
          <div className="space-y-3">
            {list.map((b) => (
              <div key={b._id} className="card p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-navy-50 text-navy flex items-center justify-center shrink-0">
                  <Landmark size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy-900">
                    {b.nickname || b.accountHolderName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {b.bankName} · {b.accountNumber}
                  </p>
                </div>
                {b.isInternal && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full font-medium shrink-0">
                    Swiss Meridian
                  </span>
                )}
                {b.isInternational && (
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium shrink-0">
                    International
                  </span>
                )}
                <button
                  onClick={() => sendTo(b)}
                  className="btn-primary !py-2 !px-3 text-sm shrink-0 flex items-center gap-1.5"
                >
                  <Send size={14} /> Send
                </button>
                <button
                  onClick={() => remove(b._id)}
                  className="text-slate-300 hover:text-red-500 transition shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Beneficiaries;
