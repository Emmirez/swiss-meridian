import { useNavigate } from "react-router-dom";
import { Landmark, Globe2, Building2 } from "lucide-react";

const options = [
  //   {
  //     key: "internal",
  //     label: "Swiss Meridian Transfer",
  //     desc: "Send to another Swiss Meridian account",
  //     icon: Landmark,
  //     bg: "bg-navy-800",
  //     to: "/dashboard/transfer?mode=internal",
  //   },
  {
    key: "external",
    label: "Local Transfer",
    desc: "Domestic bank transfer",
    icon: Building2,
    bg: "bg-emerald-500",
    to: "/dashboard/transfer?mode=external",
  },
  {
    key: "international",
    label: "Wire Transfer",
    desc: "International bank transfer",
    icon: Globe2,
    bg: "bg-blue-500",
    to: "/dashboard/transfer?mode=international",
  },
  {
    key: "paypal",
    label: "PayPal",
    desc: "Send via PayPal",
    monogram: "P",
    bg: "bg-[#0070BA]",
    to: "/dashboard/transfer?mode=paypal",
  },
  {
    key: "zelle",
    label: "Zelle",
    desc: "Send via Zelle",
    monogram: "Z",
    bg: "bg-[#6D1ED4]",
    to: "/dashboard/transfer?mode=zelle",
  },
];

const SendMoney = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
        Send Money
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.key}
              onClick={() => navigate(opt.to)}
              className="card p-4 text-left hover:-translate-y-0.5 hover:shadow-card transition-all"
            >
              <div
                className={`h-11 w-11 rounded-2xl flex items-center justify-center mb-3 text-white ${opt.bg}`}
              >
                {Icon ? (
                  <Icon size={20} />
                ) : (
                  <span className="font-bold text-lg">{opt.monogram}</span>
                )}
              </div>
              <p className="font-semibold text-navy-900 text-sm">{opt.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SendMoney;
