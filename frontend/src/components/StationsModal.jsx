import { useState, useEffect } from 'react';
import { Fuel, MapPin, X } from 'lucide-react';
import api from '../api/axios';

const AVAILABILITY_OPTIONS = [
  { value: 'all',        label: 'All Status',  activeClass: 'bg-slate-800 text-white border-slate-800' },
  { value: 'available',  label: 'Available',   activeClass: 'bg-emerald-500 text-white border-emerald-500' },
  { value: 'long_queue', label: 'Long Queue',  activeClass: 'bg-amber-500 text-white border-amber-500' },
  { value: 'empty',      label: 'Empty',       activeClass: 'bg-red-500 text-white border-red-500' },
];

function availabilityTag(val) {
  if (val === true  || val === 'available' || String(val) === '1')
    return { label: 'Available', className: 'badge-green' };
  if (val === 'long_queue')
    return { label: 'Long Queue', className: 'badge-yellow' };
  if (val === false || val === 'empty' || String(val) === '0')
    return { label: 'Empty', className: 'badge-red' };
  return { label: 'Unknown', className: 'bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1 rounded-full text-xs font-bold' };
}

export default function StationsModal({ onClose }) {
  const [stations, setStations] = useState([]);
  const [district, setDistrict] = useState('All Districts');
  const [availability, setAvailability] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStations = () => {
      api.get('/stations')
        .then(r => setStations(r.data || []))
        .catch(() => setStations([]))
        .finally(() => setLoading(false));
    };
    fetchStations();
    const interval = setInterval(fetchStations, 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = stations.filter(s => {
    const districtMatch = district === 'All Districts' || s.district === district;
    const avail =
      availability === 'all' ||
      (availability === 'available'  && (s.is_available === true  || s.is_available === 'available' || String(s.is_available) === '1')) ||
      (availability === 'long_queue' &&  s.is_available === 'long_queue') ||
      (availability === 'empty'      && (s.is_available === false || s.is_available === 'empty' || String(s.is_available) === '0'));
    return districtMatch && avail;
  });

  const uniqueDistricts = ['All Districts', ...new Set(stations.map(s => s.district).filter(Boolean))];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="solid-card modal-card w-full max-w-3xl mx-4 max-h-[85vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <Fuel className="w-5 h-5 text-indigo-500" /> Fuel Stations
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">
              {filtered.length} station{filtered.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <select
            value={district}
            onChange={e => setDistrict(e.target.value)}
            className="solid-input flex-1 text-sm"
          >
            {uniqueDistricts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <div className="flex gap-2 flex-wrap">
            {AVAILABILITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setAvailability(opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                  availability === opt.value
                    ? opt.activeClass
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Station Cards */}
        <div className="overflow-y-auto px-6 py-5 flex-1">
          {loading ? (
            <div className="text-center py-16 text-slate-400 font-medium">Loading stations…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400 font-medium">No stations match your filters.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map(s => {
                const tag = availabilityTag(s.is_available);
                return (
                  <div
                    key={s.id}
                    className="solid-card-hover p-4 flex items-center gap-4"
                  >
                    {/* Station icon */}
                    <div className="shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-indigo-50 flex items-center justify-center">
                      {s.user?.profile_picture_url ? (
                        <img src={s.user.profile_picture_url} alt={s.name} className="w-full h-full object-cover" />
                      ) : (
                        <Fuel className="w-5 h-5 text-indigo-400" />
                      )}
                    </div>

                    {/* Station info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-700 text-sm truncate">{s.name}</p>
                      <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {s.district || 'Unknown'}
                      </p>
                    </div>

                    {/* Availability badge */}
                    <span className={`shrink-0 ${tag.className}`}>{tag.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
