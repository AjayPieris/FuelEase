import { useState, useEffect } from "react";
import { Users, Eye, CheckCircle, XCircle } from "lucide-react";
import api from "../api/axios";

export default function AdminUsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers((res.data || []).filter((u) => u.role === "user"));
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleBlockUser = async (id, currentStatus) => {
    try {
      if (currentStatus) {
        await api.post(`/admin/users/${id}/unblock`);
      } else {
        if (!window.confirm("Are you sure you want to block this user?")) return;
        await api.post(`/admin/users/${id}/block`);
      }
      fetchUsers();
    } catch (err) {
      console.error("Error toggling user block status", err);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400 text-lg font-bold animate-pulse">Loading system users…</div>
      </div>
    );

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      <div className="solid-card p-6 sm:p-8 animate-[slideUp_0.4s_ease]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
              <Users className="w-6 h-6 text-indigo-500" /> System Users
            </h2>
            <p className="text-slate-400 text-sm mt-1.5 font-medium">
              Manage and review all registered customer accounts.
            </p>
          </div>
          <span className="badge-indigo">Total: {users.length} Users</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">ID</th>
                <th className="px-6 py-4 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest text-center w-16">Profile</th>
                <th className="px-6 py-4 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Name</th>
                <th className="px-6 py-4 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">NIC</th>
                <th className="px-6 py-4 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">NIC Photo</th>
                <th className="px-6 py-4 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Status</th>
                <th className="px-6 py-4 pr-8 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((u, idx) => (
                <tr key={u.id || idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm font-black text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                      {u.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="w-10 h-10 rounded-full border-2 border-slate-200 shadow-sm mx-auto overflow-hidden bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs">
                      {u.profile_picture_url || u.profile_image ? (
                        <img src={u.profile_picture_url || u.profile_image} className="w-full h-full object-cover" alt={u.name} />
                      ) : (
                        u.name ? u.name.substring(0, 2).toUpperCase() : "?"
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">{u.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-bold text-slate-500">{u.nic_number || u.nic || "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {u.nic_image_url || u.nic_image ? (
                      <a
                        href={u.nic_image_url || u.nic_image} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition"
                      >
                        <Eye className="w-3 h-3" /> View Photo
                      </a>
                    ) : (
                      <span className="text-slate-300 text-xs font-medium">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {u.is_blocked ? (
                      <span className="badge-red"><XCircle className="w-3 h-3" /> Suspended</span>
                    ) : (
                      <span className="badge-green"><CheckCircle className="w-3 h-3" /> Active</span>
                    )}
                  </td>
                  <td className="px-6 py-4 pr-8 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleBlockUser(u.id, u.is_blocked)}
                      className={`px-4 py-1.5 rounded-lg font-bold text-xs hover:scale-105 transition shadow-sm ${
                        u.is_blocked
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                      }`}
                    >
                      {u.is_blocked ? "Restore" : "Suspend"}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-medium italic">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-300 tracking-wider">PAGE {page} OF 1</p>
          <div className="flex gap-2">
            <button className="solid-btn-outline text-sm py-2 px-4 opacity-50 cursor-not-allowed">Previous</button>
            <button className="solid-btn text-sm py-2 px-4">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
