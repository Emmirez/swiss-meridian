import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeftRight,
  Landmark,
  Building2,
  Globe2,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  Info,
  Mail,
} from "lucide-react";
import api from "../api/axios";
import TopBar from "../components/TopBar";
import CustomSelect from "../components/CustomSelect";
import TransferReceipt from "../components/TransferReceipt";
import { useUserMenu } from "../components/DashboardLayout";

const countries = [
  "United Kingdom",
  "Germany",
  "France",
  "Canada",
  "Australia",
  "Japan",
  "Switzerland",
  "India",
  "Spain",
  "Italy",
  "Netherlands",
  "Other",
];
const countryOptions = countries.map((c) => ({ value: c, label: c }));

const validModes = ["internal", "external", "international", "zelle", "paypal"];

const Transfer = () => {
  const { onMenuClick } = useUserMenu();
  const [searchParams] = useSearchParams();
  const presetMode = searchParams.get("mode");
  const [mode, setMode] = useState(
    validModes.includes(presetMode) ? presetMode : "internal",
  );

  const presetAccount = searchParams.get("account") || "";
  const presetBank = searchParams.get("bank") || "";
  const presetName = searchParams.get("name") || "";
  const presetRouting = searchParams.get("routing") || "";
  const presetCountry = searchParams.get("country") || "";
  const presetSwift = searchParams.get("swift") || "";
  const presetIban = searchParams.get("iban") || "";
  const presetBankAddress = searchParams.get("bankAddress") || "";
  const [form, setForm] = useState({
    receiverAccountNumber: presetMode === "internal" ? presetAccount : "",
    bankName: presetBank,
    accountName: presetName,
    accountNumber: presetMode === "external" ? presetAccount : "",
    routingNumber: presetRouting,
    country: presetCountry,
    swiftCode: presetSwift,
    iban: presetIban,
    bankAddress: presetBankAddress,
    identifier: "",
    amount: "",
    description: "",
    pin: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const estimatedFee = form.amount
    ? Math.min(Math.max(parseFloat(form.amount) * 0.01 || 0, 5), 50).toFixed(2)
    : null;

  const buildRecipientLabel = (data) => {
    if (mode === "internal")
      return data?.receiverName
        ? `${data.receiverName} (${form.receiverAccountNumber})`
        : `Account ${form.receiverAccountNumber}`;
    if (mode === "external") return `${form.accountName} · ${form.bankName}`;
    if (mode === "international")
      return `${form.accountName} · ${form.bankName} (${form.country})`;
    return form.identifier;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setLoading(true);
    try {
      if (mode === "internal") {
        const { data } = await api.post("/transactions/transfer/internal", {
          receiverAccountNumber: form.receiverAccountNumber,
          amount: parseFloat(form.amount),
          pin: form.pin,
          description: form.description,
        });
        setSuccess({
          ...data.transaction,
          recipientLabel: buildRecipientLabel(data.transaction),
        });
      } else if (mode === "external") {
        const { data } = await api.post("/transactions/transfer/external", {
          bankName: form.bankName,
          accountName: form.accountName,
          accountNumber: form.accountNumber,
          routingNumber: form.routingNumber,
          amount: parseFloat(form.amount),
          pin: form.pin,
          description: form.description,
        });
        setSuccess({
          ...data.transaction,
          recipientLabel: buildRecipientLabel(),
        });
      } else if (mode === "international") {
        const { data } = await api.post(
          "/transactions/transfer/international",
          {
            country: form.country,
            bankName: form.bankName,
            accountName: form.accountName,
            swiftCode: form.swiftCode,
            iban: form.iban,
            bankAddress: form.bankAddress,
            amount: parseFloat(form.amount),
            pin: form.pin,
            description: form.description,
          },
        );
        setSuccess({
          ...data.transaction,
          recipientLabel: buildRecipientLabel(),
        });
      } else {
        const { data } = await api.post(`/transactions/transfer/${mode}`, {
          identifier: form.identifier,
          amount: parseFloat(form.amount),
          pin: form.pin,
          description: form.description,
        });
        setSuccess({
          ...data.transaction,
          recipientLabel: buildRecipientLabel(),
        });
      }
      setForm({
        receiverAccountNumber: "",
        bankName: "",
        accountName: "",
        accountNumber: "",
        routingNumber: "",
        country: "",
        swiftCode: "",
        iban: "",
        bankAddress: "",
        identifier: "",
        amount: "",
        description: "",
        pin: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <TopBar onMenuClick={onMenuClick} />

      <div className="px-4 md:px-8 max-w-xl">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-navy-900">
            Transfers
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Send money within Swiss Meridian Bank, domestically, or
            internationally.
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex flex-wrap gap-2 mb-6 bg-white rounded-2xl p-1.5 shadow-soft w-fit">
          <button
            onClick={() => setMode("internal")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${mode === "internal" ? "bg-navy text-white" : "text-slate-500"}`}
          >
            <ArrowLeftRight size={15} /> Swiss Meridian Transfer
          </button>
          <button
            onClick={() => setMode("external")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${mode === "external" ? "bg-navy text-white" : "text-slate-500"}`}
          >
            <Building2 size={15} /> Local Bank Transfer
          </button>
          <button
            onClick={() => setMode("international")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${mode === "international" ? "bg-navy text-white" : "text-slate-500"}`}
          >
            <Globe2 size={15} /> International Wire
          </button>
          <button
            onClick={() => setMode("zelle")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${mode === "zelle" ? "bg-navy text-white" : "text-slate-500"}`}
          >
            <Mail size={15} /> Zelle
          </button>
          <button
            onClick={() => setMode("paypal")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${mode === "paypal" ? "bg-navy text-white" : "text-slate-500"}`}
          >
            <Mail size={15} /> PayPal
          </button>
        </div>

        {success ? (
          <TransferReceipt
            mode={mode}
            transaction={success}
            recipient={success.recipientLabel}
            onNewTransfer={() => setSuccess(null)}
          />
        ) : (
          <form onSubmit={submit} className="card p-6 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {mode === "internal" && (
              <div className="relative">
                <Landmark
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  required
                  placeholder="Recipient's Swiss Meridian account number"
                  value={form.receiverAccountNumber}
                  onChange={(e) =>
                    update("receiverAccountNumber", e.target.value)
                  }
                  className="input-field !pl-10"
                />
              </div>
            )}

            {mode === "external" && (
              <>
                <input
                  required
                  placeholder="Recipient bank name"
                  value={form.bankName}
                  onChange={(e) => update("bankName", e.target.value)}
                  className="input-field"
                />
                <input
                  required
                  placeholder="Recipient account holder name"
                  value={form.accountName}
                  onChange={(e) => update("accountName", e.target.value)}
                  className="input-field"
                />
                <input
                  required
                  placeholder="Recipient account number"
                  value={form.accountNumber}
                  onChange={(e) => update("accountNumber", e.target.value)}
                  className="input-field"
                />
                <input
                  required
                  placeholder="Routing number (9 digits)"
                  value={form.routingNumber}
                  onChange={(e) =>
                    update(
                      "routingNumber",
                      e.target.value.replace(/\D/g, "").slice(0, 9),
                    )
                  }
                  className="input-field"
                />
              </>
            )}

            {mode === "international" && (
              <>
                <CustomSelect
                  value={form.country}
                  onChange={(v) => update("country", v)}
                  options={countryOptions}
                  placeholder="Destination country"
                />
                <input
                  required
                  placeholder="Recipient full name"
                  value={form.accountName}
                  onChange={(e) => update("accountName", e.target.value)}
                  className="input-field"
                />
                <input
                  required
                  placeholder="Recipient bank name"
                  value={form.bankName}
                  onChange={(e) => update("bankName", e.target.value)}
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
                  placeholder="IBAN / account number"
                  value={form.iban}
                  onChange={(e) => update("iban", e.target.value)}
                  className="input-field"
                />
                <input
                  placeholder="Recipient bank address (optional)"
                  value={form.bankAddress}
                  onChange={(e) => update("bankAddress", e.target.value)}
                  className="input-field"
                />
              </>
            )}

            {mode === "paypal" && (
              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  required
                  type="email"
                  placeholder="Recipient's PayPal email"
                  value={form.identifier}
                  onChange={(e) => update("identifier", e.target.value)}
                  className="input-field !pl-10"
                />
              </div>
            )}

            {mode === "zelle" && (
              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  required
                  placeholder="Recipient's email or phone number"
                  value={form.identifier}
                  onChange={(e) => update("identifier", e.target.value)}
                  className="input-field !pl-10"
                />
              </div>
            )}

            {(mode === "zelle" || mode === "paypal") && (
              <p className="text-xs text-slate-600 -mt-1">
                {mode === "paypal"
                  ? "Send money to any PayPal account. Standard processing: 1-3 business days."
                  : "Send money to any Zelle-enrolled recipient.  Funds arrive within minutes."}
              </p>
            )}

            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => update("amount", e.target.value)}
              className="input-field"
            />

            {mode === "international" && estimatedFee && (
              <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2.5">
                <Info size={14} className="shrink-0 mt-0.5 text-navy-400" />
                Estimated transfer fee:{" "}
                <strong className="text-navy-900">${estimatedFee}</strong> (1%
                of amount, min $5, max $50). Total debited:{" "}
                <strong className="text-navy-900">
                  $
                  {(
                    parseFloat(form.amount || 0) + parseFloat(estimatedFee)
                  ).toFixed(2)}
                </strong>
              </div>
            )}

            {(mode === "internal" || mode === "zelle" || mode === "paypal") &&
              form.amount && (
                <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2.5">
                  <Info size={14} className="shrink-0 mt-0.5 text-navy-400" />
                  If the recipient's account is in a different currency, a
                  conversion fee applies (1% of amount, min $5, max $50) and
                  they'll receive the converted amount at the current exchange
                  rate.
                </div>
              )}

            <input
              placeholder="What's this for? (optional)"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="input-field"
            />
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
                value={form.pin}
                onChange={(e) =>
                  update("pin", e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                className="input-field !pl-10 tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? "Processing..." : "Send Money"}{" "}
              <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Transfer;
