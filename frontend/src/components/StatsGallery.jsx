import { Users, Globe2, ShieldCheck, Wallet } from "lucide-react";

const stats = [
  { icon: Users, value: "120K+", label: "Accounts opened" },
  { icon: Globe2, value: "7", label: "Supported currencies" },
  { icon: ShieldCheck, value: "24/7", label: "Fraud monitoring" },
  { icon: Wallet, value: "$0", label: "Monthly maintenance fees" },
];

const galleryImages = [
  {
    src: "/team1.jpg",
    alt: "Swiss Meridian Bank headquarters",
  },
  {
    src: "/wellbank3.jpg",
    alt: "Swiss Meridian Bank office collaboration",
  },
  {
    src: "https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=900&auto=format&fit=crop",
    alt: "Swiss Meridian Bank team meeting",
  },
];

const StatsGallery = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-14">
        {stats.map(({ icon: Icon, value, label }) => (
          <div key={label} className="card p-6 text-center">
            <div className="h-11 w-11 rounded-xl bg-navy-50 text-navy flex items-center justify-center mx-auto mb-3">
              <Icon size={19} />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-navy-900">
              {value}
            </p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        {galleryImages.map((img) => (
          <div
            key={img.src}
            className="rounded-xl3 overflow-hidden shadow-card h-64"
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsGallery;
