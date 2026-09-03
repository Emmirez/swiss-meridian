import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  X,
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Receipt,
  FileClock,
  LogOut,
  ShieldCheck,
  LifeBuoy,
  CreditCard,
  Landmark,
  Gift,
  FileSpreadsheet,
  Bell,
  Megaphone,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const AdminMenuDrawer = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (open) {
      api
        .get("/admin/stats")
        .then((res) => setStats(res.data))
        .catch(() => {});
    }
  }, [open]);

  const go = (path) => {
    onClose();
    navigate(path);
  };

  const sections = [
    {
      label: "Overview",
      items: [
        {
          icon: LayoutDashboard,
          label: "Dashboard",
          path: "/admin",
          end: true,
        },
      ],
    },
    {
      label: "Management",
      items: [
        { icon: Users, label: "All Users", path: "/admin/users" },
        {
          icon: ClipboardCheck,
          label: "Approvals",
          path: "/admin/approvals",
          badge: stats?.pendingApprovals,
          badgeColor: "bg-gold-500",
        },
        { icon: ShieldCheck, label: "KYC Review", path: "/admin/kyc" },
      ],
    },
    {
      label: "Requests",
      items: [
        { icon: CreditCard, label: "Card Requests", path: "/admin/cards" },
        { icon: Landmark, label: "Loan Applications", path: "/admin/loans" },
        { icon: Gift, label: "Grant Applications", path: "/admin/grants" },
        {
          icon: FileSpreadsheet,
          label: "Tax Refunds",
          path: "/admin/tax-refunds",
        },
      ],
    },
    {
      label: "Support",
      items: [
        { icon: LifeBuoy, label: "Support Tickets", path: "/admin/tickets" },
      ],
    },
    {
      label: "Records",
      items: [
        {
          icon: Receipt,
          label: "Transactions",
          path: "/admin/transactions",
          badge: stats?.totalTransactions,
        },
        { icon: FileClock, label: "Audit Logs", path: "/admin/audit-logs" },
         { icon: Bell, label: "Notifications", path: "/admin/notifications" },
         { icon: Megaphone, label: "Announcements", path: "/admin/announcements" },
      ],
    },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-navy-900/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 max-w-[75vw] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Menu
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-navy transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-2 mb-2">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map(
                  ({ icon: Icon, label, path, badge, badgeColor, end }) => {
                    const isActive = end
                      ? location.pathname === path
                      : location.pathname.startsWith(path);
                    return (
                      <button
                        key={path}
                        onClick={() => go(path)}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-navy text-white"
                            : "text-slate-600 hover:bg-navy-50"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon size={18} /> {label}
                        </span>
                        {badge !== undefined && badge !== null && badge > 0 && (
                          <span
                            className={`text-xs font-semibold text-white rounded-full px-2 py-0.5 ${badgeColor || "bg-navy-400"}`}
                          >
                            {badge}
                          </span>
                        )}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Profile + Logout footer */}
        <div className="border-t border-slate-100 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-navy-100 flex items-center justify-center text-navy font-semibold text-sm overflow-hidden shrink-0">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              (user?.firstName?.[0] || "A") + (user?.lastName?.[0] || "")
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-navy-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-400 truncate">Administrator</p>
          </div>
          <button
            onClick={logout}
            className="text-slate-400 hover:text-red-500 transition-colors"
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminMenuDrawer;
