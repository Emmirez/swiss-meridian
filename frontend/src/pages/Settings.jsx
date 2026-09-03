import { useEffect, useState } from "react";
import { Lock, KeyRound, ShieldCheck, Save, QrCode, CheckCircle2, XCircle } from "lucide-react";
import api from "../api/axios";
import TopBar from "../components/TopBar";
import { useUserMenu } from "../components/DashboardLayout";

const Settings = () => {
  const { onMenuClick } = useUserMenu();

  // Change password
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // Change PIN
  const [pinForm, setPinForm] = useState({ currentPassword: "", newPin: "", confirmPin: "" });
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState("");
  const [pinLoading, setPinLoading] = useState(false);

  // 2FA
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [twoFactorError, setTwoFactorError] = useState("");
  const [twoFactorSuccess, setTwoFactorSuccess] = useState("");
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  useEffect(() => {
    api.get("/users/2fa/status").then((res) => setTwoFactorEnabled(res.data.twoFactorEnabled));
  }, []);

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    setPwError(""); setPwSuccess("");
    if (pwForm.newPassword !== pwForm.confirmPassword) return setPwError("New passwords do not match");
    if (pwForm.newPassword.length < 8) return setPwError("New password must be at least 8 characters");
    setPwLoading(true);
    try {
      await api.put("/users/change-password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwSuccess("Password updated successfully.");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwError(err.response?.data?.message || "Could not update password");
    } finally {
      setPwLoading(false);
    }
  };

  const submitPinChange = async (e) => {
    e.preventDefault();
    setPinError(""); setPinSuccess("");
    if (!/^\d{4}$/.test(pinForm.newPin)) return setPinError("PIN must be exactly 4 digits");
    setPinLoading(true);
    try {
      await api.put("/users/change-pin", pinForm);
      setPinSuccess("Transaction PIN updated successfully.");
      setPinForm({ currentPassword: "", newPin: "", confirmPin: "" });
    } catch (err) {
      setPinError(err.response?.data?.message || "Could not update PIN");
    } finally {
      setPinLoading(false);
    }
  };

  const startTwoFactorSetup = async () => {
    setTwoFactorError(""); setTwoFactorSuccess("");
    setTwoFactorLoading(true);
    try {
      const { data } = await api.post("/users/2fa/setup");
      setQrCode(data.qrCodeDataUrl);
      setSecret(data.secret);
    } catch (err) {
      setTwoFactorError(err.response?.data?.message || "Could not start 2FA setup");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const confirmTwoFactorSetup = async (e) => {
    e.preventDefault();
    setTwoFactorError(""); setTwoFactorSuccess("");
    setTwoFactorLoading(true);
    try {
      await api.post("/users/2fa/verify-setup", { token: verifyCode });
      setTwoFactorEnabled(true);
      setQrCode(null);
      setSecret(null);
      setVerifyCode("");
      setTwoFactorSuccess("Two-factor authentication is now enabled.");
    } catch (err) {
      setTwoFactorError(err.response?.data?.message || "Invalid code");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const disableTwoFactor = async (e) => {
    e.preventDefault();
    setTwoFactorError(""); setTwoFactorSuccess("");
    setTwoFactorLoading(true);
    try {
      await api.post("/users/2fa/disable", { currentPassword: disablePassword });
      setTwoFactorEnabled(false);
      setDisablePassword("");
      setTwoFactorSuccess("Two-factor authentication has been disabled.");
    } catch (err) {
      setTwoFactorError(err.response?.data?.message || "Could not disable 2FA");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  return (
    <div>
      <TopBar onMenuClick={onMenuClick} />

      <div className="px-4 md:px-8 max-w-2xl space-y-6 pb-10">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-navy-900">Settings</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage your password, transaction PIN, and login security.</p>
        </div>

        {/* Change Password */}
        <form onSubmit={submitPasswordChange} className="card p-6 space-y-4">
          <h3 className="font-semibold text-navy-900 flex items-center gap-2"><Lock size={17} /> Change Password</h3>
          {pwError && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{pwError}</div>}
          {pwSuccess && <div className="bg-emerald-50 text-emerald-600 text-sm rounded-xl px-4 py-3">{pwSuccess}</div>}
          <input
            type="password"
            required
            placeholder="Current password"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
            className="input-field"
          />
          <input
            type="password"
            required
            placeholder="New password (min. 8 characters)"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
            className="input-field"
          />
          <input
            type="password"
            required
            placeholder="Confirm new password"
            value={pwForm.confirmPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            className="input-field"
          />
          <button type="submit" disabled={pwLoading} className="btn-primary flex items-center gap-2">
            <Save size={16} /> {pwLoading ? "Updating..." : "Update Password"}
          </button>
        </form>

        {/* Change PIN */}
        <form onSubmit={submitPinChange} className="card p-6 space-y-4">
          <h3 className="font-semibold text-navy-900 flex items-center gap-2"><KeyRound size={17} /> Change Transaction PIN</h3>
          {pinError && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{pinError}</div>}
          {pinSuccess && <div className="bg-emerald-50 text-emerald-600 text-sm rounded-xl px-4 py-3">{pinSuccess}</div>}
          <input
            type="password"
            required
            placeholder="Current account password"
            value={pinForm.currentPassword}
            onChange={(e) => setPinForm((f) => ({ ...f, currentPassword: e.target.value }))}
            className="input-field"
          />
          <input
            type="password"
            required
            inputMode="numeric"
            maxLength={4}
            placeholder="New 4-digit PIN"
            value={pinForm.newPin}
            onChange={(e) => setPinForm((f) => ({ ...f, newPin: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
            className="input-field tracking-widest"
          />
          <input
            type="password"
            required
            inputMode="numeric"
            maxLength={4}
            placeholder="Confirm new PIN"
            value={pinForm.confirmPin}
            onChange={(e) => setPinForm((f) => ({ ...f, confirmPin: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
            className="input-field tracking-widest"
          />
          <button type="submit" disabled={pinLoading} className="btn-primary flex items-center gap-2">
            <Save size={16} /> {pinLoading ? "Updating..." : "Update PIN"}
          </button>
        </form>

        {/* 2FA */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-navy-900 flex items-center gap-2"><ShieldCheck size={17} /> Two-Factor Authentication</h3>
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${twoFactorEnabled ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
              {twoFactorEnabled ? <CheckCircle2 size={12} /> : <XCircle size={12} />} {twoFactorEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          {twoFactorError && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{twoFactorError}</div>}
          {twoFactorSuccess && <div className="bg-emerald-50 text-emerald-600 text-sm rounded-xl px-4 py-3">{twoFactorSuccess}</div>}

          {twoFactorEnabled ? (
            <form onSubmit={disableTwoFactor} className="space-y-3">
              <p className="text-sm text-slate-500">Enter your password to turn off two-factor authentication.</p>
              <input
                type="password"
                required
                placeholder="Current password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                className="input-field"
              />
              <button type="submit" disabled={twoFactorLoading} className="btn-secondary !bg-red-50 !text-red-500 hover:!bg-red-100">
                {twoFactorLoading ? "Disabling..." : "Disable 2FA"}
              </button>
            </form>
          ) : qrCode ? (
            <form onSubmit={confirmTwoFactorSetup} className="space-y-3">
              <p className="text-sm text-slate-500">Scan this QR code with Google Authenticator, Authy, or a similar app.</p>
              <div className="flex justify-center">
                <img src={qrCode} alt="2FA QR code" className="h-44 w-44 rounded-xl border border-slate-100" />
              </div>
              <p className="text-xs text-slate-400 text-center">
                Can't scan it? Enter this code manually: <span className="font-mono font-semibold text-navy-900">{secret}</span>
              </p>
              <input
                required
                placeholder="Enter the 6-digit code from your app"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="input-field tracking-widest text-center"
              />
              <button type="submit" disabled={twoFactorLoading} className="btn-gold w-full">
                {twoFactorLoading ? "Verifying..." : "Verify & Enable 2FA"}
              </button>
            </form>
          ) : (
            <div>
              <p className="text-sm text-slate-500 mb-4">
                Add an extra layer of security — after entering your password, you'll also need a code from an authenticator app to log in.
              </p>
              <button onClick={startTwoFactorSetup} disabled={twoFactorLoading} className="btn-primary flex items-center gap-2">
                <QrCode size={16} /> {twoFactorLoading ? "Loading..." : "Set Up 2FA"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;