import { useState, useEffect } from "react";
import { MapPin, CheckCircle, XCircle, Clock, Paperclip } from "lucide-react";
import api from "../api/axios";

export default function AdminStationsTable() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchStations = async () => {
    try {
      const res = await api.get("/admin/stations");
      const data = res.data || [];
      // Sort pending stations first
      const sorted = [...data].sort((a, b) => {
        if (a.approval_status === "pending" && b.approval_status !== "pending") return -1;
        if (b.approval_status === "pending" && a.approval_status !== "pending") return 1;
        return 0;
      });
      setStations(sorted);
    } catch {
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStations(); }, []);

  const handleApproveStation = async (id) => {
    if (!window.confirm("Approve this station?")) return;
    try {
      await api.post(`/admin/stations/${id}/approve`);
      fetchStations();
    } catch (err) {
      console.error("Error approving station", err);
    }
  };

  const handleRejectStation = async (id) => {
    const reason = window.prompt("Enter reason for rejection:");
    if (!reason) return;
    try {
      await api.post(`/admin/stations/${id}/reject`, { reason });
      fetchStations();
    } catch (err) {
      console.error("Error rejecting station", err);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400 text-lg font-bold animate-pulse">Loading fuel stations…</div>
      </div>
    );

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      <div className="solid-card p-6 sm:p-8 animate-[slideUp_0.4s_ease]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
              <MapPin className="w-6 h-6 text-indigo-500" /> Fuel Stations
            </h2>
            <p className="text-slate-400 text-sm mt-1.5 font-medium">
              Review approvals and manage registered fuel stations.
            </p>
          </div>
          <span className="badge-indigo">Total: {stations.length} Stations</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">ID</th>
                <th className="px-6 py-4 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest text-center w-16">Profile</th>
                <th className="px-6 py-4 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Station Details</th>
                <th className="px-6 py-4 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Documents</th>
                <th className="px-6 py-4 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Status</th>
                <th className="px-6 py-4 pr-8 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stations.map((s, idx) => (
                <tr key={s.id || idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm font-black text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                      {s.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="w-12 h-12 rounded-xl border-2 border-slate-200 shadow-sm mx-auto overflow-hidden bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs">
                      {s.user?.profile_picture_url || s.profile_picture_url || s.profile_image ? (
                        <img
                          src={s.user?.profile_picture_url || s.profile_picture_url || s.profile_image}
                          className="w-full h-full object-cover" alt={s.name}
                        />
                      ) : (
                        <MapPin className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-bold text-slate-700 text-sm">{s.name}</p>
                    <p className="text-sm text-slate-400 mt-0.5 font-medium">{s.district || "District Not Set"}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {s.document_url ? (
                      <a
                        href={s.document_url} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition"
                      >
                        <Paperclip className="w-3 h-3" /> View Documents
                      </a>
                    ) : (
                      <span className="text-slate-300 text-xs font-medium">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {s.approval_status === "approved" && (
                      <span className="badge-green"><CheckCircle className="w-3 h-3" /> Approved</span>
                    )}
                    {s.approval_status === "pending" && (
                      <span className="badge-yellow"><Clock className="w-3 h-3" /> Pending</span>
                    )}
                    {s.approval_status === "rejected" && (
                      <span className="badge-red"><XCircle className="w-3 h-3" /> Rejected</span>
                    )}
                  </td>
                  <td className="px-6 py-4 pr-8 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {s.approval_status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApproveStation(s.id)}
                            className="px-4 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold text-xs hover:bg-emerald-100 hover:scale-105 transition shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectStation(s.id)}
                            className="px-4 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 font-bold text-xs hover:bg-red-100 hover:scale-105 transition shadow-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {stations.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium italic">No stations found.</td>
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
