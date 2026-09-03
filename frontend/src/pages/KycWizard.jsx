import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  FileText,
  User,
  MapPin,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Camera,
  ShieldCheck,
} from "lucide-react";
import api from "../api/axios";
import TopBar from "../components/TopBar";
import CustomSelect from "../components/CustomSelect";
import { compressImage } from "../utils/compressImage";
import { useUserMenu } from "../components/DashboardLayout";

const steps = [
  { key: "documents", label: "Documents", icon: FileText },
  { key: "personal", label: "Personal Info", icon: User },
  { key: "address", label: "Address", icon: MapPin },
  { key: "employment", label: "Employment", icon: Briefcase },
];

const documentTypes = [
  { value: "drivers_license", label: "Driver's License" },
  { value: "passport", label: "Passport" },
  { value: "national_id", label: "National ID" },
  { value: "state_id", label: "State ID Card" },
];

const employmentStatuses = [
  { value: "employed", label: "Employed" },
  { value: "self_employed", label: "Self-Employed" },
  { value: "unemployed", label: "Unemployed" },
  { value: "student", label: "Student" },
  { value: "retired", label: "Retired" },
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const FileDropzone = ({ label, required, file, onChange, hint }) => {
  const [compressing, setCompressing] = useState(false);

  const handleFile = async (rawFile) => {
    if (!rawFile) return;
    setCompressing(true);
    try {
      const compressed = await compressImage(rawFile);
      onChange(compressed);
    } finally {
      setCompressing(false);
    }
  };

  return (
    <div>
      <p className="text-sm font-medium text-navy-900 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
        {!required && (
          <span className="text-slate-400 font-normal"> (optional)</span>
        )}
      </p>
      <label className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-slate-200 rounded-2xl py-6 cursor-pointer hover:border-navy-300 hover:bg-navy-50/40 transition-colors">
        <Camera size={22} className="text-slate-400" />
        <span className="text-sm font-medium text-navy">
          {compressing
            ? "Compressing..."
            : file
              ? file.name
              : `Click to upload ${label.toLowerCase()}`}
        </span>
        <span className="text-xs text-slate-400">
          JPG, PNG up to 5MB (auto-compressed)
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleFile(e.target.files[0])}
          disabled={compressing}
          className="hidden"
        />
      </label>
      {hint && <p className="text-xs text-slate-400 mt-1.5">{hint}</p>}
    </div>
  );
};

const KycWizard = () => {
  const { onMenuClick } = useUserMenu();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    documentType: "",
    documentNumber: "",
    frontId: null,
    backId: null,
    selfie: null,
    fullName: "",
    dateOfBirth: "",
    nationality: "",
    gender: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    employmentStatus: "",
    occupation: "",
    employerName: "",
    annualIncome: "",
    sourceOfFunds: "",
  });

  useEffect(() => {
    api
      .get("/users/kyc")
      .then((res) => setStatus(res.data))
      .finally(() => setCheckingStatus(false));
  }, []);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const validateStep = () => {
    setError("");
    if (step === 0) {
      if (!form.documentType)
        return setError("Please select a document type") ?? false;
      if (!form.documentNumber)
        return setError("Please enter your document number") ?? false;
      if (!form.frontId) return setError("Front of ID is required") ?? false;
      if (!form.selfie) return setError("Selfie with ID is required") ?? false;
    }
    if (step === 1) {
      if (!form.fullName || !form.dateOfBirth || !form.nationality)
        return setError("Please complete all required fields") ?? false;
    }
    if (step === 2) {
      if (
        !form.street ||
        !form.city ||
        !form.state ||
        !form.zip ||
        !form.country
      )
        return setError("Please complete your address") ?? false;
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    if (step === 3) {
      setError("");
      if (!form.employmentStatus || !form.sourceOfFunds) {
        setError("Please complete all required fields");
        return;
      }
    }
    setSubmitting(true);
    setError("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== "") formData.append(key, value);
      });

      await api.post("/users/kyc", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not submit KYC information",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingStatus) {
    return (
      <div>
        <TopBar onMenuClick={onMenuClick} />
        <div className="p-8 text-slate-400 text-sm">Loading...</div>
      </div>
    );
  }

  // Already verified or pending — show status instead of the form
  if (
    status?.kycStatus === "approved" ||
    status?.kycStatus === "pending" ||
    submitted
  ) {
    const isApproved = submitted ? false : status?.kycStatus === "approved";
    const isPending = submitted || status?.kycStatus === "pending";
    return (
      <div>
        <TopBar onMenuClick={onMenuClick} />
        <div className="px-4 md:px-8 max-w-lg mx-auto py-10">
          <div className="card p-8 text-center">
            <div
              className={`h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-4 ${isApproved ? "bg-emerald-50 text-emerald-500" : "bg-gold-50 text-gold-600"}`}
            >
              <ShieldCheck size={26} />
            </div>
            <h3 className="font-bold text-navy-900 text-lg">
              {isApproved ? "Identity Verified" : "Verification Submitted"}
            </h3>
            <p className="text-slate-500 text-sm mt-2">
              {isApproved
                ? "Your identity has been verified. No further action needed."
                : "Your KYC information is under review. We'll notify you once it's been checked."}
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="btn-primary mt-6"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar onMenuClick={onMenuClick} />

      <div className="px-4 md:px-8 max-w-2xl mx-auto pb-10">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-navy-900">
            Identity Verification
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Complete all steps to verify your identity.
          </p>
        </div>

        {status?.kycStatus === "rejected" && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">
            Your previous submission was rejected
            {status.kycNote ? `: ${status.kycNote}` : "."} Please resubmit
            below.
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
          {steps.map(({ label, icon: Icon }, i) => (
            <div key={label} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    i < step
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : i === step
                        ? "border-navy text-navy bg-navy-50"
                        : "border-slate-200 text-slate-300"
                  }`}
                >
                  {i < step ? <Check size={18} /> : <Icon size={17} />}
                </div>
                <span
                  className={`text-[11px] mt-1.5 text-center ${i === step ? "text-navy font-medium" : "text-slate-400"}`}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 -mt-5 ${i < step ? "bg-emerald-500" : "bg-slate-200"}`}
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
            <div className="space-y-5">
              <CustomSelect
                value={form.documentType}
                onChange={(v) => update("documentType", v)}
                options={documentTypes}
                placeholder="Select document type"
              />
              <input
                placeholder="Document number"
                value={form.documentNumber}
                onChange={(e) => update("documentNumber", e.target.value)}
                className="input-field"
              />
              <FileDropzone
                label="Front of ID"
                required
                file={form.frontId}
                onChange={(f) => update("frontId", f)}
              />
              <FileDropzone
                label="Back of ID"
                file={form.backId}
                onChange={(f) => update("backId", f)}
              />
              <FileDropzone
                label="Selfie with ID"
                required
                file={form.selfie}
                onChange={(f) => update("selfie", f)}
                hint="Make sure all text is clearly visible. Selfie should clearly show your face."
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <input
                placeholder="Full legal name"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                className="input-field"
              />
              <input
                type="date"
                placeholder="Date of birth"
                value={form.dateOfBirth}
                onChange={(e) => update("dateOfBirth", e.target.value)}
                className="input-field"
              />
              <input
                placeholder="Nationality (country of citizenship)"
                value={form.nationality}
                onChange={(e) => update("nationality", e.target.value)}
                className="input-field"
              />
              <CustomSelect
                value={form.gender}
                onChange={(v) => update("gender", v)}
                options={genderOptions}
                placeholder="Select gender (optional)"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <input
                placeholder="Street address"
                value={form.street}
                onChange={(e) => update("street", e.target.value)}
                className="input-field"
              />
              <div className="grid sm:grid-cols-3 gap-4">
                <input
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="input-field"
                />
                <input
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  className="input-field"
                />
                <input
                  placeholder="ZIP code"
                  value={form.zip}
                  onChange={(e) => update("zip", e.target.value)}
                  className="input-field"
                />
              </div>
              <input
                placeholder="Country"
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
                className="input-field"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <CustomSelect
                value={form.employmentStatus}
                onChange={(v) => update("employmentStatus", v)}
                options={employmentStatuses}
                placeholder="Select employment status"
              />
              <input
                placeholder="Occupation (optional)"
                value={form.occupation}
                onChange={(e) => update("occupation", e.target.value)}
                className="input-field"
              />
              <input
                placeholder="Employer name (optional)"
                value={form.employerName}
                onChange={(e) => update("employerName", e.target.value)}
                className="input-field"
              />
              <input
                type="number"
                placeholder="Annual income in USD (optional)"
                value={form.annualIncome}
                onChange={(e) => update("annualIncome", e.target.value)}
                className="input-field"
              />
              <input
                placeholder="Source of funds (e.g. Salary, Business, Investments)"
                value={form.sourceOfFunds}
                onChange={(e) => update("sourceOfFunds", e.target.value)}
                className="input-field"
              />
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
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting}
                className="btn-gold flex items-center gap-1.5 whitespace-nowrap"
              >
                {submitting ? "Submitting..." : "Submit for Review"}{" "}
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KycWizard;
