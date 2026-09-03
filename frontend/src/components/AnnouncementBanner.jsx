import { useEffect, useState } from "react";
import { Megaphone, AlertTriangle, X } from "lucide-react";
import api from "../api/axios";

const priorityConfig = {
  info: { icon: Megaphone, bg: "bg-blue-50 border-blue-100", iconBg: "bg-blue-100 text-blue-600" },
  warning: { icon: AlertTriangle, bg: "bg-gold-50 border-gold-100", iconBg: "bg-gold-100 text-gold-700" },
  critical: { icon: AlertTriangle, bg: "bg-red-50 border-red-100", iconBg: "bg-red-100 text-red-600" },
};

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState([]);

  const load = () => {
    api.get("/announcements/mine").then((res) => setAnnouncements(res.data.announcements)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const dismiss = async (id) => {
    setAnnouncements((a) => a.filter((x) => x._id !== id));
    await api.put(`/announcements/${id}/dismiss`);
  };

  if (announcements.length === 0) return null;

  return (
    <div className="space-y-3">
      {announcements.map((a) => {
        const config = priorityConfig[a.priority] || priorityConfig.info;
        const Icon = config.icon;
        return (
          <div key={a._id} className={`border rounded-2xl p-4 flex items-start gap-3 ${config.bg}`}>
            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${config.iconBg}`}>
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-navy-900">{a.title}</p>
              <p className="text-sm text-slate-500 mt-0.5">{a.message}</p>
            </div>
            <button onClick={() => dismiss(a._id)} className="text-slate-400 hover:text-navy transition shrink-0">
              <X size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default AnnouncementBanner;