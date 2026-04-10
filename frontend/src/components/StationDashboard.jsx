import { useState, useEffect } from "react";
import { 
  MapPin, CheckCircle, Zap, AlertTriangle, XCircle, FileText,
  LayoutDashboard, Fuel, Users, IdCard, BarChart2, LogOut,
  Check, Hourglass, X
} from "lucide-react";
import api from "../api/axios";

export default function StationDashboard() {
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState("");
  const [liters, setLiters] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newDocumentUrl, setNewDocumentUrl] = useState("");
  const [user, setUser] = useState(null);
  const [stationStatus, setStationStatus] = useState("available");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchStationData();
    const interval = setInterval(fetchStationData, 5000);
    try {
      setUser(JSON.parse(localStorage.getItem("fuelease_user")));
    } catch {}
    
    return () => clearInterval(interval);
  }, []);

  const fetchStationData = async () => {
    try {
      const res = await api.get("/station");
      if (res.data) {
        setStation(res.data);
        const sa = res.data.is_available;
        if (sa === "long_queue") setStationStatus("long_queue");
        else if (sa === false || sa === "empty" || String(sa) === "0") setStationStatus("empty");
        else setStationStatus("available");
      }
    } catch (err) {
      console.error("Error fetching station", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResubmitDocument = async (e) => {
    e.preventDefault();
    try {
      await api.post("/station/resubmit", { document_url: newDocumentUrl });
      fetchStationData();
      setNewDocumentUrl("");
    } catch {
      alert("Error resubmitting document");
    }
  };

  const handleDeductFuel = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await api.post("/stations/scan", { qr_code: qrCode, liters });
      setMessage(`${liters}L deducted. User has ${res.data.remaining_quota}L remaining.`);
      setQrCode("");
      setLiters("");
    } catch (err) {
      setError(err.response?.data?.message || "Transaction failed.");
    }
  };

  const handleStatusUpdate = async (statusVal) => {
    try {
      await api.patch("/station/availability", { is_available: statusVal });
    } catch (e) {
      console.log("Error updating status, updating locally instead", e);
    } finally {
      setStationStatus(statusVal);
    }
  };

  /* ── MAIN DASHBOARD ── */
  const statusOptions = [
    { value: "available",  label: "Available",     desc: "No wait, multiple pumps open",  icon: CheckCircle, color: "emerald", bg: "bg-emerald-50", text: "text-emerald-500" },
    { value: "long_queue", label: "Long Queue",    desc: "Estimated wait time 15+ mins",  icon: Hourglass,   color: "amber",   bg: "bg-amber-50",   text: "text-amber-500" },
    { value: "empty",      label: "Station Empty", desc: "Fuel outage or maintenance",    icon: XCircle,     color: "red",     bg: "bg-red-50",     text: "text-red-500" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("fuelease_token");
    localStorage.removeItem("fuelease_user");
    window.location.href = "/";
  };

  const getNavClass = (tab) => {
    if (activeTab === tab) {
      return "flex items-center gap-4 bg-[#11153D] text-white px-8 py-5 rounded-[2rem] font-bold text-[15px] shadow-[0_10px_20px_-10px_rgba(17,21,61,0.5)] w-[calc(100%+32px)] -ml-4 relative z-10 transition-all duration-300";
    }
    return "flex items-center gap-4 text-[#A1A5B7] hover:bg-white hover:text-[#11153D] px-8 py-5 rounded-[2rem] font-bold text-[15px] transition-all w-full duration-300";
  };

  return (
    <div className="min-h-screen relative w-full flex bg-[#F8F9FD] font-sans overflow-x-hidden">
      {/* TOAST NOTIFICATION - SUCCESS */}
      {message && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up" style={{ animationFillMode: 'both' }}>
           <div className="bg-white rounded-full shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 flex items-center pr-4 overflow-hidden relative">
             <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-[#69F0AE] rounded-l-full"></div>
             
             <div className="w-[50px] h-full flex items-center justify-center shrink-0 pl-3">
               <div className="w-8 h-8 rounded-full bg-[#69F0AE] flex items-center justify-center">
                 <Check className="text-[#0A2616] w-4 h-4" strokeWidth={4} />
               </div>
             </div>
             
             <div className="flex flex-col px-4 py-3 flex-1 min-w-[280px]">
               <span className="text-[#11153D] font-black text-[15px] leading-tight mb-0.5">Deduction Successful</span>
               <span className="text-[#A1A5B7] text-[13px] font-bold">{message}</span>
             </div>
             
             <button onClick={() => setMessage("")} className="text-[#A1A5B7] hover:text-[#11153D] pl-4 py-2 shrink-0 transition-colors">
               <X className="w-5 h-5" />
             </button>
           </div>
        </div>
      )}

      {/* TOAST NOTIFICATION - ERROR */}
      {error && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up" style={{ animationFillMode: 'both' }}>
           <div className="bg-white rounded-full shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 flex items-center pr-4 overflow-hidden relative">
             <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-red-500 rounded-l-full"></div>
             <div className="w-[50px] h-full flex items-center justify-center shrink-0 pl-3">
               <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                 <X className="text-white w-5 h-5" strokeWidth={4} />
               </div>
             </div>
             <div className="flex flex-col px-4 py-3 flex-1 min-w-[280px]">
               <span className="text-[#11153D] font-black text-[15px] leading-tight mb-0.5">Transaction Failed</span>
               <span className="text-[#A1A5B7] text-[13px] font-bold">{error}</span>
             </div>
             <button onClick={() => setError("")} className="text-[#A1A5B7] hover:text-[#11153D] pl-4 py-2 shrink-0 transition-colors">
               <X className="w-5 h-5" />
             </button>
           </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-[300px] h-screen shrink-0 hidden lg:flex flex-col pt-12 pb-10 sticky top-0 left-0 bg-[#F8F9FD] pl-8">
         <nav className="flex flex-col gap-3 flex-1 relative pr-8">
            <button onClick={() => setActiveTab("overview")} className={getNavClass("overview")}>
               <LayoutDashboard className="w-[20px] h-[20px]" /> Overview
            </button>
            <button onClick={() => setActiveTab("status")} className={getNavClass("status")}>
               <MapPin className="w-[20px] h-[20px]" /> Status
            </button>
            <button onClick={() => setActiveTab("staff")} className={getNavClass("staff")}>
               <IdCard className="w-[20px] h-[20px]" /> Staff
            </button>
            <button onClick={() => setActiveTab("reports")} className={getNavClass("reports")}>
               <BarChart2 className="w-[20px] h-[20px]" /> Reports
            </button>
         </nav>
         
         <div className="pr-8">
           <button onClick={handleLogout} className="flex items-center gap-4 text-[#A1A5B7] hover:text-[#F1416C] px-8 py-5 font-bold text-[15px] transition-colors w-full group">
             <LogOut className="w-[20px] h-[20px] group-hover:text-[#F1416C]" /> Logout
           </button>
         </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full flex items-center justify-center p-6 lg:p-12 overflow-y-auto min-h-screen">
         <div className="w-full max-w-[1000px] flex items-center justify-center animate-fade-in-up">
            
            {/* OVERVIEW TAB - SCAN & DEDUCT ONLY */}
            {activeTab === "overview" && (
              <div className="w-full flex justify-center">
                 <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_15px_50px_-20px_rgba(17,21,61,0.05)] w-full max-w-[550px] relative overflow-hidden flex flex-col gap-8 mx-auto">
                    
                    <div className="flex items-center gap-4">
                       <span className="text-[#11153D]">
                         <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
                       </span>
                       <h2 className="text-[26px] font-black text-[#11153D] tracking-tight">Scan & Deduct</h2>
                    </div>

                    <form onSubmit={handleDeductFuel} className="flex flex-col gap-8 flex-1 mt-4">
                       <div className="flex flex-col">
                          <label className="text-[12px] font-[800] text-[#11153D] tracking-wide mb-3">User QR Code Text</label>
                          <div className="relative">
                             <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#A1A5B7]">
                               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="18" height="18" x="3" y="3" rx="4"/><path d="M9 12h6"/><path d="M12 9v6"/></svg>
                             </div>
                             <input
                               type="text" 
                               placeholder="Enter or paste QR code string" 
                               required
                               className="w-full bg-[#F4F6FB] border-none rounded-[1.5rem] pl-[52px] pr-5 py-5 text-[15px] font-bold text-[#11153D] outline-none placeholder-[#A1A5B7]"
                               value={qrCode}
                               onChange={(e) => setQrCode(e.target.value)}
                             />
                          </div>
                       </div>

                       <div className="flex flex-col">
                          <label className="text-[12px] font-[800] text-[#11153D] tracking-wide mb-3">Liters to Deduct</label>
                          <div className="relative">
                             <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#A1A5B7]">
                               <Fuel className="w-[18px] h-[18px]" strokeWidth={2.5}/>
                             </div>
                             <input
                               type="number" 
                               placeholder="0.00" 
                               required min="1" step="0.01"
                               className="w-full bg-[#F4F6FB] border-none rounded-[1.5rem] pl-[52px] pr-16 py-5 text-[18px] font-bold text-[#11153D] outline-none placeholder-[#A1A5B7]"
                               value={liters}
                               onChange={(e) => setLiters(e.target.value)}
                             />
                             <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[#A1A5B7] font-black text-[13px] tracking-widest pl-4">
                                LTR
                             </div>
                          </div>
                       </div>

                       <div className="mt-auto pt-6">
                          <button type="submit" className="w-full bg-[#11153D] text-white font-bold rounded-[2rem] py-[22px] flex items-center justify-center gap-3 transition-transform hover:-translate-y-0.5 text-[16px] shadow-[0_15px_30px_-10px_rgba(17,21,61,0.4)]">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2H6a1 1 0 0 0-1 1v9h3v10a1 1 0 0 0 1.9.4l4.6-8.9A1 1 0 0 0 14 12h-3V3a1 1 0 0 0-1-1z"/></svg>
                            Process Deduction
                          </button>
                       </div>
                    </form>
                 </div>
              </div>
            )}

            {/* STATUS TAB - STATUS & MAP ONLY */}
            {activeTab === "status" && (
              <div className="w-full flex justify-center">
                <div className="flex flex-col gap-6 w-full max-w-[550px] mx-auto">
                   {/* STATUS MODULE */}
                   <div className="bg-[#F4F6FB] rounded-[2.5rem] p-8 lg:p-10 w-full relative overflow-hidden">
                      <h3 className="text-[17px] font-black text-[#11153D] tracking-tight mb-6">
                         Station Current Status
                      </h3>
                      
                      <div className="flex flex-col gap-4">
                         {statusOptions.map((opt) => {
                            const Icon = opt.icon;
                            const isSelected = stationStatus === opt.value;
                            return (
                               <button 
                                 key={opt.value}
                                 type="button"
                                 onClick={() => handleStatusUpdate(opt.value)}
                                 className={`w-full bg-white rounded-[1.5rem] p-5 flex items-center justify-between text-left transition-all ${isSelected ? 'shadow-[0_10px_20px_-10px_rgba(0,0,0,0.08)] scale-[1.01]' : 'hover:bg-white/80'}`}
                               >
                                  <div className="flex items-center gap-5">
                                     <div className={`w-12 h-12 rounded-full ${opt.bg} flex items-center justify-center shrink-0`}>
                                        <Icon className={`w-6 h-6 ${opt.text}`} strokeWidth={2.5}/>
                                     </div>
                                     <div className="flex flex-col">
                                        <span className="font-black text-[15px] text-[#11153D] tracking-tight">{opt.label}</span>
                                        <span className="text-[12px] font-bold text-[#A1A5B7] mt-0.5">{opt.desc}</span>
                                     </div>
                                  </div>
                                  <div className={`w-[22px] h-[22px] rounded-full border-[2.5px] flex items-center justify-center transition-colors shrink-0 mx-2 ${isSelected ? 'border-[#11153D]' : 'border-[#EAECEF]'}`}>
                                     {isSelected && <div className="w-[10px] h-[10px] rounded-full bg-[#11153D]" />}
                                  </div>
                               </button>
                            );
                         })}
                      </div>
                   </div>

                   {/* CSS MAP MODULE */}
                   <div className="bg-[#1C1F2B] w-full rounded-[2.5rem] h-[280px] overflow-hidden relative shadow-inner">
                      {/* CSS Map Grid Pattern Background */}
                      <div className="absolute inset-0 opacity-[0.15]" 
                           style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px', backgroundPosition: 'center center' }}>
                      </div>
                      {/* Diagonal "streets" */}
                      <div className="absolute w-[150%] h-[2px] bg-white opacity-[0.1] -rotate-45 top-1/2 left-[-25%]"></div>
                      <div className="absolute w-[150%] h-[2px] bg-white opacity-[0.1] rotate-[30deg] top-[30%] left-[-25%]"></div>
                      
                      {/* Map Pin */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none drop-shadow-xl z-10 w-[70px] h-[70px] rounded-full bg-white/10 backdrop-blur-sm border border-white/20 justify-center">
                         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md pb-[2px]">
                            <MapPin className="text-[#11153D] w-6 h-6 fill-[#11153D]" />
                         </div>
                      </div>

                      <div className="absolute bottom-5 left-0 w-full text-center tracking-[0.3em] text-white/20 text-[8px] font-black uppercase">
                         Simulated Location
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* STAFF TAB (MOCK DATA) */}
            {activeTab === "staff" && (
              <div className="w-full">
                 <h2 className="text-2xl font-black text-[#11153D] mb-8">Active Staff Members</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { name: "John Doe", role: "Pump Operator", status: "On Shift" },
                      { name: "Jane Smith", role: "Manager", status: "On Shift" },
                      { name: "Alex Johnson", role: "Cashier", status: "Off Duty" },
                      { name: "Sam Wilson", role: "Pump Operator", status: "Off Duty" },
                      { name: "Chris Evans", role: "Security", status: "On Shift" },
                    ].map((staff, i) => (
                      <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5">
                         <div className="w-14 h-14 rounded-full bg-[#F4F6FB] flex items-center justify-center shrink-0">
                            <span className="text-[#11153D] font-black text-lg">{staff.name.charAt(0)}</span>
                         </div>
                         <div className="flex flex-col">
                            <span className="font-bold text-[#11153D]">{staff.name}</span>
                            <span className="text-xs font-bold text-slate-400 mt-1">{staff.role}</span>
                            <span className={`text-[10px] uppercase tracking-widest font-black mt-2 ${staff.status === 'On Shift' ? 'text-emerald-500' : 'text-slate-400'}`}>
                               {staff.status}
                            </span>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {/* REPORTS TAB (TRANSACTION MOCKS) */}
            {activeTab === "reports" && (
              <div className="w-full bg-white rounded-[2rem] p-8 shadow-sm">
                 <h2 className="text-2xl font-black text-[#11153D] mb-8">Recent Transactions</h2>
                 <div className="flex flex-col gap-4">
                    {[
                      { id: "#TRX-0912", user: "John Doe", liters: "8.5", time: "10 mins ago", status: "Completed" },
                      { id: "#TRX-0911", user: "Jane Smith", liters: "12.0", time: "1 hour ago", status: "Completed" },
                      { id: "#TRX-0910", user: "Kamal Perera", liters: "5.0", time: "2 hours ago", status: "Completed" },
                      { id: "#TRX-0909", user: "Nimal Silva", liters: "20.0", time: "3 hours ago", status: "Failed" },
                      { id: "#TRX-0908", user: "Amila Fernando", liters: "15.5", time: "Yesterday", status: "Completed" },
                    ].map((tx, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-[1rem] bg-[#F4F6FB] hover:bg-[#EAECEF] transition-colors">
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.status === 'Completed' ? 'bg-emerald-100/50' : 'bg-red-100/50'}`}>
                               {tx.status === 'Completed' ? <Check className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-red-500" />}
                            </div>
                            <div className="flex flex-col">
                               <span className="font-bold text-[#11153D]">{tx.user}</span>
                               <span className="text-xs font-bold text-slate-400 mt-0.5">{tx.id} • {tx.time}</span>
                            </div>
                         </div>
                         <div className="flex flex-col items-end">
                            <span className="font-black text-[#11153D]">{tx.liters} LTR</span>
                            <span className={`text-[10px] uppercase font-bold tracking-widest mt-1 ${tx.status === 'Completed' ? 'text-emerald-500' : 'text-red-500'}`}>{tx.status}</span>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

         </div>
      </main>
    </div>
  );
}
