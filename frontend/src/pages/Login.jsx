import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Login = () => {
  const { login, verifyTwoFactorLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [twoFactorUserId, setTwoFactorUserId] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.needsTwoFactor) {
        setTwoFactorUserId(result.userId);
        return;
      }
      navigate(result.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        navigate("/verify", {
          state: { userId: err.response.data.userId, email },
        });
        return;
      }
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const submitTwoFactor = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await verifyTwoFactorLogin(twoFactorUserId, twoFactorCode);
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid code. Please try again.",
      );
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
              {twoFactorUserId ? "Enter your 2FA code" : "Welcome back"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {twoFactorUserId
                ? "Open your authenticator app to get your code"
                : "Log in to your Swiss Meridian Bank account"}
            </p>
          </div>

          {twoFactorUserId ? (
            <form
              onSubmit={submitTwoFactor}
              className="card p-6 md:p-8 space-y-4"
            >
              {error && (
                <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
              <div className="relative">
                <ShieldCheck
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  required
                  placeholder="6-digit code"
                  value={twoFactorCode}
                  onChange={(e) =>
                    setTwoFactorCode(
                      e.target.value.replace(/\D/g, "").slice(0, 6),
                    )
                  }
                  className="input-field !pl-10 tracking-widest text-center"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? "Verifying..." : "Verify & Log In"}{" "}
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => setTwoFactorUserId(null)}
                className="text-xs text-slate-400 w-full text-center"
              >
                Back to login
              </button>
            </form>
          ) : (
            <form onSubmit={submit} className="card p-6 md:p-8 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
                  {error}
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
              <div className="relative">
                <Lock
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field !pl-10"
                />
              </div>

              <div className="text-right -mt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs text-navy font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? "Logging in..." : "Log In"} <ArrowRight size={16} />
              </button>
            </form>
          )}

          {!twoFactorUserId && (
            <p className="text-center text-sm text-slate-400 mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-navy font-semibold">
                Open one now
              </Link>
            </p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
