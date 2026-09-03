import { CheckCircle2 } from "lucide-react";

const reasons = [
  {
    tag: "Real Human Review",
    title: "A real team reviews every application",
    text: "No black-box algorithm decides whether your account gets approved. Our team checks every application by hand before it goes live.",
    points: [
      "Manual KYC review on every signup",
      "Clear status updates at every step",
      "A real person to reach if something's off",
    ],
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1000&auto=format&fit=crop",
  },
  {
    tag: "Instant Transfers",
    title: "Money moves the moment you hit send",
    text: "Transfers between Swiss Meridian accounts settle instantly — no 'processing' spinner, no waiting three business days to see it land.",
    points: [
      "Real-time balance updates",
      "Email, SMS & in-app alerts on every transfer",
      "Transaction PIN on every payment",
    ],
    image: "/loan1.jpg",
  },
  {
    tag: "Built for a Global Life",
    title: "Bank in the currency you actually live in",
    text: "Whether you're paid in GBP, spend in EUR, or save in USD, your account speaks your currency from day one.",
    points: [
      "7 supported currencies",
      "One account, one clear balance",
      "No surprise conversion fees",
    ],
    image: "/bank2.jpg",
  },
];

const WhyBankWithUs = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
      <div className="max-w-xl mb-14">
        <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
          Why Swiss Meridian
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mt-2">
          Why bank with us
        </h2>
        <p className="text-slate-500 mt-3">
          Three reasons our account holders don't switch back to legacy banks.
        </p>
      </div>

      <div className="space-y-16 md:space-y-24">
        {reasons.map((reason, i) => (
          <div
            key={reason.tag}
            className="grid md:grid-cols-2 gap-10 md:gap-14 items-center"
          >
            <div
              className={`rounded-xl3 overflow-hidden shadow-card h-[300px] md:h-[360px] ${i % 2 === 1 ? "md:order-2" : ""}`}
            >
              <img
                src={reason.image}
                alt={reason.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className={i % 2 === 1 ? "md:order-1" : ""}>
              <span className="inline-block text-xs font-semibold uppercase tracking-wide text-gold-700 bg-gold-50 px-3 py-1.5 rounded-full mb-4">
                {reason.tag}
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-navy-900 leading-tight">
                {reason.title}
              </h3>
              <p className="text-slate-500 mt-3 leading-relaxed">
                {reason.text}
              </p>
              <ul className="mt-5 space-y-2.5">
                {reason.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-center gap-3 text-sm text-slate-600"
                  >
                    <span className="h-6 w-6 rounded-full bg-navy-50 text-navy flex items-center justify-center shrink-0">
                      <CheckCircle2 size={13} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyBankWithUs;
