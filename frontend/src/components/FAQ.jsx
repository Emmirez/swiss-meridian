import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, MessageCircleQuestion, ArrowRight } from "lucide-react";

const faqs = [
  {
    q: "How do I open a Swiss Meridian Bank account?",
    a: 'Click "Open an Account," fill in your personal details, address, account type, and currency, then set a password and a 4-digit transaction PIN. It takes about five minutes.',
  },
  {
    q: "How long does account approval take?",
    a: "Once you've verified your email and phone number, our team manually reviews every application — most are approved within 1-2 business days.",
  },
  {
    q: "Can I have an account in a currency other than USD?",
    a: "Yes. You choose your account's currency at signup from USD, GBP, EUR, CAD, AUD, JPY, or CHF. Transfers currently work between accounts holding the same currency.",
  },
  {
    q: "What happens if I forget my transaction PIN?",
    a: "Contact support to verify your identity and reset your PIN. For your protection, we can't reset it through automated channels alone.",
  },
  {
    q: "Is my money insured?",
    a: "Yes. Swiss Meridian Bank is a fully licensed bank and a member of the national deposit insurance scheme. All eligible deposits are insured up to the maximum coverage limit per depositor, providing you with government-backed protection and peace of mind.",
  },
  {
    q: "How do I get notified about transactions?",
    a: "Every transfer triggers an email, an SMS text, and an in-app notification by default. You can turn any of these on or off from your Profile page.",
  },
];

const FAQ = () => {
  const [open, setOpen] = useState(0);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28 grid md:grid-cols-5 gap-10 md:gap-14">
      <div className="md:col-span-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
          Help Center
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mt-2">
          Frequently Asked Questions
        </h2>
        <p className="text-slate-500 mt-3 mb-8">
          Everything account holders ask us most — if yours isn't here, our team
          is one message away.
        </p>

        <div className="space-y-3">
          {faqs.map((item, i) => (
            <div key={item.q} className="card overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-semibold text-navy-900 text-sm md:text-base">
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
      </div>

      <div className="md:col-span-2">
        <div className="rounded-xl3 overflow-hidden shadow-card relative h-[320px] md:h-full min-h-[380px]">
          <img
            src="/global.jpg"
            alt="Swiss Meridian Bank support team"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/95 via-navy-900/40 to-transparent" />
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <div className="h-11 w-11 rounded-xl bg-gold/90 text-navy-900 flex items-center justify-center mb-4">
              <MessageCircleQuestion size={20} />
            </div>
            <h3 className="text-white font-bold text-lg">
              Still have questions?
            </h3>
            <p className="text-slate-200 text-sm mt-2 leading-relaxed">
              Our support team is a real team — reach out and a person will get
              back to you.
            </p>
            <a
              href="/contact"
              className="btn-gold inline-flex items-center justify-center gap-2 mt-5 w-fit"
            >
              Contact Us <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
