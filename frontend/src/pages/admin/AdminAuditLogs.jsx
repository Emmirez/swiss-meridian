import { useEffect, useState } from "react";
import api from "../../api/axios";
import TopBar from "../../components/TopBar";
import { useAdminMenu } from "../../components/AdminLayout";

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { onMenuClick } = useAdminMenu();

  useEffect(() => {
    api
      .get("/admin/audit-logs")
      .then((res) => setLogs(res.data.logs))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <TopBar
        title="Audit Logs"
        subtitle="Every administrative action, tracked."
       notificationsHref="/admin/notifications"
        onMenuClick={onMenuClick}
      />

      <div className="px-4 md:px-8">
        <div className="card overflow-hidden">
          {loading ? (
            <p className="text-sm text-slate-400 p-8 text-center">
              Loading logs...
            </p>
          ) : logs.length === 0 ? (
            <p className="text-sm text-slate-400 p-8 text-center">
              No admin actions recorded yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-50">
              {logs.map((log) => (
                <div key={log._id} className="px-4 md:px-6 py-4">
                  <p className="text-sm font-medium text-navy-900 capitalize">
                    {log.action.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    By {log.admin?.firstName} {log.admin?.lastName}
                    {log.targetUser &&
                      ` · Target: ${log.targetUser.firstName} ${log.targetUser.lastName}`}
                    {" · "}
                    {new Date(log.createdAt).toLocaleString("en-US")}
                  </p>
                  {log.details && (
                    <p className="text-xs text-slate-500 mt-1">{log.details}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogs;
