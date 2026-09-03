import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  ShieldCheck,
  Globe2,
  Smartphone,
  Bell,
  Building2,
  ArrowRight,
  Menu,
  X,
  CreditCard,
  PiggyBank,
  Briefcase,
  TrendingUp,
  Lock,
  Zap,
  HeartHandshake,
  Users,
} from "lucide-react";
import HeroCarousel from "../components/HeroCarousel";
import FinancialGuidance from "../components/FinancialGuidance";
import OurStory from "../components/OurStory";
import WhyBankWithUs from "../components/WhyBankWithUs";
import ImportantFinancialInfo from "../components/ImportantFinancialInfo";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Testimonials from "../components/Testimonials";
import TrustedAndSecure from "../components/TrustedAndSecure";
import StatsGallery from "../components/StatsGallery";
import LiveExchangeRates from "../components/LiveExchangeRates";

const navLinks = [
  { label: "Accounts", href: "#accounts", icon: Wallet },
  { label: "Security", href: "#security", icon: ShieldCheck },
  { label: "Currencies", href: "#currencies", icon: Globe2 },
  { label: "About", href: "#about", icon: Building2 },
];

const accountTypes = [
  {
    icon: Wallet,
    name: "Checking",
    desc: "Everyday spending with a debit card, mobile deposits, and zero minimum balance.",
    accent: "bg-navy-50 text-navy",
    to: "/accounts/checking",
  },
  {
    icon: PiggyBank,
    name: "Savings",
    desc: "Watch your balance grow with automatic daily interest, no hidden fees.",
    accent: "bg-gold-50 text-gold-700",
    to: "/accounts/savings",
  },
  {
    icon: Briefcase,
    name: "Business",
    desc: "Built for founders — invoicing-ready transfers and multi-user oversight.",
    accent: "bg-navy-50 text-navy",
    to: "/accounts/business",
  },
  {
    icon: TrendingUp,
    name: "Money Market",
    desc: "Higher yields for larger balances, with the flexibility of a savings account.",
    accent: "bg-gold-50 text-gold-700",
    to: "/accounts/money-market",
  },
];

const features = [
  {
    icon: Zap,
    title: "Instant transfers",
    desc: "Move money between Swiss Meridian accounts in seconds, any time of day.",
  },
  {
    icon: Bell,
    title: "Real-time alerts",
    desc: "Email, SMS, and in-app notifications the moment money moves.",
  },
  {
    icon: Lock,
    title: "Transaction PIN",
    desc: "A second layer of protection on every transfer and payment.",
  },
  {
    icon: Globe2,
    title: "7 currencies",
    desc: "Hold your account in USD, GBP, EUR, CAD, AUD, JPY, or CHF.",
  },
  {
    icon: Smartphone,
    title: "Mobile-first design",
    desc: "A full banking experience that feels right at home on your phone.",
  },
  {
    icon: HeartHandshake,
    title: "Human support",
    desc: "A real team behind every account, not just a chatbot.",
  },
];

const currencies = [
  { code: "USD", name: "US Dollar", flag: "us" },
  { code: "GBP", name: "British Pound", flag: "gb" },
  { code: "EUR", name: "Euro", flag: "eu" },
  { code: "CAD", name: "Canadian Dollar", flag: "ca" },
  { code: "AUD", name: "Australian Dollar", flag: "au" },
  { code: "JPY", name: "Japanese Yen", flag: "jp" },
  { code: "CHF", name: "Swiss Franc", flag: "ch" },
];

const Landing = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* NAVBAR */}
      <Header />

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-10 md:pt-16">
        <div className="grid md:grid-cols-5 gap-8 items-center">
          <div className="md:col-span-2 order-2 md:order-1">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gold-700 bg-gold-50 px-3 py-1.5 rounded-full mb-5">
              <ShieldCheck size={14} /> Member FDIC
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-navy-900 leading-tight">
              Modern banking, built on{" "}
              <span className="text-gold-600">trust</span>.
            </h1>
            <p className="text-slate-500 mt-5 text-base md:text-lg leading-relaxed">
              Swiss Meridian Bank offers checking, savings, and business
              accounts with instant internal transfers, multi-currency support,
              and real-time alerts to help you stay in control of your finances.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <a href="/register" className="btn-gold flex items-center gap-2">
                Open an Account <ArrowRight size={17} />
              </a>
              <a href="/login" className="btn-secondary">
                Log In
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4 mt-10">
              {[
                { icon: Users, value: "120K+", label: "Accounts opened" },
                { icon: Globe2, value: "7", label: "Supported currencies" },
                { icon: ShieldCheck, value: "24/7", label: "Fraud monitoring" },
              ].map(({ icon: Icon, value, label }, i) => (
                <div key={label} className="flex items-center gap-6">
                  {i > 0 && (
                    <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                  )}
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-gold-50 text-gold-600 flex items-center justify-center shrink-0">
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-navy-900 leading-tight">
                        {value}
                      </p>
                      <p className="text-xs text-slate-400 leading-tight">
                        {label}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 order-1 md:order-2">
            <HeroCarousel />
          </div>
        </div>
      </section>

      <FinancialGuidance />

      {/* ACCOUNT TYPES */}
      <section
        id="accounts"
        className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-28"
      >
        <div className="max-w-xl mb-12">
          <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
            Accounts
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mt-2">
            One bank, four ways to grow
          </h2>
          <p className="text-slate-500 mt-3">
            Pick the account that fits how you actually use money — switch or
            add more later.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {accountTypes.map(({ icon: Icon, name, desc, accent, to }, i) => (
            <a
              key={name}
              href={to}
              className={`card p-6 border border-slate-100 hover:-translate-y-1 hover:shadow-card transition-all duration-300 block ${
                i % 2 === 0
                  ? "rounded-tl-[6px] rounded-br-[6px] rounded-tr-3xl rounded-bl-3xl"
                  : "rounded-tr-[6px] rounded-bl-[6px] rounded-tl-3xl rounded-br-3xl"
              }`}
            >
              <div
                className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-5 ${accent}`}
              >
                <Icon size={22} />
              </div>
              <h3 className="font-bold text-navy-900 text-lg">{name}</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                {desc}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-gold-700 mt-4">
                Learn more <ArrowRight size={14} />
              </span>
            </a>
          ))}
        </div>
      </section>

      <OurStory />
      <StatsGallery />
      <LiveExchangeRates />
      <WhyBankWithUs />
      <Testimonials />
      <TrustedAndSecure />

      {/* FEATURES */}
      <section className="bg-navy-900 py-20 md:py-28 rounded-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-wide text-gold-400">
              Why Swiss Meridian
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
              Everything a modern account needs
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-navy-800/60 border border-navy-700 rounded-tl-3xl rounded-br-3xl rounded-tr-lg rounded-bl-lg p-6 hover:bg-navy-800 transition-colors"
              >
                <div className="h-11 w-11 rounded-xl bg-gold/15 text-gold-300 flex items-center justify-center mb-4">
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section
        id="security"
        className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center"
      >
        <div className="rounded-xl3 overflow-hidden shadow-card">
          <img
            src="/security.jpg"
            alt="Bank security"
            className="w-full h-[380px] object-cover"
          />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
            Security
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mt-2">
            Your money doesn't move without your say-so
          </h2>
          <p className="text-slate-500 mt-4 leading-relaxed">
            Every transfer is locked behind your personal transaction PIN, and
            every login is protected by verified email and phone. New accounts
            are reviewed by our team before they go live — no automated
            approvals, no shortcuts.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "4-digit transaction PIN on every transfer",
              "Manual account review before activation",
              "Real-time email, SMS & in-app alerts",
              "Encrypted account and identity data",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-sm text-slate-600"
              >
                <span className="h-6 w-6 rounded-full bg-navy-50 text-navy flex items-center justify-center shrink-0">
                  <ShieldCheck size={13} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CURRENCIES */}
      <section
        id="currencies"
        className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28"
      >
        <div className="bg-white rounded-xl3 shadow-card p-8 md:p-12 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-gold-700">
              Global accounts
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mt-2">
              Bank in the currency that fits your life
            </h2>
            <p className="text-slate-500 mt-4 leading-relaxed">
              Choose your account's currency at signup — perfect for remote
              workers, frequent travelers, and international families.
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {currencies.map((c) => (
              <div
                key={c.code}
                className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-4 text-center hover:border-gold-300 hover:bg-gold-50 transition-colors"
              >
                <img
                  src={`https://flagcdn.com/w80/${c.flag}.png`}
                  alt={`${c.name} flag`}
                  className="h-8 w-11 object-cover rounded-md mx-auto mb-2 shadow-sm"
                  loading="lazy"
                />
                <p className="font-bold text-navy">{c.code}</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                  {c.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FAQ />
      <ImportantFinancialInfo />
      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
        <div className="rounded-xl3 bg-gradient-to-br from-navy-800 to-navy-900 px-8 md:px-16 py-14 md:py-16 text-center relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/10" />
          <div className="absolute -left-10 -bottom-10 h-52 w-52 rounded-full bg-gold/10" />
          <h2 className="text-3xl md:text-4xl font-bold text-white relative">
            Ready to bank differently?
          </h2>
          <p className="text-slate-300 mt-3 max-w-lg mx-auto relative">
            Opening an account takes about five minutes. Verification and admin
            approval keep it real — no instant, unchecked signups.
          </p>
          <a
            href="/register"
            className="btn-gold inline-flex items-center gap-2 mt-8 relative"
          >
            Open Your Account <ArrowRight size={17} />
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Landing;
