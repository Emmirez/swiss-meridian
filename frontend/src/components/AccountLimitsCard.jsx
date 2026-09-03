import { useEffect, useState } from "react";
import { Gauge, ChevronDown, Clock3 } from "lucide-react";
import api from "../api/axios";

const formatMoney = (n, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n || 0);

const LimitBar = ({ icon: Icon, label, used, limit, currency }) => {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const remaining = Math.max(limit - used, 0);
  return (
    <div className="py-3 border-b border-slate-50 last:border-0">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium text-navy-900">
          <Icon size={14} className="text-slate-400" /> {label}
        </span>
        <span className="text-slate-500">{formatMoney(used, currency)} / {formatMoney(limit, currency)}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
        <div className="h-full bg-navy rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-emerald-600 mt-1">{formatMoney(remaining, currency)} remaining</p>
    </div>
  );
};

const AccountLimitsCard = ({ currency = "USD" }) => {
  const [data, setData] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    api.get("/users/limits").then((res) => setData(res.data));
  }, []);

  if (!data) return null;

  const { limits, usage } = data;
  const dailyRemaining = Math.max(limits.dailyLimit - usage.daily, 0);

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Gauge size={18} />
          </div>
          <div>
            <p className="font-semibold text-navy-900 text-sm">Account Limits</p>
            <p className="text-xs text-emerald-600">Daily: {formatMoney(dailyRemaining, currency)} remaining</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-navy shrink-0">
          {expanded ? "Hide" : "View"} <ChevronDown size={14} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          <LimitBar icon={Clock3} label="Daily Limit" used={usage.daily} limit={limits.dailyLimit} currency={currency} />
          <LimitBar icon={Clock3} label="Weekly Limit" used={usage.weekly} limit={limits.weeklyLimit} currency={currency} />
          <LimitBar icon={Clock3} label="Monthly Limit" used={usage.monthly} limit={limits.monthlyLimit} currency={currency} />
          <div className="flex items-center justify-between text-sm pt-3">
            <span className="font-medium text-navy-900">Per Transaction</span>
            <span className="font-semibold text-navy">{formatMoney(limits.perTransactionLimit, currency)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountLimitsCard;