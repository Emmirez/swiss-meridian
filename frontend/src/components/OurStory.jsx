import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const OurStory = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-32 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
      {/* Image block */}
      <div className="relative pb-10 md:pb-0">
        <div className="rounded-xl3 overflow-hidden shadow-card h-[380px] md:h-[440px]">
          <img
            src="https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=1200&auto=format&fit=crop"
            alt="Swiss Meridian Bank team at work"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Floating stat card */}
        <div className="absolute top-7 left-6 bg-white rounded-2xl shadow-card px-6 py-5 max-w-[210px]">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Industry Impact
          </p>
          <p className="text-3xl font-bold text-navy mt-1">120K+</p>
          <p className="text-sm text-slate-500 mt-0.5">
            Account holders trust us
          </p>
        </div>

        {/* Overlapping secondary photo */}
        <div className="absolute bottom-0 right-4 sm:right-8 h-36 w-28 sm:h-44 sm:w-36 rounded-2xl overflow-hidden border-4 border-white shadow-card">
          <img
            src="/team1.jpg"
            alt="Swiss Meridian Bank community volunteering"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Text content */}
      <div>
        <span className="inline-block text-xs font-semibold uppercase tracking-wide text-navy-400 bg-navy-50 px-3 py-1.5 rounded-full mb-4">
          Our Story
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-navy-900 leading-tight">
          Built by bankers who got tired of legacy banking
        </h2>
        <p className="text-slate-500 mt-4 leading-relaxed">
          Swiss Meridian Bank started with a simple question: why does opening
          an account still feel like 1998? We rebuilt the experience from
          scratch — real approvals, real transfers, and real people reviewing
          every application, without the paperwork or the wait.
        </p>
        <Link
          to="/about"
          className="btn-primary inline-flex items-center gap-2 mt-8"
        >
          Read Our Story <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
};

export default OurStory;
