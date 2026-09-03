import { Landmark, DollarSign, FileText, CreditCard } from "lucide-react";

const services = [
  {
    key: "loans",
    label: "Loans",
    desc: "Quick approval process",
    icon: Landmark,
    iconBg: "bg-blue-50 text-blue-600",
    btnBg: "bg-blue-600 hover:bg-blue-700",
    to: "/dashboard/loans",
  },
  {
    key: "grants",
    label: "Grants",
    desc: "No repayment required",
    icon: DollarSign,
    iconBg: "bg-emerald-50 text-emerald-600",
    btnBg: "bg-emerald-600 hover:bg-emerald-700",
    to: "/dashboard/grants",
  },
  {
    key: "tax-refunds",
    label: "Tax Refunds",
    desc: "Fast processing",
    icon: FileText,
    iconBg: "bg-purple-50 text-purple-600",
    btnBg: "bg-purple-600 hover:bg-purple-700",
    to: "/dashboard/tax-refunds",
  },
  {
    key: "cards",
    label: "Virtual Cards",
    desc: "Instant virtual cards",
    icon: CreditCard,
    iconBg: "bg-orange-50 text-orange-600",
    btnBg: "bg-orange-500 hover:bg-orange-600",
    to: "/dashboard/cards",
  },
];

const FinancialServices = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-navy-900">Financial Services</h3>
        <a
          href="/dashboard/financial-services"
          className="text-xs text-navy font-medium flex items-center gap-0.5"
        >
          View All →
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {services.map(({ key, label, desc, icon: Icon, iconBg, btnBg, to }) => (
          <div key={key} className="card p-4">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${iconBg}`}
            >
              <Icon size={18} />
            </div>
            <p className="font-semibold text-navy-900 text-sm">{label}</p>
            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{" "}
              Available
            </p>
            <p className="text-xs text-slate-400 mt-1.5 mb-3">{desc}</p>

            <a
              href={to}
              className={`w-full text-white rounded-xl py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${btnBg}`}
            >
              <Icon size={13} /> Apply Now
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinancialServices;
