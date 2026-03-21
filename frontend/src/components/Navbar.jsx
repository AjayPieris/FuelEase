import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StationsModal from './StationsModal';
import QRModal from './QRModal';
import ManageAccountPanel from './ManageAccountPanel';

export default function Navbar() {
  const navigate = useNavigate();
  const [showStations, setShowStations] = useState(false);
  const [showQR, setShowQR]             = useState(false);
  const [showManage, setShowManage]     = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser]                 = useState(null);
  const [token, setToken]               = useState(null);
  const dropdownRef = useRef(null);

  // Sync from localStorage on mount and on every navigation
  useEffect(() => {
    const sync = () => {
      setToken(localStorage.getItem('fuelease_token'));
      try {
        const u = JSON.parse(localStorage.getItem('fuelease_user'));
        setUser(u);
      } catch { setUser(null); }
    };
    sync();
    window.addEventListener('storage', sync);
    // Also poll in case same-tab changes aren't caught
    const interval = setInterval(sync, 500);
    return () => { window.removeEventListener('storage', sync); clearInterval(interval); };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('fuelease_token');
    localStorage.removeItem('fuelease_user');
    setToken(null); setUser(null);
    navigate('/');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Avatar initials fallback
  const initials = user?.name
    ? user.name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <>
      {/* ── Floating Pill Navbar ── */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl glass rounded-2xl px-6 py-3 flex items-center justify-between">

        {/* Brand */}
        <button
          onClick={() => navigate('/')}
          className="text-xl font-black tracking-tight text-white flex items-center gap-2 hover:opacity-80 transition"
        >
          <span className="text-2xl">⛽</span>
          <span className="bg-gradient-to-r from-violet-300 to-blue-300 bg-clip-text text-transparent">FuelEase</span>
        </button>

        {/* Right side – logged in */}
        {token ? (
          <div className="flex items-center gap-1">

            {/* Fuel Stations button */}
            <button
              onClick={() => setShowStations(true)}
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/10 transition"
            >
              <span>🏪</span> Fuel Stations
            </button>

            {/* QR button – only for vehicle owners */}
            {user?.role === 'user' && (
              <button
                onClick={() => setShowQR(true)}
                className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/10 transition"
              >
                <span>📱</span> My QR
              </button>
            )}

            {/* Avatar bubble */}
            <div className="relative ml-1" ref={dropdownRef}>
              <button
                id="avatar-btn"
                onClick={() => setShowDropdown(d => !d)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-sm font-black text-white shadow-lg hover:scale-110 transition-transform overflow-hidden"
              >
                {user?.profile_picture_url ? (
                  <img src={user.profile_picture_url} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 top-12 w-52 glass-strong rounded-2xl overflow-hidden py-2 shadow-2xl z-50 modal-card">
                  {/* User info header */}
                  <div className="px-4 py-2.5 border-b border-white/10 mb-1">
                    <p className="text-sm font-bold text-white truncate">{user?.name ?? 'User'}</p>
                    <p className="text-xs text-white/40 truncate">{user?.email}</p>
                  </div>

                  {/* Mobile-only links */}
                  {user?.role === 'user' && (
                    <>
                      <button
                        onClick={() => { setShowDropdown(false); setShowStations(true); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition flex items-center gap-2.5 sm:hidden"
                      >🏪 Fuel Stations</button>
                      <button
                        onClick={() => { setShowDropdown(false); setShowQR(true); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition flex items-center gap-2.5 sm:hidden"
                      >📱 My QR</button>
                    </>
                  )}

                  {/* Manage Account */}
                  <button
                    onClick={() => { setShowDropdown(false); setShowManage(true); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition flex items-center gap-2.5"
                  >⚙️ Manage Account</button>

                  {/* Logout */}
                  <div className="border-t border-white/10 mt-1 pt-1">
                    <button
                      onClick={() => { setShowDropdown(false); handleLogout(); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-300 hover:text-red-200 hover:bg-red-500/10 transition flex items-center gap-2.5"
                    >🚪 Logout</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button onClick={() => navigate('/')} className="glass-btn text-sm py-2 px-5">
            Login
          </button>
        )}
      </nav>

      {/* ── Modals ── */}
      {showStations && <StationsModal onClose={() => setShowStations(false)} />}
      {showQR       && <QRModal       onClose={() => setShowQR(false)} />}
      {showManage   && <ManageAccountPanel onClose={() => setShowManage(false)} user={user} />}
    </>
  );
}