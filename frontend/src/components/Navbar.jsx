import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Fuel,
  QrCode,
  Users,
  MapPin,
  Settings,
  LogOut,
  Receipt,
  Menu,
  Car,
} from "lucide-react";
import StationsModal from "./StationsModal";
import QRModal from "./QRModal";
import ManageAccountPanel from "./ManageAccountPanel";
import TransactionsModal from "./TransactionsModal";
import StationStatusModal from "./StationStatusModal";
import api from "../api/axios";
import fuelEaseLogo from "../assets/FuelEaseLogo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const [showStations, setShowStations] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [stationStatus, setStationStatus] = useState("available");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const dropdownRef = useRef(null);

  // Fetch initial station status
  useEffect(() => {
    if (user?.role === "station") {
      api
        .get("/station")
        .then((res) => {
          if (res.data) {
            const sa = res.data.is_available;
            if (sa === "long_queue") setStationStatus("long_queue");
            else if (sa === false || sa === "empty" || String(sa) === "0")
              setStationStatus("empty");
            else setStationStatus("available");
          }
        })
        .catch(() => {});
    }
  }, [user?.role]);

  const statusConfig = {
    available: {
      bg: "bg-emerald-500",
      ping: "bg-emerald-400",
      text: "Station Active",
    },
    long_queue: {
      bg: "bg-amber-500",
      ping: "bg-amber-400",
      text: "Long Queue",
    },
    empty: { bg: "bg-rose-500", ping: "bg-rose-400", text: "Station Empty" },
  };
  const currentStatusConfig =
    statusConfig[stationStatus] || statusConfig.available;

  useEffect(() => {
    const sync = () => {
      setToken(localStorage.getItem("fuelease_token"));
      try {
        const u = JSON.parse(localStorage.getItem("fuelease_user"));
        setUser(u);
      } catch {
        setUser(null);
      }
    };
    sync();
    window.addEventListener("storage", sync);
    const interval = setInterval(sync, 500);
    return () => {
      window.removeEventListener("storage", sync);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("fuelease_token");
    localStorage.removeItem("fuelease_user");
    setToken(null);
    setUser(null);
    navigate("/");
  };

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.name
    ? user.name
        .trim()
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  // Role-aware branding
  const brandText =
    user?.role === "station"
      ? "Station Portal"
      : user?.role === "admin"
        ? "Admin Portal"
        : null;

  return (
    <>
      {/* ── Liquid Glass Navbar ── */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl glass rounded-2xl rounded-bl-3xl rounded-br-3xl px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          <img
            src={fuelEaseLogo}
            alt="FuelEase Logo"
            className="h-12 sm:h-14 w-auto object-contain"
          />
          <span className="text-xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-violet-300 to-blue-300 bg-clip-text text-transparent">
              FuelEase
            </span>
          </span>
          {brandText && (
            <span className="text-white/40 text-sm font-semibold ml-1 hidden sm:inline">
              | {brandText}
            </span>
          )}
        </button>

        {/* Right side */}
        {token ? (
          <div className="flex items-center gap-1">
            {/* Admin nav links */}
            {user?.role === "admin" && (
              <>
                <button
                  onClick={() => navigate("/admin/users")}
                  className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/10 transition"
                >
                  <Users className="w-4 h-4" /> Users
                </button>
                <button
                  onClick={() => navigate("/admin/vehicles")}
                  className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/10 transition"
                >
                  <Car className="w-4 h-4" /> Vehicles
                </button>
                <button
                  onClick={() => navigate("/admin/stations")}
                  className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/10 transition"
                >
                  <MapPin className="w-4 h-4" /> Stations
                </button>
              </>
            )}

            {/* User nav links */}
            {user?.role === "user" && (
              <>
                <button
                  onClick={() => setShowStations(true)}
                  className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/10 transition"
                >
                  <Fuel className="w-4 h-4" /> Fuel Stations
                </button>
                <button
                  onClick={() => setShowQR(true)}
                  className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/10 transition"
                >
                  <QrCode className="w-4 h-4" /> My QR
                </button>
              </>
            )}

            {/* Station nav links */}
            {user?.role === "station" && (
              <>
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/10 transition"
                >
                  <span className="relative flex h-2.5 w-2.5 mr-0.5">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentStatusConfig.ping}`}
                    ></span>
                    <span
                      className={`relative inline-flex rounded-full h-2.5 w-2.5 ${currentStatusConfig.bg}`}
                    ></span>
                  </span>
                  {currentStatusConfig.text}
                </button>
                <button
                  onClick={() => setShowTransactions(true)}
                  className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/10 transition"
                >
                  <Receipt className="w-4 h-4" /> Transactions
                </button>
              </>
            )}

            {/* Avatar */}
            <div className="relative ml-1" ref={dropdownRef}>
              <button
                id="avatar-btn"
                onClick={() => setShowDropdown((d) => !d)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-sm font-black text-white shadow-lg hover:scale-110 transition-transform overflow-hidden"
              >
                {user?.profile_picture_url ? (
                  <img
                    src={user.profile_picture_url}
                    alt="avatar"
                    className="w-9 h-9 rounded-full object-cover bg-white"
                  />
                ) : user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt="avatar"
                    className="w-9 h-9 rounded-full object-cover bg-white"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 top-12 w-52 glass-strong rounded-2xl overflow-hidden py-2 shadow-2xl z-50 modal-card">
                  <div className="px-4 py-2.5 border-b border-white/10 mb-1">
                    <p className="text-sm font-bold text-white truncate">
                      {user?.name ?? "User"}
                    </p>
                    <p className="text-xs text-white/40 truncate">
                      {user?.email}
                    </p>
                  </div>

                  {/* Mobile-only links */}
                  {user?.role === "admin" && (
                    <>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          navigate("/admin/users");
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition flex items-center gap-2.5 sm:hidden"
                      >
                        <Users className="w-4 h-4" /> Users
                      </button>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          navigate("/admin/stations");
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition flex items-center gap-2.5 sm:hidden"
                      >
                        <MapPin className="w-4 h-4" /> Stations
                      </button>
                    </>
                  )}

                  {user?.role === "user" && (
                    <>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          setShowStations(true);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition flex items-center gap-2.5 sm:hidden"
                      >
                        <Fuel className="w-4 h-4" /> Fuel Stations
                      </button>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          setShowQR(true);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition flex items-center gap-2.5 sm:hidden"
                      >
                        <QrCode className="w-4 h-4" /> My QR
                      </button>
                    </>
                  )}

                  {user?.role === "station" && (
                    <>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          setShowStatusModal(true);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition flex items-center gap-2.5 sm:hidden"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${currentStatusConfig.bg} animate-pulse`}
                        ></span>
                        {currentStatusConfig.text}
                      </button>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          setShowTransactions(true);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition flex items-center gap-2.5 sm:hidden"
                      >
                        <Receipt className="w-4 h-4" /> Transactions
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setShowManage(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition flex items-center gap-2.5"
                  >
                    <Settings className="w-4 h-4" /> Manage Account
                  </button>

                  <div className="border-t border-white/10 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-300 hover:text-red-200 hover:bg-red-500/10 transition flex items-center gap-2.5"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/")}
            className="glass-btn text-sm py-2 px-5"
          >
            Login
          </button>
        )}
      </nav>

      {/* ── Modals ── */}
      {showStations && <StationsModal onClose={() => setShowStations(false)} />}
      {showQR && <QRModal onClose={() => setShowQR(false)} />}
      {showManage && (
        <ManageAccountPanel onClose={() => setShowManage(false)} user={user} />
      )}
      {showTransactions && (
        <TransactionsModal onClose={() => setShowTransactions(false)} />
      )}
      {showStatusModal && (
        <StationStatusModal
          onClose={() => setShowStatusModal(false)}
          user={user}
          stationStatus={stationStatus}
          setStationStatus={setStationStatus}
        />
      )}
    </>
  );
}
