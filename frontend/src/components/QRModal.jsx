import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api/axios';

const MOCK_VEHICLE = { qr_code: 'FUELEASE-MOCK-QR-ABC123', vehicle_number: 'CAB-7890', fuel_type: 'Petrol' };
const MOCK_QUOTA   = { weekly_quota: 20, remaining_quota: 14 };

export default function QRModal({ onClose }) {
  const [vehicle, setVehicle] = useState(null);
  const [quota,   setQuota]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/vehicle'), api.get('/quota')])
      .then(([vRes, qRes]) => {
        setVehicle(vRes.data || MOCK_VEHICLE);
        setQuota(qRes.data   || MOCK_QUOTA);
      })
      .catch(() => {
        setVehicle(MOCK_VEHICLE);
        setQuota(MOCK_QUOTA);
      })
      .finally(() => setLoading(false));
  }, []);

  const used      = quota ? (quota.weekly_quota - quota.remaining_quota) : 0;
  const total     = quota?.weekly_quota    ?? 20;
  const remaining = quota?.remaining_quota ?? 14;
  const pctUsed   = total > 0 ? Math.round((used / total) * 100) : 0;
  const pctLeft   = 100 - pctUsed;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-strong modal-card rounded-3xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-2xl font-black text-white">📱 My Fuel QR</h2>
            {vehicle && <p className="text-white/50 text-sm mt-0.5">{vehicle.vehicle_number} · {vehicle.fuel_type}</p>}
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg transition">×</button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-white/40">Loading…</div>
        ) : (
          <div className="px-6 pb-8 flex flex-col items-center gap-6">
            {/* QR Code */}
            <div className="glass rounded-2xl p-5 flex flex-col items-center gap-3">
              <QRCodeSVG
                value={vehicle?.qr_code || 'FUELEASE-MOCK'}
                size={180}
                bgColor="transparent"
                fgColor="#ffffff"
                level="H"
              />
              {/* QR value text */}
              <p className="text-white/40 text-xs font-mono tracking-widest text-center select-all break-all">
                {vehicle?.qr_code || 'FUELEASE-MOCK'}
              </p>
            </div>

            {/* Quota Section */}
            <div className="w-full glass rounded-2xl p-5 flex flex-col gap-4">
              <p className="text-white font-bold text-sm text-center tracking-wide uppercase opacity-70">Weekly Fuel Quota</p>

              {/* Big number */}
              <div className="text-center">
                <span className="text-5xl font-black text-white">{remaining}</span>
                <span className="text-xl text-white/50"> / {total}L</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pctLeft}%`,
                    background: pctLeft > 50
                      ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                      : pctLeft > 20
                        ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                        : 'linear-gradient(90deg, #ef4444, #f87171)',
                  }}
                />
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="glass rounded-xl py-2 px-1">
                  <p className="text-xs text-white/40 mb-0.5">Total</p>
                  <p className="font-bold text-white text-sm">{total}L</p>
                </div>
                <div className="glass rounded-xl py-2 px-1">
                  <p className="text-xs text-white/40 mb-0.5">Used</p>
                  <p className="font-bold text-orange-300 text-sm">{used}L</p>
                </div>
                <div className="glass rounded-xl py-2 px-1">
                  <p className="text-xs text-white/40 mb-0.5">Left</p>
                  <p className="font-bold text-green-300 text-sm">{remaining}L</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
