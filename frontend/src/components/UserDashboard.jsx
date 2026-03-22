import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, Fuel, Plus, Car, Clock, CheckCircle } from 'lucide-react';
import api from '../api/axios';

const VEHICLE_TYPES = [
  { value: 'Motorcycles', label: 'Motorcycles (5L/Week)', quota: 5 },
  { value: 'Cars / Three-Wheelers', label: 'Cars / Three-Wheelers (15L/Week)', quota: 15 },
  { value: 'Vans', label: 'Vans (40L/Week)', quota: 40 },
  { value: 'Buses', label: 'Buses (60L/Week)', quota: 60 },
  { value: 'Land Vehicles', label: 'Land Vehicles (25L/Week)', quota: 25 },
];

export default function UserDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [quota, setQuota] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  // Registration form
  const [fullName, setFullName] = useState('');
  const [nicNumber, setNicNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Motorcycles');
  const [regError, setRegError] = useState('');

  useEffect(() => { fetchUserData(); }, []);

  const fetchUserData = async () => {
    try {
      const vehicleRes = await api.get('/vehicle');
      const vehicleList = Array.isArray(vehicleRes.data) ? vehicleRes.data : (vehicleRes.data ? [vehicleRes.data] : []);
      setVehicles(vehicleList);

      const [quotaRes, historyRes] = await Promise.all([
        api.get('/quota').catch(() => ({ data: null })),
        api.get('/history').catch(() => ({ data: [] }))
      ]);
      setQuota(quotaRes.data);
      setHistory(historyRes.data || []);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally { setLoading(false); }
  };

  const handleRegisterVehicle = async (e) => {
    e.preventDefault();
    setRegError('');
    try {
      await api.post('/vehicles', {
        vehicle_number: vehicleNumber,
        fuel_type: vehicleType,
        chassis_number: chassisNumber,
        full_name: fullName,
        nic_number: nicNumber,
      });
      setShowRegister(false);
      setVehicleNumber(''); setChassisNumber(''); setFullName(''); setNicNumber('');
      fetchUserData();
    } catch (error) {
      setRegError(error.response?.data?.message || 'Error registering vehicle');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="solid-card px-10 py-8 text-slate-400 text-lg font-medium">Loading your dashboard…</div>
    </div>
  );

  const vehicle = vehicles[selectedIdx];

  /* ── Empty State — No vehicles ── */
  if (vehicles.length === 0 && !showRegister) {
    return (
      <div className="max-w-md mx-auto">
        <div className="solid-card p-8 text-center modal-card">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
            <Car className="w-8 h-8 text-indigo-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Welcome to FuelEase!</h2>
          <p className="text-slate-500 text-sm mb-6">Register your vehicle to generate your National Fuel Pass QR.</p>
          <button onClick={() => setShowRegister(true)} className="solid-btn w-full flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Register Vehicle
          </button>
        </div>
      </div>
    );
  }

  /* ── Vehicle Registration Form ── */
  if (showRegister || (vehicles.length === 0)) {
    return (
      <div className="max-w-md mx-auto">
        <div className="solid-card p-8 modal-card">
          <h2 className="text-2xl font-black text-slate-800 mb-1 flex items-center gap-2">
            <Car className="w-6 h-6 text-indigo-500" /> Register Vehicle
          </h2>
          <p className="text-slate-400 text-sm mb-6">Submit your vehicle details for verification.</p>

          {regError && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium">{regError}</div>
          )}

          <form onSubmit={handleRegisterVehicle} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Full Name</label>
              <input type="text" placeholder="Your full name" required className="solid-input" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">NIC Number</label>
              <input type="text" placeholder="e.g., 199012345678" required className="solid-input uppercase" value={nicNumber} onChange={e => setNicNumber(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Vehicle Number</label>
              <input type="text" placeholder="e.g., CBA-1234" required className="solid-input uppercase" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Chassis Number</label>
              <input type="text" placeholder="e.g., CHAS12345" required className="solid-input uppercase" value={chassisNumber} onChange={e => setChassisNumber(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Vehicle Type</label>
              <select className="solid-input" value={vehicleType} onChange={e => setVehicleType(e.target.value)}>
                {VEHICLE_TYPES.map(vt => <option key={vt.value} value={vt.value}>{vt.label}</option>)}
              </select>
            </div>
            <button type="submit" className="solid-btn w-full mt-2 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Submit for Verification
            </button>
            {vehicles.length > 0 && (
              <button type="button" onClick={() => setShowRegister(false)} className="solid-btn-outline w-full text-sm">
                Cancel
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  /* ── Main Dashboard ── */
  const vehicleQuota = quota?.vehicles_quota?.find(q => q.id === vehicle?.id);
  const total = Number(vehicleQuota?.weekly_quota || 0);
  const remaining = Number(vehicleQuota?.remaining_quota || 0);
  const used = total - remaining;
  const pctLeft = total > 0 ? (remaining / total) * 100 : 0;
  const currentVehicleType = VEHICLE_TYPES.find(vt => vt.value === vehicle?.fuel_type || vt.value === vehicle?.vehicle_type);

  return (
    <div className="flex flex-col gap-6">
      {/* Vehicle selector (if multiple) */}
      {vehicles.length > 1 && (
        <div className="solid-card p-4 flex items-center gap-3 animate-[slideUp_0.3s_ease]">
          <Car className="w-5 h-5 text-indigo-500" />
          <select
            className="solid-input flex-1 font-semibold"
            value={selectedIdx}
            onChange={e => setSelectedIdx(Number(e.target.value))}
          >
            {vehicles.map((v, i) => (
              <option key={i} value={i}>{v.vehicle_number} — {v.fuel_type || v.vehicle_type}</option>
            ))}
          </select>
        </div>
      )}

      {vehicle.status === 'pending' ? (
        /* ── Pending Approval State ── */
        <div className="solid-card p-8 text-center animate-[slideUp_0.4s_ease] border-t-8 border-t-amber-400">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 flex items-center justify-center mb-6">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-3">Pending Admin Approval</h2>
          <span className="badge-yellow mb-5 inline-flex"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending Verification</span>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            Your vehicle <strong className="text-slate-800">{vehicle.vehicle_number}</strong> is currently being verified. 
            Waiting for Admin verification to generate your National Fuel Pass.
          </p>
        </div>
      ) : vehicle.status === 'rejected' ? (
        /* ── Rejected State ── */
        <div className="solid-card p-8 text-center animate-[slideUp_0.4s_ease] border-t-8 border-t-red-500">
          <h2 className="text-2xl font-black text-slate-800 mb-2">Application Rejected</h2>
          <p className="text-slate-500">Your vehicle registration was denied. Please contact support.</p>
        </div>
      ) : (
        /* ── Active Approved State ── */
        <div className="flex flex-col md:flex-row gap-6 animate-[slideUp_0.4s_ease]">
          {/* QR Code Card */}
          <div className="solid-card p-6 flex flex-col items-center gap-4 flex-1">
            <div className="self-start flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-black text-slate-800">Your Fuel QR</h2>
            </div>
            <p className="text-slate-400 text-sm self-start -mt-3 ml-7">{vehicle?.vehicle_number} · {vehicle?.fuel_type}</p>

            <div className="bg-slate-900 rounded-3xl p-6 flex flex-col items-center gap-4 my-2 shadow-xl shadow-slate-200">
              <QRCodeSVG value={vehicle?.qr_code || 'FUELEASE'} size={180} bgColor="transparent" fgColor="#ffffff" level="H" />
              <div className="bg-white/10 px-4 py-1.5 rounded-lg border border-white/10 w-full">
                <p className="text-white/70 text-[10px] uppercase font-bold text-center mb-0.5 tracking-wider">National Fuel Pass ID</p>
                <p className="text-white text-sm font-mono tracking-widest text-center select-all break-all font-bold">
                  {vehicle?.qr_code || 'FUELEASE-XXXX'}
                </p>
              </div>
            </div>

            {currentVehicleType && (
              <span className="badge-indigo mt-1 text-xs px-4 py-1.5">{currentVehicleType.label} Limit</span>
            )}
            <p className="text-slate-400 text-xs font-medium">Show this QR at the fuel station</p>
          </div>

          {/* Quota Card */}
          <div className="solid-card p-6 flex flex-col gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Fuel className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-black text-slate-800">Weekly Quota Progress</h2>
            </div>
            
            <div className="flex-1 flex flex-col justify-center gap-6 py-4">
              <div className="text-center">
                <span className="text-7xl font-black text-slate-800 tracking-tight">{remaining}</span>
                <span className="text-2xl font-bold text-slate-300 ml-1">/ {total}L</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${pctLeft}%`,
                    background: pctLeft > 50 ? 'linear-gradient(90deg,#22c55e,#4ade80)' : pctLeft > 20 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#ef4444,#f87171)',
                  }}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl py-3 shadow-sm hover:shadow-md transition">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total</p>
                  <p className="font-black text-slate-700 text-lg">{total}L</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl py-3 shadow-sm hover:shadow-md transition">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Used</p>
                  <p className="font-black text-amber-500 text-lg">{used}L</p>
                </div>
                <div className="bg-green-50/50 border border-green-100 rounded-2xl py-3 shadow-sm hover:shadow-md transition ring-1 ring-green-100/50">
                  <p className="text-xs text-green-600/70 font-bold uppercase tracking-wider mb-1">Left</p>
                  <p className="font-black text-green-600 text-lg">{remaining}L</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Another Vehicle */}
      <button
        onClick={() => setShowRegister(true)}
        className="solid-btn flex items-center justify-center gap-2 py-3.5 mx-auto w-full md:w-auto md:px-12 mt-2"
      >
        <Plus className="w-5 h-5" /> Add Another Vehicle
      </button>

      {/* Transaction History (Only show if approved and has history) */}
      {(vehicle.status === 'approved' || history.length > 0) && (
        <div className="solid-card p-6 animate-[slideUp_0.5s_ease]">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-black text-slate-800">Fuel History</h2>
          </div>
          {history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 font-medium">No fuel transactions yet.</p>
              <p className="text-slate-300 text-sm mt-1">Your recent fill-ups will appear here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {history.map((tx) => (
                <div key={tx.id} className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 hover:bg-slate-100/50 transition-colors">
                  <div>
                    <p className="font-bold text-slate-700 text-sm">{tx.station?.name || `Station #${tx.station_id}`}</p>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">{new Date(tx.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</p>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="badge-green text-[10px]"><CheckCircle className="w-3 h-3" /> Completed</span>
                    <span className="text-red-500 font-black text-xl">-{tx.liters_deducted}L</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}