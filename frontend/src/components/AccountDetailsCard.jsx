import { Landmark, Copy, Check } from "lucide-react";
import { useState } from "react";

const SWISS_MERIDIAN_SWIFT = "SMBKCHZZ";
const SWISS_MERIDIAN_ADDRESS = "Rue des Alpes 14, 1201 Geneva, Switzerland";

const Row = ({ label, value, copyable }) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(value || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 py-3 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400 shrink-0">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-medium text-navy-900 sm:text-right break-words">
          {value || "—"}
        </span>
        {copyable && value && (
          <button
            onClick={copy}
            className="text-slate-300 hover:text-navy transition shrink-0"
          >
            {copied ? (
              <Check size={14} className="text-emerald-500" />
            ) : (
              <Copy size={14} />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const AccountDetailsCard = ({ user }) => {
  const fullAddress = user?.address
    ? `${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.zip}, ${user.address.country}`
    : null;

  return (
    <div className="card p-6">
      <h3 className="font-semibold text-navy-900 flex items-center gap-2 mb-1">
        <Landmark size={17} /> Account Details
      </h3>
      <p className="text-xs text-slate-400 mb-4">
        Share these details with anyone sending you a bank transfer.
      </p>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1 mt-2">
          Your Account
        </p>
        <Row
          label="Account Name"
          value={`${user?.firstName || ""} ${user?.lastName || ""}`}
        />
        <Row label="Phone Number" value={user?.phone} />
        <Row label="Account Number" value={user?.accountNumber} copyable />
        <Row
          label="Account Type"
          value={
            user?.accountType
              ? `${user.isJoint ? "Joint " : ""}${user.accountType.replace("_", " ")}`
              : null
          }
        />
        <Row label="Currency" value={user?.currency} />
        <Row label="Your Address" value={fullAddress} />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1 mt-5">
          Bank Details
        </p>
        <Row label="Bank Name" value="Swiss Meridian Bank" />
        <Row label="Routing Number" value={user?.routingNumber} copyable />
        <Row label="SWIFT / BIC Code" value={SWISS_MERIDIAN_SWIFT} copyable />
        <Row label="Bank Address" value={SWISS_MERIDIAN_ADDRESS} />
      </div>
    </div>
  );
};

export default AccountDetailsCard;
