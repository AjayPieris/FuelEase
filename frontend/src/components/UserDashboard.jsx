import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Smartphone,
  Fuel,
  Plus,
  Car,
  Clock,
  CheckCircle,
  LayoutDashboard,
  History,
  Download,
  AlertCircle,
  Bike,
  Bus,
  Truck,
  User,
} from "lucide-react";
import api from "../api/axios";

const VEHICLE_TYPES = [
  { value: "Motorcycles", label: "Motorcycles", quota: 5 },
  { value: "Cars / Three-Wheelers", label: "Cars / Three-Wheelers", quota: 15 },
  { value: "Vans", label: "Vans", quota: 40 },
  { value: "Buses", label: "Buses", quota: 60 },
  { value: "Land Vehicles", label: "Land Vehicles", quota: 25 },
];

export default function UserDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [quota, setQuota] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard", "vehicles", "quotas", "history", "add_vehicle"
  const [user, setUser] = useState({});

  // Registration form
  const [fullName, setFullName] = useState("");
  const [nicNumber, setNicNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [chassisNumber, setChassisNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("Motorcycles");
  const [regError, setRegError] = useState("");

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("fuelease_user")) || {};
      setUser(u);
    } catch (e) {}

    fetchUserData();
    const interval = setInterval(fetchUserData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserData = async () => {
    try {
      const vehicleRes = await api.get("/vehicle");
      const vehicleList = Array.isArray(vehicleRes.data)
        ? vehicleRes.data
        : vehicleRes.data
          ? [vehicleRes.data]
          : [];
      setVehicles(vehicleList);

      const [quotaRes, historyRes] = await Promise.all([
        api.get("/quota").catch(() => ({ data: null })),
        api.get("/history").catch(() => ({ data: [] })),
      ]);
      setQuota(quotaRes.data);
      setHistory(historyRes.data || []);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterVehicle = async (e) => {
    e.preventDefault();
    setRegError("");
    try {
      await api.post("/vehicles", {
        vehicle_number: vehicleNumber,
        fuel_type: vehicleType,
        chassis_number: chassisNumber,
        full_name: fullName,
        nic_number: nicNumber,
      });
      setActiveTab("dashboard");
      setVehicleNumber("");
      setChassisNumber("");
      setFullName("");
      setNicNumber("");
      fetchUserData();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setRegError(error.response?.data?.message || "Error registering vehicle");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh] pt-24">
        <div className="bg-white/50 backdrop-blur-md px-10 py-8 rounded-3xl text-slate-800 text-lg font-bold shadow-sm animate-pulse">
          Loading Command Center...
        </div>
      </div>
    );

  const vehicle = vehicles[selectedIdx] || null;
  const vehicleQuota = vehicle
    ? quota?.vehicles_quota?.find((q) => q.id === vehicle?.id)
    : null;
  const total = Number(
    vehicleQuota?.weekly_quota ||
      (vehicle
        ? VEHICLE_TYPES.find(
            (v) =>
              v.value === vehicle.vehicle_type || v.value === vehicle.fuel_type,
          )?.quota || 0
        : 0),
  );
  const remaining = Number(vehicleQuota?.remaining_quota || total);
  const used = total - remaining;
  const pctLeft = total > 0 ? (remaining / total) * 100 : 0;

  const showRegisterForm = activeTab === "add_vehicle" || vehicles.length === 0;
  const showQuota = activeTab === "quotas";
  const showHistory = activeTab === "history";
  const showFuelPass = activeTab === "dashboard";

  const getVehicleIcon = (type) => {
    switch (type) {
      case "Motorcycles":
        return <Bike className="w-[20px] h-[20px]" />;
      case "Buses":
        return <Bus className="w-[20px] h-[20px]" />;
      case "Vans":
      case "Land Vehicles":
        return <Truck className="w-[20px] h-[20px]" />;
      case "Cars / Three-Wheelers":
      default:
        return <Car className="w-[20px] h-[20px]" />;
    }
  };

  return (
    <div className="min-h-screen relative w-full flex bg-[#F8F9FD] font-sans animate-fade-in overflow-x-hidden pb-16">
      <div className="flex flex-col lg:flex-row w-full max-w-[1300px] mx-auto pt-8 lg:pt-10 pb-12 gap-8 px-4 lg:px-8">
        {/* === SIDEBAR === */}
        <aside className="flex flex-col w-full lg:w-[260px] shrink-0 gap-6 h-fit lg:sticky lg:top-10 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <div className="bg-white rounded-[2rem] px-5 py-4 flex items-center gap-4 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-0.5 duration-300">
            <div className="w-10 h-10 rounded-full bg-[#11153D] flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
              {(user?.profile_picture_url || user?.profile_photo_url || user?.avatar || user?.image) ? (
                <img 
                  src={user.profile_picture_url || user.profile_photo_url || user.avatar || user.image} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User className="w-[18px] h-[18px] text-white" />
              )}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[15px] font-black text-[#11153d] leading-none truncate">
                {user?.name || "user 1"}
              </span>
            </div>
          </div>

          <nav className="flex flex-col gap-2 relative z-10 w-full mt-2">
            <button
              type="button"
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-4 px-6 py-[16px] rounded-[2rem] font-bold transition-all w-full cursor-pointer z-10 text-[15px] ${activeTab === 'dashboard' ? 'bg-[#11153D] text-white shadow-[0_10px_20px_-5px_rgba(17,21,61,0.4)]' : 'text-[#A1A5B7] hover:text-[#11153D] hover:bg-white/50'}`}
            >
              <LayoutDashboard className={`w-[22px] h-[22px] ${activeTab === 'dashboard' ? 'text-white/50' : ''}`} /> Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("vehicles")}
              className={`flex items-center gap-4 px-6 py-[16px] rounded-[2rem] font-bold transition-all w-full cursor-pointer z-10 text-[15px] ${activeTab === 'vehicles' ? 'bg-[#11153D] text-white shadow-[0_10px_20px_-5px_rgba(17,21,61,0.4)]' : 'text-[#A1A5B7] hover:text-[#11153D] hover:bg-white/50'}`}
            >
              <Car className={`w-[22px] h-[22px] ${activeTab === 'vehicles' ? 'text-white/50' : ''}`} /> Vehicles
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("quotas")}
              className={`flex items-center gap-4 px-6 py-[16px] rounded-[2rem] font-bold transition-all w-full cursor-pointer z-10 text-[15px] ${activeTab === 'quotas' ? 'bg-[#11153D] text-white shadow-[0_10px_20px_-5px_rgba(17,21,61,0.4)]' : 'text-[#A1A5B7] hover:text-[#11153D] hover:bg-white/50'}`}
            >
              <Fuel className={`w-[22px] h-[22px] ${activeTab === 'quotas' ? 'text-white/50' : ''}`} /> Quotas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-4 px-6 py-[16px] rounded-[2rem] font-bold transition-all w-full cursor-pointer z-10 text-[15px] ${activeTab === 'history' ? 'bg-[#11153D] text-white shadow-[0_10px_20px_-5px_rgba(17,21,61,0.4)]' : 'text-[#A1A5B7] hover:text-[#11153D] hover:bg-white/50'}`}
            >
              <History className={`w-[22px] h-[22px] ${activeTab === 'history' ? 'text-white/50' : ''}`} /> History
            </button>
          </nav>

          <button
            type="button"
            onClick={() => setActiveTab("add_vehicle")}
            className="mt-6 bg-[#69F0AE] hover:bg-[#52e89f] text-[#0A2616] font-black px-6 py-[16px] rounded-[2rem] flex items-center justify-center transition-all duration-300 w-[200px] shadow-[0_10px_20px_-5px_rgba(105,240,174,0.4)] hover:-translate-y-0.5 text-[15px]"
          >
            Add Vehicle
          </button>
        </aside>

        {/* === MAIN CONTENT === */}
        <main className="flex-1 flex flex-col gap-8 w-full min-w-0">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            <div>
              <h1 className="text-[32px] md:text-[38px] font-black text-[#11153D] leading-[1.1] tracking-tight">
                Welcome,
                <br />
                <span className="text-[#11153D] truncate block max-w-xs md:max-w-md">
                  {user?.name || "Driver"}
                </span>
              </h1>
              <p className="text-[#A1A5B7] font-semibold mt-3 text-[14px]">
                {vehicles.length > 0
                  ? "Your fleet is ready for the road."
                  : "Register a vehicle to begin."}
              </p>
            </div>

            {vehicles.length > 0 && (
              <div className="flex flex-col md:items-end justify-center">
                <span className="text-[10px] font-black text-[#A1A5B7] uppercase tracking-widest mb-2 pl-2">
                  Active Vehicle
                </span>
                <div className="bg-white rounded-full pl-3 pr-5 py-2.5 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] flex items-center gap-4 min-h-[56px] min-w-[200px] border border-slate-50 transition-all hover:border-slate-200 relative cursor-pointer">
                  <select
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 outline-none"
                    value={selectedIdx}
                    onChange={(e) => setSelectedIdx(Number(e.target.value))}
                  >
                    {vehicles.map((v, i) => (
                      <option key={i} value={i}>
                        {v.vehicle_number}
                      </option>
                    ))}
                  </select>

                  <div className="w-[38px] h-[38px] rounded-full bg-[#E8FFF3] flex items-center justify-center text-[#2E8B57] shrink-0">
                    {vehicle ? getVehicleIcon(vehicle.fuel_type || vehicle.vehicle_type) : <Car className="w-[20px] h-[20px]" />}
                  </div>
                  <div className="flex flex-col flex-1 justify-center pr-2">
                    <span className="font-black text-[#11153D] text-[15px] leading-tight tracking-wide z-10 pointer-events-none block">
                      {vehicle?.vehicle_number || "Select"}
                    </span>
                    <span className="text-[11px] font-bold text-[#A1A5B7] leading-none mt-1 z-10 pointer-events-none block">
                      {vehicle?.fuel_type || "Vehicle"}
                    </span>
                  </div>
                  <div className="pointer-events-none text-[#A1A5B7] shrink-0 pr-1">
                    <svg width="12" height="7" viewBox="0 0 10 6" fill="none">
                      <path
                        d="M1 1L5 5L9 1"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </header>

          <div className="flex flex-col gap-10 items-center w-full min-w-0 mt-8">
              {/* QUOTA CARD */}
              {showQuota && vehicle && vehicle.status !== "rejected" && (
                <div className="bg-white w-full max-w-3xl rounded-[2.5rem] p-8 lg:p-10 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden transition-all duration-500 animate-scale-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-[22px] font-black text-[#11153D] tracking-tight flex items-center gap-2">
                        <span className="bg-[#4285F4] text-white px-2 py-0.5 rounded-md text-[20px] leading-tight font-black">Weekly</span> Quota
                      </h3>
                      <p className="text-[13px] font-semibold text-[#A1A5B7] mt-1.5">
                        Resets in 2 days, 4 hours
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-[3rem] font-black text-[#11153D] leading-none tracking-tighter flex items-end justify-end">
                        {remaining}
                        <span className="text-[1.5rem] text-[#A1A5B7] ml-1 font-[800] pb-1">
                          L
                        </span>
                      </div>
                      <p className="font-bold text-[10px] text-[#2E8B57] bg-emerald-50 uppercase tracking-widest mt-3 inline-block px-3 py-1.5 rounded-full text-center">
                        Remaining
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-[12px] bg-[#F4F5F8] rounded-full mb-8 overflow-hidden relative z-10 flex">
                    <div
                      className="h-full bg-[#69F0AE] rounded-full transition-all duration-[1500ms] ease-out shadow-sm"
                      style={{ width: `${pctLeft}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center px-2">
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-[9px] font-black text-[#A1A5B7] uppercase tracking-widest">
                        Total
                      </span>
                      <span className="text-[#11153D] font-black text-[17px]">
                        {total}L
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1 border-x border-[#EAECEF] px-10 xs:px-14 md:px-24">
                      <span className="text-[9px] font-black text-[#A1A5B7] uppercase tracking-widest">
                        Used
                      </span>
                      <span className="text-[#F1416C] font-black text-[17px]">
                        {used > 0 ? `${used.toFixed(1)}L` : "0.0L"}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[9px] font-black text-[#A1A5B7] uppercase tracking-widest">
                        Efficiency
                      </span>
                      <span className="text-[#2E8B57] font-black text-[17px]">
                        High
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* USAGE HISTORY CARD */}
              {showHistory && (!vehicle ||
                vehicle.status === "approved" ||
                history.length > 0) && (
                <div className="w-full max-w-4xl mt-4 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                  <div className="flex justify-between items-end mb-6 px-1">
                    <h3 className="text-[20px] font-black text-[#11153D] tracking-tight">
                      Usage History
                    </h3>
                    <button className="text-[#2E8B57] hover:text-emerald-700 font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                      Export PDF{" "}
                      <Download className="w-3.5 h-3.5" strokeWidth={3} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    {history.length > 0 ? (
                      history.map((tx) => (
                        <div
                          key={tx.id}
                          className="bg-white rounded-[1.5rem] p-5 py-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-[46px] h-[46px] rounded-2xl bg-[#F8F9FD] flex items-center justify-center shrink-0">
                              <Fuel className="w-5 h-5 text-[#11153D]" />
                            </div>
                            <div className="flex flex-col">
                              <h4 className="font-black text-[13px] text-[#11153D] mb-1">
                                {tx.station?.name ||
                                  `Station #${tx.station_id || ""}`}
                              </h4>
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#A1A5B7]">
                                <span className="flex items-center justify-center">
                                  <Clock className="w-3 h-3" />
                                </span>
                                {new Date(tx.created_at).toLocaleString([], {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}{" "}
                                •{" "}
                                {new Date(tx.created_at).toLocaleString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <p className="text-[#F1416C] font-black text-[17px] mb-0.5">
                              -{tx.liters_deducted}{" "}
                              <span className="text-[13px]">L</span>
                            </p>
                            <p className="text-[9px] font-black text-[#A1A5B7] uppercase tracking-widest mt-1">
                              Deducted
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white rounded-[2rem] p-8 text-center text-[#A1A5B7] font-bold text-[13px]">
                        No refuel history.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* FUELPASS CARD */}
              {showFuelPass && vehicle && vehicle.status === "approved" && (
                <div className="bg-[#11153D] w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-scale-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                  <div className="flex justify-between items-center mb-8 relative z-10">
                    <h3 className="text-[20px] font-black text-white italic tracking-tighter">
                      FuelPass
                    </h3>
                  </div>

                  <div className="bg-white rounded-[2rem] p-[20px] aspect-square w-full mx-auto mb-8 relative z-10 flex items-center justify-center">
                    <QRCodeSVG
                      value={vehicle?.qr_code || "FUELEASE"}
                      size={400}
                      className="w-full h-full"
                      bgColor="#ffffff"
                      fgColor="#11153D"
                      level="Q"
                    />
                  </div>

                  <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 px-6 mb-8 relative z-10 border border-white/5">
                    <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mb-1.5">
                      Pass Identity
                    </p>
                    <p className="text-[#69F0AE] font-mono text-[14px] leading-[1.3] font-bold tracking-[0.05em] break-all max-h-[40px] overflow-hidden text-center flex items-center justify-center">
                      {vehicle?.qr_code || vehicle?.vehicle_number || "FUELEASE"}
                    </p>
                  </div>

                  <div className="flex justify-between items-end relative z-10 px-1">
                    <div>
                      <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mb-2">
                        Expires
                      </p>
                      <p className="text-white text-[13px] font-bold">
                        12 / 2025
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mb-2">
                        Status
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#69F0AE]"></span>
                        <span className="text-[#69F0AE] text-[13px] font-black tracking-wider">
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VEHICLE DETAILS CARD (Only on Vehicles Tab) */}
              {activeTab === "vehicles" && vehicle && vehicle.status === "approved" && (
                <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden animate-scale-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                   <div className="flex items-center gap-4 mb-6">
                     <div className="w-[42px] h-[42px] rounded-[13px] bg-[#E8EAEF] flex items-center justify-center text-[#11153D] shrink-0">
                       {vehicle ? getVehicleIcon(vehicle.fuel_type || vehicle.vehicle_type) : <Car className="w-[20px] h-[20px]" />}
                     </div>
                     <h3 className="text-[18px] font-black text-[#11153D] tracking-tight">
                        Vehicle Details
                     </h3>
                   </div>
                   
                   <div className="flex flex-col gap-5">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-[#A1A5B7] uppercase tracking-widest mb-1">Fuel Type</span>
                        <span className="font-bold text-[#11153D] text-[14px]">{vehicle.fuel_type || vehicle.vehicle_type}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-[#A1A5B7] uppercase tracking-widest mb-1">Chassis Number</span>
                        <span className="font-black font-mono text-[#4285F4] text-[13px]">{vehicle.chassis_number || "N/A"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-[#A1A5B7] uppercase tracking-widest mb-1">Registered Owner (NIC)</span>
                        <span className="font-bold text-[#11153D] text-[14px] uppercase tracking-wide">{vehicle.nic_number || "N/A"}</span>
                      </div>
                   </div>
                </div>
              )}

              {/* REGISTER VEHICLE FORM */}
              {showRegisterForm && (
                <div className="bg-[#F4F5F8] w-full max-w-xl mx-auto rounded-[2.5rem] p-10 pt-11 border border-[#EAECEF] animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-[46px] h-[46px] rounded-[14px] bg-[#69F0AE] flex items-center justify-center shrink-0">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#11153D"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </div>
                    <div className="flex flex-col pb-1">
                      <h3 className="text-[20px] font-black text-[#11153D] leading-none mb-1.5">
                        Register Vehicle
                      </h3>
                      <p className="text-[11px] font-bold text-[#A1A5B7]">
                        Add a new unit to your fleet
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={handleRegisterVehicle}
                    className="flex flex-col gap-5"
                  >
                    <div className="flex flex-col">
                      <label className="text-[9px] font-[800] text-[#A1A5B7] tracking-[0.1em] uppercase mb-2 ml-1">
                        Full Name (As Per NIC)
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full bg-[#E8EAEF] border-none rounded-2xl px-5 py-4 text-[13px] font-bold text-[#11153D] outline-none placeholder-[#A1A5B7]"
                        placeholder="Alexander Graham"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="text-[9px] font-[800] text-[#A1A5B7] tracking-[0.1em] uppercase mb-2 ml-1">
                          NIC Number
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full bg-[#E8EAEF] border-none rounded-2xl px-5 py-4 text-[13px] font-bold text-[#11153D] outline-none placeholder-[#A1A5B7] uppercase"
                          placeholder="981234567"
                          value={nicNumber}
                          onChange={(e) => setNicNumber(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[9px] font-[800] text-[#A1A5B7] tracking-[0.1em] uppercase mb-2 ml-1">
                          Vehicle Number
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full bg-[#E8EAEF] border-none rounded-2xl px-5 py-4 text-[13px] font-bold text-[#11153D] outline-none placeholder-[#A1A5B7] uppercase"
                          placeholder="CBA-1234"
                          value={vehicleNumber}
                          onChange={(e) => setVehicleNumber(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[9px] font-[800] text-[#A1A5B7] tracking-[0.1em] uppercase mb-2 ml-1">
                        Chassis Number
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full bg-[#E8EAEF] border-none rounded-2xl px-5 py-4 text-[13px] font-bold text-[#11153D] outline-none placeholder-[#A1A5B7] uppercase"
                        placeholder="MD2A1234567890"
                        value={chassisNumber}
                        onChange={(e) => setChassisNumber(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col mb-2">
                      <label className="text-[9px] font-[800] text-[#A1A5B7] tracking-[0.1em] uppercase mb-2 ml-1">
                        Vehicle Type
                      </label>
                      <div className="relative">
                        <select
                          className="w-full bg-[#E8EAEF] border-none rounded-2xl px-5 py-4 text-[13px] font-bold text-[#11153D] outline-none appearance-none cursor-pointer pr-10"
                          value={vehicleType}
                          onChange={(e) => setVehicleType(e.target.value)}
                        >
                          {VEHICLE_TYPES.map((vt) => (
                            <option key={vt.value} value={vt.value}>
                              {vt.value}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#A1A5B7]">
                          <svg
                            width="10"
                            height="6"
                            viewBox="0 0 10 6"
                            fill="none"
                          >
                            <path
                              d="M1 1L5 5L9 1"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#11153D] text-white font-bold rounded-[2rem] py-5 mt-2 transition-transform hover:-translate-y-0.5 text-[13px] shadow-[0_10px_20px_-5px_rgba(17,21,61,0.4)]"
                    >
                      Complete Registration
                    </button>
                    {vehicles.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("dashboard")}
                        className="w-full text-[#A1A5B7] font-black hover:text-[#11153D] text-xs pt-1 pb-2"
                      >
                        Cancel
                      </button>
                    )}
                  </form>
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}
