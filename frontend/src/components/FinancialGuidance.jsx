import { PiggyBank, TrendingUp, ShieldCheck, Wallet2 } from "lucide-react";

const tips = [
  {
    icon: Wallet2,
    tag: "Budgeting",
    title: "The 50/30/20 rule, simplified",
    text: "Put 50% of income toward needs, 30% toward wants, and 20% into savings — set it once and let it run.",
    image: "/budget.jpg",
  },
  {
    icon: PiggyBank,
    tag: "Saving",
    title: "Build a 3-month safety net",
    text: "Start small — even $20 a week compounds into a real emergency fund faster than most people expect.",
    image: "/saving2.jpg",
  },
  {
    icon: ShieldCheck,
    tag: "Credit",
    title: "What actually moves your score",
    text: "Payment history and credit utilization drive most of your score — pay on time, stay under 30% usage.",
    image: "/creditt2.jpg",
  },
  {
    icon: TrendingUp,
    tag: "Investing",
    title: "Time in the market beats timing it",
    text: "Consistent, smaller contributions over years typically outperform trying to guess the perfect entry point.",
    image: "/invest.jpg",
  },
];

const FinancialGuidance = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
      <div className="max-w-xl mb-12">
        <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
          Financial Guidance
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mt-2">
          Bank smarter, not just harder
        </h2>
        <p className="text-slate-500 mt-3">
          A few habits our team sees make the biggest difference for real
          accounts.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {tips.map(({ icon: Icon, tag, title, text, image }, i) => (
          <div
            key={tag}
            className={`group relative overflow-hidden shadow-card hover:-translate-y-1 transition-all duration-300 ${
              i % 2 === 0
                ? "rounded-tl-[6px] rounded-br-[6px] rounded-tr-3xl rounded-bl-3xl"
                : "rounded-tr-[6px] rounded-bl-[6px] rounded-tl-3xl rounded-br-3xl"
            }`}
          >
            <div className="h-56 w-full overflow-hidden">
              <img
                src={image}
                alt={title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/95 via-navy-900/50 to-transparent" />

            <div className="absolute inset-0 p-5 flex flex-col justify-end">
              <div className="h-9 w-9 rounded-xl bg-gold/90 text-navy-900 flex items-center justify-center mb-3">
                <Icon size={16} />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gold-300">
                {tag}
              </span>
              <h3 className="text-white font-bold text-base mt-1 leading-snug">
                {title}
              </h3>
              <p className="text-slate-200 text-xs mt-2 leading-relaxed">
                {text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FinancialGuidance;
