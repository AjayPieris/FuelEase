import { useState, useEffect, useRef } from "react";
import { Car, CheckCircle, XCircle, Clock, Smartphone, Upload, Eye, Trash2, FileSpreadsheet, AlertTriangle, ShieldCheck, Search } from "lucide-react";
import api from "../api/axios";

const TABS = [
  { key: "all",     label: "All Vehicles" },
  { key: "auto",    label: "Auto-Approved",         color: "emerald" },
  { key: "manual",  label: "Requires Manual Review", color: "amber" },
];

export default function AdminVehiclesTable() {
  const [vehicles, setVehicles] = useState([]);
  const [registryFiles, setRegistryFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewEntries, setPreviewEntries] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    try {
      const [vRes, rRes] = await Promise.all([
        api.get("/admin/vehicles"),
        api.get("/admin/registry/files"),
      ]);
      setVehicles(vRes.data || []);
      setRegistryFiles(rRes.data || []);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Upload handler ──
  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadMsg("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/admin/registry/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadMsg(res.data.message || "Upload successful!");
      fetchAll();
    } catch (err) {
      setUploadMsg(err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleDeleteFile = async (id) => {
    if (!window.confirm("Delete this registry file and all its records?")) return;
    try {
      await api.delete(`/admin/registry/files/${id}`);
      fetchAll();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handlePreview = async (file) => {
    setPreviewFile(file);
    setPreviewLoading(true);
    try {
      const res = await api.get(`/admin/registry/files/${file.id}/entries`);
      setPreviewEntries(res.data?.entries?.data || []);
    } catch {
      setPreviewEntries([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  // ── Approve / Reject ──
  const handleApprove = async (id) => {
    if (!window.confirm("Override & approve this vehicle?")) return;
    try {
      await api.post(`/admin/vehicles/${id}/approve`);
      fetchAll();
    } catch (err) {
      console.error("Approve failed", err);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this vehicle application?")) return;
    try {
      await api.post(`/admin/vehicles/${id}/reject`);
      fetchAll();
    } catch (err) {
      console.error("Reject failed", err);
    }
  };

  // ── Filtering ──
  const filteredVehicles = vehicles.filter((v) => {
    if (activeTab === "all") return true;
    if (activeTab === "auto") return v.status === "approved" && v.approval_method === "auto";
    if (activeTab === "manual") return v.status === "pending" || (v.failure_reason && v.status !== "approved" && v.status !== "rejected");
    return true;
  });

  const pendingManualCount = vehicles.filter(
    (v) => v.status === "pending" || (v.failure_reason && v.status !== "approved" && v.status !== "rejected")
  ).length;
  const autoApprovedCount = vehicles.filter(
    (v) => v.status === "approved" && v.approval_method === "auto"
  ).length;

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400 text-lg font-bold animate-pulse">Loading vehicles & registry…</div>
      </div>
    );

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">

      {/* ═══════ SECTION 1: MASTER REGISTRY FILES ═══════ */}
      <div className="solid-card p-6 sm:p-8 animate-[slideUp_0.3s_ease]">
        <div className="flex items-center gap-3 mb-1">
          <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800">Master Registry Files</h2>
        </div>
        <p className="text-slate-400 text-sm font-medium mb-6 ml-9">Upload the official DMT vehicle registry to enable auto-verification.</p>

        {/* Upload Zone */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group ${
            dragOver
              ? "border-emerald-400 bg-emerald-50/50 scale-[1.01]"
              : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files[0])}
          />
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload className={`w-7 h-7 ${dragOver ? "text-emerald-500" : "text-emerald-400"}`} />
          </div>
          <p className="text-slate-600 font-bold text-sm mb-1">
            {dragOver ? "Drop your file here…" : "Upload Official Vehicle Registry (.xlsx)"}
          </p>
          <p className="text-slate-400 text-xs font-medium">Drag & drop or click to browse</p>
        </div>

        {/* Upload Button */}
        {uploading && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold">
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              Processing & syncing database…
            </div>
          </div>
        )}
        {uploadMsg && (
          <div className={`mt-4 p-3 rounded-xl text-sm font-bold text-center ${
            uploadMsg.includes("fail") || uploadMsg.includes("Could not")
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}>
            {uploadMsg}
          </div>
        )}

        {/* File History Table */}
        {registryFiles.length > 0 && (
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">File Name</th>
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Date</th>
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Total Records</th>
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {registryFiles.map((rf) => (
                  <tr key={rf.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-2 font-bold text-sm text-slate-700">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                        {rf.file_name}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500 font-medium">
                      {new Date(rf.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="bg-indigo-50 text-indigo-600 font-bold text-xs px-2.5 py-1 rounded-lg border border-indigo-100">
                        {rf.total_records}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handlePreview(rf)}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-indigo-100 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition"
                          title="Preview data"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(rf.id)}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-100 flex items-center justify-center text-slate-500 hover:text-red-600 transition"
                          title="Delete file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══════ PREVIEW MODAL ═══════ */}
      {previewFile && (
        <div className="modal-overlay" onClick={() => setPreviewFile(null)}>
          <div className="solid-card modal-card w-full max-w-4xl mx-4 max-h-[80vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-indigo-500" /> {previewFile.file_name}
                </h3>
                <p className="text-slate-400 text-xs font-medium mt-0.5">{previewFile.total_records} records</p>
              </div>
              <button onClick={() => setPreviewFile(null)} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto px-6 pb-6">
              {previewLoading ? (
                <div className="py-12 text-center text-slate-400 font-medium animate-pulse">Loading…</div>
              ) : (
                <table className="w-full text-left border-collapse mt-4">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle No</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Chassis</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">NIC</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fuel Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {previewEntries.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-2.5 text-sm font-bold text-indigo-700">{e.vehicle_number}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">{e.chassis_number || "—"}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">{e.nic_number || "—"}</td>
                        <td className="px-4 py-2.5 text-sm text-slate-600 font-medium">{e.full_name || "—"}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-500">{e.fuel_type || "—"}</td>
                      </tr>
                    ))}
                    {previewEntries.length === 0 && (
                      <tr><td colSpan="5" className="py-8 text-center text-slate-400 italic">No entries found.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ SECTION 2: VEHICLE APPROVALS ═══════ */}
      <div className="solid-card p-6 sm:p-8 animate-[slideUp_0.4s_ease]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
              <Car className="w-6 h-6 text-indigo-500" /> Vehicle Approvals
            </h2>
            <p className="text-slate-400 text-sm mt-1.5 font-medium">
              Vehicles are auto-verified against the Master Registry. Review mismatches below.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? tab.color === "emerald"
                      ? "bg-emerald-500 text-white shadow-sm"
                      : tab.color === "amber"
                        ? "bg-amber-500 text-white shadow-sm"
                        : "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
                {tab.key === "manual" && pendingManualCount > 0 && (
                  <span className="ml-1.5 bg-red-100 text-red-700 px-1.5 py-0.5 rounded-md text-[10px]">
                    {pendingManualCount}
                  </span>
                )}
                {tab.key === "auto" && autoApprovedCount > 0 && (
                  <span className="ml-1.5 bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md text-[10px]">
                    {autoApprovedCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-5 py-4 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Owner Info</th>
                <th className="px-5 py-4 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Vehicle Info</th>
                <th className="px-5 py-4 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Type / Quota</th>
                {activeTab === "manual" && (
                  <th className="px-5 py-4 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Failure Reason</th>
                )}
                <th className="px-5 py-4 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">Status</th>
                <th className="px-5 py-4 pr-6 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredVehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <p className="font-bold text-slate-700 text-sm">{v.full_name || v.user?.name || "Unknown"}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">{v.nic_number || v.user?.nic_number || "No NIC"}</p>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <p className="font-bold text-indigo-700 text-sm">{v.vehicle_number}</p>
                    {v.chassis_number && <p className="text-[10px] text-slate-400 mt-0.5 font-mono">CHASSIS: {v.chassis_number}</p>}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200">
                      <Car className="w-3 h-3 text-slate-400" />
                      {v.fuel_type}
                    </span>
                  </td>
                  {activeTab === "manual" && (
                    <td className="px-5 py-4 whitespace-nowrap">
                      {v.failure_reason ? (
                        <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-2.5 py-1 rounded-lg text-xs font-bold border border-red-200">
                          <AlertTriangle className="w-3 h-3" />
                          {v.failure_reason}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs italic">No registry data</span>
                      )}
                    </td>
                  )}
                  <td className="px-5 py-4 whitespace-nowrap text-center">
                    {v.status === "approved" ? (
                      <span className="inline-flex flex-col items-center gap-1">
                        {v.approval_method === "auto" ? (
                          <span className="badge-green"><ShieldCheck className="w-3 h-3" /> Auto-Approved</span>
                        ) : (
                          <span className="badge-green"><CheckCircle className="w-3 h-3" /> Approved</span>
                        )}
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {v.qr_code || "QR GENERATED"}
                        </span>
                      </span>
                    ) : v.status === "rejected" ? (
                      <span className="badge-red"><XCircle className="w-3 h-3" /> Rejected</span>
                    ) : (
                      <span className="badge-yellow"><Clock className="w-3 h-3" /> Pending Review</span>
                    )}
                  </td>
                  <td className="px-5 py-4 pr-6 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {(v.status === "pending") && (
                        <>
                          <button
                            onClick={() => handleApprove(v.id)}
                            className="bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition shadow-sm flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3 h-3" /> Override & Approve
                          </button>
                          <button
                            onClick={() => handleReject(v.id)}
                            className="bg-red-50 text-red-600 border border-red-200 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-red-100 transition shadow-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredVehicles.length === 0 && (
                <tr>
                  <td colSpan={activeTab === "manual" ? 6 : 5} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                    {activeTab === "manual"
                      ? "No vehicles require manual review — great!"
                      : activeTab === "auto"
                        ? "No auto-approved vehicles yet. Upload a registry to get started."
                        : "No vehicles found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-300 tracking-wider">
            {filteredVehicles.length} of {vehicles.length} vehicles shown
          </p>
        </div>
      </div>
    </div>
  );
}
