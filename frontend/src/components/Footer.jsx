import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  ShieldCheck,
  Lock,
} from "lucide-react";

const accountLinks = [
  { label: "Checking", to: "/accounts/checking" },
  { label: "Savings", to: "/accounts/savings" },
  { label: "Business", to: "/accounts/business" },
  { label: "Money Market", to: "/accounts/money-market" },
];

const companyLinks = [
  { label: "About", to: "/about" },
  { label: "Security", to: "/security" },
  { label: "Help Center", to: "/help" },
  { label: "Support", to: "/contact" },
  { label: "Careers", to: "/careers" },
];

const legalLinks = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
  { label: "Deposit Disclosures", to: "/disclosures" },
];

const socialLinks = [
  { icon: Twitter, href: "#" },
  { icon: Instagram, href: "#" },
  { icon: Linkedin, href: "#" },
  { icon: Facebook, href: "#" },
];

const Footer = () => {
  return (
    <footer className="bg-navy-900 rounded-md">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-10">
        <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-10 md:gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src="/logo.png"
                alt="Swiss Meridian Bank"
                className="h-9 w-auto"
                onError={(e) => (e.target.style.display = "none")}
              />
              <span className="font-display font-bold text-lg tracking-tight leading-none">
                <span className="text-white">Swiss</span>{" "}
                <span className="text-gold-400">Meridian Bank</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Modern checking, savings, and business banking — built for how
              people actually manage money today.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="h-9 w-9 rounded-full bg-white/5 hover:bg-gold/20 text-slate-300 hover:text-gold-300 flex items-center justify-center transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="font-display font-semibold text-white text-sm tracking-wide mb-4">
              Accounts
            </p>
            <ul className="space-y-2.5 text-sm text-slate-400">
              {accountLinks.map(({ label, to }) => (
                <li key={label}>
                  <a
                    href={to}
                    className="hover:text-gold-300 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-display font-semibold text-white text-sm tracking-wide mb-4">
              Company
            </p>
            <ul className="space-y-2.5 text-sm text-slate-400">
              {companyLinks.map(({ label, to }) => (
                <li key={label}>
                  <a
                    href={to}
                    className="hover:text-gold-300 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-display font-semibold text-white text-sm tracking-wide mb-4">
              Legal
            </p>
            <ul className="space-y-2.5 text-sm text-slate-400">
              {legalLinks.map(({ label, to }) => (
                <li key={label}>
                  <a
                    href={to}
                    className="hover:text-gold-300 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-6 mt-12 pt-8 border-t border-white/10">
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Lock size={13} className="text-gold-400" /> 256-bit encryption
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck size={13} className="text-gold-400" /> FDIC Insured
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 pt-6 border-t border-white/10">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Swiss Meridian Bank. All rights
            reserved.
          </p>
          <p className="text-xs text-slate-500">
            Swiss Meridian Bank, Member FDIC. All deposit accounts are insured
            by the Federal Deposit Insurance Corporation (FDIC) to the maximum
            amount permitted by law. Balances, transfers, and transaction data
            are provided for informational purposes only and may not reflect
            recent or pending activity.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
