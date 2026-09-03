import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import api from "../../api/axios";
import TopBar from "../../components/TopBar";
import { useAdminMenu } from "../../components/AdminLayout";

const AdminCardRequests = () => {
  const { onMenuClick } = useAdminMenu();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState("");

  const load = () => {
    api
      .get("/admin/cards?status=pending")
      .then((res) => setCards(res.data.cards))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    await api.put(`/admin/cards/${id}/approve`);
    load();
  };

  const reject = async (id) => {
    await api.put(`/admin/cards/${id}/reject`, { reason });
    setRejectingId(null);
    setReason("");
    load();
  };

  return (
    <div>
      <TopBar
        notificationsHref="/admin/notifications"
        onMenuClick={onMenuClick}
        profileHref={null}
      />

      <div className="px-4 md:px-8 space-y-6 pb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-navy-900">
            Card Requests
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Review and approve debit card requests.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading requests...</p>
        ) : cards.length === 0 ? (
          <div className="card p-10 text-center text-slate-400 text-sm">
            No pending card requests. All caught up!
          </div>
        ) : (
          <div className="space-y-3">
            {cards.map((c) => (
              <div key={c._id} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-navy-900">
                      {c.user?.firstName} {c.user?.lastName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {c.user?.email} · Account {c.user?.accountNumber}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 capitalize">
                      {c.network} card ·{" "}
                      {c.user?.accountType?.replace("_", " ")} ·{" "}
                      {c.user?.currency} · Requested{" "}
                      {new Date(c.requestedAt).toLocaleDateString("en-US")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => approve(c._id)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-3 py-2 text-sm font-medium flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={15} /> Approve
                    </button>
                    <button
                      onClick={() =>
                        setRejectingId(rejectingId === c._id ? null : c._id)
                      }
                      className="bg-red-50 hover:bg-red-100 text-red-500 rounded-xl px-3 py-2 text-sm font-medium flex items-center gap-1.5"
                    >
                      <XCircle size={15} /> Reject
                    </button>
                  </div>
                </div>
                {rejectingId === c._id && (
                  <div className="mt-4 flex gap-2">
                    <input
                      placeholder="Reason for rejection (optional)"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="input-field flex-1"
                    />
                    <button
                      onClick={() => reject(c._id)}
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

export default AdminCardRequests;
