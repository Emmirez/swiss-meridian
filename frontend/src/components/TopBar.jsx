import { Bell, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import ProfileDropdown from "./ProfileDropdown";

const TopBar = ({
  notificationsHref = "/dashboard/notifications",
  onMenuClick,
  profileHref = "/dashboard/profile",
}) => {
  const { liveNotifications } = useSocket() || {};

  return (
    <header className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 bg-slate-50 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 rounded-full hover:bg-white transition"
          >
            <Menu size={20} className="text-navy" />
          </button>
        )}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Swiss Meridian Bank"
            className="h-8 w-auto"
            onError={(e) => (e.target.style.display = "none")}
          />
          <span className="font-display font-bold text-base tracking-tight leading-none hidden sm:inline">
            <span className="text-navy-900">Swiss</span>{" "}
            <span className="text-gold-600"> Meridian Bank</span>
          </span>
        </Link>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <Link
          to={notificationsHref}
          className="relative p-2.5 rounded-full bg-white shadow-soft hover:shadow-card transition"
        >
          <Bell size={19} className="text-navy" />
          {liveNotifications?.length > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gold" />
          )}
        </Link>
        <ProfileDropdown profileHref={profileHref} />
      </div>
    </header>
  );
};

export default TopBar;
