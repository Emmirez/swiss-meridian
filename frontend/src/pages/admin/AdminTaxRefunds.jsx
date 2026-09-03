import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import api from "../../api/axios";
import TopBar from "../../components/TopBar";
import { useAdminMenu } from "../../components/AdminLayout";

const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount || 0);

const AdminTaxRefunds = () => {
  const { onMenuClick } = useAdminMenu();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState("");

  const load = () => {
    api.get("/admin/tax-refunds?status=pending").then((res) => setRefunds(res.data.refunds)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    await api.put(`/admin/tax-refunds/${id}/approve`);
    load();
  };

  const reject = async (id) => {
    await api.put(`/admin/tax-refunds/${id}/reject`, { reason });
    setRejectingId(null);
    setReason("");
    load();
  };

  return (
    <div>
      <TopBar notificationsHref="/admin/notifications" onMenuClick={onMenuClick} profileHref={null} />

      <div className="px-4 md:px-8 space-y-6 pb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-navy-900">Tax Refund Claims</h1>
          <p className="text-sm text-slate-400 mt-0.5">Review pending tax refund claims.</p>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading claims...</p>
        ) : refunds.length === 0 ? (
          <div className="card p-10 text-center text-slate-400 text-sm">No pending tax refund claims. All caught up!</div>
        ) : (
          <div className="space-y-3">
            {refunds.map((r) => (
              <div key={r._id} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-navy-900">{r.taxYear} Tax Refund — {formatMoney(r.amountClaimed, r.user?.currency)}</p>
                    <p className="text-xs text-slate-400">{r.user?.firstName} {r.user?.lastName} · {r.user?.email} · Account {r.user?.accountNumber}</p>
                    <p className="text-xs text-slate-400 mt-1">Submitted {new Date(r.appliedAt).toLocaleDateString("en-US")}</p>
                    <p className="text-sm text-slate-600 mt-2">"{r.reason}"</p>
                    {r.user?.kycStatus !== "approved" && (
                      <p className="text-xs text-red-500 font-medium mt-2">KYC not verified for this user</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => approve(r._id)} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-3 py-2 text-sm font-medium flex items-center gap-1.5">
                      <CheckCircle2 size={15} /> Approve
                    </button>
                    <button onClick={() => setRejectingId(rejectingId === r._id ? null : r._id)} className="bg-red-50 hover:bg-red-100 text-red-500 rounded-xl px-3 py-2 text-sm font-medium flex items-center gap-1.5">
                      <XCircle size={15} /> Reject
                    </button>
                  </div>
                </div>
                {rejectingId === r._id && (
                  <div className="mt-4 flex gap-2">
                    <input
                      placeholder="Reason for rejection (optional)"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="input-field flex-1"
                    />
                    <button onClick={() => reject(r._id)} className="btn-primary !bg-red-500 hover:!bg-red-600">Confirm Reject</button>
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

export default AdminTaxRefunds;