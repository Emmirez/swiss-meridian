import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ArrowRight,
  KeyRound,
  UserCheck,
  Bell,
  Lock,
  Eye,
  Fingerprint,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const points = [
  {
    icon: KeyRound,
    title: "4-Digit Transaction PIN",
    desc: "Required on every transfer, separate from your login password.",
  },
  {
    icon: UserCheck,
    title: "Manual Account Review",
    desc: "Every new account is reviewed by our team before it goes live.",
  },
  {
    icon: Bell,
    title: "Real-Time Alerts",
    desc: "Email, SMS, and in-app notifications the moment money moves.",
  },
  {
    icon: Lock,
    title: "Encrypted Data",
    desc: "Identity and account data encrypted at rest and in transit.",
  },
  {
    icon: Eye,
    title: "24/7 Fraud Monitoring",
    desc: "Unusual activity gets flagged and reviewed around the clock.",
  },
  {
    icon: Fingerprint,
    title: "Verified Identity",
    desc: "Email and phone verification required before any account goes active.",
  },
];

const steps = [
  {
    step: "01",
    title: "You initiate a transfer",
    desc: "Every transfer request starts with your login already verified.",
  },
  {
    step: "02",
    title: "Your PIN confirms it's really you",
    desc: "A second, separate credential stands between a request and a completed transfer.",
  },
  {
    step: "03",
    title: "You're notified instantly",
    desc: "Email, SMS, and in-app alerts fire the moment the transfer completes.",
  },
  {
    step: "04",
    title: "Our team keeps watching",
    desc: "Account activity is monitored continuously, not just at the moment of signup.",
  },
];

const Security = () => (
  <div className="bg-slate-50 min-h-screen">
    <Header />

    {/* HERO */}
    <section className="max-w-7xl mx-auto px-4 md:px-8 pt-16 md:pt-20 grid md:grid-cols-2 gap-10 items-center">
      <div>
        <div className="h-14 w-14 rounded-2xl bg-navy-50 text-navy flex items-center justify-center mb-5">
          <ShieldCheck size={26} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-navy-900 leading-tight">
          Security at Swiss Meridian Bank
        </h1>
        <p className="text-slate-500 mt-5 text-base md:text-lg leading-relaxed">
          Your money doesn't move without your say-so. Every account, every
          transfer, and every login is built around one idea: nothing happens
          automatically that shouldn't.
        </p>
        <Link
          to="/register"
          className="btn-primary inline-flex items-center gap-2 mt-8"
        >
          Open Your Account <ArrowRight size={16} />
        </Link>
      </div>
      <div className="rounded-xl3 overflow-hidden shadow-card h-[280px] md:h-[380px]">
        <img
          src="/security.jpg"
          alt="Swiss Meridian Bank security"
          className="w-full h-full object-cover"
        />
      </div>
    </section>

    {/* CORE PROTECTIONS */}
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
      <div className="max-w-xl mb-10">
        <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
          What's In Place
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mt-2">
          Six layers, working together
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
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

    {/* HOW IT WORKS + IMAGE */}
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20 grid md:grid-cols-5 gap-10 md:gap-14 items-center">
      <div className="md:col-span-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
          How It Works
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mt-2 mb-6">
          What happens behind every transfer
        </h2>
        <div className="space-y-5">
          {steps.map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4">
              <span className="text-2xl font-bold text-gold-300 shrink-0 w-10">
                {step}
              </span>
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
      <div className="md:col-span-2 rounded-xl3 overflow-hidden shadow-card h-[300px] md:h-[420px]">
        <img
          src="/wellbank4.jpg"
          alt="Reviewing a secure transaction"
          className="w-full h-full object-cover"
        />
      </div>
    </section>

    {/* SUSPICIOUS ACTIVITY */}
    <section className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-14">
      <div className="card p-6 md:p-8 flex flex-col sm:flex-row items-start gap-5">
        <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
          <AlertTriangle size={22} />
        </div>
        <div>
          <h3 className="font-bold text-navy-900 text-lg">
            Notice something off?
          </h3>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            If you spot a transaction you don't recognize or suspect
            unauthorized access to your account, contact our support team right
            away. We never ask for your full PIN or password by phone, email, or
            text.
          </p>
          <a
            href="/contact"
            className="btn-secondary inline-flex items-center gap-2 mt-5"
          >
            Contact Support <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>

    {/* GOOD TO KNOW */}
    <section className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-14">
      <div className="card p-6 md:p-8">
        <h3 className="font-bold text-navy-900 text-lg mb-4">Good to know</h3>
        <ul className="space-y-3">
          {[
            "Your transaction PIN is never the same as your login password.",
            "New accounts stay in review status until a real person approves them.",
            "You control which notification channels are active from your Profile page.",
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
          Ready to bank securely?
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

export default Security;
