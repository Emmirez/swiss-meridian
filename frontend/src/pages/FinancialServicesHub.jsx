import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Wallet,
  Landmark,
  DollarSign,
  FileText,
  CreditCard,
  Zap,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import TopBar from "../components/TopBar";
import { useUserMenu } from "../components/DashboardLayout";

const services = [
  {
    key: "loans",
    label: "Loans",
    desc: "Quick approval process with competitive rates",
    icon: Landmark,
    iconBg: "bg-blue-50 text-blue-600",
    gradient: "from-blue-500 to-cyan-500",
    tags: [
      { label: "Fast Approval", icon: Zap, color: "text-blue-600" },
      { label: "Low Interest", icon: DollarSign, color: "text-emerald-600" },
      { label: "Secure", icon: ShieldCheck, color: "text-purple-600" },
    ],
    benefits: [
      "Flexible repayment terms",
      "No hidden fees",
      "Online application",
      "Fast admin review",
    ],
    to: "/dashboard/loans",
  },
  {
    key: "grants",
    label: "Grants",
    desc: "Funding support with no repayment required",
    icon: DollarSign,
    iconBg: "bg-emerald-50 text-emerald-600",
    gradient: "from-emerald-500 to-teal-500",
    tags: [
      { label: "No Repayment", icon: CheckCircle2, color: "text-emerald-600" },
      { label: "Multiple Categories", icon: Sparkles, color: "text-gold-600" },
      { label: "Secure", icon: ShieldCheck, color: "text-purple-600" },
    ],
    benefits: [
      "Small Business, Education & more",
      "Simple proposal form",
      "Direct disbursement",
      "Fast admin review",
    ],
    to: "/dashboard/grants",
  },
  {
    key: "tax-refunds",
    label: "Tax Refunds",
    desc: "Submit and track your tax refund claims",
    icon: FileText,
    iconBg: "bg-purple-50 text-purple-600",
    gradient: "from-purple-500 to-fuchsia-500",
    tags: [
      { label: "Fast Processing", icon: Zap, color: "text-blue-600" },
      { label: "Any Recent Year", icon: FileText, color: "text-purple-600" },
      { label: "Secure", icon: ShieldCheck, color: "text-emerald-600" },
    ],
    benefits: [
      "Claims for the last 6 years",
      "Simple online form",
      "Direct account credit",
      "Track claim status",
    ],
    to: "/dashboard/tax-refunds",
  },
  {
    key: "cards",
    label: "Virtual Cards",
    desc: "Request a debit card on any major network",
    icon: CreditCard,
    iconBg: "bg-orange-50 text-orange-600",
    gradient: "from-orange-500 to-red-500",
    tags: [
      { label: "Instant Issue", icon: Zap, color: "text-orange-600" },
      { label: "Multiple Networks", icon: CreditCard, color: "text-blue-600" },
      { label: "Secure", icon: ShieldCheck, color: "text-purple-600" },
    ],
    benefits: [
      "Visa, Mastercard, Verve & Amex",
      "Freeze or unfreeze anytime",
      "Custom spending controls",
      "One card per account",
    ],
    to: "/dashboard/cards",
  },
];

const FinancialServicesHub = () => {
  const { onMenuClick } = useUserMenu();

  return (
    <div>
      <TopBar onMenuClick={onMenuClick} />

      <div className="px-4 md:px-8 max-w-2xl pb-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="h-16 w-16 rounded-full bg-navy-50 text-navy flex items-center justify-center mx-auto mb-4">
            <Wallet size={28} />
          </div>
          <h1 className="text-xl font-bold text-navy-900">
            Financial Services
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Explore our comprehensive financial solutions
          </p>
        </div>

        {/* Service cards */}
        <div className="space-y-5">
          {services.map(
            ({
              key,
              label,
              desc,
              icon: Icon,
              iconBg,
              gradient,
              tags,
              benefits,
              to,
            }) => (
              <div key={key} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}
                    >
                      <Icon size={22} />
                    </div>
                    <div>
                      <p className="font-bold text-navy-900">{label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{" "}
                    Available
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  {tags.map(({ label: tagLabel, icon: TagIcon, color }) => (
                    <span
                      key={tagLabel}
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${color}`}
                    >
                      <TagIcon size={13} /> {tagLabel}
                    </span>
                  ))}
                </div>

                <div className="bg-slate-50 rounded-xl p-4 mt-4">
                  <p className="text-xs font-semibold text-navy-900 mb-2.5">
                    Key Benefits:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    {benefits.map((b) => (
                      <p
                        key={b}
                        className="text-xs text-slate-500 flex items-start gap-1.5"
                      >
                        <CheckCircle2
                          size={13}
                          className="text-emerald-500 shrink-0 mt-0.5"
                        />{" "}
                        {b}
                      </p>
                    ))}
                  </div>
                </div>

                <a
                  href={to}
                  className={`w-full text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 mt-4 bg-gradient-to-r ${gradient} hover:opacity-90 transition-opacity`}
                >
                  <Icon size={16} /> Apply Now <ChevronRight size={15} />
                </a>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialServicesHub;
