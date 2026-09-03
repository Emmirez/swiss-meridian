import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Briefcase } from "lucide-react";
import api from "../../api/axios";
import TopBar from "../../components/TopBar";
import { useAdminMenu } from "../../components/AdminLayout";

const employmentLabels = {
  employed: "Employed",
  self_employed: "Self-Employed",
  unemployed: "Unemployed",
  student: "Student",
  retired: "Retired",
};

const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount || 0);

const AdminGrants = () => {
  const { onMenuClick } = useAdminMenu();
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState("");

  const load = () => {
    api.get("/admin/grants?status=pending").then((res) => setGrants(res.data.grants)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    await api.put(`/admin/grants/${id}/approve`);
    load();
  };

  const reject = async (id) => {
    await api.put(`/admin/grants/${id}/reject`, { reason });
    setRejectingId(null);
    setReason("");
    load();
  };

  return (
    <div>
      <TopBar notificationsHref="/admin/notifications" onMenuClick={onMenuClick} profileHref={null} />

      <div className="px-4 md:px-8 space-y-6 pb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-navy-900">Grant Applications</h1>
          <p className="text-sm text-slate-400 mt-0.5">Review pending grant requests.</p>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading applications...</p>
        ) : grants.length === 0 ? (
          <div className="card p-10 text-center text-slate-400 text-sm">No pending grant applications. All caught up!</div>
        ) : (
          <div className="space-y-3">
            {grants.map((grant) => (
              <div key={grant._id} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-navy-900">{grant.category} Grant — {formatMoney(grant.amountRequested, grant.user?.currency)}</p>
                    <p className="text-xs text-slate-400">{grant.user?.firstName} {grant.user?.lastName} · {grant.user?.email} · Account {grant.user?.accountNumber}</p>
                    <p className="text-xs text-slate-400 mt-1">Applied {new Date(grant.appliedAt).toLocaleDateString("en-US")}</p>
                    <p className="text-sm text-slate-600 mt-2">"{grant.proposal}"</p>

                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2 w-fit flex-wrap">
                      <Briefcase size={13} />
                      {employmentLabels[grant.user?.kycEmploymentStatus] || "No KYC employment data"}
                      {grant.user?.kycOccupation && ` · ${grant.user.kycOccupation}`}
                      {grant.user?.kycAnnualIncome && ` · ${formatMoney(grant.user.kycAnnualIncome, grant.user?.currency)}/yr`}
                      {grant.user?.kycStatus !== "approved" && (
                        <span className="text-red-500 font-medium ml-1">· KYC not verified</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => approve(grant._id)} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-3 py-2 text-sm font-medium flex items-center gap-1.5">
                      <CheckCircle2 size={15} /> Approve
                    </button>
                    <button onClick={() => setRejectingId(rejectingId === grant._id ? null : grant._id)} className="bg-red-50 hover:bg-red-100 text-red-500 rounded-xl px-3 py-2 text-sm font-medium flex items-center gap-1.5">
                      <XCircle size={15} /> Reject
                    </button>
                  </div>
                </div>
                {rejectingId === grant._id && (
                  <div className="mt-4 flex gap-2">
                    <input
                      placeholder="Reason for rejection (optional)"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="input-field flex-1"
                    />
                    <button onClick={() => reject(grant._id)} className="btn-primary !bg-red-500 hover:!bg-red-600">Confirm Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGrants;