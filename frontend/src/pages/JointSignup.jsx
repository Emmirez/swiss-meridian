import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { User, Hash, MapPin, Lock, KeyRound, Phone, Calendar, ArrowRight, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import api from "../api/axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

const PasswordField = ({ icon: Icon, value, onChange, ...props }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      {Icon && <Icon size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
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

const Field = ({ icon: Icon, ...props }) => (
  <div className="relative">
    {Icon && <Icon size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
    <input {...props} onChange={(e) => props.onChange(e.target.value)} className={`input-field ${Icon ? "!pl-10" : ""}`} />
  </div>
);

const JointSignup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [loadingInvite, setLoadingInvite] = useState(true);
  const [invite, setInvite] = useState(null);
  const [inviteError, setInviteError] = useState("");

  const [form, setForm] = useState({
    phone: "",
    dateOfBirth: "",
    ssn: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    password: "",
    confirmPassword: "",
    transactionPin: "",
    confirmPin: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setInviteError("This invite link is missing a token.");
      setLoadingInvite(false);
      return;
    }
    api.get(`/auth/joint-invite/${token}`)
      .then((res) => setInvite(res.data.invite))
      .catch((err) => setInviteError(err.response?.data?.message || "This invite could not be loaded."))
      .finally(() => setLoadingInvite(false));
  }, [token]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.phone || !form.dateOfBirth || !form.ssn || !form.street || !form.city || !form.state || !form.zip) {
      return setError("Please complete all fields");
    }
    if (!/^\d{9}$/.test(form.ssn)) {
      return setError("SSN must be exactly 9 digits");
    }
    if (form.password.length < 8) {
      return setError("Password must be at least 8 characters");
    }
    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }
    if (!/^\d{4}$/.test(form.transactionPin)) {
      return setError("Transaction PIN must be exactly 4 digits");
    }
    if (form.transactionPin !== form.confirmPin) {
      return setError("PINs do not match");
    }

    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/joint-signup", {
        token,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        ssn: form.ssn,
        address: { street: form.street, city: form.city, state: form.state, zip: form.zip },
        password: form.password,
        transactionPin: form.transactionPin,
      });
      setDone(true);
      setTimeout(() => {
        navigate("/verify", { state: { userId: data.userId, email: data.email } });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Could not complete registration");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header showBackHome />

      <div className="flex-1 flex items-center justify-center px-4 py-14">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Swiss Meridian Bank" className="h-12 mx-auto mb-4" onError={(e) => (e.target.style.display = "none")} />
            <h1 className="text-2xl font-bold text-navy-900">Join a Swiss Meridian Bank account</h1>
          </div>

          {loadingInvite ? (
            <div className="card p-8 text-center text-slate-400 text-sm">Loading invite...</div>
          ) : inviteError ? (
            <div className="card p-8 text-center">
              <p className="text-red-600 text-sm mb-4">{inviteError}</p>
              <Link to="/register" className="text-navy font-semibold text-sm underline">
                Register for your own account instead
              </Link>
            </div>
          ) : done ? (
            <div className="card p-8 text-center">
              <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={26} />
              </div>
              <p className="font-semibold text-navy-900">Registration complete</p>
              <p className="text-sm text-slate-500 mt-2">Redirecting you to verify your email...</p>
            </div>
          ) : (
            <>
              <div className="card p-5 mb-5 bg-blue-50 border border-blue-100">
                <p className="text-sm text-navy-900">
                  <strong>{invite.primaryName}</strong> has invited you (<strong>{invite.name}</strong>) to be a joint holder on a{" "}
                  <strong>{invite.accountType?.replace("_", " ")}</strong> account in <strong>{invite.currency}</strong>.
                </p>
              </div>

              <form onSubmit={submit} className="card p-6 md:p-8 space-y-4">
                {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}

                <p className="text-sm font-semibold text-navy-900">Your details</p>
                <Field icon={Phone} placeholder="Phone number (e.g. +1 202 555 0100)" value={form.phone} onChange={(v) => update("phone", v)} />
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">Date of birth</label>
                  <div className="relative w-full overflow-hidden" style={{ boxSizing: "border-box" }}>
                    <Calendar size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                    {!form.dateOfBirth && (
                      <span className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">Select date</span>
                    )}
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => update("dateOfBirth", e.target.value)}
                      className="input-field !pl-10"
                      style={{ width: "100%", maxWidth: "100%", minWidth: 0, boxSizing: "border-box", display: "block", WebkitAppearance: "none", appearance: "none" }}
                    />
                  </div>
                </div>
                <Field
                  icon={Hash}
                  placeholder="Social Security Number (9 digits)"
                  value={form.ssn}
                  onChange={(v) => update("ssn", v.replace(/\D/g, "").slice(0, 9))}
                />

                <p className="text-sm font-semibold text-navy-900 pt-2">Your address</p>
                <Field icon={MapPin} placeholder="Street address" value={form.street} onChange={(v) => update("street", v)} />
                <div className="grid sm:grid-cols-3 gap-4">
                  <Field placeholder="City" value={form.city} onChange={(v) => update("city", v)} />
                  <Field placeholder="State" value={form.state} onChange={(v) => update("state", v)} />
                  <Field placeholder="ZIP code" value={form.zip} onChange={(v) => update("zip", v)} />
                </div>

                <p className="text-sm font-semibold text-navy-900 pt-2">Security</p>
                <PasswordField icon={Lock} placeholder="Create password (min. 8 characters)" value={form.password} onChange={(v) => update("password", v)} />
                <PasswordField icon={Lock} placeholder="Confirm password" value={form.confirmPassword} onChange={(v) => update("confirmPassword", v)} />
                <PasswordField
                  icon={KeyRound}
                  placeholder="Create 4-digit transaction PIN"
                  value={form.transactionPin}
                  onChange={(v) => update("transactionPin", v.replace(/\D/g, "").slice(0, 4))}
                />
                <PasswordField
                  icon={KeyRound}
                  placeholder="Confirm transaction PIN"
                  value={form.confirmPin}
                  onChange={(v) => update("confirmPin", v.replace(/\D/g, "").slice(0, 4))}
                />

                <p className="text-xs text-slate-400">
                  Your SSN is encrypted and only used to verify your identity, as required for US bank accounts.
                </p>

                <button type="submit" disabled={submitting} className="btn-gold w-full flex items-center justify-center gap-2">
                  {submitting ? "Creating account..." : "Complete Registration"} <ArrowRight size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default JointSignup;