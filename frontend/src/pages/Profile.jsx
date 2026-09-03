import { useEffect, useState } from "react";
import { User, Phone, Bell, Save, Camera } from "lucide-react";
import api from "../api/axios";
import TopBar from "../components/TopBar";
import AccountDetailsCard from "../components/AccountDetailsCard";
import KycStatusCard from "../components/KycStatusCard";
import { compressImage } from "../utils/compressImage";
import { useAuth } from "../context/AuthContext";
import { useUserMenu } from "../components/DashboardLayout";

const Profile = () => {
  const { user, setUser } = useAuth();
  const { onMenuClick } = useUserMenu();
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });
  const [prefs, setPrefs] = useState({ email: true, sms: true, inApp: true });
  const [saved, setSaved] = useState("");
  const [fullUser, setFullUser] = useState(user);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  useEffect(() => {
    api.get("/users/dashboard").then((res) => {
      setFullUser((u) => ({ ...u, ...res.data.user }));
      setForm((f) => ({ ...f, phone: res.data.user.phone || f.phone }));
    });
  }, []);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    const { data } = await api.put("/users/profile", form);
    const updated = { ...user, ...data.user };
    localStorage.setItem("wtb_user", JSON.stringify(updated));
    setUser(updated);
    setSaved("Profile updated successfully.");
    setTimeout(() => setSaved(""), 2500);
  };

  const savePrefs = async () => {
    await api.put("/users/notification-preferences", prefs);
    setSaved("Notification preferences updated.");
    setTimeout(() => setSaved(""), 2500);
  };

  const uploadAvatar = async (rawFile) => {
    if (!rawFile) return;
    setAvatarError("");
    setUploadingAvatar(true);
    try {
      const file = await compressImage(rawFile, {
        maxDimension: 500,
        quality: 0.85,
      });
      const formData = new FormData();
      formData.append("avatar", file);
      const { data } = await api.post("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updated = { ...user, avatarUrl: data.avatarUrl };
      localStorage.setItem("wtb_user", JSON.stringify(updated));
      setUser(updated);
      setFullUser((u) => ({ ...u, avatarUrl: data.avatarUrl }));
      setSaved("Profile photo updated.");
      setTimeout(() => setSaved(""), 2500);
    } catch (err) {
      setAvatarError(err.response?.data?.message || "Could not upload photo");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div>
      <TopBar onMenuClick={onMenuClick} />

      <div className="px-4 md:px-8 max-w-2xl space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-navy-900">
            Profile
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage your personal details and notification preferences.
          </p>
        </div>

        {saved && (
          <div className="bg-emerald-50 text-emerald-600 text-sm rounded-xl px-4 py-3">
            {saved}
          </div>
        )}

        <div className="card p-6">
          <h3 className="font-semibold text-navy-900 flex items-center gap-2 mb-4">
            <Camera size={17} /> Profile Photo
          </h3>
          {avatarError && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              {avatarError}
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-navy-100 flex items-center justify-center text-navy font-semibold text-lg overflow-hidden shrink-0">
              {fullUser?.avatarUrl ? (
                <img
                  src={fullUser.avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                (user?.firstName?.[0] || "U") + (user?.lastName?.[0] || "")
              )}
            </div>
            <label className="btn-secondary !py-2 !px-4 text-sm cursor-pointer">
              {uploadingAvatar ? "Uploading..." : "Change Photo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => uploadAvatar(e.target.files[0])}
                disabled={uploadingAvatar}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            JPG, PNG, or WEBP — max 3MB.
          </p>
        </div>

        <form onSubmit={saveProfile} className="card p-6 space-y-4">
          <h3 className="font-semibold text-navy-900 flex items-center gap-2">
            <User size={17} /> Personal Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              placeholder="First name"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              className="input-field"
            />
            <input
              placeholder="Last name"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              className="input-field"
            />
          </div>
          <div className="relative">
            <Phone
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              placeholder="Phone number"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="input-field !pl-10"
            />
          </div>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save size={16} /> Save Changes
          </button>
        </form>

        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-navy-900 flex items-center gap-2">
            <Bell size={17} /> Notification Preferences
          </h3>
          {[
            { key: "email", label: "Email notifications" },
            { key: "sms", label: "SMS / text alerts" },
            { key: "inApp", label: "In-app notifications" },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center justify-between text-sm text-slate-600 py-1"
            >
              {label}
              <input
                type="checkbox"
                checked={prefs[key]}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, [key]: e.target.checked }))
                }
                className="h-5 w-9 accent-navy"
              />
            </label>
          ))}
          <button
            onClick={savePrefs}
            className="btn-secondary flex items-center gap-2"
          >
            <Save size={16} /> Save Preferences
          </button>
        </div>

        <KycStatusCard />

        <AccountDetailsCard user={fullUser} />
      </div>
    </div>
  );
};

export default Profile;
