import { Link } from "react-router-dom";
import {
  ArrowRight,
  Globe2,
  RefreshCw,
  Landmark,
  CheckCircle2,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const currencies = [
  { code: "USD", name: "US Dollar", flag: "us", region: "United States" },
  { code: "GBP", name: "British Pound", flag: "gb", region: "United Kingdom" },
  { code: "EUR", name: "Euro", flag: "eu", region: "Eurozone" },
  { code: "CAD", name: "Canadian Dollar", flag: "ca", region: "Canada" },
  { code: "AUD", name: "Australian Dollar", flag: "au", region: "Australia" },
  { code: "JPY", name: "Japanese Yen", flag: "jp", region: "Japan" },
  { code: "CHF", name: "Swiss Franc", flag: "ch", region: "Switzerland" },
];

const points = [
  {
    icon: Globe2,
    title: "Pick once, at signup",
    desc: "Your account's currency is set when you register and shows up everywhere — balance, transfers, statements.",
  },
  {
    icon: RefreshCw,
    title: "Same-currency transfers",
    desc: "Internal transfers move instantly between accounts holding the same currency, with no conversion step in the way.",
  },
  {
    icon: Landmark,
    title: "Built for real life abroad",
    desc: "Paid in one currency, spending in another, saving in a third — Swiss Meridian Bank is built around that reality.",
  },
];

const Currencies = () => (
  <div className="bg-slate-50 min-h-screen">
    <Header />

    {/* HERO */}
    <section className="max-w-7xl mx-auto px-4 md:px-8 pt-16 md:pt-20 grid md:grid-cols-2 gap-10 items-center">
      <div>
        <span className="inline-block text-xs font-semibold uppercase tracking-wide text-gold-700 bg-gold-50 px-3 py-1.5 rounded-full mb-5">
          Global Accounts
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-navy-900 leading-tight">
          Bank in the currency that fits your life
        </h1>
        <p className="text-slate-500 mt-5 text-base md:text-lg leading-relaxed">
          Choose your account's currency at signup — perfect for remote workers,
          frequent travelers, and international families who don't want their
          bank account working against them.
        </p>
        <Link
          to="/register"
          className="btn-primary inline-flex items-center gap-2 mt-8"
        >
          Open Your Account <ArrowRight size={16} />
        </Link>
      </div>
      <div className="rounded-xl3 overflow-hidden shadow-card h-[280px] md:h-[360px]">
        <img
          src="/currency.jpg"
          alt="Global currencies and international banking"
          className="w-full h-full object-cover"
        />
      </div>
    </section>

    {/* WHY IT MATTERS */}
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
      <div className="grid sm:grid-cols-3 gap-5">
        {points.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-6">
            <div className="h-11 w-11 rounded-xl bg-navy-50 text-navy flex items-center justify-center mb-4">
              <Icon size={19} />
            </div>
            <h3 className="font-bold text-navy-900">{title}</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>

    {/* CURRENCY GRID */}
    <section className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-14">
      <div className="max-w-xl mb-10">
        <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
          7 Supported Currencies
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mt-2">
          Available at signup
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {currencies.map((c) => (
          <div
            key={c.code}
            className="card p-5 text-center hover:border-gold-300 border border-transparent transition-colors"
          >
            <img
              src={`https://flagcdn.com/w80/${c.flag}.png`}
              alt={`${c.name} flag`}
              className="h-10 w-14 object-cover rounded-md mx-auto mb-3 shadow-sm"
              loading="lazy"
            />
            <p className="font-bold text-navy text-lg">{c.code}</p>
            <p className="text-xs text-slate-400 mt-1">{c.name}</p>
            <p className="text-[11px] text-slate-300 mt-0.5">{c.region}</p>
          </div>
        ))}
      </div>
    </section>

    {/* GOOD TO KNOW */}
    <section className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-14">
      <div className="card p-6 md:p-8">
        <h3 className="font-bold text-navy-900 text-lg mb-4">Good to know</h3>
        <ul className="space-y-3">
          {[
            "Your account currency is fixed at signup and shown on every statement and transfer.",
            "Transfers between Swiss Meridian accounts currently work only between matching currencies.",
            "Cross-currency conversion is on our roadmap — for now, pick the currency you use most.",
          ].map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 text-sm text-slate-600"
            >
              <CheckCircle2
                size={17}
                className="text-emerald-500 shrink-0 mt-0.5"
              />{" "}
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>

    {/* CTA */}
    <section className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
      <div className="rounded-xl3 bg-gradient-to-br from-navy-800 to-navy-900 px-8 md:px-16 py-14 text-center relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/10" />
        <div className="absolute -left-10 -bottom-10 h-52 w-52 rounded-full bg-gold/10" />
        <h2 className="text-3xl md:text-4xl font-bold text-white relative">
          Ready to choose your currency?
        </h2>
        <p className="text-slate-300 mt-3 max-w-lg mx-auto relative">
          Opening an account takes about five minutes.
        </p>
        <Link
          to="/register"
          className="btn-gold inline-flex items-center gap-2 mt-8 relative"
        >
          Open Your Account <ArrowRight size={17} />
        </Link>
      </div>
    </section>

    <Footer />
  </div>
);

export default Currencies;
