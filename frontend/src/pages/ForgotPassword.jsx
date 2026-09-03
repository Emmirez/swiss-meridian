import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, KeyRound, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import api from "../api/axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("request"); // request | reset | done
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const requestReset = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setInfo(data.message);
      if (data.userId) {
        setUserId(data.userId);
        setStep("reset");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword)
      return setError("Passwords do not match");
    if (newPassword.length < 8)
      return setError("Password must be at least 8 characters");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { userId, otp, newPassword });
      setStep("done");
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset password");
    } finally {
      setLoading(false);
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
              {step === "request" && "Forgot your password?"}
              {step === "reset" && "Reset your password"}
              {step === "done" && "Password reset"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {step === "request" &&
                "Enter your email and we'll send you a reset code."}
              {step === "reset" &&
                "Enter the code we sent you and choose a new password."}
              {step === "done" && "You can now log in with your new password."}
            </p>
          </div>

          {step === "request" && (
            <form onSubmit={requestReset} className="card p-6 md:p-8 space-y-4">
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
              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field !pl-10"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? "Sending..." : "Send Reset Code"}{" "}
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={submitReset} className="card p-6 md:p-8 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
              <div className="relative">
                <KeyRound
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  required
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="input-field !pl-10 tracking-widest text-center"
                />
              </div>
              <div className="relative">
                <Lock
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="password"
                  required
                  placeholder="New password (min. 8 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field !pl-10"
                />
              </div>
              <div className="relative">
                <Lock
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field !pl-10"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? "Resetting..." : "Reset Password"}{" "}
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {step === "done" && (
            <div className="card p-8 text-center">
              <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={26} />
              </div>
              <p className="text-slate-500 text-sm mb-6">
                Your password has been changed successfully.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="btn-primary w-full"
              >
                Go to Login
              </button>
            </div>
          )}

          {step === "request" && (
            <p className="text-center text-sm text-slate-400 mt-6">
              Remember your password?{" "}
              <Link to="/login" className="text-navy font-semibold">
                Log in
              </Link>
            </p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
