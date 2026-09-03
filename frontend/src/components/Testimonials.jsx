import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Mason Monroe",
    role: "Freelance Designer",
    quote: "I switched my business account here after getting tired of hidden fees eating into every invoice payment. The transfer notifications alone have saved me from two accounting headaches already.",
    avatar: "/Mason.jpg",
    rating: 5,
  },
  {
    name: "Camilla O'Connor",
    role: "Remote Software Engineer",
    quote: "Getting paid in GBP and living in the US used to be a mess. Having an account that just speaks my currency without a middleman skimming the conversion has genuinely simplified my life.",
    avatar: "/Martha.jpg",
    rating: 5,
  },
  {
    name: "Derek Chambers",
    role: "Small Business Owner",
    quote: "The fact that a real person reviewed my application instead of an algorithm rejecting me for no reason meant a lot. Support has actually picked up the phone every time I've called.",
    avatar: "/Duke.jpg",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
      <div className="max-w-xl mb-14">
        <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
          Testimonials
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mt-2">
          Trusted by the people who use it every day
        </h2>
        <p className="text-slate-500 mt-3 max-w-lg">
          A few words from account holders about what changed once they
          switched.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {testimonials.map(({ name, role, quote, avatar, rating }) => (
          <div key={name} className="card p-6 relative">
            <Quote size={28} className="text-navy-50 absolute top-5 right-5" />
            <div className="flex gap-0.5 mb-4">
              {Array.from({ length: rating }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className="fill-gold-400 text-gold-400"
                />
              ))}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed relative z-10">
              "{quote}"
            </p>
            <div className="flex items-center gap-3 mt-6">
              <div className="h-11 w-11 rounded-full overflow-hidden shrink-0">
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-navy-900">{name}</p>
                <p className="text-xs text-slate-400">{role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
