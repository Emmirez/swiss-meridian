import { useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import { Home, ArrowLeftRight, CreditCard, Receipt, User, Bell, Landmark } from "lucide-react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import UserMenuDrawer from "./UserMenuDrawer";

const items = [
  { to: "/dashboard", icon: Home, label: "Dashboard", end: true },
  { to: "/dashboard/transfer", icon: ArrowLeftRight, label: "Transfers" },
  { to: "/dashboard/cards", icon: CreditCard, label: "Cards" },
  { to: "/dashboard/transactions", icon: Receipt, label: "Transactions" },
  { to: "/dashboard/beneficiaries", icon: Landmark, label: "Beneficiaries" },
  { to: "/dashboard/notifications", icon: Bell, label: "Notifications" },
  { to: "/dashboard/profile", icon: User, label: "Profile" },
];

const DashboardLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar items={items} />
      <main className="flex-1 pb-24 md:pb-8 min-w-0">
        <Outlet context={{ onMenuClick: () => setDrawerOpen(true) }} />
      </main>
      <BottomNav />
      <UserMenuDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
};

export default DashboardLayout;

export const useUserMenu = () => useOutletContext();