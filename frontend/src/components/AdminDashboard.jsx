import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function AdminDashboard() {
  const [users,        setUsers]        = useState([]);
  const [stations,     setStations]     = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    try {
      const [usersRes, stationsRes, txRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stations'),
        api.get('/admin/transactions'),
      ]);
      setUsers(usersRes.data);
      setStations(stationsRes.data);
      setTransactions(txRes.data);
    } catch (err) {
      setError('Failed to load admin data. Are you sure you are an admin?');
    } finally { setLoading(false); }
  };

  const handleBlockUser = async (id, currentStatus) => {
    try {
      if (currentStatus) {
        await api.post(`/admin/users/${id}/unblock`);
      } else {
        if (!window.confirm('Block this user?')) return;
        await api.post(`/admin/users/${id}/block`);
      }
      fetchAllData();
    } catch { alert('Error updating user status'); }
  };

  const handleApproveStation = async (id) => {
    if (!window.confirm('Approve this station?')) return;
    try { await api.post(`/admin/stations/${id}/approve`); fetchAllData(); }
    catch { alert('Error approving station'); }
  };

  const handleRejectStation = async (id) => {
    const reason = window.prompt('Enter reason for rejection:');
    if (!reason) return;
    try { await api.post(`/admin/stations/${id}/reject`, { reason }); fetchAllData(); }
    catch { alert('Error rejecting station'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="glass rounded-2xl px-10 py-8 text-white/60 text-lg">Loading system data…</div>
    </div>
  );

  if (error) return (
    <div className="max-w-md mx-auto mt-10">
      <div className="glass-strong rounded-3xl p-8 text-center border-t-4 border-red-500/60">
        <p className="text-red-300 font-bold">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-7 max-w-6xl mx-auto">
      <h2 className="text-4xl font-black text-white text-center">🛡️ Administration</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── USERS TABLE ── */}
        <div className="glass-strong rounded-3xl p-6 overflow-x-auto">
          <h3 className="text-xl font-black text-violet-300 mb-4">👥 All Users</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                <th className="pb-2 pr-3">ID</th>
                <th className="pb-2 pr-3">Name</th>
                <th className="pb-2 pr-3">Role</th>
                <th className="pb-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="py-2.5 pr-3 text-white/30">{u.id}</td>
                  <td className="py-2.5 pr-3">
                    <span className="font-semibold text-white">{u.name}</span>
                    {u.is_blocked && <span className="ml-2 text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full border border-red-400/30">BLOCKED</span>}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className="text-xs text-white/50 uppercase tracking-wider">{u.role}</span>
                  </td>
                  <td className="py-2.5 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleBlockUser(u.id, u.is_blocked)}
                        className={`text-xs font-bold px-3 py-1 rounded-full border transition ${u.is_blocked ? 'bg-green-500/20 text-green-300 border-green-400/30 hover:bg-green-500/30' : 'bg-red-500/20 text-red-300 border-red-400/30 hover:bg-red-500/30'}`}
                      >
                        {u.is_blocked ? 'Unblock' : 'Block'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── STATIONS TABLE ── */}
        <div className="glass-strong rounded-3xl p-6 overflow-x-auto">
          <h3 className="text-xl font-black text-blue-300 mb-4">🏪 Fuel Stations</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                <th className="pb-2 pr-3">Station</th>
                <th className="pb-2 pr-3">Status</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stations.map(s => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="py-2.5 pr-3">
                    <p className="font-semibold text-white">{s.name}</p>
                    <p className="text-xs text-white/40">📍 {s.location}</p>
                  </td>
                  <td className="py-2.5 pr-3">
                    {s.approval_status === 'approved' && <span className="text-xs bg-green-500/20 text-green-300 px-2.5 py-1 rounded-full border border-green-400/30 font-bold">Approved</span>}
                    {s.approval_status === 'pending'  && <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2.5 py-1 rounded-full border border-yellow-400/30 font-bold">Pending</span>}
                    {s.approval_status === 'rejected' && <span className="text-xs bg-red-500/20 text-red-300 px-2.5 py-1 rounded-full border border-red-400/30 font-bold">Rejected</span>}
                  </td>
                  <td className="py-2.5 text-right">
                    {s.approval_status === 'pending' && (
                      <div className="flex gap-1.5 justify-end">
                        <button onClick={() => handleApproveStation(s.id)} className="text-xs bg-green-500/20 text-green-300 border border-green-400/30 hover:bg-green-500/30 font-bold px-3 py-1 rounded-full transition">✓ Approve</button>
                        <button onClick={() => handleRejectStation(s.id)} className="text-xs bg-red-500/20 text-red-300 border border-red-400/30 hover:bg-red-500/30 font-bold px-3 py-1 rounded-full transition">✕ Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── TRANSACTIONS TABLE ── */}
      <div className="glass-strong rounded-3xl p-6 overflow-x-auto">
        <h3 className="text-xl font-black text-green-300 mb-4">⛽ All Transactions</h3>
        {transactions.length === 0 ? (
          <p className="text-white/30 italic text-sm">No transactions recorded yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                <th className="pb-2 pr-3">Date</th>
                <th className="pb-2 pr-3">User</th>
                <th className="pb-2 pr-3">Station</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="py-2.5 pr-3 text-white/40 text-xs">{new Date(tx.created_at).toLocaleString()}</td>
                  <td className="py-2.5 pr-3 text-white/70">User #{tx.user_id}</td>
                  <td className="py-2.5 pr-3 text-white/70">Station #{tx.station_id}</td>
                  <td className="py-2.5 text-right font-black text-red-300">-{tx.liters_deducted}L</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}