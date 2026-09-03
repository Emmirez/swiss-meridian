import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Clock3, XCircle, ShieldCheck } from "lucide-react";
import api from "../api/axios";

const configByStatus = {
  approved: {
    icon: ShieldCheck,
    bg: "bg-emerald-50 border-emerald-100",
    iconBg: "bg-emerald-500 text-white",
    title: "Identity Verified",
    text: "KYC verification complete — full access unlocked",
    badge: "Completed",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  not_submitted: {
    icon: ShieldAlert,
    bg: "bg-gold-50 border-gold-100",
    iconBg: "bg-gold-100 text-gold-700",
    title: "Verify your identity",
    text: "Complete KYC verification to send transfers, apply for cards, loans, and more.",
    cta: "Start Verification",
  },
  pending: {
    icon: Clock3,
    bg: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-100 text-blue-600",
    title: "Verification pending review",
    text: "Your identity documents are being reviewed. Transfers and applications are on hold until approved.",
    cta: "View Submission",
  },
  rejected: {
    icon: XCircle,
    bg: "bg-red-50 border-red-100",
    iconBg: "bg-red-100 text-red-600",
    title: "Verification needs another look",
    text: "Your last submission wasn't approved. Resubmit to unlock transfers and applications.",
    cta: "Resubmit Verification",
  },
};

const KycReminderBanner = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api.get("/users/kyc").then((res) => setStatus(res.data.kycStatus)).catch(() => {});
  }, []);

  if (!status) return null;

  const config = configByStatus[status];
  if (!config) return null;
  const Icon = config.icon;
  const isApproved = status === "approved";

  return (
    <button
      onClick={() => navigate("/dashboard/kyc")}
      className={`w-full text-left border rounded-2xl p-4 flex items-center gap-3 hover:opacity-90 transition-opacity ${config.bg}`}
    >
      <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${config.iconBg}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-navy-900">{config.title}</p>
        <p className="text-sm text-slate-500 mt-0.5">{config.text}</p>
      </div>
      {isApproved ? (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${config.badgeColor}`}>
          {config.badge}
        </span>
      ) : (
        <span className="text-xs font-semibold text-navy shrink-0 whitespace-nowrap">{config.cta} →</span>
      )}
    </button>
  );
};

export default KycReminderBanner;