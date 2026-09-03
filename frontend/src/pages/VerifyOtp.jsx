import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Mail, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";
import api from "../api/axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

const VerifyOtp = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const userId = state?.userId;
  const email = state?.email;

  const [emailOtp, setEmailOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  if (!userId) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 text-center">
          <div>
            <p className="text-navy-900 font-semibold mb-2">
              No registration found in this session.
            </p>
            <Link to="/register" className="text-navy underline text-sm">
              Start a new registration
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const verifyEmail = async () => {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await api.post("/auth/verify-email", { userId, otp: emailOtp });
      setEmailVerified(true);
      setInfo("Email verified successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError("");
    setInfo("");
    try {
      await api.post("/auth/resend-otp", { userId });
      setInfo("A new code was sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend code");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-14">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img
              src="/logo.png"
              alt="Swiss Meridian Bank"
              className="h-12 mx-auto mb-4"
              onError={(e) => (e.target.style.display = "none")}
            />
            <h1 className="text-2xl font-bold text-navy-900">
              Verify your identity
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              We sent a code to {email || "your email"}
            </p>
          </div>

          <div className="card p-6 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            {info && (
              <div className="bg-emerald-50 text-emerald-600 text-sm rounded-xl px-4 py-3">
                {info}
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-navy-900 flex items-center gap-2 mb-3">
                <Mail size={16} /> Email verification
                {emailVerified && (
                  <CheckCircle2
                    size={16}
                    className="text-emerald-500 ml-auto"
                  />
                )}
              </p>
              {!emailVerified && (
                <div className="flex gap-2">
                  <input
                    value={emailOtp}
                    onChange={(e) =>
                      setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="6-digit code"
                    className="input-field flex-1 tracking-widest text-center"
                  />
                  <button
                    onClick={verifyEmail}
                    disabled={loading || emailOtp.length !== 6}
                    className="btn-primary !px-4"
                  >
                    Verify
                  </button>
                </div>
              )}
              {!emailVerified && (
                <button
                  onClick={resend}
                  className="text-xs text-navy flex items-center gap-1 mt-2"
                >
                  <RefreshCw size={12} /> Resend code
                </button>
              )}
            </div>

            {emailVerified && (
              <button
                onClick={() => navigate("/registration-success")}
                className="btn-gold w-full flex items-center justify-center gap-2"
              >
                Continue <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VerifyOtp;
