import { useEffect, useState } from "react";
import {
  Snowflake,
  Eye,
  EyeOff,
  Copy,
  Check,
  Clock3,
  XCircle,
  CreditCard,
} from "lucide-react";
import api from "../api/axios";
import TopBar from "../components/TopBar";
import CustomSelect from "../components/CustomSelect";
import { useAuth } from "../context/AuthContext";
import { useUserMenu } from "../components/DashboardLayout";

// Real card brand SVG logos
const CardBrandLogos = {
  visa: (
    <svg
      viewBox="0 0 80 26"
      className="h-8 w-auto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="80" height="26" rx="4" fill="#1434CB" />
      <text
        x="10"
        y="18"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="14"
        fill="white"
        letterSpacing="2"
      >
        VISA
      </text>
    </svg>
  ),
  mastercard: (
    <svg
      viewBox="0 0 60 40"
      className="h-9 w-auto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="60" height="40" rx="4" fill="white" />
      <circle cx="22" cy="20" r="14" fill="#EB001B" />
      <circle cx="38" cy="20" r="14" fill="#F79E1B" />
      <circle
        cx="30"
        cy="20"
        r="14"
        fill="none"
        stroke="#FF5F00"
        strokeWidth="2"
      />
    </svg>
  ),
  verve: (
    <svg
      viewBox="0 0 80 26"
      className="h-8 w-auto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="80" height="26" rx="4" fill="#1A1A2E" />
      <text
        x="10"
        y="18"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="14"
        fill="#00BFFF"
        letterSpacing="2"
      >
        VERVE
      </text>
    </svg>
  ),
  amex: (
    <svg
      viewBox="0 0 80 26"
      className="h-8 w-auto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="80" height="26" rx="4" fill="#006FCF" />
      <text
        x="8"
        y="18"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="10"
        fill="white"
        letterSpacing="1"
      >
        AMERICAN
      </text>
      <text
        x="8"
        y="26"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="10"
        fill="white"
        letterSpacing="1"
      >
        EXPRESS
      </text>
    </svg>
  ),
};

const networkLabels = {
  visa: "VISA",
  mastercard: "Mastercard",
  verve: "Verve",
  amex: "American Express",
};

const networkOptions = [
  { value: "visa", label: "Visa" },
  { value: "mastercard", label: "Mastercard" },
  { value: "verve", label: "Verve" },
  { value: "amex", label: "American Express" },
];

const settingLabels = [
  { key: "onlinePayments", label: "Online payments" },
  { key: "internationalTransactions", label: "International transactions" },
  { key: "atmWithdrawals", label: "ATM withdrawals" },
  { key: "contactlessPayments", label: "Contactless payments" },
];

const Cards = () => {
  const { user } = useAuth();
  const { onMenuClick } = useUserMenu();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [showNumber, setShowNumber] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("visa");

  const load = () => {
    api
      .get("/users/card")
      .then((res) => setCard(res.data.card))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const requestCard = async () => {
    setError("");
    setRequesting(true);
    try {
      const { data } = await api.post("/users/card/request", {
        network: selectedNetwork,
      });
      setCard(data.card);
    } catch (err) {
      setError(err.response?.data?.message || "Could not request card");
    } finally {
      setRequesting(false);
    }
  };

  const toggleFreeze = async () => {
    const { data } = await api.put("/users/card/freeze");
    setCard(data.card);
  };

  const toggleSetting = async (key, value) => {
    const { data } = await api.put("/users/card/settings", { [key]: value });
    setCard(data.card);
  };

  const isFrozen = card?.status === "frozen";
  const isApproved = card?.status === "approved" || isFrozen;

  const placeholderNumber = `4521 88${(user?.accountNumber || "0000000000").slice(-6, -4)} ${(user?.accountNumber || "0000000000").slice(-4)} ${(user?.accountNumber || "0000000000").slice(-4)}`;
  const realNumber = card?.cardNumber
    ? card.cardNumber.replace(/(\d{4})(?=\d)/g, "$1 ")
    : null;
  const displayNumber = realNumber || placeholderNumber;

  const copy = () => {
    navigator.clipboard.writeText(displayNumber.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return (
      <div>
        <TopBar onMenuClick={onMenuClick} />
        <div className="p-8 text-slate-500 text-sm">Loading your card...</div>
      </div>
    );
  }

  return (
    <div>
      <TopBar onMenuClick={onMenuClick} />

      <div className="px-4 md:px-8 max-w-lg">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-navy-900">
            Debit Card
          </h1>
          <p className="text-sm text-slate-800 mt-0.5">
            Manage your Swiss Meridian debit card.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Pending state */}
        {card?.status === "pending" && (
          <div className="card p-6 flex items-start gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center shrink-0">
              <Clock3 size={18} />
            </div>
            <div>
              <p className="font-semibold text-navy-900 text-sm">
                Card request pending review
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Our team is reviewing your request. You'll be notified once it's
                approved.
              </p>
            </div>
          </div>
        )}

        {/* Rejected state */}
        {card?.status === "rejected" && (
          <div className="card p-6 flex items-start gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <XCircle size={18} />
            </div>
            <div>
              <p className="font-semibold text-navy-900 text-sm">
                Card request declined
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {card.rejectionReason || "You can request a new card below."}
              </p>
            </div>
          </div>
        )}

        {/* Card visual */}
        <div
          className={`rounded-xl3 p-6 text-white shadow-card relative overflow-hidden transition-all ${isFrozen ? "bg-slate-400 grayscale" : "bg-gradient-to-br from-navy-700 to-navy-900"} ${!isApproved ? "opacity-60" : ""}`}
        >
          <div className="absolute right-6 top-6">
            {CardBrandLogos[card?.network || "visa"]}
          </div>
          <p className="text-slate-300 text-xs uppercase tracking-wide">
            Swiss Meridian Debit Card
          </p>
          <div className="flex items-center gap-2 mt-4">
            <p className="text-xl md:text-2xl font-semibold tracking-widest">
              {showNumber
                ? displayNumber
                : `•••• •••• •••• ${displayNumber.slice(-4)}`}
            </p>
            <button onClick={() => setShowNumber((s) => !s)}>
              {showNumber ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            {isApproved && (
              <button onClick={copy}>
                {copied ? (
                  <Check size={16} className="text-emerald-300" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            )}
          </div>
          <div className="flex items-end justify-between mt-6">
            <div>
              <p className="text-[10px] text-slate-300 uppercase">
                Card Holder
              </p>
              <p className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-300 uppercase">CVV</p>
              <p className="text-sm font-medium">{card?.cvv || "•••"}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-300 uppercase">Expires</p>
              <p className="text-sm font-medium">
                {card?.expiryMonth
                  ? `${card.expiryMonth}/${card.expiryYear}`
                  : "--/--"}
              </p>
            </div>
          </div>
          {isFrozen && (
            <div className="absolute inset-0 bg-navy-900/60 flex items-center justify-center backdrop-blur-[2px]">
              <span className="flex items-center gap-2 text-white font-semibold text-sm">
                <Snowflake size={18} /> Card Frozen
              </span>
            </div>
          )}
        </div>

        {/* No card yet — network selector + request button */}
        {(!card || card.status === "rejected") && (
          <div className="mt-6 space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                Card Network
              </label>
              <CustomSelect
                value={selectedNetwork}
                onChange={setSelectedNetwork}
                options={networkOptions}
                placeholder="Choose a card network"
              />
            </div>
            <button
              onClick={requestCard}
              disabled={requesting}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <CreditCard size={17} />{" "}
              {requesting ? "Submitting..." : "Request a Debit Card"}
            </button>
          </div>
        )}
        {/* Approved — freeze toggle + settings */}
        {isApproved && (
          <>
            <button
              onClick={toggleFreeze}
              className={`w-full mt-6 rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 transition ${
                isFrozen
                  ? "bg-navy text-white"
                  : "bg-white border border-slate-200 text-navy"
              }`}
            >
              <Snowflake size={17} />{" "}
              {isFrozen ? "Unfreeze Card" : "Freeze Card"}
            </button>

            <div className="card p-5 mt-5 space-y-3">
              <p className="text-sm font-semibold text-navy-900">
                Card Settings
              </p>
              {settingLabels.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center justify-between text-sm text-slate-500 py-2 border-b border-slate-50 last:border-0"
                >
                  {label}
                  <input
                    type="checkbox"
                    checked={card.settings?.[key] ?? true}
                    onChange={(e) => toggleSetting(key, e.target.checked)}
                    className="h-5 w-9 rounded-full accent-navy"
                  />
                </label>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cards;
