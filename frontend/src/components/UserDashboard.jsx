import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api/axios';

export default function UserDashboard() {
  const [vehicle, setVehicle]           = useState(null);
  const [quota, setQuota]               = useState(null);
  const [history, setHistory]           = useState([]);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [fuelType, setFuelType]         = useState('Petrol');
  const [loading, setLoading]           = useState(true);

  useEffect(() => { fetchUserData(); }, []);

  const fetchUserData = async () => {
    try {
      const vehicleRes = await api.get('/vehicle');
      if (vehicleRes.data) {
        setVehicle(vehicleRes.data);
        const [quotaRes, historyRes] = await Promise.all([api.get('/quota'), api.get('/history')]);
        setQuota(quotaRes.data);
        setHistory(historyRes.data);
      }
    } catch (error) {
      console.error('Error fetching data', error);
    } finally { setLoading(false); }
  };

  const handleRegisterVehicle = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vehicles', { vehicle_number: vehicleNumber, fuel_type: fuelType });
      fetchUserData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error registering vehicle');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="glass rounded-2xl px-10 py-8 text-white/60 text-lg">Loading your dashboard…</div>
    </div>
  );

  /* ── Register Vehicle ── */
  if (!vehicle) {
    return (
      <div className="max-w-md mx-auto">
        <div className="glass-strong rounded-3xl p-8 modal-card">
          <h2 className="text-2xl font-black text-white mb-2">🚗 Register Your Vehicle</h2>
          <p className="text-white/50 text-sm mb-6">You need to register a vehicle to get your fuel QR code.</p>
          <form onSubmit={handleRegisterVehicle} className="flex flex-col gap-4">
            <input 
              type="text" placeholder="Vehicle Number (e.g., CBA-1234)" required
              className="glass-input uppercase"
              value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)}
            />
            <select 
              className="glass-input"
              value={fuelType} onChange={e => setFuelType(e.target.value)}
            >
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
            </select>
            <button type="submit" className="glass-btn w-full">Register Vehicle</button>
          </form>
        </div>
      </div>
    );
  }

  /* ── Main Dashboard ── */
  const used      = quota ? (quota.weekly_quota - quota.remaining_quota) : 0;
  const total     = quota?.weekly_quota    ?? 20;
  const remaining = quota?.remaining_quota ?? 0;
  const pctLeft   = total > 0 ? (remaining / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Top row */}
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* QR Code Card */}
        <div className="glass-strong rounded-3xl p-6 flex flex-col items-center gap-4 flex-1">
          <h2 className="text-xl font-black text-white self-start">📱 Your Fuel QR</h2>
          <p className="text-white/40 text-sm self-start -mt-3">{vehicle.vehicle_number} · {vehicle.fuel_type}</p>
          <div className="glass rounded-2xl p-4">
            <QRCodeSVG value={vehicle.qr_code} size={170} bgColor="transparent" fgColor="#ffffff" level="H" />
          </div>
          <p className="text-white/30 text-xs">Show this QR at the fuel station</p>
        </div>

        {/* Quota Card */}
        {quota && (
          <div className="glass-strong rounded-3xl p-6 flex flex-col gap-4 flex-1">
            <h2 className="text-xl font-black text-white">⛽ Weekly Quota</h2>
            <div className="text-center my-2">
              <span className="text-6xl font-black text-white">{remaining}</span>
              <span className="text-2xl text-white/40"> / {total}L</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pctLeft}%`,
                  background: pctLeft > 50 ? 'linear-gradient(90deg,#22c55e,#4ade80)' : pctLeft > 20 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#ef4444,#f87171)',
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="glass rounded-xl py-2">
                <p className="text-xs text-white/40">Total</p>
                <p className="font-bold text-white">{total}L</p>
              </div>
              <div className="glass rounded-xl py-2">
                <p className="text-xs text-white/40">Used</p>
                <p className="font-bold text-orange-300">{used}L</p>
              </div>
              <div className="glass rounded-xl py-2">
                <p className="text-xs text-white/40">Left</p>
                <p className="font-bold text-green-300">{remaining}L</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="glass-strong rounded-3xl p-6">
        <h2 className="text-xl font-black text-white mb-4">📋 Fuel History</h2>
        {history.length === 0 ? (
          <p className="text-white/30 italic text-sm">No fuel transactions yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((tx) => (
              <div key={tx.id} className="glass rounded-2xl px-5 py-3 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-white text-sm">Station #{tx.station_id}</p>
                  <p className="text-xs text-white/40">{new Date(tx.created_at).toLocaleString()}</p>
                </div>
                <div className="text-red-300 font-black text-lg">-{tx.liters_deducted}L</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}