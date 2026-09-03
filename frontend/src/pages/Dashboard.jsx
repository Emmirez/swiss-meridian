import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Eye,
  EyeOff,
  Plus,
  ArrowLeftRight,
  ArrowDownRight,
  ArrowUpRight,
  Receipt,
  Send,
  HandCoins,
  ScanLine,
  ChevronRight,
  FileText,
} from "lucide-react";
import api from "../api/axios";
import TopBar from "../components/TopBar";
import SendMoney from "../components/SendMoney";
import AccountLimitsCard from "../components/AccountLimitsCard";
import FinancialServices from "../components/FinancialServices";
import StaySecureTip from "../components/StaySecureTip";
import KycReminderBanner from "../components/KycReminderBanner";
import AnnouncementBanner from "../components/AnnouncementBanner";
import { useAuth } from "../context/AuthContext";
import { useUserMenu } from "../components/DashboardLayout";

const CATEGORY_COLORS = [
  "#0B2545",
  "#C9A227",
  "#2C5A9C",
  "#E6C154",
  "#6E97CE",
  "#7D6216",
];

const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount || 0,
  );

const greetingByTime = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const Dashboard = () => {
  const { user } = useAuth();
  const { onMenuClick } = useUserMenu();
  const [data, setData] = useState(null);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    api
      .get("/users/dashboard")
      .then((res) => {
        setData(res.data);
        setLastUpdated(new Date());
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <TopBar onMenuClick={onMenuClick} />
        <div className="p-8 text-slate-400 text-sm">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  const currency = data?.user?.currency || "USD";
  const balance = data?.user?.balance ?? 0;

  return (
    <div>
      <TopBar onMenuClick={onMenuClick} />

      <div className="px-4 md:px-8 space-y-6 min-w-0">
        <AnnouncementBanner />
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-navy-900">
            {greetingByTime()}, {user?.firstName || ""}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Here's what's happening with your account today.
          </p>
        </div>

        {/* Balance + card */}
        <div className="grid md:grid-cols-3 gap-5">
          <div className="md:col-span-1 rounded-xl3 bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-white shadow-card relative overflow-hidden">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gold/10" />
            <div className="flex items-center justify-between relative">
              <p className="text-slate-300 text-sm">Total Balance</p>
              <button
                onClick={() => setShowBalance((s) => !s)}
                className="text-slate-300"
              >
                {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
            <p
              className="text-2xl md:text-3xl font-bold mt-2 relative truncate"
              title={showBalance ? formatMoney(balance, currency) : undefined}
            >
              {showBalance ? formatMoney(balance, currency) : "•••••••"}
            </p>
            <p className="text-xs text-gold-300 mt-1 relative capitalize">
              {data?.user?.isJoint ? "Joint " : ""}
              {data?.user?.accountType?.replace("_", " ") || "account"} ·{" "}
              {currency}
            </p>
            {lastUpdated && (
              <p className="text-[11px] text-slate-400 mt-1 relative">
                Last updated{" "}
                {lastUpdated.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
            <div className="flex gap-2 mt-6 relative">
              <Link
                to="/dashboard/transfer"
                className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/10 rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 transition"
              >
                <ArrowLeftRight size={15} /> Transfer
              </Link>
              <Link
                to="/dashboard/notifications"
                className="flex-1 bg-gold text-navy-900 rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5"
              >
                <Plus size={15} /> Activity
              </Link>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {[
              { icon: Send, label: "Send", to: "/dashboard/transfer" },
              {
                icon: HandCoins,
                label: "Request",
                to: "/dashboard/requests",
              },
              { icon: FileText, label: "Bill Pay", to: "/dashboard/bills" },
              {
                icon: Receipt,
                label: "History",
                to: "/dashboard/transactions",
              },
              { icon: ScanLine, label: "Cards", to: "/dashboard/cards" },
            ].map(({ icon: Icon, label, to }) => (
              <Link
                key={label}
                to={to}
                className="card p-4 flex flex-col items-center gap-2 hover:-translate-y-0.5 hover:shadow-card transition-all"
              >
                <div className="h-10 w-10 rounded-xl bg-navy-50 text-navy flex items-center justify-center">
                  <Icon size={18} />
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {label}
                </span>
              </Link>
            ))}
          </div>

          <AccountLimitsCard currency={currency} />

          {/* Virtual card */}
          <Link
            to="/dashboard/cards"
            className="block rounded-xl3 bg-gradient-to-br from-navy-600 to-navy-800 p-6 text-white shadow-card relative overflow-hidden flex flex-col justify-between min-h-[220px] hover:opacity-95 transition-opacity"
          >
            {/* Card brand badge */}
            <div className="absolute right-6 top-6 flex items-center gap-3">
              <svg
                viewBox="0 0 48 30"
                className="h-8 w-auto"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="48" height="30" rx="4" fill="#1A1F71" />
                <circle cx="31" cy="15" r="11" fill="#FF5F00" />
                <circle cx="17" cy="15" r="11" fill="#EB001B" />
                <path
                  d="M24 6.5C21.8 8.4 20.3 11.4 20.3 15C20.3 18.6 21.8 21.6 24 23.5C26.2 21.6 27.7 18.6 27.7 15C27.7 11.4 26.2 8.4 24 6.5Z"
                  fill="#F79E1B"
                />
              </svg>
            </div>

            <div>
              <p className="text-slate-300 text-xs uppercase tracking-wide">
                Swiss Meridian Debit Card
              </p>
              <p className="text-xl md:text-2xl font-semibold tracking-widest mt-4">
                •••• •••• •••• {data?.user?.accountNumber?.slice(-4) || "0000"}
              </p>
            </div>

            <div className="flex items-end justify-between mt-6">
              <div>
                <p className="text-[10px] text-slate-300 uppercase">
                  Card Holder
                </p>
                <p className="text-sm font-medium">
                  {data?.user?.firstName} {data?.user?.lastName}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-300 uppercase">
                  Routing No.
                </p>
                <p className="text-sm font-medium">
                  {data?.user?.routingNumber}
                </p>
              </div>
            </div>
          </Link>
        </div>

        <SendMoney />
        <KycReminderBanner />
        <StaySecureTip />

        <FinancialServices />

        <div className="grid lg:grid-cols-3 gap-5 pb-6">
          {/* Recent transactions */}
          <div className="lg:col-span-2 card p-5 min-w-0">
            <div className="flex items-center justify-between mb-4 gap-2">
              <h3 className="font-semibold text-navy-900 shrink-0">
                Recent Transactions
              </h3>
              <Link
                to="/dashboard/transactions"
                className="text-xs text-navy font-medium flex items-center gap-0.5 shrink-0 whitespace-nowrap"
              >
                View All <ChevronRight size={14} />
              </Link>
            </div>
            {data?.recentTransactions?.length ? (
              <div className="space-y-1">
                {data.recentTransactions.map((tx) => {
                  const isCredit =
                    tx.receiver?._id === data.user.id ||
                    tx.type === "adjustment_credit";
                  return (
                    <div
                      key={tx._id}
                      className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0 min-w-0"
                    >
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${isCredit ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
                      >
                        {isCredit ? (
                          <ArrowDownRight size={17} />
                        ) : (
                          <ArrowUpRight size={17} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-sm font-medium text-navy-900 truncate">
                          {tx.description || tx.category}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {new Date(tx.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <p
                        className={`text-sm font-semibold shrink-0 whitespace-nowrap ${isCredit ? "text-emerald-600" : "text-red-500"}`}
                      >
                        {isCredit ? "+" : "-"}
                        {formatMoney(tx.amount, tx.currency)}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400 py-8 text-center">
                No transactions yet — your activity will show up here.
              </p>
            )}
          </div>

          {/* Spending overview */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-navy-900">Spending Overview</h3>
              <Link
                to="/dashboard/trends"
                className="text-xs text-navy font-medium"
              >
                6-month trends
              </Link>
            </div>
            <p className="text-xs text-slate-400 mb-3">This month</p>
            {data?.spending?.length ? (
              <>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.spending}
                        dataKey="total"
                        nameKey="_id"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                      >
                        {data.spending.map((_, i) => (
                          <Cell
                            key={i}
                            fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => formatMoney(v, currency)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 mt-2">
                  {data.spending.map((s, i) => (
                    <div
                      key={s._id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="flex items-center gap-2 text-slate-500">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            background:
                              CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                          }}
                        />
                        {s._id}
                      </span>
                      <span className="font-medium text-navy-900">
                        {formatMoney(s.total, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400 py-10 text-center">
                No spending recorded this month yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
