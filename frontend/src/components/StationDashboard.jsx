import { useState, useEffect } from "react";
import { MapPin, CheckCircle, Zap, AlertTriangle, XCircle, FileText } from "lucide-react";
import api from "../api/axios";

export default function StationDashboard() {
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState("");
  const [liters, setLiters] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newDocumentUrl, setNewDocumentUrl] = useState("");
  const [user, setUser] = useState(null);
  const [stationStatus, setStationStatus] = useState("available");

  useEffect(() => {
    fetchStationData();
    try {
      setUser(JSON.parse(localStorage.getItem("fuelease_user")));
    } catch {}
  }, []);

  const fetchStationData = async () => {
    try {
      const res = await api.get("/station");
      if (res.data) {
        setStation(res.data);
        const sa = res.data.is_available;
        if (sa === "long_queue") setStationStatus("long_queue");
        else if (sa === false || sa === "empty" || String(sa) === "0") setStationStatus("empty");
        else setStationStatus("available");
      }
    } catch (err) {
      console.error("Error fetching station", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResubmitDocument = async (e) => {
    e.preventDefault();
    try {
      await api.post("/station/resubmit", { document_url: newDocumentUrl });
      fetchStationData();
      setNewDocumentUrl("");
    } catch {
      alert("Error resubmitting document");
    }
  };

  const handleDeductFuel = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await api.post("/stations/scan", { qr_code: qrCode, liters });
      setMessage(`${liters}L deducted. User has ${res.data.remaining_quota}L remaining.`);
      setQrCode("");
      setLiters("");
    } catch (err) {
      setError(err.response?.data?.message || "Transaction failed.");
    }
  };

  const handleStatusUpdate = async (statusVal) => {
    try {
      await api.patch("/station/availability", { is_available: statusVal });
    } catch (e) {
      console.log("Error updating status, updating locally instead", e);
    } finally {
      setStationStatus(statusVal);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="solid-card px-10 py-8 text-slate-400 text-lg font-medium">Loading station…</div>
      </div>
    );

  /* ── REJECTED OR MISSING ── */
  if (station?.approval_status === "rejected") {
    return (
      <div className="max-w-md mx-auto">
        <div className="solid-card p-8 modal-card border-t-4 border-red-400">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-black text-red-600">Station Rejected</h2>
          </div>
          <div className="bg-red-50 rounded-xl px-4 py-3 text-slate-600 text-sm mb-4">
            Reason: <span className="font-bold text-red-600">{station.rejection_reason || "No reason provided."}</span>
          </div>
          <p className="text-slate-500 text-sm mb-5">Please submit a new valid document URL to reapply.</p>
          <form onSubmit={handleResubmitDocument} className="flex flex-col gap-4">
            <input
              type="url" placeholder="New Document URL" required
              className="solid-input"
              value={newDocumentUrl}
              onChange={(e) => setNewDocumentUrl(e.target.value)}
            />
            <button type="submit" className="solid-btn w-full flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" /> Resubmit Document
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── PENDING ── */
  if (station?.approval_status === "pending") {
    return (
      <div className="max-w-md mx-auto">
        <div className="solid-card p-8 modal-card border-t-4 border-amber-400 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-3">Pending Approval</h2>
          <span className="badge-yellow mb-3 inline-flex"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Under Review</span>
          <div className="bg-slate-50 rounded-2xl px-5 py-4 text-slate-600 text-sm mt-3">
            Your station <span className="font-bold text-slate-800">{station.name}</span> has been submitted. An admin is reviewing your document. You'll be able to scan QR codes once approved.
          </div>
        </div>
      </div>
    );
  }

  /* ── MISSING PROFILE (Legacy User) ── */
  if (!station || !station.id) {
    return (
      <div className="max-w-md mx-auto">
        <div className="solid-card p-8 modal-card border-t-4 border-red-400 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-3">Station Profile Missing</h2>
          <div className="bg-slate-50 rounded-2xl px-5 py-4 text-slate-600 text-sm mt-3 mb-5">
            Your account was created but no station profile exists. Due to a system update, please re-register a new account to set up your station correctly.
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem("fuelease_token");
              localStorage.removeItem("fuelease_user");
              window.location.href = "/";
            }} 
            className="solid-btn w-full py-3"
          >
            Logout to Re-register
          </button>
        </div>
      </div>
    );
  }

  /* ── MAIN DASHBOARD ── */
  const statusOptions = [
    { value: "available",  label: "Available",     desc: "Fuel in stock",  icon: CheckCircle, color: "emerald" },
    { value: "long_queue", label: "Long Queue",    desc: "Expect delays",  icon: AlertTriangle, color: "amber" },
    { value: "empty",      label: "Station Empty", desc: "Out of fuel",    icon: XCircle, color: "red" },
  ];

  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col gap-6">
      {/* Station Info Card */}
      <div className="solid-card overflow-hidden">
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative">
          <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-slate-100 border border-slate-200 shadow-sm p-1.5 flex items-center justify-center transition-transform hover:scale-105 overflow-hidden">
            {user?.profile_picture_url || station?.user?.profile_picture_url ? (
              <img
                src={user?.profile_picture_url || station?.user?.profile_picture_url}
                alt="Station Profile"
                className="w-full h-full rounded-xl object-cover"
              />
            ) : (
              <MapPin className="w-10 h-10 text-slate-300" />
            )}
          </div>

          <div className="flex-1 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800">{station?.name}</h2>
              <p className="text-slate-500 text-sm mt-1.5 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                <MapPin className="w-4 h-4" /> {station?.location}
              </p>
            </div>
            <span className="badge-green shrink-0">
              <CheckCircle className="w-3.5 h-3.5" /> Approved
            </span>
          </div>
        </div>
      </div>

      {/* Queue Status Controls */}
      <div className="solid-card p-6 sm:p-8">
        <h3 className="text-lg font-black text-slate-800 mb-1">Queue Status</h3>
        <p className="text-sm text-slate-400 font-medium mb-4">Update your real-time station status</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {statusOptions.map(opt => {
            const Icon = opt.icon;
            const isActive = stationStatus === opt.value;
            const colorMap = {
              emerald: { active: 'border-emerald-500 bg-emerald-50', icon: 'bg-emerald-500 text-white shadow-emerald-200', text: 'text-emerald-700', desc: 'text-emerald-500/70' },
              amber: { active: 'border-amber-500 bg-amber-50', icon: 'bg-amber-500 text-white shadow-amber-200', text: 'text-amber-700', desc: 'text-amber-500/70' },
              red: { active: 'border-red-500 bg-red-50', icon: 'bg-red-500 text-white shadow-red-200', text: 'text-red-700', desc: 'text-red-500/70' },
            };
            const c = colorMap[opt.color];

            return (
              <button
                key={opt.value}
                onClick={() => handleStatusUpdate(opt.value)}
                className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 transition-all active:scale-95 ${isActive ? c.active : 'border-slate-100 bg-white hover:bg-slate-50'}`}
              >
                <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-colors shadow-sm ${isActive ? c.icon : 'bg-slate-100 text-slate-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className={`text-sm font-bold ${isActive ? c.text : 'text-slate-700'}`}>{opt.label}</p>
                  <p className={`text-[10px] font-semibold mt-0.5 ${isActive ? c.desc : 'text-slate-400'}`}>{opt.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scan & Deduct Form */}
      <div className="solid-card p-6 sm:p-8">
        <h3 className="text-lg font-black text-slate-800 mb-1">Scan & Deduct</h3>
        <p className="text-sm text-slate-400 font-medium mb-5">Process fuel distribution</p>

        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl mb-5 text-sm font-bold flex items-center gap-3">
            <CheckCircle className="w-5 h-5 shrink-0" /> {message}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-5 text-sm font-bold flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleDeductFuel} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">User QR Code Text</label>
            <input
              type="text" placeholder="e.g., QR-ABC123XYZ" required
              className="solid-input font-mono uppercase tracking-widest font-bold placeholder:font-sans placeholder:tracking-normal placeholder:font-medium"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Liters to Deduct</label>
            <input
              type="number" placeholder="Enter amount (e.g., 5)" required min="1" step="0.01"
              className="solid-input font-bold placeholder:font-medium"
              value={liters}
              onChange={(e) => setLiters(e.target.value)}
            />
          </div>
          <button type="submit" className="solid-btn w-full py-4 text-sm uppercase tracking-wider flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" /> Process Deduction
          </button>
        </form>
      </div>
    </div>
  );
}
