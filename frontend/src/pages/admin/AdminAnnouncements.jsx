import { useEffect, useState } from "react";
import { Plus, X, Send, Trash2, Pencil, Megaphone, Users, User as UserIcon } from "lucide-react";
import api from "../../api/axios";
import TopBar from "../../components/TopBar";
import CustomSelect from "../../components/CustomSelect";
import { useAdminMenu } from "../../components/AdminLayout";

const priorityOptions = [
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "critical", label: "Critical" },
];

const priorityColor = {
  info: "bg-blue-50 text-blue-600",
  warning: "bg-gold-50 text-gold-700",
  critical: "bg-red-50 text-red-500",
};

const AdminAnnouncements = () => {
  const { onMenuClick } = useAdminMenu();
  const [announcements, setAnnouncements] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: "", message: "", targetType: "all", targetUserId: "", priority: "info" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api.get("/admin/announcements").then((res) => setAnnouncements(res.data.announcements)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api.get("/admin/users?limit=200").then((res) => setUsers(res.data.users));
  }, []);

  const userOptions = users.map((u) => ({ value: u._id, label: `${u.firstName} ${u.lastName} (${u.email})` }));

  const resetForm = () => {
    setForm({ title: "", message: "", targetType: "all", targetUserId: "", priority: "info" });
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const startEdit = (a) => {
    setForm({
      title: a.title,
      message: a.message,
      targetType: a.targetType,
      targetUserId: a.targetUser?._id || "",
      priority: a.priority,
    });
    setEditingId(a._id);
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.message) return setError("Title and message are required");
    if (form.targetType === "specific" && !form.targetUserId) return setError("Please select a user");
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/admin/announcements/${editingId}`, {
          title: form.title,
          message: form.message,
          priority: form.priority,
        });
      } else {
        await api.post("/admin/announcements", form);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save announcement");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    await api.delete(`/admin/announcements/${id}`);
    load();
  };

  return (
    <div>
      <TopBar notificationsHref="/admin/notifications" onMenuClick={onMenuClick} profileHref={null} />

      <div className="px-4 md:px-8 space-y-6 pb-6 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-navy-900">Announcements</h1>
            <p className="text-sm text-slate-400 mt-0.5">Broadcast a message to all users, or target one specifically.</p>
          </div>
          <button onClick={() => (showForm ? resetForm() : setShowForm(true))} className="btn-primary flex items-center gap-2 !py-2.5 shrink-0">
            {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Cancel" : "New Announcement"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={submit} className="card p-5 space-y-3 max-w-xl">
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}

            <input
              required
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="input-field"
            />

            {!editingId && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, targetType: "all" }))}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium ${form.targetType === "all" ? "bg-navy text-white" : "bg-slate-100 text-slate-500"}`}
                >
                  <Users size={14} /> All Users
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, targetType: "specific" }))}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium ${form.targetType === "specific" ? "bg-navy text-white" : "bg-slate-100 text-slate-500"}`}
                >
                  <UserIcon size={14} /> Specific User
                </button>
              </div>
            )}

            {!editingId && form.targetType === "specific" && (
              <CustomSelect
                value={form.targetUserId}
                onChange={(v) => setForm((f) => ({ ...f, targetUserId: v }))}
                options={userOptions}
                placeholder="Select a user"
              />
            )}

            <CustomSelect
              value={form.priority}
              onChange={(v) => setForm((f) => ({ ...f, priority: v }))}
              options={priorityOptions}
              placeholder="Priority"
            />

            <textarea
              required
              rows={4}
              placeholder="Message"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className="input-field resize-none"
            />

            <button type="submit" disabled={submitting} className="btn-gold w-full flex items-center justify-center gap-2">
              <Send size={16} /> {submitting ? "Saving..." : editingId ? "Save Changes" : "Send Announcement"}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <div className="card p-10 text-center text-slate-400 text-sm">
            <Megaphone size={28} className="mx-auto mb-3 text-slate-300" />
            No announcements yet.
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a._id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-navy-900">{a.title}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${priorityColor[a.priority]}`}>
                        {a.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {a.targetType === "all" ? "All users" : `${a.targetUser?.firstName} ${a.targetUser?.lastName}`} · by {a.createdBy?.firstName} · {new Date(a.createdAt).toLocaleDateString("en-US")}
                    </p>
                    <p className="text-sm text-slate-600 mt-2">{a.message}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => startEdit(a)} className="text-navy hover:text-gold-700 transition">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => remove(a._id)} className="text-slate-300 hover:text-red-500 transition">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnnouncements;