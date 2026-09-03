import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Hash,
  MapPin,
  Lock,
  KeyRound,
  Wallet,
  PiggyBank,
  Briefcase,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  Users,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../api/axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

const accountTypeOptions = [
  {
    value: "checking",
    label: "Checking",
    icon: Wallet,
    desc: "Everyday spending",
  },
  {
    value: "savings",
    label: "Savings",
    icon: PiggyBank,
    desc: "Grow your balance",
  },
  {
    value: "business",
    label: "Business",
    icon: Briefcase,
    desc: "For your company",
  },
  {
    value: "money_market",
    label: "Money Market",
    icon: TrendingUp,
    desc: "Higher yields",
  },
];

const currencyOptions = ["USD", "GBP", "EUR", "CAD", "AUD", "JPY", "CHF"];

const steps = ["Personal Info", "Address & ID", "Account Setup", "Security"];

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    ssn: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    accountType: "checking",
    currency: "USD",
    isJoint: false,
    jointHolderName: "",
    jointHolderEmail: "",
    password: "",
    confirmPassword: "",
    transactionPin: "",
    confirmPin: "",
  });

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const validateStep = () => {
    setError("");
    if (step === 0) {
      if (
        !form.firstName ||
        !form.lastName ||
        !form.email ||
        !form.phone ||
        !form.dateOfBirth
      ) {
        setError("Please fill in all fields");
        return false;
      }
    }
    if (step === 1) {
      if (!/^\d{9}$/.test(form.ssn)) {
        setError("SSN must be exactly 9 digits");
        return false;
      }
      if (!form.street || !form.city || !form.state || !form.zip) {
        setError("Please complete your address");
        return false;
      }
    }
    if (step === 2 && form.isJoint) {
      if (!form.jointHolderName || !form.jointHolderEmail) {
        setError("Please provide the joint account holder's name and email");
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.jointHolderEmail)) {
        setError("Please enter a valid email for the joint account holder");
        return false;
      }
    }
    if (step === 3) {
      if (form.password.length < 8) {
        setError("Password must be at least 8 characters");
        return false;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
      if (!/^\d{4}$/.test(form.transactionPin)) {
        setError("Transaction PIN must be exactly 4 digits");
        return false;
      }
      if (form.transactionPin !== form.confirmPin) {
        setError("PINs do not match");
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/register", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        ssn: form.ssn,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          zip: form.zip,
        },
        password: form.password,
        transactionPin: form.transactionPin,
        accountType: form.accountType,
        currency: form.currency,
        isJoint: form.isJoint,
        jointHolderName: form.isJoint ? form.jointHolderName : undefined,
        jointHolderEmail: form.isJoint ? form.jointHolderEmail : undefined,
      });
      navigate("/verify", {
        state: { userId: data.userId, email: data.email },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <img
              src="/logo.png"
              alt="Swiss Meridian Bank"
              className="h-12 mx-auto mb-4"
              onError={(e) => (e.target.style.display = "none")}
            />
            <h1 className="text-2xl font-bold text-navy-900">
              Start banking with us today
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Get started in minutes. Most applications are approved within 1-2
              business days.
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-between mb-8 px-2">
            {steps.map((label, i) => (
              <div key={label} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                      i < step
                        ? "bg-navy border-navy text-white"
                        : i === step
                          ? "border-navy text-navy"
                          : "border-slate-200 text-slate-300"
                    }`}
                  >
                    {i < step ? <Check size={16} /> : i + 1}
                  </div>
                  <span
                    className={`text-[11px] mt-1.5 text-center ${i === step ? "text-navy font-medium" : "text-slate-400"}`}
                  >
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 -mt-5 ${i < step ? "bg-navy" : "bg-slate-200"}`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="card p-6 md:p-8">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
                {error}
              </div>
            )}

            {step === 0 && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field
                    icon={User}
                    placeholder="First name"
                    value={form.firstName}
                    onChange={(v) => update("firstName", v)}
                  />
                  <Field
                    icon={User}
                    placeholder="Last name"
                    value={form.lastName}
                    onChange={(v) => update("lastName", v)}
                  />
                </div>
                <Field
                  icon={Mail}
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(v) => update("email", v)}
                />
                <Field
                  icon={Phone}
                  placeholder="Phone number (e.g. +1 202 555 0100)"
                  value={form.phone}
                  onChange={(v) => update("phone", v)}
                />
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">
                    Date of birth
                  </label>
                  <div
                    className="relative w-full overflow-hidden"
                    style={{ boxSizing: "border-box" }}
                  >
                    <Calendar
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                    />
                    {!form.dateOfBirth && (
                      <span className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                        Select date
                      </span>
                    )}
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => update("dateOfBirth", e.target.value)}
                      className="input-field !pl-10"
                      style={{
                        width: "100%",
                        maxWidth: "100%",
                        minWidth: 0,
                        boxSizing: "border-box",
                        display: "block",
                        WebkitAppearance: "none",
                        appearance: "none",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <Field
                  icon={Hash}
                  placeholder="Social Security Number (9 digits)"
                  value={form.ssn}
                  onChange={(v) =>
                    update("ssn", v.replace(/\D/g, "").slice(0, 9))
                  }
                />
                <Field
                  icon={MapPin}
                  placeholder="Street address"
                  value={form.street}
                  onChange={(v) => update("street", v)}
                />
                <div className="grid sm:grid-cols-3 gap-4">
                  <Field
                    placeholder="City"
                    value={form.city}
                    onChange={(v) => update("city", v)}
                  />
                  <Field
                    placeholder="State"
                    value={form.state}
                    onChange={(v) => update("state", v)}
                  />
                  <Field
                    placeholder="ZIP code"
                    value={form.zip}
                    onChange={(v) => update("zip", v)}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Your SSN is encrypted and only used to verify your identity,
                  as required for US bank accounts.
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-navy-900 mb-3">
                    Choose your account type
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {accountTypeOptions.map(
                      ({ value, label, icon: Icon, desc }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => update("accountType", value)}
                          className={`text-left p-4 rounded-2xl border-2 transition-colors ${
                            form.accountType === value
                              ? "border-navy bg-navy-50"
                              : "border-slate-100 hover:border-slate-200"
                          }`}
                        >
                          <Icon size={20} className="text-navy mb-2" />
                          <p className="text-sm font-semibold text-navy-900">
                            {label}
                          </p>
                          <p className="text-xs text-slate-400">{desc}</p>
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <label className="flex items-start gap-3 bg-slate-50 rounded-xl px-4 py-3.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isJoint}
                    onChange={(e) => update("isJoint", e.target.checked)}
                    className="h-4 w-4 mt-0.5 accent-navy shrink-0"
                  />
                  <span className="text-sm">
                    <span className="font-semibold text-navy-900 flex items-center gap-1.5">
                      <Users size={15} /> Make this a joint account
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      Add a second account holder who shares equal access to
                      this account.
                    </p>
                  </span>
                </label>

                {form.isJoint && (
                  <div>
                    <p className="text-sm font-semibold text-navy-900 mb-3">
                      Joint account holder's details
                    </p>
                    <div className="space-y-3">
                      <Field
                        icon={User}
                        placeholder="Joint holder's full name"
                        value={form.jointHolderName}
                        onChange={(v) => update("jointHolderName", v)}
                      />
                      <Field
                        icon={Mail}
                        type="email"
                        placeholder="Joint holder's email address"
                        value={form.jointHolderEmail}
                        onChange={(v) => update("jointHolderEmail", v)}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      The joint holder will be listed on this account but won't
                      need to complete their own registration.
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold text-navy-900 mb-3">
                    Choose your account currency
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {currencyOptions.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => update("currency", c)}
                        className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                          form.currency === c
                            ? "border-navy bg-navy text-white"
                            : "border-slate-100 text-slate-500 hover:border-slate-200"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <PasswordField
                  icon={Lock}
                  placeholder="Create password (min. 8 characters)"
                  value={form.password}
                  onChange={(v) => update("password", v)}
                />
                <PasswordField
                  icon={Lock}
                  placeholder="Confirm password"
                  value={form.confirmPassword}
                  onChange={(v) => update("confirmPassword", v)}
                />
                <PasswordField
                  icon={KeyRound}
                  placeholder="Create 4-digit transaction PIN"
                  value={form.transactionPin}
                  onChange={(v) =>
                    update("transactionPin", v.replace(/\D/g, "").slice(0, 4))
                  }
                />
                <PasswordField
                  icon={KeyRound}
                  placeholder="Confirm transaction PIN"
                  value={form.confirmPin}
                  onChange={(v) =>
                    update("confirmPin", v.replace(/\D/g, "").slice(0, 4))
                  }
                />
                <p className="text-xs text-slate-400">
                  Your transaction PIN is required for every transfer — keep it
                  separate from your login password.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mt-8">
              {step > 0 ? (
                <button
                  onClick={back}
                  className="btn-secondary flex items-center gap-1.5 !px-4"
                >
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <span />
              )}
              {step < steps.length - 1 ? (
                <button
                  onClick={next}
                  className="btn-primary flex items-center gap-1.5"
                >
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={loading}
                  className="btn-gold flex items-center gap-1.5 whitespace-nowrap"
                >
                  {loading ? "Creating account..." : "Create Account"}{" "}
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-navy font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

const Field = ({ icon: Icon, ...props }) => (
  <div className="relative">
    {Icon && (
      <Icon
        size={17}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
    )}
    <input
      {...props}
      onChange={(e) => props.onChange(e.target.value)}
      className={`input-field ${Icon ? "!pl-10" : ""}`}
    />
  </div>
);

const PasswordField = ({ icon: Icon, value, onChange, ...props }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={17}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      )}
      <input
        {...props}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field !pl-10 !pr-10"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy transition"
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
};

export default Register;
