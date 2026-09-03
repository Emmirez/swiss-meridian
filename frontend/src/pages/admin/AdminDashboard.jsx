import { useEffect, useState } from "react";
import {
  Users,
  Clock3,
  UserCheck,
  ShieldAlert,
  Receipt,
  DollarSign,
} from "lucide-react";
import api from "../../api/axios";
import TopBar from "../../components/TopBar";
import { useAdminMenu } from "../../components/AdminLayout";

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="card p-5 flex items-center gap-4">
    <div
      className={`h-11 w-11 rounded-2xl flex items-center justify-center ${accent}`}
    >
      <Icon size={20} />
    </div>
    <div>
      <p className="text-2xl font-bold text-navy-900">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const { onMenuClick } = useAdminMenu();

  useEffect(() => {
    api.get("/admin/stats").then((res) => setStats(res.data));
  }, []);

  return (
    <div>
      <TopBar
        notificationsHref="/admin/notifications"
        onMenuClick={onMenuClick}
        profileHref={null}
      />

      <div className="px-4 md:px-8 space-y-6 pb-6">
       

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats?.totalUsers ?? "—"}
            accent="bg-navy-50 text-navy"
          />
          <StatCard
            icon={Clock3}
            label="Pending Approvals"
            value={stats?.pendingApprovals ?? "—"}
            accent="bg-gold-50 text-gold-700"
          />
          <StatCard
            icon={UserCheck}
            label="Active Accounts"
            value={stats?.activeUsers ?? "—"}
            accent="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            icon={ShieldAlert}
            label="Suspended / Frozen"
            value={stats?.suspendedUsers ?? "—"}
            accent="bg-red-50 text-red-500"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="card p-5">
            <h3 className="font-semibold text-navy-900 flex items-center gap-2 mb-4">
              <Receipt size={17} /> Total Transactions
            </h3>
            <p className="text-3xl font-bold text-navy">
              {stats?.totalTransactions ?? "—"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Across all users, all time
            </p>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-navy-900 flex items-center gap-2 mb-4">
              <DollarSign size={17} /> Transaction Volume
            </h3>
            {stats?.totalVolumeByCurrency?.length ? (
              <div className="space-y-2">
                {stats.totalVolumeByCurrency.map((v) => (
                  <div key={v._id} className="flex justify-between text-sm">
                    <span className="text-slate-500">{v._id}</span>
                    <span className="font-semibold text-navy-900">
                      {v.total.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                No transaction volume yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
