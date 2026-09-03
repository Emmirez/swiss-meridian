import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ items, footerNote }) => {
  const { user, logout } = useAuth();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 lg:w-72 h-screen sticky top-0 bg-white border-r border-slate-100 px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <img
          src="/logo.png"
          alt="Swiss Meridian Bank"
          className="h-9 w-auto"
          onError={(e) => (e.target.style.display = "none")}
        />
        <span className="font-display font-bold text-lg text-navy leading-tight">
          Swiss Meridian
          <br className="hidden" /> Bank
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {items.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-navy text-white shadow-soft"
                  : "text-slate-500 hover:bg-navy-50 hover:text-navy"
              }`
            }
          >
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
      </nav>

      {footerNote}

      <div className="mt-4 flex items-center gap-3 px-2 pt-4 border-t border-slate-100">
        <div className="h-9 w-9 rounded-full bg-navy-100 flex items-center justify-center text-navy font-semibold text-sm overflow-hidden">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            (user?.firstName?.[0] || "U") + (user?.lastName?.[0] || "")
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-navy truncate">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-slate-400 truncate">
            {user?.role === "admin" ? "Administrator" : "Swiss Meridian Member"}
          </p>
        </div>
        <button
          onClick={logout}
          className="text-slate-400 hover:text-red-500 transition-colors"
          title="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
