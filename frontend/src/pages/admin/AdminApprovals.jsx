import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, XCircle, Eye } from "lucide-react";
import api from "../../api/axios";
import TopBar from "../../components/TopBar";
import { useAdminMenu } from "../../components/AdminLayout";

const AdminApprovals = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState("");
  const { onMenuClick } = useAdminMenu();

  const load = () => {
    api
      .get("/admin/users?status=pending&limit=50")
      .then((res) => setUsers(res.data.users))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    await api.put(`/admin/users/${id}/approve`);
    load();
  };

  const reject = async (id) => {
    await api.put(`/admin/users/${id}/reject`, { reason });
    setRejectingId(null);
    setReason("");
    load();
  };

  return (
    <div>
      <TopBar
        title="Pending Approvals"
        subtitle="Review and approve new account applications."
        notificationsHref="/admin/notifications"
        onMenuClick={onMenuClick}
      />

      <div className="px-4 md:px-8">
        {loading ? (
          <p className="text-sm text-slate-400">Loading applications...</p>
        ) : users.length === 0 ? (
          <div className="card p-10 text-center text-slate-400 text-sm">
            No pending applications. All caught up!
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u._id} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-navy-900">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {u.email} · {u.phone}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 capitalize">
                      {u.accountType?.replace("_", " ")} · {u.currency} ·
                      Account {u.accountNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/admin/users/${u._id}`}
                      className="btn-secondary !py-2 !px-3 flex items-center gap-1.5 text-sm"
                    >
                      <Eye size={15} /> View
                    </Link>
                    <button
                      onClick={() => approve(u._id)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-3 py-2 text-sm font-medium flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={15} /> Approve
                    </button>
                    <button
                      onClick={() =>
                        setRejectingId(rejectingId === u._id ? null : u._id)
                      }
                      className="bg-red-50 hover:bg-red-100 text-red-500 rounded-xl px-3 py-2 text-sm font-medium flex items-center gap-1.5"
                    >
                      <XCircle size={15} /> Reject
                    </button>
                  </div>
                </div>
                {rejectingId === u._id && (
                  <div className="mt-4 flex gap-2">
                    <input
                      placeholder="Reason for rejection (optional)"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="input-field flex-1"
                    />
                    <button
                      onClick={() => reject(u._id)}
                      className="btn-primary !bg-red-500 hover:!bg-red-600"
                    >
                      Confirm Reject
                    </button>
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

export default AdminApprovals;
