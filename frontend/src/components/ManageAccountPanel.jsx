import { useState } from 'react';
import api from '../api/axios';

export default function ManageAccountPanel({ onClose, user }) {
  const [name,    setName]    = useState(user?.name    || '');
  const [password, setPass]   = useState('');
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      const payload = {};
      if (name     && name !== user?.name) payload.name = name;
      if (password)                        payload.password = password;

      if (Object.keys(payload).length === 0) {
        setError('No changes to save.');
        setSaving(false);
        return;
      }

      const res = await api.put('/account', payload);
      // Update localStorage user
      const updatedUser = { ...user, ...res.data.user };
      localStorage.setItem('fuelease_user', JSON.stringify(updatedUser));
      setSuccess('Account updated successfully! 🎉');
      setPass('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update account.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-strong modal-card rounded-3xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-black text-white">⚙️ Manage Account</h2>
            <p className="text-white/50 text-xs mt-0.5">Update your name or password</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg transition">×</button>
        </div>

        {/* Avatar */}
        <div className="flex justify-center pt-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-2xl font-black text-white shadow-xl">
            {user?.name ? user.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : '?'}
          </div>
        </div>

        <form onSubmit={handleSave} className="px-6 pt-5 pb-7 flex flex-col gap-4">
          {success && (
            <div className="bg-green-500/20 border border-green-400/30 text-green-300 text-sm px-4 py-2.5 rounded-xl">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 text-red-300 text-sm px-4 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="glass-input text-sm"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">New Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPass(e.target.value)}
              className="glass-input text-sm"
              placeholder="Leave blank to keep current"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="glass-btn w-full mt-2 flex items-center justify-center gap-2"
          >
            {saving ? (
              <><span className="animate-spin">⏳</span> Saving…</>
            ) : (
              <><span>💾</span> Save Changes</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
