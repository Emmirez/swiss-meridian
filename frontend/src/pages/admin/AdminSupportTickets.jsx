import { useEffect, useState } from "react";
import { Send, ArrowLeft, Clock3, CheckCircle2, RotateCcw } from "lucide-react";
import api from "../../api/axios";
import TopBar from "../../components/TopBar";
import CustomSelect from "../../components/CustomSelect";
import { useAdminMenu } from "../../components/AdminLayout";

const statusFilterOptions = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "", label: "All Tickets" },
];

const statusConfig = {
  open: { label: "Open", color: "bg-emerald-50 text-emerald-600", icon: Clock3 },
  closed: { label: "Closed", color: "bg-slate-100 text-slate-500", icon: CheckCircle2 },
};

const AdminSupportTickets = () => {
  const { onMenuClick } = useAdminMenu();
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("open");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");

  const loadTickets = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    api.get(`/admin/tickets?${params}`).then((res) => setTickets(res.data.tickets)).finally(() => setLoading(false));
  };

  useEffect(() => { loadTickets(); }, [statusFilter]);

  const openTicket = async (id) => {
    const { data } = await api.get(`/admin/tickets/${id}`);
    setSelected(data.ticket);
  };

  const sendReply = async () => {
    if (!reply.trim()) return;
    const { data } = await api.post(`/admin/tickets/${selected._id}/reply`, { message: reply });
    setSelected(data.ticket);
    setReply("");
    loadTickets();
  };

  const toggleStatus = async () => {
    const endpoint = selected.status === "open" ? "close" : "reopen";
    const { data } = await api.put(`/admin/tickets/${selected._id}/${endpoint}`);
    setSelected(data.ticket);
    loadTickets();
  };

  if (selected) {
    const config = statusConfig[selected.status];
    const StatusIcon = config.icon;
    return (
      <div>
        <TopBar notificationsHref="/admin/notifications" onMenuClick={onMenuClick} profileHref={null} />
        <div className="px-4 md:px-8 max-w-2xl">
          <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
            <ArrowLeft size={16} /> Back to tickets
          </button>

          <div className="card p-5 mb-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-navy-900">{selected.subject}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selected.user?.firstName} {selected.user?.lastName} · {selected.user?.email} · {selected.category} · Priority: {selected.priority}
                </p>
              </div>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${config.color}`}>
                <StatusIcon size={12} /> {config.label}
              </span>
            </div>
            <button onClick={toggleStatus} className="btn-secondary !py-2 !px-3 text-sm flex items-center gap-1.5 mt-3">
              <RotateCcw size={14} /> {selected.status === "open" ? "Close Ticket" : "Reopen Ticket"}
            </button>
          </div>

          <div className="space-y-3 mb-4">
            {selected.messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.sender === "admin" ? "bg-navy text-white" : "bg-white border border-slate-100 text-slate-700"}`}>
                  <p>{m.text}</p>
                  <p className={`text-[10px] mt-1 ${m.sender === "admin" ? "text-slate-300" : "text-slate-400"}`}>
                    {m.sender === "admin" ? "You (Support)" : `${selected.user?.firstName}`} · {new Date(m.createdAt).toLocaleString("en-US")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              placeholder="Type a reply..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendReply()}
              className="input-field flex-1"
            />
            <button onClick={sendReply} className="btn-primary !px-4">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar notificationsHref="/admin" onMenuClick={onMenuClick} profileHref={null} />
      <div className="px-4 md:px-8 space-y-6 pb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-navy-900">Support Tickets</h1>
          <p className="text-sm text-slate-400 mt-0.5">Respond to account holder support requests.</p>
        </div>

        <div className="max-w-xs">
          <CustomSelect value={statusFilter} onChange={setStatusFilter} options={statusFilterOptions} placeholder="Filter by status" />
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <div className="card p-10 text-center text-slate-400 text-sm">No tickets found.</div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => {
              const config = statusConfig[t.status];
              const StatusIcon = config.icon;
              return (
                <button
                  key={t._id}
                  onClick={() => openTicket(t._id)}
                  className="w-full card p-4 flex items-center justify-between gap-3 text-left hover:-translate-y-0.5 hover:shadow-card transition-all"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-navy-900 text-sm truncate">{t.subject}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {t.user?.firstName} {t.user?.lastName} · {t.category} · Updated {new Date(t.updatedAt).toLocaleDateString("en-US")}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${config.color}`}>
                    <StatusIcon size={12} /> {config.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSupportTickets;