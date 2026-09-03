import { Link } from "react-router-dom";
import {
  Wallet,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Bell,
  Smartphone,
  GraduationCap,
  Briefcase,
  Users,
  ShieldCheck,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const whoFor = [
  {
    icon: GraduationCap,
    title: "Students & New Grads",
    desc: "No minimum balance and no monthly fees while you're just getting started.",
  },
  {
    icon: Briefcase,
    title: "Everyday Professionals",
    desc: "A dashboard built for real spending — not spreadsheets and paper statements.",
  },
  {
    icon: Users,
    title: "Families",
    desc: "Clear balances and instant alerts so nothing about your account is a surprise.",
  },
];

const features = [
  {
    icon: CreditCard,
    title: "Free Debit Card",
    desc: "Instant freeze and unfreeze from your dashboard — no calling support to lock it down.",
  },
  {
    icon: Bell,
    title: "Real-Time Notifications",
    desc: "Email, SMS, and in-app alerts the moment a transaction posts.",
  },
  {
    icon: Smartphone,
    title: "Mobile Check Deposit",
    desc: "Deposit checks from your phone — no branch visit required.",
  },
  {
    icon: Wallet,
    title: "No Monthly Fees",
    desc: "No minimum balance requirement and no maintenance charges, ever.",
  },
];

const requirements = [
  "A valid government-issued ID",
  "Your Social Security Number",
  "A US mailing address",
  "A 4-digit transaction PIN, set at signup",
];

const Checking = () => (
  <div className="bg-slate-50 min-h-screen">
    <Header />

    {/* HERO */}
    <section className="max-w-7xl mx-auto px-4 md:px-8 pt-16 md:pt-20 grid md:grid-cols-2 gap-10 items-center">
      <div>
        <div className="h-14 w-14 rounded-2xl bg-navy-50 text-navy flex items-center justify-center mb-5">
          <Wallet size={26} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-navy-900 leading-tight">
          Checking Account
        </h1>
        <p className="text-slate-500 mt-5 text-base md:text-lg leading-relaxed">
          Everyday spending, built for how you actually use money — no minimum
          balance, no surprise fees, and a dashboard that shows you exactly
          where your money is going.
        </p>
        <Link
          to="/register"
          className="btn-primary inline-flex items-center gap-2 mt-8"
        >
          Open a Checking Account <ArrowRight size={16} />
        </Link>
      </div>
      <div className="rounded-xl3 overflow-hidden shadow-card h-[280px] md:h-[360px]">
        <img
          src="/check2.jpg"
          alt="Swiss Meridian Bank checking account"
          className="w-full h-full object-cover"
        />
      </div>
    </section>

    {/* WHO IT'S FOR */}
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
      <div className="max-w-xl mb-10">
        <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
          Who It's For
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mt-2">
          Built for everyday life
        </h2>
      </div>
      <div className="grid sm:grid-cols-3 gap-5">
        {whoFor.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-6">
            <div className="h-11 w-11 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center mb-4">
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

    {/* FEATURES + IMAGE */}
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20 grid md:grid-cols-5 gap-10 md:gap-14 items-center">
      <div className="md:col-span-2 rounded-xl3 overflow-hidden shadow-card h-[300px] md:h-[420px] order-2 md:order-1">
        <img
          src="/checking.jpg"
          alt="Mobile banking on a checking account"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="md:col-span-3 order-1 md:order-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
          What You Get
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mt-2 mb-6">
          Everything a checking account needs
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-3">
              <div className="h-10 w-10 rounded-xl bg-navy-50 text-navy flex items-center justify-center shrink-0">
                <Icon size={17} />
              </div>
              <div>
                <p className="font-semibold text-navy-900 text-sm">{title}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* REQUIREMENTS */}
    <section className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-14">
      <div className="card p-6 md:p-8">
        <h3 className="font-bold text-navy-900 text-lg mb-4 flex items-center gap-2">
          <ShieldCheck size={19} className="text-gold-600" /> What you'll need
          to apply
        </h3>
        <ul className="space-y-3">
          {requirements.map((item) => (
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
        <p className="text-xs text-slate-400 mt-5">
          Every application goes through manual review — most checking accounts
          are approved within 1-2 business days.
        </p>
      </div>
    </section>

    {/* CTA */}
    <section className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
      <div className="rounded-xl3 bg-gradient-to-br from-navy-800 to-navy-900 px-8 md:px-16 py-14 text-center relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/10" />
        <div className="absolute -left-10 -bottom-10 h-52 w-52 rounded-full bg-gold/10" />
        <h2 className="text-3xl md:text-4xl font-bold text-white relative">
          Ready for everyday banking?
        </h2>
        <p className="text-slate-300 mt-3 max-w-lg mx-auto relative">
          Opening a checking account takes about five minutes.
        </p>
        <Link
          to="/register"
          className="btn-gold inline-flex items-center gap-2 mt-8 relative"
        >
          Open a Checking Account <ArrowRight size={17} />
        </Link>
      </div>
    </section>

    <Footer />
  </div>
);

export default Checking;
