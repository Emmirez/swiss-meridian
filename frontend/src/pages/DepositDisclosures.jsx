import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const sections = [
  {
    title: "1. Account Types Covered",
    body: "This disclosure applies to all deposit accounts offered by Swiss Meridian Bank: Checking, Savings, Business, and Money Market accounts. Each account type carries its own terms regarding interest, minimum balance, and access, as summarized below.",
  },
  {
    title: "2. Interest Rate Information",
    body: "Savings and Money Market accounts accrue interest daily based on the account's end-of-day balance, and interest is credited to the account automatically. Checking and Business accounts do not accrue interest. Rates are variable and may change without prior notice, consistent with standard practice for demand deposit accounts.",
  },
  {
    title: "3. Minimum Balance Requirements",
    body: "There is no minimum balance required to open or maintain a Checking or Savings account. Business accounts may be subject to a recommended minimum operating balance disclosed at account opening. Falling below any recommended balance does not result in account closure, though it may affect certain account features.",
  },
  {
    title: "4. Fee Schedule",
    body: "Swiss Meridian Bank does not charge monthly maintenance fees on Checking, Savings, or Money Market accounts. There are no fees for standard internal transfers between Swiss Meridian Bank accounts. External transfers may carry a disclosed fee at the time of the transaction, shown to you before you confirm the transfer.",
  },
  {
    title: "5. Funds Availability",
    body: "Internal transfers between Swiss Meridian Bank accounts are typically reflected in both the sender's and recipient's balance immediately upon completion. External transfers to other financial institutions may take one to three business days to be reflected in the receiving account, depending on the receiving bank's own processing timelines.",
  },
  {
    title: "6. Overdrafts",
    body: "Swiss Meridian Bank does not permit transactions that would take an account balance below zero. Internal and external transfer requests that exceed the available balance are declined at the time of the request, and no overdraft fees are charged as a result.",
  },
  {
    title: "7. Account Closure",
    body: "You may request to close your account at any time by contacting support, provided your account balance is at or near zero or you have arranged for the remaining balance to be transferred out. Swiss Meridian Bank reserves the right to close an account that has been inactive for an extended period or that violates the Online Banking Service Agreement, with notice provided where required by law.",
  },
  {
    title: "8. Error Resolution",
    body: "If you believe a transaction on your account is incorrect or unauthorized, contact support as soon as possible. We will investigate the transaction and provide a determination within a reasonable timeframe, consistent with standard error-resolution practices for electronic fund transfers.",
  },
  {
    title: "9. Statements",
    body: "Account statements are available electronically at any time from your Transactions page. Swiss Meridian Bank does not mail paper statements; by opening an account, you consent to receive statements and disclosures electronically.",
  },
  {
    title: "10. Regulatory Note",
    body: "Swiss Meridian Bank is a portfolio demonstration project built to showcase full-stack banking application design. It is not a chartered bank, and deposits shown on this platform are not insured by the FDIC or any government agency.",
  },
];

const DepositDisclosures = () => (
  <div className="bg-slate-50 min-h-screen">
    <Header />

    <section className="max-w-5xl mx-auto px-4 md:px-8 pt-14 md:pt-20 text-center">
      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gold-700 bg-gold-50 px-3 py-1.5 rounded-full mb-5">
        <FileText size={14} /> Account Disclosure
      </span>
      <h1 className="text-3xl md:text-5xl font-bold text-navy-900 leading-tight">
        Deposit Account Disclosures
      </h1>
      <p className="text-slate-500 mt-4 text-sm">Last updated: January 2026</p>
    </section>

    <section className="max-w-5xl mx-auto px-4 md:px-8 mt-10">
      <div className="rounded-xl3 overflow-hidden shadow-card h-[220px] md:h-[320px]">
        <img
          src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1600&auto=format&fit=crop"
          alt="Reviewing deposit account disclosures"
          className="w-full h-full object-cover"
        />
      </div>
    </section>

    <section className="max-w-5xl mx-auto px-4 md:px-8 py-14 md:py-20">
      <div className="card p-6 md:p-10">
        <p className="text-slate-500 leading-relaxed mb-8">
          This Account Disclosure describes the key terms and conditions of your
          Swiss Meridian Bank deposit account, including interest rates, fees,
          balance requirements, and funds availability. Please read this
          disclosure carefully and retain it for your records. For complete
          details about your account, including our full Fee Schedule and Funds
          Availability Policy, please refer to your Account Agreement or contact
          us at 1-800-555-0199.
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

export default DepositDisclosures;
