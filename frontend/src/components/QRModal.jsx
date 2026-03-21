import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, Fuel, X } from 'lucide-react';
import api from '../api/axios';

export default function QRModal({ onClose }) {
  const [vehicle, setVehicle] = useState(null);
  const [quota, setQuota]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    Promise.all([api.get('/vehicle'), api.get('/quota')])
      .then(([vRes, qRes]) => {
        setVehicle(vRes.data || null);
        setQuota(qRes.data || null);
      })
      .catch((err) => {
        console.error('Error loading QR data', err);
        setError('Could not load vehicle data.');
      })
      .finally(() => setLoading(false));
  }, []);

  const used      = quota ? (quota.weekly_quota - quota.remaining_quota) : 0;
  const total     = quota?.weekly_quota    ?? 0;
  const remaining = quota?.remaining_quota ?? 0;
  const pctLeft   = total > 0 ? Math.round((remaining / total) * 100) : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="solid-card modal-card w-full max-w-sm mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-500" /> My Fuel QR
            </h2>
            {vehicle && <p className="text-slate-400 text-sm mt-0.5">{vehicle.vehicle_number} · {vehicle.fuel_type}</p>}
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 font-medium">Loading…</div>
        ) : error ? (
          <div className="py-16 text-center text-red-400 font-medium">{error}</div>
        ) : !vehicle ? (
          <div className="py-16 text-center text-slate-400 font-medium">No vehicle registered yet.</div>
        ) : (
          <div className="px-6 pb-8 flex flex-col items-center gap-6">
            {/* QR Code */}
            <div className="bg-slate-900 rounded-2xl p-5 flex flex-col items-center gap-3 mt-4">
              <QRCodeSVG
                value={vehicle.qr_code || 'NO-QR'}
                size={180}
                bgColor="transparent"
                fgColor="#ffffff"
                level="H"
              />
              <p className="text-white/50 text-xs font-mono tracking-widest text-center select-all break-all">
                {vehicle.qr_code}
              </p>
            </div>

            {/* Quota Section */}
            {quota && (
              <div className="w-full bg-slate-50 rounded-2xl p-5 flex flex-col gap-4">
                <p className="text-slate-500 font-bold text-sm text-center tracking-wide uppercase">Weekly Fuel Quota</p>

                <div className="text-center">
                  <span className="text-5xl font-black text-slate-800">{remaining}</span>
                  <span className="text-xl text-slate-300"> / {total}L</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
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
                  <div className="bg-white rounded-xl py-2 px-1 shadow-sm">
                    <p className="text-xs text-slate-400 mb-0.5">Total</p>
                    <p className="font-bold text-slate-700 text-sm">{total}L</p>
                  </div>
                  <div className="bg-white rounded-xl py-2 px-1 shadow-sm">
                    <p className="text-xs text-slate-400 mb-0.5">Used</p>
                    <p className="font-bold text-amber-500 text-sm">{used}L</p>
                  </div>
                  <div className="bg-white rounded-xl py-2 px-1 shadow-sm">
                    <p className="text-xs text-slate-400 mb-0.5">Left</p>
                    <p className="font-bold text-emerald-500 text-sm">{remaining}L</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
