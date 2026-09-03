import { useEffect, useState } from "react";
import { Lock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const StaySecureTip = () => {
  const navigate = useNavigate();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(null);

  useEffect(() => {
    api.get("/users/2fa/status").then((res) => setTwoFactorEnabled(res.data.twoFactorEnabled)).catch(() => {});
  }, []);

  if (twoFactorEnabled !== false) return null; // hide while loading or once already enabled

  return (
    <button
      onClick={() => navigate("/dashboard/settings")}
      className="w-full text-left bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 hover:bg-blue-100/60 transition-colors"
    >
      <div className="h-10 w-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
        <Lock size={18} />
      </div>
      <div>
        <p className="font-semibold text-navy-900 flex items-center gap-2">
          Stay Secure
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
            <Zap size={10} /> Tip
          </span>
        </p>
        <p className="text-sm text-slate-500 mt-0.5">Enable two-factor authentication for better security</p>
      </div>
    </button>
  );
};

export default StaySecureTip;