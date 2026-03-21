import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function StationDashboard() {
  const [station,        setStation]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [qrCode,         setQrCode]         = useState('');
  const [liters,         setLiters]         = useState('');
  const [message,        setMessage]        = useState('');
  const [error,          setError]          = useState('');
  const [newDocumentUrl, setNewDocumentUrl] = useState('');

  useEffect(() => { fetchStationData(); }, []);

  const fetchStationData = async () => {
    try {
      const res = await api.get('/station');
      if (res.data) setStation(res.data);
    } catch (err) {
      console.error('Error fetching station', err);
    } finally { setLoading(false); }
  };

  const handleResubmitDocument = async (e) => {
    e.preventDefault();
    try {
      await api.post('/station/resubmit', { document_url: newDocumentUrl });
      fetchStationData();
      setNewDocumentUrl('');
    } catch { alert('Error resubmitting document'); }
  };

  const handleDeductFuel = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      const res = await api.post('/stations/scan', { qr_code: qrCode, liters });
      setMessage(`✅ ${liters}L deducted. User has ${res.data.remaining_quota}L remaining.`);
      setQrCode(''); setLiters('');
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction failed.');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="glass rounded-2xl px-10 py-8 text-white/60 text-lg">Loading station…</div>
    </div>
  );

  /* ── REJECTED ── */
  if (station?.approval_status === 'rejected') {
    return (
      <div className="max-w-md mx-auto">
        <div className="glass-strong rounded-3xl p-8 modal-card border-t-4 border-red-500/60">
          <h2 className="text-2xl font-black text-red-300 mb-2">❌ Station Rejected</h2>
          <p className="glass rounded-xl px-4 py-3 text-white/70 text-sm mb-4">
            Reason: <span className="font-bold text-red-300">{station.rejection_reason || 'No reason provided.'}</span>
          </p>
          <p className="text-white/50 text-sm mb-5">Please submit a new valid document URL to reapply.</p>
          <form onSubmit={handleResubmitDocument} className="flex flex-col gap-4">
            <input
              type="url" placeholder="New Document URL" required
              className="glass-input"
              value={newDocumentUrl} onChange={e => setNewDocumentUrl(e.target.value)}
            />
            <button type="submit" className="glass-btn w-full">Resubmit Document</button>
          </form>
        </div>
      </div>
    );
  }

  /* ── PENDING ── */
  if (station?.approval_status === 'pending') {
    return (
      <div className="max-w-md mx-auto">
        <div className="glass-strong rounded-3xl p-8 modal-card border-t-4 border-yellow-400/60 text-center">
          <div className="text-5xl mb-4">⏳</div>
          <h2 className="text-2xl font-black text-yellow-300 mb-3">Pending Approval</h2>
          <div className="glass rounded-2xl px-5 py-4 text-white/70 text-sm">
            Your station <span className="font-bold text-white">{station.name}</span> has been submitted. An admin is reviewing your document.
            You'll be able to scan QR codes once approved.
          </div>
        </div>
      </div>
    );
  }

  /* ── MAIN DASHBOARD ── */
  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6">

      {/* Station header */}
      <div className="glass-strong rounded-3xl p-6 text-center modal-card">
        <div className="text-4xl mb-3">⛽</div>
        <h2 className="text-3xl font-black text-white">{station?.name}</h2>
        <p className="text-white/50 text-sm mt-1">📍 {station?.location}</p>
        <div className="mt-3 inline-flex items-center gap-2 glass rounded-full px-4 py-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <span className="text-green-300 text-xs font-bold uppercase tracking-wider">Approved & Active</span>
        </div>
      </div>

      {/* Scan & Deduct form */}
      <div className="glass-strong rounded-3xl p-6">
        <h3 className="text-xl font-black text-white mb-5 text-center">📲 Scan & Deduct Fuel</h3>

        {message && (
          <div className="bg-green-500/20 border border-green-400/30 text-green-300 p-4 rounded-2xl mb-4 text-sm font-semibold text-center">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-300 p-4 rounded-2xl mb-4 text-sm font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleDeductFuel} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
              User QR Code Text
            </label>
            <input
              type="text" placeholder="e.g., QR-ABC123XYZ" required
              className="glass-input font-mono uppercase tracking-widest"
              value={qrCode} onChange={e => setQrCode(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
              Liters to Deduct
            </label>
            <input
              type="number" placeholder="Enter amount (e.g., 5)" required min="1" step="0.01"
              className="glass-input"
              value={liters} onChange={e => setLiters(e.target.value)}
            />
          </div>

          <button type="submit" className="glass-btn w-full mt-1 text-base py-3">
            ⚡ Deduct Fuel
          </button>
        </form>
      </div>
    </div>
  );
}