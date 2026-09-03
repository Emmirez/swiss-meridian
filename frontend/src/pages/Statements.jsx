import { useState } from "react";
import { FileText, Download } from "lucide-react";
import api from "../api/axios";
import TopBar from "../components/TopBar";
import CustomSelect from "../components/CustomSelect";
import { useUserMenu } from "../components/DashboardLayout";

const monthOptions = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((label, i) => ({ value: i + 1, label }));

const now = new Date();
const yearOptions = Array.from(
  { length: 5 },
  (_, i) => now.getFullYear() - i,
).map((y) => ({ value: y, label: String(y) }));

const Statements = () => {
  const { onMenuClick } = useUserMenu();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const download = async () => {
    setError("");
    setDownloading(true);
    try {
      const response = await api.get(
        `/users/statement?month=${month}&year=${year}`,
        {
          responseType: "blob",
        },
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `swissmeridianbank-Statement-${year}-${String(month).padStart(2, "0")}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Could not generate statement. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <TopBar onMenuClick={onMenuClick} />

      <div className="px-4 md:px-8 max-w-lg">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-navy-900">
            Account Statements
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Download a PDF statement for any month.
          </p>
        </div>

        <div className="card p-6">
          <div className="h-12 w-12 rounded-2xl bg-navy-50 text-navy flex items-center justify-center mb-4">
            <FileText size={22} />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-4">
            <CustomSelect
              value={month}
              onChange={setMonth}
              options={monthOptions}
              placeholder="Month"
            />
            <CustomSelect
              value={year}
              onChange={setYear}
              options={yearOptions}
              placeholder="Year"
            />
          </div>

          <button
            onClick={download}
            disabled={downloading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Download size={16} />{" "}
            {downloading ? "Generating..." : "Download Statement"}
          </button>

          <p className="text-xs text-slate-400 mt-4">
            Statements include your opening and closing balance for the selected
            month, along with every transaction that posted during that period.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Statements;
