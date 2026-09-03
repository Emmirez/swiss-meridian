import { Link } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const sections = [
  {
    title: "1. Information We Collect",
    body: "When you apply for a Swiss Meridian Bank account, we collect the information necessary to verify your identity and administer your account: your full name, date of birth, Social Security Number, residential address, phone number, and email address. When you use online and mobile banking, we also collect transaction data, device information, IP address, login timestamps, and the general information you provide when contacting support. We do not collect more than what's needed to open, verify, and service your account.",
  },
  {
    title: "2. How We Use Your Information",
    body: "We use your information to verify your identity during account opening, to process transfers and deposits, to detect and prevent fraud, to send you required account disclosures and transaction notifications, and to respond to support requests. We may also use aggregated, de-identified data to understand how our platform is used and to improve our products. We do not use your Social Security Number or account balance for marketing purposes.",
  },
  {
    title: "3. How We Share Information",
    body: "We do not sell your personal information. We may share limited information with service providers who help us operate the platform — for example, our email delivery provider for transaction alerts, and our SMS provider for text notifications — under agreements that restrict them from using your data for any purpose other than delivering that service. We may also disclose information when required by law, such as in response to a valid subpoena or regulatory request.",
  },
  {
    title: "4. Data Security",
    body: "Account data is encrypted both at rest and in transit using industry-standard encryption protocols. Passwords and transaction PINs are hashed and are never stored or transmitted in plain text. Access to production account data is restricted to authorized personnel who need it to review applications, investigate support tickets, or maintain the platform, and all such access is logged.",
  },
  {
    title: "5. Cookies & Tracking",
    body: "Our website and application use essential cookies to keep you logged in and to remember your session securely. We do not use third-party advertising cookies or trackers on Swiss Meridian Bank's banking platform. Any analytics we use are limited to understanding aggregate usage patterns and do not attempt to identify individual account holders for marketing purposes.",
  },
  {
    title: "6. Your Rights and Choices",
    body: "You can review and update your personal information — including your name, phone number, and mailing address — directly from your Profile page. You can also control which notification channels (email, SMS, in-app) you receive by adjusting your preferences at any time. If you wish to close your account or request a copy of the personal data we hold about you, contact our support team and we will respond within a reasonable timeframe.",
  },
  {
    title: "7. Data Retention",
    body: "We retain account and transaction records for as long as your account remains open, and for a period afterward as required by applicable recordkeeping regulations. Once the retention period has passed and no legal obligation requires otherwise, personal data is securely deleted or irreversibly anonymized.",
  },
  {
    title: "8. Children's Privacy",
    body: "Swiss Meridian Bank's services are intended for individuals who are at least 18 years old. We do not knowingly collect personal information from anyone under 18. If we learn that an account was opened by someone who does not meet this age requirement, we will take steps to close the account and remove associated data.",
  },
  {
    title: "9. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. When we make material changes, we will notify account holders through email or an in-app notification before the changes take effect.",
  },
  {
    title: "10. Contact Us",
    body: "If you have questions about this Privacy Policy or how your information is handled, reach out through our Contact page. A member of our team — not an automated system — will respond to your inquiry.",
  },
];

const PrivacyPolicy = () => (
  <div className="bg-slate-50 min-h-screen">
    <Header />

    <section className="max-w-5xl mx-auto px-4 md:px-8 pt-14 md:pt-20 text-center">
      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gold-700 bg-gold-50 px-3 py-1.5 rounded-full mb-5">
        <Lock size={14} /> Privacy Policy
      </span>
      <h1 className="text-3xl md:text-5xl font-bold text-navy-900 leading-tight">
        How We Handle Your Information
      </h1>
      <p className="text-slate-500 mt-4 text-sm">Last updated: January 2026</p>
    </section>

    <section className="max-w-5xl mx-auto px-4 md:px-8 mt-10">
      <div className="rounded-xl3 overflow-hidden shadow-card h-[220px] md:h-[320px]">
        <img
          src="/team1.jpg"
          alt="Data privacy and security at Swiss Meridian Bank"
          className="w-full h-full object-cover"
        />
      </div>
    </section>

    <section className="max-w-5xl mx-auto px-4 md:px-8 py-14 md:py-20">
      <div className="card p-6 md:p-10">
        <p className="text-slate-500 leading-relaxed mb-8">
          Swiss Meridian Bank respects your privacy and is committed to
          protecting the personal information you share with us. This Privacy
          Policy explains how we collect, use, disclose, and safeguard your
          information when you use our online and mobile banking services.
          Please read this policy carefully. By using our services, you consent
          to the collection and use of your information as described herein. We
          do not sell your personal information to third parties. For more
          details about your privacy rights, please review our full Privacy
          Policy or contact us at [phone number or email].
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
        <Link
          to="/contact"
          className="btn-primary inline-flex items-center gap-2"
        >
          Questions About Your Data? <ArrowRight size={16} />
        </Link>
      </div>
    </section>

    <Footer />
  </div>
);

export default PrivacyPolicy;
