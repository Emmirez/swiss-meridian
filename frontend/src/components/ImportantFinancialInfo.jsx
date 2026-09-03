import { Link } from "react-router-dom";
import {
  FileText,
  ShieldCheck,
  Mail,
  Landmark,
  ArrowRight,
} from "lucide-react";

const documents = [
  {
    icon: FileText,
    title: "Online Banking Service Agreement",
    desc: "The terms that govern your use of Swiss Meridian Bank's online and mobile banking services.",
    hasLink: true,
  },
  {
    icon: Mail,
    title: "Electronic Communications Consent",
    desc: "How we deliver statements, disclosures, and notices to you electronically.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy & Data Policy",
    desc: "What information we collect, how it's used, and how it's protected.",
  },
  {
    icon: Landmark,
    title: "Deposit Account Agreement",
    desc: "Terms specific to checking, savings, business, and money market accounts.",
  },
];

const ImportantFinancialInfo = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
      <div className="rounded-xl3 overflow-hidden shadow-card h-[320px] md:h-[420px] order-2 md:order-1">
        <img
          src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1200&auto=format&fit=crop"
          alt="Reviewing a banking service agreement"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="order-1 md:order-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
          Legal &amp; Disclosures
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mt-2">
          Important Financial Information
        </h2>
        <p className="text-slate-500 mt-3 leading-relaxed">
          The agreements and disclosures that apply the moment you open a Well
          Swiss Meridian Bank account — worth a read before you sign up.
        </p>

        <div className="mt-8 space-y-5">
          {documents.map(({ icon: Icon, title, desc, hasLink }) => (
            <div key={title} className="flex gap-4">
              <div className="h-11 w-11 rounded-xl bg-navy-50 text-navy flex items-center justify-center shrink-0">
                <Icon size={19} />
              </div>
              <div>
                <p className="font-semibold text-navy-900 text-sm">{title}</p>
                <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
                  {desc}
                </p>
                {hasLink && (
                  <Link
                    to="/terms"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-700 mt-2 hover:text-gold-800 transition"
                  >
                    View Terms &amp; Conditions <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImportantFinancialInfo;
