import { useEffect, useState } from "react";
import { CheckCheck, Wallet, ShieldAlert, Settings2, Bell, Trash2, X } from "lucide-react";
import api from "../api/axios";
import TopBar from "../components/TopBar";
import { useUserMenu } from "../components/DashboardLayout";

const iconForType = (type) => {
  switch (type) {
    case "transaction": return Wallet;
    case "security": return ShieldAlert;
    case "account": return Settings2;
    default: return Bell;
  }
};

const Notifications = () => {
  const { onMenuClick } = useUserMenu();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingDeleteAll, setConfirmingDeleteAll] = useState(false);

  const load = () => {
    api.get("/users/notifications").then((res) => setItems(res.data.notifications)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    await api.put("/users/notifications/read-all");
    load();
  };

  const markRead = async (id) => {
    await api.put(`/users/notifications/${id}/read`);
    load();
  };

  const deleteOne = async (id, e) => {
    e.stopPropagation();
    await api.delete(`/users/notifications/${id}`);
    load();
  };

  const deleteAll = async () => {
    await api.delete("/users/notifications");
    setConfirmingDeleteAll(false);
    load();
  };

  return (
    <div>
      <TopBar onMenuClick={onMenuClick} />

      <div className="px-4 md:px-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-navy-900">Notifications</h1>
          <p className="text-sm text-slate-400 mt-0.5">Alerts about your account and transactions.</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <button onClick={markAllRead} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCheck size={16} /> Mark all as read
          </button>
          {items.length > 0 && (
            <button
              onClick={() => setConfirmingDeleteAll(true)}
              className="btn-secondary !text-red-500 flex items-center gap-2 text-sm"
            >
              <Trash2 size={16} /> Delete all
            </button>
          )}
        </div>

        {confirmingDeleteAll && (
          <div className="card p-4 mb-5 flex items-center justify-between gap-3 border border-red-100">
            <p className="text-sm text-slate-600">Delete all notifications? This can't be undone.</p>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={deleteAll} className="btn-primary !bg-red-500 hover:!bg-red-600 !py-2 !px-3 text-sm">
                Delete All
              </button>
              <button onClick={() => setConfirmingDeleteAll(false)} className="text-slate-400 hover:text-navy transition">
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Loading notifications...</p>
        ) : items.length === 0 ? (
          <div className="card p-10 text-center text-slate-400 text-sm">No notifications yet.</div>
        ) : (
          <div className="space-y-2">
            {items.map((n) => {
              const Icon = iconForType(n.type);
              return (
                <div
                  key={n._id}
                  onClick={() => markRead(n._id)}
                  className={`w-full text-left card p-4 flex gap-3 items-start cursor-pointer ${!n.read ? "border-l-4 border-gold" : ""}`}
                >
                  <div className="h-9 w-9 rounded-xl bg-navy-50 text-navy flex items-center justify-center shrink-0">
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy-900">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString("en-US")}</p>
                  </div>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-gold shrink-0 mt-1.5" />}
                  <button
                    onClick={(e) => deleteOne(n._id, e)}
                    className="text-slate-300 hover:text-red-500 transition shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;