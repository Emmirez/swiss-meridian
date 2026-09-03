import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By enrolling in Swiss Meridian Bank's online and mobile banking services, you agree to be bound by this Online Banking Service Agreement, along with your Deposit Account Agreement and Privacy Policy. If you do not agree, please do not enroll in or use these services.",
  },
  {
    title: "2. Eligibility",
    body: "Online banking services are available to account holders who are at least 18 years old, have successfully completed identity verification, and whose account application has been approved by our team.",
  },
  {
    title: "3. Electronic Communications",
    body: "You consent to receive statements, disclosures, transaction alerts, and other account communications electronically, through email, SMS, and in-app notifications, in place of paper mail unless otherwise required by law.",
  },
  {
    title: "4. Security & Transaction PIN",
    body: "You are responsible for keeping your password and 4-digit transaction PIN confidential. Swiss Meridian Bank will never ask for your full PIN or password by phone, email, or text. Notify us immediately if you suspect unauthorized access to your account.",
  },
  {
    title: "5. Transfers & Availability of Funds",
    body: "Internal transfers between Swiss Meridian Bank accounts are typically reflected immediately. External transfers may be subject to review and standard processing timelines. We reserve the right to delay or decline a transfer to protect the security of your account.",
  },
  {
    title: "6. Fees",
    body: "Swiss Meridian Bank does not charge monthly maintenance fees on checking or savings accounts. Certain services, such as expedited external transfers, may carry a disclosed fee at the time of the transaction.",
  },
  {
    title: "7. Limitation of Liability",
    body: "Swiss Meridian Bank is not liable for losses caused by circumstances beyond our reasonable control, including power failures, system outages, or unauthorized access resulting from your failure to safeguard your login credentials or PIN.",
  },
  {
    title: "8. Account Suspension & Termination",
    body: "We may suspend, freeze, or close your account if we detect suspicious activity, a violation of this agreement, or as required by applicable law. You may close your account at any time by contacting support.",
  },
  {
    title: "9. Changes to This Agreement",
    body: "We may update this agreement from time to time. Continued use of online banking services after changes take effect constitutes acceptance of the revised terms.",
  },
  {
    title: "10. Governing Law",
    body: "This agreement is governed by the laws of the United States and the state in which your account was opened, without regard to conflict-of-law principles.",
  },
];

const TermsAndConditions = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 pt-14 md:pt-20 text-center">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gold-700 bg-gold-50 px-3 py-1.5 rounded-full mb-5">
          <FileText size={14} /> Legal Agreement
        </span>
        <h1 className="text-3xl md:text-5xl font-bold text-navy-900 leading-tight">
          Online Banking Service Agreement
        </h1>
        <p className="text-slate-500 mt-4 text-sm">
          Last updated: January 2026
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 md:px-8 mt-10">
        <div className="rounded-xl3 overflow-hidden shadow-card h-[220px] md:h-[320px]">
          <img
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1600&auto=format&fit=crop"
            alt="Signing a banking service agreement"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 py-14 md:py-20">
        <div className="card p-6 md:p-10">
          <p className="text-slate-500 leading-relaxed mb-8">
            This Online Banking Service Agreement ("Agreement") governs your use
            of Swiss Meridian Bank's online and mobile banking services. By
            using these services, you agree to the terms and conditions set
            forth herein. Please read this Agreement carefully and retain a copy
            for your records. This Agreement is subject to change at any time,
            and continued use of the services constitutes acceptance of any
            modifications.
          </p>

          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="font-bold text-navy-900 text-lg mb-2">
                  {section.title}
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-10">
          <p className="text-sm text-slate-400 mb-4">
            Have questions about this agreement?
          </p>
          <Link
            to="/register"
            className="btn-primary inline-flex items-center gap-2"
          >
            Open an Account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsAndConditions;
