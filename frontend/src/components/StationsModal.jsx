import { useState, useEffect } from 'react';
import api from '../api/axios';

const DISTRICTS = [
  "All Districts",
  "Ampara","Anuradhapura","Badulla","Batticaloa","Colombo","Galle","Gampaha",
  "Hambantota","Jaffna","Kalutara","Kandy","Kegalle","Kilinochchi","Kurunegala",
  "Mannar","Matale","Matara","Monaragala","Mullaitivu","Nuwara Eliya","Polonnaruwa",
  "Puttalam","Ratnapura","Trincomalee","Vavuniya"
];

const AVAILABILITY_OPTIONS = [
  { value: 'all',        label: 'All Status',  color: 'bg-white/20 text-white' },
  { value: 'available',  label: 'Available',   color: 'bg-green-500/30 text-green-300 border-green-400/40' },
  { value: 'long_queue', label: 'Long Queue',  color: 'bg-yellow-500/30 text-yellow-300 border-yellow-400/40' },
  { value: 'empty',      label: 'Empty',       color: 'bg-red-500/30 text-red-300 border-red-400/40' },
];

// Mock data for when API returns no stations yet
const MOCK_STATIONS = [
  { id:1, name:'Colombo Central Fuel Station', district:'Colombo',       is_available: 'available' },
  { id:2, name:'Kandy Highlands Fuel Stop',    district:'Kandy',         is_available: 'long_queue' },
  { id:3, name:'Galle Fort Fuel Centre',       district:'Galle',         is_available: 'available' },
  { id:4, name:'Jaffna North Filling Station', district:'Jaffna',        is_available: 'empty' },
  { id:5, name:'Gampaha Express Fuel Hub',     district:'Gampaha',       is_available: 'available' },
  { id:6, name:'Kurunegala Town Fuel Stop',    district:'Kurunegala',    is_available: 'long_queue' },
];

function availabilityTag(val) {
  if (val === true || val === 'available')   return { label: 'Available',  styles: 'bg-green-500/25 text-green-300 border-green-400/40' };
  if (val === 'long_queue')                  return { label: 'Long Queue', styles: 'bg-yellow-500/25 text-yellow-300 border-yellow-400/40' };
  if (val === false || val === 'empty')      return { label: 'Empty',      styles: 'bg-red-500/25 text-red-300 border-red-400/40' };
  return { label: 'Unknown', styles: 'bg-gray-500/20 text-gray-300' };
}

export default function StationsModal({ onClose }) {
  const [stations, setStations]               = useState([]);
  const [district, setDistrict]               = useState('All Districts');
  const [availability, setAvailability]       = useState('all');
  const [loading, setLoading]                 = useState(true);

  useEffect(() => {
    api.get('/stations')
      .then(r => setStations(r.data.length ? r.data : MOCK_STATIONS))
      .catch(() => setStations(MOCK_STATIONS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = stations.filter(s => {
    const districtMatch = district === 'All Districts' || s.district === district;
    const avail = availability === 'all'
      || (availability === 'available'  && (s.is_available === true || s.is_available === 'available'))
      || (availability === 'long_queue' && s.is_available === 'long_queue')
      || (availability === 'empty'      && (s.is_available === false || s.is_available === 'empty'));
    return districtMatch && avail;
  });

  // Unique districts from stations
  const uniqueDistricts = ['All Districts', ...new Set(stations.map(s => s.district).filter(Boolean))];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-strong modal-card rounded-3xl w-full max-w-3xl mx-4 max-h-[85vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-black text-white">🏪 Fuel Stations</h2>
            <p className="text-white/50 text-sm mt-0.5">{filtered.length} station{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg transition">×</button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 px-6 py-4 border-b border-white/10">
          <select
            value={district}
            onChange={e => setDistrict(e.target.value)}
            className="glass-input flex-1 text-sm"
          >
            {uniqueDistricts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <div className="flex gap-2 flex-wrap">
            {AVAILABILITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setAvailability(opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${availability === opt.value ? opt.color + ' scale-105 shadow-lg' : 'bg-white/5 text-white/50 border-white/15 hover:bg-white/10'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Station Cards */}
        <div className="overflow-y-auto px-6 py-5 flex-1">
          {loading ? (
            <div className="text-center py-16 text-white/40">Loading stations…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-white/40">No stations match your filters.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map(s => {
                const tag = availabilityTag(s.is_available);
                return (
                  <div key={s.id} className="glass rounded-2xl px-5 py-4 flex items-start justify-between gap-3 hover:bg-white/10 transition group">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate group-hover:text-violet-200 transition">{s.name}</p>
                      <p className="text-white/50 text-xs mt-1 flex items-center gap-1">
                        <span>📍</span> {s.district || 'Unknown'}
                      </p>
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold border ${tag.styles}`}>
                      {tag.label}
                    </span>
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
