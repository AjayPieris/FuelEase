import { useState, useEffect } from "react";
import { MapPin, CheckCircle, AlertTriangle, XCircle, Clock, X } from "lucide-react";
import api from "../api/axios";

export default function StationStatusModal({ onClose, stationStatus, setStationStatus, user }) {
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchStation = () => {
      api.get("/station")
        .then((res) => setStation(res.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    };
    fetchStation();
    const interval = setInterval(fetchStation, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (statusVal) => {
    setUpdating(true);
    try {
      await api.patch("/station/availability", { is_available: statusVal });
    } catch (e) {
      console.log("Error updating status, updating locally instead", e);
    } finally {
      setStationStatus(statusVal);
      onClose();
    }
  };

  const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const statusOptions = [
    { value: "available", label: "Station Active", desc: "Fuel in stock", icon: CheckCircle, color: "emerald" },
    { value: "long_queue", label: "Long Queue", desc: "Expect delays", icon: AlertTriangle, color: "amber" },
    { value: "empty", label: "Station Empty", desc: "Out of fuel", icon: XCircle, color: "red" },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="solid-card modal-card w-full max-w-sm mx-4 flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 z-20 transition hover:scale-105 active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>

        {loading ? (
          <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Loading Details...</div>
        ) : (
          <>
            {/* Header / Info */}
            <div className="p-6 flex flex-col items-center border-b border-slate-100 text-center bg-slate-50/50">
              <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 shadow-sm p-1.5 flex items-center justify-center mb-3">
                {user?.profile_picture_url || station?.user?.profile_picture_url ? (
                  <img
                    src={user?.profile_picture_url || station?.user?.profile_picture_url}
                    alt="Station"
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <MapPin className="w-8 h-8 text-slate-300" />
                )}
              </div>
              <h3 className="text-xl font-black text-slate-800">{station?.name}</h3>
              <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {station?.location}
              </p>
              <div className="mt-3 badge-indigo">
                <Clock className="w-3.5 h-3.5" /> Time: {currentTime}
              </div>
            </div>

            {/* Controls */}
            <div className="p-6 flex flex-col gap-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-center text-slate-400 mb-1">Set Queue Status</p>

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
                    disabled={updating}
                    onClick={() => handleStatusUpdate(opt.value)}
                    className={`flex items-center gap-3.5 p-3.5 rounded-2xl border-2 transition-all active:scale-95 ${isActive ? c.active : 'border-slate-100 bg-white hover:bg-slate-50'}`}
                  >
                    <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-colors shadow-sm ${isActive ? c.icon : 'bg-slate-100 text-slate-400'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-left flex-1">
                      <p className={`text-sm font-bold leading-none ${isActive ? c.text : 'text-slate-700'}`}>{opt.label}</p>
                      <p className={`text-[10px] font-bold mt-1.5 ${isActive ? c.desc : 'text-slate-400'}`}>{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
