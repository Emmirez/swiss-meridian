import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Cpu,
  Users,
  Globe2,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const values = [
  {
    icon: ShieldCheck,
    title: "Trust",
    desc: "Every account is manually reviewed — no shortcuts, no automated rubber stamps.",
  },
  {
    icon: Cpu,
    title: "Technology",
    desc: "Real-time transfers, live notifications, and a dashboard built for how people actually bank.",
  },
  {
    icon: HeartHandshake,
    title: "Transparency",
    desc: "No hidden fees, no fine-print surprises — what you see is what your account gets.",
  },
];

const leadership = [
  {
    name: "Marcus Ellison",
    role: "Chief Executive Officer",
    bio: "15+ years in retail banking before founding Swiss Meridian Bank to fix what legacy banks got wrong.",
    photo: "/Raul.jpg",
  },
  {
    name: "Dana Whitfield",
    role: "Chief Financial Officer",
    bio: "Former investment analyst focused on making sure every dollar in the system is accounted for.",
    photo: "/Royalty.jpg",
  },
  {
    name: "Renee Nandakumar",
    role: "Chief Technology Officer",
    bio: "Leads engineering — the person responsible for keeping transfers instant and accounts secure.",
    photo: "/Renee.jpg",
  },
  {
    name: "James Erwin",
    role: "Chief Operating Officer",
    bio: "Oversees account approvals and support — the team behind every application review.",
    photo: "/Timo.jpg",
  },
];

const galleryImages = [
  {
    src: "/global1.jpg",
    alt: "Swiss Meridian Bank headquarters",
  },
  {
    src: "/wellbank3.jpg",
    alt: "Swiss Meridian Bank office collaboration",
  },
  {
    src: "wellbank4.jpg",
    alt: "Swiss Meridian Bank team meeting",
  },
];

const AboutUs = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-10 text-center">
        <span className="inline-block text-xs font-semibold uppercase tracking-wide text-gold-700 bg-gold-50 px-3 py-1.5 rounded-full mb-5">
          About Us
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-navy-900 leading-tight max-w-3xl mx-auto">
          Building a better banking experience
        </h1>
        <p className="text-slate-500 mt-5 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
          Swiss Meridian Bank was founded with a clear and enduring purpose: to
          create a financial institution that combines the strength, security,
          and regulatory oversight of a traditional bank with the
          responsiveness, transparency, and customer focus that people expect in
          the modern era. We believe that banking should be straightforward,
          fair, and built on genuine relationships — not fine print, hidden
          fees, or impersonal automated systems.
          <br />
          <br />
          Our journey began with a simple observation: too many people feel
          disconnected from their financial institutions. They open accounts
          without fully understanding the terms, encounter fees they didn't
          anticipate, and struggle to reach someone who can actually help when
          problems arise. We set out to change that. At Swiss Meridian Bank,
          we're reimagining what banking looks like — not by abandoning the
          principles that make banking trustworthy, but by strengthening them
          with modern technology and a relentless commitment to our customers.
          <br />
          <br />
          Every account we open is handled with care. Our team takes the time to
          review applications thoroughly, ensuring that our customers understand
          their products and feel confident in their choices. We believe that
          financial decisions should be informed decisions, and we're here to
          provide the clarity and guidance our customers deserve. Whether you're
          opening your first checking account, saving for a major purchase, or
          managing your day-to-day finances, we're committed to being a partner
          you can count on.
          <br />
          <br />
          Our infrastructure is built to be secure, reliable, and fast. We've
          invested in modern systems that protect your information while
          delivering a seamless digital experience. But we've never lost sight
          of the human element. Behind every account, every transaction, and
          every support request is a team of dedicated professionals who
          genuinely care about your financial well-being. When you call Well
          Swiss Meridian Bank, you'll reach a real person who can listen,
          understand, and take action. No endless phone trees. No automated
          responses that don't address your concern. Just real, helpful
          conversations with people who are empowered to make things right.
          <br />
          <br />
          We're also deeply committed to financial inclusion. We believe that
          access to quality banking services should not be a privilege — it
          should be a right. That's why we work hard to design products that are
          accessible, transparent, and fair. We explain our fees clearly, we
          communicate openly about account requirements, and we're always
          looking for ways to serve more people in more communities. Our goal
          isn't just to grow our business — it's to grow trust, one customer at
          a time.
          <br />
          <br />
          At Swiss Meridian Bank, we measure our success not by quarterly
          earnings alone, but by the satisfaction and confidence of our
          customers. We celebrate every account opened, every question answered,
          and every problem solved. We're proud of the work we do, and we're
          constantly striving to do it better. That means listening to feedback,
          embracing new ideas, and never settling for "good enough." It means
          holding ourselves to the highest standards of integrity,
          professionalism, and service — not because we have to, but because we
          believe it's the right way to do business.
          <br />
          <br />
          We're not trying to be the biggest bank in the country. We're trying
          to be the best bank for our customers. We're building something
          different — an institution that values relationships as much as
          revenue, transparency as much as technology, and people as much as
          process. That's the vision that drives us. That's the standard we hold
          ourselves to. And that's the promise we make to every person who
          trusts us with their financial life.
          <br />
          <br />
          Welcome to Swiss Meridian Bank. We're here for you — today, tomorrow,
          and every day after.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="rounded-xl3 overflow-hidden shadow-card h-[280px] md:h-[420px]">
          <img
            src="/wellbank5.jpg"
            alt="Swiss Meridian Bank headquarters building"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { icon: Users, value: "120K+", label: "Accounts opened" },
            { icon: Globe2, value: "7", label: "Supported currencies" },
            { icon: ShieldCheck, value: "24/7", label: "Fraud monitoring" },
            { icon: HeartHandshake, value: "2019", label: "Founded" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="card p-5 text-center">
              <div className="h-10 w-10 rounded-xl bg-navy-50 text-navy flex items-center justify-center mx-auto mb-3">
                <Icon size={18} />
              </div>
              <p className="text-2xl font-bold text-navy-900">{value}</p>
              <p className="text-xs text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VALUES */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="max-w-xl mb-12">
          <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
            What We Stand For
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mt-2">
            Three things we don't compromise on
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {values.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6">
              <div className="h-12 w-12 rounded-2xl bg-gold-50 text-gold-700 flex items-center justify-center mb-5">
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

      {/* BANK IMAGERY GALLERY */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="max-w-xl mb-12">
          <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
            Behind Swiss Meridian
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mt-2">
            Where the work actually happens
          </h2>
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

      {/* LEADERSHIP */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="max-w-xl mb-12">
          <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
            Leadership
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mt-2">
            The team behind every approval
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {leadership.map((person) => (
            <div key={person.name} className="card p-6 text-center">
              <div className="h-24 w-24 rounded-full overflow-hidden mx-auto mb-4 ring-4 ring-navy-50">
                <img
                  src={person.photo}
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-navy-900">{person.name}</h3>
              <p className="text-xs text-gold-700 font-semibold uppercase tracking-wide mt-1">
                {person.role}
              </p>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                {person.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
        <div className="rounded-xl3 bg-gradient-to-br from-navy-800 to-navy-900 px-8 md:px-16 py-14 md:py-16 text-center relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/10" />
          <div className="absolute -left-10 -bottom-10 h-52 w-52 rounded-full bg-gold/10" />
          <h2 className="text-3xl md:text-4xl font-bold text-white relative">
            Ready to bank with us?
          </h2>
          <p className="text-slate-300 mt-3 max-w-lg mx-auto relative">
            Join the account holders who trust Swiss Meridian Bank with real
            approvals and real support.
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
};

export default AboutUs;
