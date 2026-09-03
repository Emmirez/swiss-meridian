import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, ClipboardCheck, Receipt, FileClock } from "lucide-react";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Overview" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/approvals", icon: ClipboardCheck, label: "Approvals" },
  { to: "/admin/transactions", icon: Receipt, label: "Transactions" },
  { to: "/admin/audit-logs", icon: FileClock, label: "Logs" },
];

const AdminBottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 shadow-[0_-4px_20px_-8px_rgba(11,37,69,0.15)] md:hidden">
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-2 py-1.5 rounded-2xl transition-colors ${
                isActive ? "text-navy" : "text-slate-400"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl ${isActive ? "bg-navy-50" : ""}`}>
                  <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default AdminBottomNav;
