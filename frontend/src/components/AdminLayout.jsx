import { useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Receipt,
  FileClock,
  ShieldCheck,
  LifeBuoy,
  CreditCard,
  Landmark,
  Gift,
  FileSpreadsheet,
  Bell,
  Megaphone,
} from "lucide-react";
import Sidebar from "./Sidebar";
import AdminBottomNav from "./AdminBottomNav";
import AdminMenuDrawer from "./AdminMenuDrawer";

const items = [
  { to: "/admin", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/admin/users", icon: Users, label: "All Users" },
  { to: "/admin/approvals", icon: ClipboardCheck, label: "Approvals" },
  { to: "/admin/kyc", icon: ShieldCheck, label: "KYC Review" },
  { to: "/admin/tickets", icon: LifeBuoy, label: "Support Tickets" },
  { to: "/admin/cards", icon: CreditCard, label: "Card Requests" },
  { to: "/admin/loans", icon: Landmark, label: "Loan Applications" },
  { to: "/admin/grants", icon: Gift, label: "Grant Applications" },
  { to: "/admin/tax-refunds", icon: FileSpreadsheet, label: "Tax Refunds" },
  { to: "/admin/transactions", icon: Receipt, label: "Transactions" },
  { to: "/admin/audit-logs", icon: FileClock, label: "Audit Logs" },
  { to: "/admin/notifications", icon: Bell, label: "Notifications" },
  { to: "/admin/announcements", icon: Megaphone, label: "Announcements" },
];

const AdminLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar items={items} />
      <main className="flex-1 pb-24 md:pb-8 min-w-0">
        <Outlet context={{ onMenuClick: () => setDrawerOpen(true) }} />
      </main>
      <AdminBottomNav />
      <AdminMenuDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
};

export default AdminLayout;

export const useAdminMenu = () => useOutletContext();
