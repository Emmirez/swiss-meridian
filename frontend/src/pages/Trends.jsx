import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";
import api from "../api/axios";
import TopBar from "../components/TopBar";
import { useAuth } from "../context/AuthContext";
import { useUserMenu } from "../components/DashboardLayout";

const COLORS = ["#0B2545", "#C9A227", "#2C5A9C", "#7D6216", "#94A3B8"];

const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount || 0);

const Trends = () => {
  const { user } = useAuth();
  const { onMenuClick } = useUserMenu();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/users/spending-trends").then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  const currency = user?.currency || "USD";
  const hasData = data?.trends?.some((row) =>
    data.categories.some((cat) => row[cat] > 0)
  );

  return (
    <div>
      <TopBar onMenuClick={onMenuClick} />

      <div className="px-4 md:px-8 pb-6">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-navy-900">Spending Trends</h1>
          <p className="text-sm text-slate-400 mt-0.5">How your spending has moved over the last 6 months.</p>
        </div>

        {loading ? (
          <div className="card p-8 text-sm text-slate-400 text-center">Loading trends...</div>
        ) : !hasData ? (
          <div className="card p-10 text-center text-slate-400 text-sm">
            <TrendingUp size={28} className="mx-auto mb-3 text-slate-300" />
            Not enough transaction history yet to show trends.
          </div>
        ) : (
          <div className="card p-5">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.trends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatMoney(v, currency)}
                  />
                  <Tooltip formatter={(v) => formatMoney(v, currency)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {data.categories.map((cat, i) => (
                    <Bar key={cat} dataKey={cat} stackId="spending" fill={COLORS[i % COLORS.length]} radius={i === data.categories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trends;