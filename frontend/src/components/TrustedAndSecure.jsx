import {
  Lock,
  ShieldCheck,
  Building,
  Award,
  Database,
  BadgeCheck,
} from "lucide-react";

const badges = [
  {
    icon: ShieldCheck,
    label: "FDIC Insured",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Building,
    label: "Member SIPC",
    color: "bg-navy-50 text-navy-700",
  },
  {
    icon: Lock,
    label: "256-bit Encryption",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: BadgeCheck,
    label: "BBB Accredited",
    color: "bg-red-50 text-red-500",
  },
  {
    icon: Award,
    label: "PCI DSS Compliant",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Database,
    label: "Multi-Factor Auth",
    color: "bg-slate-50 text-slate-700",
  },
];

const TrustedAndSecure = () => {
  return (
    <section className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-20 text-center">
      <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
        Trusted and Secure
      </span>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-10 mt-10 max-w-3xl mx-auto">
        {badges.map(({ icon: Icon, label, color }) => (
          <div key={label} className="flex flex-col items-center">
            <div
              className={`h-16 w-16 rounded-full flex items-center justify-center mb-3 ${color}`}
            >
              <Icon size={26} />
            </div>
            <p className="text-sm font-semibold text-navy-900 text-center">
              {label}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 mt-8 max-w-md mx-auto">
        Swiss Meridian Bank, Member FDIC. Deposits insured up to $250,000 per
        depositor, per ownership category. SIPC protection available for
        securities accounts.
      </p>
    </section>
  );
};

export default TrustedAndSecure;
