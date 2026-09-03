import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "/wellbank3.jpg",
    eyebrow: "Everyday Banking",
    title: "Banking that moves at the speed of your life",
    text: "Open a checking, savings, or business account in minutes — manage it all from one clean dashboard.",
  },
  {
    image: "/global1.jpg",
    eyebrow: "Global by Design",
    title: "Hold and send money in 7 currencies",
    text: "USD, GBP, EUR, CAD, AUD, JPY, and CHF — Swiss Meridian Bank was built for a borderless life.",
  },
  {
    image: "/wellbank5.jpg",
    eyebrow: "Security First",
    title: "Your money, protected at every step",
    text: "Transaction PINs, real-time alerts, and 24/7 fraud monitoring keep your account locked down.",
  },
];

const HeroCarousel = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setActive((a) => (a + 1) % slides.length),
      5500,
    );
    return () => clearInterval(timer);
  }, []);

  const go = (i) => setActive((i + slides.length) % slides.length);

  return (
    <div className="relative w-full h-[480px] md:h-[560px] rounded-xl3 overflow-hidden shadow-card">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === active ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <span className="inline-block text-gold-300 bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded-full mb-4">
              {slide.eyebrow}
            </span>
            <h2 className="text-white text-2xl md:text-4xl font-bold max-w-xl leading-tight">
              {slide.title}
            </h2>
            <p className="text-slate-200 mt-3 max-w-md text-sm md:text-base">
              {slide.text}
            </p>
          </div>
        </div>
      ))}

      <button
        onClick={() => go(active - 1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white flex items-center justify-center hover:bg-white/25 transition"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => go(active + 1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white flex items-center justify-center hover:bg-white/25 transition"
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-6 right-8 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`h-2 rounded-full transition-all ${i === active ? "w-7 bg-gold" : "w-2 bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
