import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, User, MapPin, Briefcase, FileText } from "lucide-react";
import api from "../../api/axios";
import TopBar from "../../components/TopBar";
import { useAdminMenu } from "../../components/AdminLayout";

const docLabels = {
  drivers_license: "Driver's License",
  passport: "Passport",
  national_id: "National ID",
  state_id: "State ID Card",
};

const employmentLabels = {
  employed: "Employed",
  self_employed: "Self-Employed",
  unemployed: "Unemployed",
  student: "Student",
  retired: "Retired",
};

const genderLabels = {
  male: "Male",
  female: "Female",
  other: "Other",
  prefer_not_to_say: "Prefer not to say",
};

const Field = ({ label, value }) => (
  <div>
    <p className="text-[11px] text-slate-400">{label}</p>
    <p className="text-sm font-medium text-navy-900">{value || "—"}</p>
  </div>
);

const ImageThumb = ({ label, url }) => {
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="block">
      <img src={url} alt={label} className="h-24 w-full rounded-xl border border-slate-100 object-cover" />
      <p className="text-[11px] text-slate-400 mt-1 text-center">{label}</p>
    </a>
  );
};

const AdminKycReview = () => {
  const { onMenuClick } = useAdminMenu();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState("");

  const load = () => {
    api.get("/admin/kyc?status=pending").then((res) => setUsers(res.data.users)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    await api.put(`/admin/kyc/${id}/approve`);
    load();
  };

  const reject = async (id) => {
    await api.put(`/admin/kyc/${id}/reject`, { reason });
    setRejectingId(null);
    setReason("");
    load();
  };

  return (
    <div>
      <TopBar notificationsHref="/admin/notifications" onMenuClick={onMenuClick} profileHref={null} />

      <div className="px-4 md:px-8 space-y-6 pb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-navy-900">KYC Review</h1>
          <p className="text-sm text-slate-400 mt-0.5">Review full identity verification submissions.</p>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading submissions...</p>
        ) : users.length === 0 ? (
          <div className="card p-10 text-center text-slate-400 text-sm">No pending KYC submissions. All caught up!</div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => {
              const isExpanded = expandedId === u._id;
              const addr = u.kycAddress;
              return (
                <div key={u._id} className="card p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-navy-900">{u.kycFullName || `${u.firstName} ${u.lastName}`}</p>
                      <p className="text-xs text-slate-400">{u.email} · Account {u.accountNumber}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {docLabels[u.kycDocumentType] || "No document type"} · Submitted{" "}
                        {u.kycSubmittedAt && new Date(u.kycSubmittedAt).toLocaleDateString("en-US")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : u._id)}
                        className="btn-secondary !py-2 !px-3 text-sm"
                      >
                        {isExpanded ? "Hide Details" : "View Full Submission"}
                      </button>
                      <button onClick={() => approve(u._id)} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-3 py-2 text-sm font-medium flex items-center gap-1.5">
                        <CheckCircle2 size={15} /> Approve
                      </button>
                      <button onClick={() => setRejectingId(rejectingId === u._id ? null : u._id)} className="bg-red-50 hover:bg-red-100 text-red-500 rounded-xl px-3 py-2 text-sm font-medium flex items-center gap-1.5">
                        <XCircle size={15} /> Reject
                      </button>
                    </div>
                  </div>

                  {rejectingId === u._id && (
                    <div className="mt-4 flex gap-2">
                      <input
                        placeholder="Reason for rejection"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="input-field flex-1"
                      />
                      <button onClick={() => reject(u._id)} className="btn-primary !bg-red-500 hover:!bg-red-600">Confirm</button>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t border-slate-100 space-y-6">
                      {/* Documents */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 flex items-center gap-1.5 mb-3">
                          <FileText size={13} /> Documents
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4 mb-3">
                          <Field label="Document Type" value={docLabels[u.kycDocumentType]} />
                          <Field label="Document Number" value={u.kycDocumentNumber} />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <ImageThumb label="Front of ID" url={u.kycFrontIdUrl} />
                          <ImageThumb label="Back of ID" url={u.kycBackIdUrl} />
                          <ImageThumb label="Selfie with ID" url={u.kycSelfieUrl} />
                        </div>
                      </div>

                      {/* Personal Info */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 flex items-center gap-1.5 mb-3">
                          <User size={13} /> Personal Info
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Field label="Full Name" value={u.kycFullName} />
                          <Field label="Date of Birth" value={u.kycDateOfBirth && new Date(u.kycDateOfBirth).toLocaleDateString("en-US")} />
                          <Field label="Nationality" value={u.kycNationality} />
                          <Field label="Gender" value={genderLabels[u.kycGender]} />
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 flex items-center gap-1.5 mb-3">
                          <MapPin size={13} /> Address
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Field label="Street" value={addr?.street} />
                          <Field label="City" value={addr?.city} />
                          <Field label="State" value={addr?.state} />
                          <Field label="ZIP Code" value={addr?.zip} />
                          <Field label="Country" value={addr?.country} />
                        </div>
                      </div>

                      {/* Employment */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 flex items-center gap-1.5 mb-3">
                          <Briefcase size={13} /> Employment
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Field label="Employment Status" value={employmentLabels[u.kycEmploymentStatus]} />
                          <Field label="Occupation" value={u.kycOccupation} />
                          <Field label="Employer" value={u.kycEmployerName} />
                          <Field label="Annual Income" value={u.kycAnnualIncome ? `$${u.kycAnnualIncome.toLocaleString()}` : null} />
                          <Field label="Source of Funds" value={u.kycSourceOfFunds} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminKycReview;