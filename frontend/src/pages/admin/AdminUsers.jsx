import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronRight, ChevronLeft } from "lucide-react";
import api from "../../api/axios";
import TopBar from "../../components/TopBar";
import CustomSelect from "../../components/CustomSelect";
import { useAdminMenu } from "../../components/AdminLayout";

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "frozen", label: "Frozen" },
  { value: "rejected", label: "Rejected" },
];

const statusColor = {
  active: "bg-emerald-50 text-emerald-600",
  pending: "bg-gold-50 text-gold-700",
  suspended: "bg-red-50 text-red-500",
  frozen: "bg-blue-50 text-blue-600",
  rejected: "bg-slate-100 text-slate-500",
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const { onMenuClick } = useAdminMenu();

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    api
      .get(`/admin/users?${params}`)
      .then((res) => {
        setUsers(res.data.users);
        setPages(res.data.pages || 1);
      })
      .finally(() => setLoading(false));
  }, [status, search, page]);

  return (
    <div>
      <TopBar
        notificationsHref="/admin/notifications"
        onMenuClick={onMenuClick}
        profileHref={null}
      />

      <div className="px-4 md:px-8 min-w-0">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-navy-900">All Users</h1>
          <p className="text-sm text-slate-400 mt-0.5">Search, filter, and manage every account.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              placeholder="Search by name, email, or account number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input-field !pl-10"
            />
          </div>
         <div className="sm:w-48">
            <CustomSelect
              value={status}
              onChange={(v) => { setStatus(v); setPage(1); }}
              options={statusOptions}
              placeholder="All statuses"
            />
          </div>
        </div>

       <div className="card overflow-x-auto min-w-0">
          {loading ? (
            <p className="text-sm text-slate-400 p-8 text-center">
              Loading users...
            </p>
          ) : users.length === 0 ? (
            <p className="text-sm text-slate-400 p-8 text-center">
              No users found.
            </p>
          ) : (
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-left text-xs text-slate-400 uppercase border-b border-slate-100">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Balance</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-900">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {u.accountNumber}
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-500">
                      {u.accountType?.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3 font-medium text-navy-900">
                      {u.currency} {u.balance?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColor[u.status]}`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/users/${u._id}`}
                        className="text-navy inline-flex items-center gap-0.5 text-xs font-medium"
                      >
                        Manage <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-5">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="btn-secondary !p-2 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-slate-500">
              Page {page} of {pages}
            </span>
            <button
              disabled={page === pages}
              onClick={() => setPage((p) => p + 1)}
              className="btn-secondary !p-2 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
