import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Clock3,
  XCircle,
  FileText,
  ArrowRight,
} from "lucide-react";
import api from "../api/axios";

const statusConfig = {
  not_submitted: {
    label: "Not Verified",
    color: "bg-slate-100 text-slate-500",
    icon: FileText,
    desc: "Verify your identity to unlock full account features.",
  },
  pending: {
    label: "Pending Review",
    color: "bg-gold-50 text-gold-700",
    icon: Clock3,
    desc: "Your submission is being reviewed by our team.",
  },
  approved: {
    label: "Verified",
    color: "bg-emerald-50 text-emerald-600",
    icon: ShieldCheck,
    desc: "Your identity has been verified.",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-50 text-red-500",
    icon: XCircle,
    desc: "Your last submission needs another look.",
  },
};

const KycStatusCard = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/users/kyc")
      .then((res) => setStatus(res.data.kycStatus))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card p-6 text-sm text-slate-400">
        Loading verification status...
      </div>
    );
  }

  const config = statusConfig[status || "not_submitted"];
  const Icon = config.icon;
  const showButton = status !== "approved" && status !== "pending";

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${config.color}`}
          >
            <Icon size={20} />
          </div>
          <div>
            <p className="font-semibold text-navy-900">Identity Verification</p>
            <p className="text-xs text-slate-400 mt-1">{config.desc}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${config.color}`}
        >
          {config.label}
        </span>
      </div>

      {showButton && (
        <button
          onClick={() => navigate("/dashboard/kyc")}
          className="btn-primary flex items-center gap-2 mt-4 !py-2.5 text-sm"
        >
          {status === "rejected"
            ? "Resubmit Verification"
            : "Start Verification"}{" "}
          <ArrowRight size={15} />
        </button>
      )}
      {status === "pending" && (
        <button
          onClick={() => navigate("/dashboard/kyc")}
          className="btn-secondary flex items-center gap-2 mt-4 !py-2.5 text-sm"
        >
          View Submission <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
};

export default KycStatusCard;
