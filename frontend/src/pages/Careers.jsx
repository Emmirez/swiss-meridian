import { Link } from "react-router-dom";
import {
  ArrowRight,
  MapPin,
  Briefcase,
  HeartHandshake,
  Cpu,
  Users2,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const values = [
  {
    icon: HeartHandshake,
    title: "Real Impact",
    desc: "Every review, every approval, every support ticket is handled by someone on this team — your work is felt directly.",
  },
  {
    icon: Cpu,
    title: "Build Things That Matter",
    desc: "We ship features people actually use, not roadmap filler. Engineering here means real ownership.",
  },
  {
    icon: Users2,
    title: "Small, Direct Team",
    desc: "No layers of management between you and the decision. Good ideas move fast.",
  },
];

const openRoles = [
  {
    title: "Senior Backend Engineer",
    dept: "Engineering",
    location: "Remote (US)",
    type: "Full-time",
  },
  {
    title: "Product Designer",
    dept: "Design",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Customer Support Specialist",
    dept: "Operations",
    location: "Remote (US)",
    type: "Full-time",
  },
  {
    title: "Compliance & Risk Analyst",
    dept: "Operations",
    location: "New York, NY",
    type: "Full-time",
  },
  {
    title: "Mobile Engineer (React Native)",
    dept: "Engineering",
    location: "Remote",
    type: "Contract",
  },
];

const Careers = () => (
  <div className="bg-slate-50 min-h-screen">
    <Header />

    {/* HERO */}
    <section className="max-w-7xl mx-auto px-4 md:px-8 pt-16 md:pt-20 grid md:grid-cols-2 gap-10 items-center">
      <div>
        <span className="inline-block text-xs font-semibold uppercase tracking-wide text-gold-700 bg-gold-50 px-3 py-1.5 rounded-full mb-5">
          Careers
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-navy-900 leading-tight">
          Join us in building the future of banking
        </h1>
        <p className="text-slate-500 mt-5 text-base md:text-lg leading-relaxed">
          At Swiss Meridian Bank, we're reimagining what a bank can be —
          combining the stability and trust of a regulated financial institution
          with the speed and innovation of modern technology. We're looking for
          talented individuals who share our passion for customer experience,
          security, and financial inclusion. If you're ready to make a
          meaningful impact, we'd love to hear from you.
        </p>
        <a
          href="#openings"
          className="btn-primary inline-flex items-center gap-2 mt-8"
        >
          View Open Roles <ArrowRight size={16} />
        </a>
      </div>
      <div className="rounded-xl3 overflow-hidden shadow-card h-[280px] md:h-[380px]">
        <img
          src="/career1.jpg"
          alt="Swiss Meridian Bank team collaborating"
          className="w-full h-full object-cover"
        />
      </div>
    </section>

    {/* VALUES */}
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
      <div className="max-w-xl mb-12">
        <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
          Why Work Here
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mt-2">
          What it's actually like
        </h2>
      </div>
      <div className="grid sm:grid-cols-3 gap-5">
        {values.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-6">
            <div className="h-12 w-12 rounded-2xl bg-navy-50 text-navy flex items-center justify-center mb-5">
              <Icon size={22} />
            </div>
            <h3 className="font-bold text-navy-900 text-lg">{title}</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>

    {/* OFFICE PHOTO */}
    <section className="max-w-7xl mx-auto px-4 md:px-8">
      <div className="rounded-xl3 overflow-hidden shadow-card h-[260px] md:h-[360px]">
        <img
          src="/career.jpg"
          alt="Swiss Meridian Bank headquarters"
          className="w-full h-full object-cover"
        />
      </div>
    </section>

    {/* OPEN ROLES */}
    <section
      id="openings"
      className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-20"
    >
      <div className="max-w-xl mb-10">
        <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
          Open Roles
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mt-2">
          Current openings
        </h2>
      </div>
      <div className="space-y-3">
        {openRoles.map((role) => (
          <div
            key={role.title}
            className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <p className="font-semibold text-navy-900">{role.title}</p>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Briefcase size={12} /> {role.dept}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {role.location}
                </span>
                <span>{role.type}</span>
              </div>
            </div>
            <Link
              to="/contact"
              className="btn-secondary !py-2 !px-4 text-sm w-fit"
            >
              Apply
            </Link>
          </div>
        ))}
      </div>
      <p className="text-sm text-slate-400 mt-8 text-center">
        Don't see a role that fits? Reach out anyway through our{" "}
        <Link
          to="/contact"
          className="text-navy font-medium hover:text-gold-700"
        >
          Contact page
        </Link>{" "}
        — we're always open to hearing from people who'd be a good fit.
      </p>
    </section>

    {/* CTA */}
    <section className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
      <div className="rounded-xl3 bg-gradient-to-br from-navy-800 to-navy-900 px-8 md:px-16 py-14 text-center relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/10" />
        <div className="absolute -left-10 -bottom-10 h-52 w-52 rounded-full bg-gold/10" />
        <h2 className="text-3xl md:text-4xl font-bold text-white relative">
          Not hiring for your role yet?
        </h2>
        <p className="text-slate-300 mt-3 max-w-lg mx-auto relative">
          We're growing quickly — send us a note and we'll keep you in mind.
        </p>
        <a
          href="/contact"
          className="btn-gold inline-flex items-center gap-2 mt-8 relative"
        >
          Get In Touch <ArrowRight size={17} />
        </a>
      </div>
    </section>

    <Footer />
  </div>
);

export default Careers;
