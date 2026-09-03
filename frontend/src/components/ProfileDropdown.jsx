import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  ShieldCheck,
  LifeBuoy,
  LayoutDashboard,
  Bell,
  FileClock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ProfileDropdown = ({ profileHref }) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = (user?.firstName?.[0] || "U") + (user?.lastName?.[0] || "");

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 p-1 pr-2 rounded-full bg-white shadow-soft hover:shadow-card transition"
      >
        <div className="h-8 w-8 rounded-full bg-navy-100 flex items-center justify-center text-navy font-semibold text-xs overflow-hidden shrink-0">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

     {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-card border border-slate-100 py-2 z-40">
          <div className="px-4 py-2.5 border-b border-slate-50">
            <p className="text-sm font-semibold text-navy-900 truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>

          {profileHref ? (
            <>
              <Link
                to={profileHref}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-navy-50 hover:text-navy transition-colors"
              >
                <User size={16} /> My Profile
              </Link>
              <Link
                to="/dashboard/kyc"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-navy-50 hover:text-navy transition-colors"
              >
                <ShieldCheck size={16} /> KYC Verification
              </Link>
              <Link
                to="/dashboard/support"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-navy-50 hover:text-navy transition-colors"
              >
                <LifeBuoy size={16} /> Help & Support
              </Link>
              <Link
                to="/dashboard/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-navy-50 hover:text-navy transition-colors"
              >
                <Settings size={16} /> Settings
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-navy-50 hover:text-navy transition-colors"
              >
                <LayoutDashboard size={16} /> Admin Overview
              </Link>
              <Link
                to="/admin/notifications"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-navy-50 hover:text-navy transition-colors"
              >
                <Bell size={16} /> Notifications
              </Link>
              <Link
                to="/admin/audit-logs"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-navy-50 hover:text-navy transition-colors"
              >
                <FileClock size={16} /> Audit Logs
              </Link>
            </>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
