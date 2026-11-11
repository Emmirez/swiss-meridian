import { useState } from "react";
import { X, Save, MapPin } from "lucide-react";
import api from "../api/axios";
import CustomSelect from "./CustomSelect";
import { countries } from "../utils/countries";

const countryOptions = countries.map((c) => ({ value: c, label: c }));

const getRegionConfig = (country) => {
  if (country === "United States")
    return { region: "State", postal: "ZIP code", required: true };
  if (country === "Canada")
    return { region: "Province", postal: "Postal code", required: true };
  return {
    region: "State / Region (optional)",
    postal: "Postal code (optional)",
    required: false,
  };
};

const AdminEditAddressModal = ({ user, onClose, onSaved }) => {
  const [form, setForm] = useState({
    street: user.address?.street || "",
    city: user.address?.city || "",
    state: user.address?.state || "",
    zip: user.address?.zip || "",
    country: user.address?.country || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const regionConfig = getRegionConfig(form.country);

  const save = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.country) return setError("Please select a country");
    if (!form.street.trim() || !form.city.trim())
      return setError("Street and city are required");
    if (regionConfig.required && (!form.state.trim() || !form.zip.trim()))
      return setError(
        form.country === "Canada"
          ? "Province and postal code are required"
          : "State and ZIP code are required",
      );

    setSaving(true);
    try {
      await api.put(`/admin/users/${user._id}/address`, form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update address");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-navy-900/40 backdrop-blur-sm px-0 sm:px-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-1">
          <p className="font-semibold text-navy-900 flex items-center gap-2">
            <MapPin size={17} /> Edit Address
          </p>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-slate-400 hover:text-navy transition"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          {user.firstName} {user.lastName} · {user.accountNumber}
        </p>

        <form onSubmit={save} className="space-y-3">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <CustomSelect
            value={form.country}
            onChange={(v) => update("country", v)}
            options={countryOptions}
            placeholder="Select country"
          />
          <input
            placeholder="Street address"
            value={form.street}
            onChange={(e) => update("street", e.target.value)}
            className="input-field"
          />
          <input
            placeholder="City"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            className="input-field"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder={regionConfig.region}
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
              className="input-field"
            />
            <input
              placeholder={regionConfig.postal}
              value={form.zip}
              onChange={(e) => update("zip", e.target.value)}
              className="input-field"
            />
          </div>

          <p className="text-[11px] text-slate-400">
            The customer will be notified by email and in-app that their
            address was changed.
          </p>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-navy text-white hover:bg-navy-800 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Save size={15} /> {saving ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditAddressModal;