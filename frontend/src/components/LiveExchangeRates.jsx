import { useState, useEffect } from "react";
import { RefreshCw, TrendingUp } from "lucide-react";

const currencies = [
  { code: "USD", name: "US Dollar", flag: "us" },
  { code: "GBP", name: "British Pound", flag: "gb" },
  { code: "EUR", name: "Euro", flag: "eu" },
  { code: "CAD", name: "Canadian Dollar", flag: "ca" },
  { code: "AUD", name: "Australian Dollar", flag: "au" },
  { code: "JPY", name: "Japanese Yen", flag: "jp" },
  { code: "CHF", name: "Swiss Franc", flag: "ch" },
];

const LiveExchangeRates = () => {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const fetchRates = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      const data = await res.json();
      if (data.result === "success") {
        setRates(data.rates);
        setUpdatedAt(new Date());
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  return (
    <section className="max-w-5xl mx-auto px-4 md:px-8 py-20 md:py-28">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
            Live Rates
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mt-2">
            Exchange rates
          </h2>
          <p className="text-slate-500 mt-3 max-w-lg">
            See how each supported currency compares to the US Dollar right now.
          </p>
        </div>
        <button
          onClick={fetchRates}
          disabled={loading}
          className="btn-secondary flex items-center gap-2 !py-2.5 w-fit"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />{" "}
          Refresh
        </button>
      </div>

      {error ? (
        <div className="card p-8 text-center text-sm text-slate-400">
          Couldn't load live rates right now — please try refreshing.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {currencies.map((c) => (
            <div key={c.code} className="card p-5 flex items-center gap-3">
              <img
                src={`https://flagcdn.com/w80/${c.flag}.png`}
                alt={`${c.name} flag`}
                className="h-9 w-12 object-cover rounded-md shadow-sm shrink-0"
                loading="lazy"
              />
              <div>
                <p className="font-bold text-navy text-sm">{c.code}</p>
                {loading ? (
                  <div className="h-4 w-14 bg-slate-100 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-sm text-slate-500">
                    {c.code === "USD"
                      ? "1.00"
                      : (rates?.[c.code]?.toFixed(4) ?? "—")}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {updatedAt && (
        <p className="text-xs text-slate-400 mt-6 flex items-center gap-1.5">
          <TrendingUp size={13} /> Last updated {updatedAt.toLocaleTimeString()}{" "}
          · Base currency USD
        </p>
      )}
    </section>
  );
};

export default LiveExchangeRates;
