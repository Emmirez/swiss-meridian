import { useState } from "react";
import {
  Search,
  LifeBuoy,
  CreditCard,
  ShieldCheck,
  ArrowLeftRight,
  UserCog,
  ArrowRight,
  ChevronDown,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const categories = [
  { icon: UserCog, label: "Account Basics" },
  { icon: ArrowLeftRight, label: "Transfers & Payments" },
  { icon: CreditCard, label: "Cards & Spending" },
  { icon: ShieldCheck, label: "Security & Privacy" },
];

const helpTopics = [
  {
    q: "How do I open a Swiss Meridian Bank account?",
    a: "To open an account, visit our website and select 'Open an Account.' You'll need to provide personal identification, contact information, and choose your account type. The application takes approximately 5-10 minutes to complete. Once submitted, our team will verify your information and notify you of approval via email.",
  },
  {
    q: "How long does account approval take?",
    a: "Most applications are reviewed and approved within 1-2 business days. You'll receive an email confirmation once your account is active. In some cases, we may contact you for additional verification to ensure the security of your account.",
  },
  {
    q: "Why hasn't my transfer shown up yet?",
    a: "Internal transfers between Swiss Meridian Bank accounts are typically reflected immediately. External transfers to other financial institutions may take 1-3 business days, depending on the receiving bank's processing times and federal clearing schedules.",
  },
  {
    q: "How do I freeze my debit card?",
    a: "You can freeze your debit card immediately through our mobile app or online banking. Navigate to 'Cards' in your dashboard, select the card, and tap 'Freeze Card.' The freeze takes effect instantly. You can unfreeze it at any time through the same interface.",
  },
  {
    q: "I forgot my transaction PIN. What do I do?",
    a: "For security reasons, PIN resets require identity verification. Please contact our customer support team, who will guide you through the verification process. Once verified, we'll assist you in resetting your PIN securely.",
  },
  {
    q: "How do I manage notification preferences?",
    a: "You can customize your notification preferences by logging into your account and navigating to 'Profile' > 'Notification Settings.' From there, you can independently toggle email, SMS, and in-app alerts for transactions, balances, and security updates.",
  },
  {
    q: "What security measures does Swiss Meridian Bank use?",
    a: "Swiss Meridian Bank employs industry-leading security measures, including 256-bit SSL encryption, multi-factor authentication, and 24/7 fraud monitoring. We are FDIC insured and comply with all federal banking regulations to protect your information and deposits.",
  },
  {
    q: "How do I update my contact information?",
    a: "You can update your contact information by logging into your account and navigating to 'Profile' > 'Personal Information.' For security purposes, certain changes may require additional verification. You can also visit a branch or contact customer support for assistance.",
  },
];

const Help = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(0);

  const filtered = helpTopics.filter((t) =>
    t.q.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 pt-16 md:pt-20 text-center">
        <div className="h-14 w-14 rounded-2xl bg-navy-50 text-navy flex items-center justify-center mx-auto mb-5">
          <LifeBuoy size={26} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-navy-900">
          Customer Support Center
        </h1>
        <p className="text-slate-500 mt-4 max-w-xl mx-auto text-lg">
          Find answers to common questions, or connect with our support team.
        </p>

        <div className="relative max-w-lg mx-auto mt-8">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search help topics..."
            className="input-field pl-11 !py-3.5"
          />
        </div>
      </section>

      {/* QUICK CONTACT */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 pt-8 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="tel:18005550199"
            className="card p-4 flex items-center gap-4 hover:border-gold-300 border border-transparent transition-colors"
          >
            <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Phone size={18} />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-navy-900">Call Us</p>
              <p className="text-xs text-slate-400">+1 (863) 333-9415</p>
            </div>
          </a>
          <a
            href="mailto:support@swissmeridianbank.com"
            className="card p-4 flex items-center gap-4 hover:border-gold-300 border border-transparent transition-colors"
          >
            <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Mail size={18} />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-navy-900">Email Us</p>
              <p className="text-xs text-slate-400">
                support@swissmeridianbank.com
              </p>
            </div>
          </a>
          <a
            href="/contact"
            className="card p-4 flex items-center gap-4 hover:border-gold-300 border border-transparent transition-colors"
          >
            <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <MessageCircle size={18} />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-navy-900">
                Secure Message
              </p>
              <p className="text-xs text-slate-400">Log in to send</p>
            </div>
          </a>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 py-10">
        <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wide mb-4 text-center md:text-left">
          Browse by Topic
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="card p-5 text-center hover:border-gold-300 border border-transparent transition-colors cursor-pointer"
            >
              <div className="h-11 w-11 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center mx-auto mb-3">
                <Icon size={19} />
              </div>
              <p className="text-sm font-semibold text-navy-900">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* IMAGE + TOPICS */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-14 grid md:grid-cols-5 gap-10 items-start">
        <div className="md:col-span-3">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">
            {search
              ? `Showing matches for "${search}"`
              : "Most searched questions"}
          </h2>
          {filtered.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-sm text-slate-400 mb-3">
                No topics matched your search.
              </p>
              <p className="text-sm text-slate-500">
                Try different keywords or contact our support team for
                assistance.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item, i) => (
                <div key={item.q} className="card overflow-hidden">
                  <button
                    onClick={() => setOpen(open === i ? -1 : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-semibold text-navy-900 text-sm">
                      {item.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-navy shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}
                    />
                  </button>
                  {open === i && (
                    <div className="px-5 pb-4 text-sm text-slate-500 leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-2 rounded-xl overflow-hidden shadow-card h-[300px] md:h-full min-h-[360px]">
          <img
            src="/team1.jpg"
            alt="Swiss Meridian Bank customer support team"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* BUSINESS HOURS */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 pb-8">
        <div className="card p-6 text-center bg-white">
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-navy-900">Support hours:</span>{" "}
            Monday – Friday, 8:00 AM – 8:00 PM ET &bull; Saturday, 9:00 AM –
            5:00 PM ET &bull; Sunday, Closed
          </p>
          <p className="text-xs text-slate-400 mt-2">
            For after-hours support, please send a secure message through online
            banking.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
        <div className="rounded-xl bg-gradient-to-br from-navy-800 to-navy-900 px-8 md:px-16 py-14 text-center relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/10" />
          <div className="absolute -left-10 -bottom-10 h-52 w-52 rounded-full bg-gold/10" />
          <h2 className="text-3xl md:text-4xl font-bold text-white relative">
            Need more help?
          </h2>
          <p className="text-slate-300 mt-3 max-w-lg mx-auto relative">
            Our knowledgeable support team is ready to assist you with any
            questions.
          </p>
          <a
            href="/contact"
            className="btn-gold inline-flex items-center gap-2 mt-8 relative"
          >
            Contact Support <ArrowRight size={17} />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Help;
