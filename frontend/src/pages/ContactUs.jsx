import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const contactInfo = [
  { icon: Mail, title: "Email", detail: "support@swissmeridianapp.com" },
  { icon: Phone, title: "Phone", detail: "+1 (863) 333-9415" },
  {
    icon: MapPin,
    title: "Headquarters",
    detail: "Rue des Alpes 14, 1201 Geneva, Switzerland",
  },
  {
    icon: Clock,
    title: "Support Hours",
    detail: "24/7 — every day of the year",
  },
];

const ContactUs = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const submit = (e) => {
    e.preventDefault();
    // This is a portfolio demo form — wire this up to a real endpoint
    // (e.g. POST /api/support/contact) when you're ready to make it functional.
    setSubmitted(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-14 md:pt-20 pb-10 text-center">
        <span className="inline-block text-xs font-semibold uppercase tracking-wide text-gold-700 bg-gold-50 px-3 py-1.5 rounded-full mb-5">
          Contact Us
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-navy-900 leading-tight max-w-2xl mx-auto">
          We're here to help
        </h1>
        <p className="text-slate-500 mt-5 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
          Have questions about your account, a recent transaction, or our
          services? Our customer support team is available to assist you. Reach
          out by phone, email, or visit a branch near you.
        </p>
      </section>

      {/* CONTACT INFO CARDS */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {contactInfo.map(({ icon: Icon, title, detail }) => (
            <div key={title} className="card p-5">
              <div className="h-11 w-11 rounded-xl bg-navy-50 text-navy flex items-center justify-center mb-4">
                <Icon size={19} />
              </div>
              <p className="text-sm font-semibold text-navy-900">{title}</p>
              <p className="text-sm text-slate-500 mt-1">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FORM + IMAGE */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 grid md:grid-cols-5 gap-10 md:gap-14 items-start">
        <div className="md:col-span-3 card p-6 md:p-8">
          {submitted ? (
            <div className="text-center py-10">
              <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={26} />
              </div>
              <h3 className="font-bold text-navy-900 text-lg">Message sent</h3>
              <p className="text-slate-500 text-sm mt-2">
                Thanks for reaching out — our team will get back to you shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: "", email: "", subject: "", message: "" });
                }}
                className="btn-secondary mt-6"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <h2 className="font-bold text-navy-900 text-xl mb-2">
                Send us a message
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  required
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="input-field"
                />
                <input
                  required
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="input-field"
                />
              </div>
              <input
                required
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => update("subject", e.target.value)}
                className="input-field"
              />
              <textarea
                required
                placeholder="How can we help?"
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                rows={5}
                className="input-field resize-none"
              />
              <button
                type="submit"
                className="btn-primary flex items-center gap-2"
              >
                <Send size={16} /> Send Message
              </button>
            </form>
          )}
        </div>

        <div className="md:col-span-2 rounded-xl3 overflow-hidden shadow-card h-[320px] md:h-full min-h-[380px]">
          <img
            src="/team1.jpg"
            alt="Swiss Meridian Bank support team ready to help"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
        <div className="rounded-xl3 bg-gradient-to-br from-navy-800 to-navy-900 px-8 md:px-16 py-14 md:py-16 text-center relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/10" />
          <div className="absolute -left-10 -bottom-10 h-52 w-52 rounded-full bg-gold/10" />
          <h2 className="text-3xl md:text-4xl font-bold text-white relative">
            Not ready to talk yet?
          </h2>
          <p className="text-slate-300 mt-3 max-w-lg mx-auto relative">
            Open an account in about five minutes — you can always reach out
            later.
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

export default ContactUs;
