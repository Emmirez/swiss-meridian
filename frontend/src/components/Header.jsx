import { useState } from "react";
import {
  Wallet,
  ShieldCheck,
  Globe2,
  Building2,
  ArrowRight,
  ArrowLeft,
  Menu,
  X,
  Home,
  ChevronDown,
  PiggyBank,
  Briefcase,
  TrendingUp,
  Mail,
} from "lucide-react";

const accountDropdown = [
  {
    label: "Checking",
    to: "/accounts/checking",
    icon: Wallet,
    desc: "Everyday spending",
  },
  {
    label: "Savings",
    to: "/accounts/savings",
    icon: PiggyBank,
    desc: "Grow your balance",
  },
  {
    label: "Business",
    to: "/accounts/business",
    icon: Briefcase,
    desc: "For your company",
  },
  {
    label: "Money Market",
    to: "/accounts/money-market",
    icon: TrendingUp,
    desc: "Higher yields",
  },
];

const navLinks = [
  { label: "Home", to: "/", icon: Home },
  { label: "Security", to: "/security", icon: ShieldCheck },
  { label: "Currencies", to: "/currencies", icon: Globe2 },
  { label: "About", to: "/about", icon: Building2 },
  { label: "Contact Us", to: "/contact", icon: Mail },
];

const Header = ({ showBackHome = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [mobileAccountsOpen, setMobileAccountsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-20">
        <a href="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src="/logo.png"
            alt="Swiss Meridian Bank"
            className="h-10 w-auto shrink-0"
            onError={(e) => (e.target.style.display = "none")}
          />
          <span className="font-display font-bold text-lg tracking-tight leading-none whitespace-nowrap">
            <span className="text-navy-900">Swiss</span>{" "}
            <span className="text-gold-600">Meridian Bank</span>
          </span>
        </a>

        {showBackHome ? (
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-navy transition"
            >
              <ArrowLeft size={15} /> Back to Home
            </a>
            <a href="/login" className="btn-secondary !py-2.5">
              Log In
            </a>

            <a
              href="/register"
              className="btn-primary !py-2.5 hidden sm:flex items-center gap-1.5"
            >
              Open an Account <ArrowRight size={16} />
            </a>
          </div>
        ) : (
          <>
            <nav className="hidden lg:flex items-center gap-6">
              <a
                href={navLinks[0].to}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-navy transition"
              >
                <Home size={16} /> Home
              </a>

              {/* Accounts dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setAccountsOpen(true)}
                onMouseLeave={() => setAccountsOpen(false)}
              >
                <button className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-navy transition">
                  <Wallet size={16} /> Accounts{" "}
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${accountsOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {accountsOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-72">
                    <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-2">
                      {accountDropdown.map(
                        ({ label, to, icon: Icon, desc }) => (
                          <a
                            key={to}
                            href={to}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-navy-50 transition-colors"
                          >
                            <div className="h-9 w-9 rounded-lg bg-navy-50 text-navy flex items-center justify-center shrink-0">
                              <Icon size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-navy-900">
                                {label}
                              </p>
                              <p className="text-xs text-slate-400">{desc}</p>
                            </div>
                          </a>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>

              {navLinks.slice(1).map(({ label, to, icon: Icon }) => (
                <a
                  key={to}
                  href={to}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-navy transition"
                >
                  <Icon size={16} /> {label}
                </a>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <a
                href="/login"
                className="btn-secondary !py-2.5 whitespace-nowrap"
              >
                Log In
              </a>

              <a
                href="/register"
                className="btn-primary !py-2.5 flex items-center gap-1.5 whitespace-nowrap"
              >
                Open an Account <ArrowRight size={16} />
              </a>
            </div>

            <button
              className="lg:hidden text-navy shrink-0"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </>
        )}
      </div>

      {!showBackHome && menuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-1">
          <a
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 py-2"
            onClick={() => setMenuOpen(false)}
          >
            <Home size={16} /> Home
          </a>

          <button
            onClick={() => setMobileAccountsOpen((o) => !o)}
            className="w-full flex items-center justify-between gap-2 text-sm font-medium text-slate-600 py-2"
          >
            <span className="flex items-center gap-2">
              <Wallet size={16} /> Accounts
            </span>
            <ChevronDown
              size={14}
              className={`transition-transform ${mobileAccountsOpen ? "rotate-180" : ""}`}
            />
          </button>
          {mobileAccountsOpen && (
            <div className="pl-6 space-y-1">
              {accountDropdown.map(({ label, to, icon: Icon }) => (
                <a
                  key={to}
                  href={to}
                  className="flex items-center gap-2 text-sm text-slate-500 py-1.5"
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon size={14} /> {label}
                </a>
              ))}
            </div>
          )}

          {navLinks.slice(1).map(({ label, to, icon: Icon }) => (
            <a
              key={to}
              href={to}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 py-2"
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={16} /> {label}
            </a>
          ))}

          <div className="flex gap-3 pt-3">
            <a href="/login" className="btn-secondary flex-1 text-center">
              Log In
            </a>
            <a href="/register" className="btn-primary flex-1 text-center">
              Open Account
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
