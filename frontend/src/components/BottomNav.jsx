import { NavLink } from "react-router-dom";
import { Home, ArrowLeftRight, CreditCard, Receipt, User } from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/dashboard/transfer", icon: ArrowLeftRight, label: "Transfer" },
  { to: "/dashboard/cards", icon: CreditCard, label: "Cards" },
  { to: "/dashboard/transactions", icon: Receipt, label: "History" },
  { to: "/dashboard/profile", icon: User, label: "Profile" },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 shadow-[0_-4px_20px_-8px_rgba(11,37,69,0.15)] md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-colors ${
                isActive ? "text-navy" : "text-slate-400"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl ${isActive ? "bg-navy-50" : ""}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
                </div>
                <span className="text-[11px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
