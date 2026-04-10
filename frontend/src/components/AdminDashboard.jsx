import { useState, useEffect } from "react";
import { 
  Receipt, CheckCircle, LayoutDashboard, MapPin, Package, Users, 
  LifeBuoy, Activity, Power, Droplet, Zap, History, Filter, Download, Cloud, Wifi
} from "lucide-react";
import api from "../api/axios";
import AdminUsersTable from "./AdminUsersTable";
import AdminStationsTable from "./AdminStationsTable";
import AdminVehiclesTable from "./AdminVehiclesTable";
import mapImg from "../assets/image.png";

export default function AdminDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTransactions = () => {
      api.get("/admin/transactions")
        .then((res) => setTransactions(res.data || []))
        .catch(() => setTransactions([]))
        .finally(() => setLoading(false));
    };
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 5000);
    return () => clearInterval(interval);
  }, []);

  const getSidebarClass = (tab) => {
    if (activeTab === tab) {
      return "flex items-center gap-4 bg-[#11153D] text-white px-6 py-4 rounded-[1.5rem] font-bold text-[13px] tracking-wide relative z-10 transition-all shadow-lg w-full mb-2";
    }
    return "flex items-center gap-4 text-[#A1A5B7] hover:bg-white hover:text-[#11153D] px-6 py-4 rounded-[1.5rem] font-bold text-[13px] tracking-wide transition-all w-full mb-2";
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FD]">
        <div className="text-slate-400 text-lg font-bold animate-pulse">Loading intelligence network…</div>
      </div>
    );

  const filteredTransactions = transactions.filter(tx => {
    const txIdStr = `tx-${tx.id?.toString().padStart(4, '0')}`.toLowerCase();
    const stationStr = (tx.station_name || tx.station?.name || ("Station #" + tx.station_id)).toLowerCase();
    const q = searchQuery.toLowerCase();
    return txIdStr.includes(q) || stationStr.includes(q) || tx.id?.toString().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / 10));
  const currentPage = Math.min(page, totalPages);
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <div className="min-h-screen relative w-full flex bg-white font-sans selection:bg-[#11153D] selection:text-white">
      
      {/* ── LEFT SIDEBAR ── */}
      <aside className="w-[280px] h-screen shrink-0 hidden lg:flex flex-col pt-12 pb-10 sticky top-0 left-0 bg-white">
         <nav className="flex flex-col flex-1 px-6">
            <button onClick={() => setActiveTab("dashboard")} className={getSidebarClass("dashboard")}>
              <LayoutDashboard className="w-5 h-5" /> DASHBOARD
            </button>
            <button onClick={() => setActiveTab("stations")} className={getSidebarClass("stations")}>
              <MapPin className="w-5 h-5" /> STATIONS
            </button>
            <button onClick={() => setActiveTab("inventory")} className={getSidebarClass("inventory")}>
              <Package className="w-5 h-5" /> INVENTORY
            </button>
            <button onClick={() => setActiveTab("user_management")} className={getSidebarClass("user_management")}>
              <Users className="w-5 h-5" /> USER MANAGEMENT
            </button>

            <div className="mt-auto flex flex-col pt-10">
               <button className="flex items-center gap-4 text-[#A1A5B7] hover:text-[#11153D] px-6 py-4 font-bold text-[13px] tracking-wide transition-all w-full">
                 <LifeBuoy className="w-5 h-5" /> SUPPORT
               </button>
               <button className="flex items-center gap-4 text-[#A1A5B7] hover:text-[#11153D] px-6 py-4 font-bold text-[13px] tracking-wide transition-all w-full mb-6">
                 <Activity className="w-5 h-5" /> SYSTEM STATUS
               </button>

               {/* EMERGENCY SHUTDOWN */}
               <button className="flex items-center justify-center bg-[#FF4D4D]/10 text-[#FF4D4D] hover:bg-[#FF4D4D]/20 transition-colors w-full py-4 rounded-xl font-black text-[10px] tracking-widest uppercase">
                  Emergency Shutdown
               </button>
            </div>
         </nav>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex pt-12 pb-24 px-8 min-w-0 h-screen overflow-y-auto">
         {activeTab === "dashboard" && (
            <div className="w-full flex justify-center">
              <div className="w-full xl:max-w-[1400px] flex flex-col gap-10">
            
            {/* HEADER BANNER */}
            <div className="w-full bg-[#0A0D27] rounded-[2.5rem] p-12 relative overflow-hidden shadow-2xl flex flex-col justify-center min-h-[200px]">
               <div className="absolute right-0 top-0 bottom-0 w-[50%] opacity-20 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)]" style={{ backgroundSize: '24px 24px' }}></div>
               <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D27] via-[#0A0D27]/90 to-transparent"></div>
               
               <div className="relative z-10 max-w-2xl">
                  <h1 className="text-white text-[42px] leading-[1.1] font-extrabold tracking-tight mb-4">
                     Network Transaction<br />Intelligence
                  </h1>
                  <p className="text-[#8B91D2] font-medium text-[16px]">
                     Real-time monitoring of fuel distribution nodes across the global infrastructure.
                  </p>
               </div>
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               {/* Stat 1 */}
               <div className="group bg-white rounded-3xl p-6 shadow-[0_5px_15px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col justify-between border-b-4 border-b-indigo-500 relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                     <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                        <Droplet className="w-4 h-4 text-indigo-500" />
                     </div>
                     <span className="text-[9px] font-black tracking-widest text-[#69F0AE] uppercase">+12% VS LY</span>
                  </div>
                  <div className="text-[10px] font-black text-[#A1A5B7] tracking-wider uppercase mb-1">Total Volume Dispensed</div>
                  <div className="text-2xl font-black text-[#11153D] leading-none">1.2M <span className="text-lg text-slate-400">Liters</span></div>
               </div>

               {/* Stat 2 */}
               <div className="group bg-white rounded-3xl p-6 shadow-[0_5px_15px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col justify-between border-b-4 border-b-[#69F0AE] relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                     <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
                        <Activity className="w-4 h-4 text-emerald-500" />
                     </div>
                     <span className="text-[9px] font-black tracking-widest text-[#69F0AE] uppercase flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#69F0AE] animate-pulse"></span> LIVE
                     </span>
                  </div>
                  <div className="text-[10px] font-black text-[#A1A5B7] tracking-wider uppercase mb-1">Active Stations</div>
                  <div className="text-2xl font-black text-[#11153D] leading-none group-hover:text-emerald-500 transition-colors duration-300">542</div>
               </div>

               {/* Stat 3 */}
               <div className="group bg-white rounded-3xl p-6 shadow-[0_5px_15px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col justify-between border-b-4 border-b-blue-400 relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                     <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                        <Zap className="w-4 h-4 text-blue-500" />
                     </div>
                     <span className="text-[9px] font-black tracking-widest text-blue-500 uppercase group-hover:text-blue-600 transition-colors">OPTIMIZED</span>
                  </div>
                  <div className="text-[10px] font-black text-[#A1A5B7] tracking-wider uppercase mb-1">System Uptime</div>
                  <div className="text-2xl font-black text-[#11153D] leading-none group-hover:text-blue-500 transition-colors duration-300">99.9%</div>
               </div>

               {/* Stat 4 */}
               <div className="group bg-white rounded-3xl p-6 shadow-[0_5px_15px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col justify-between border-b-4 border-b-yellow-400 relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                     <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center group-hover:scale-110 group-hover:bg-yellow-100 transition-all duration-300 group-hover:rotate-12">
                        <History className="w-4 h-4 text-yellow-500" />
                     </div>
                     <span className="text-[9px] font-black tracking-widest text-yellow-500 uppercase">LAST 24H</span>
                  </div>
                  <div className="text-[10px] font-black text-[#A1A5B7] tracking-wider uppercase mb-1">Transactions</div>
                  <div className="text-2xl font-black text-[#11153D] leading-none group-hover:text-yellow-500 transition-colors duration-300">12,450</div>
               </div>
            </div>

            {/* LIVE STREAM TABLE */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                   <h2 className="text-[22px] font-black text-[#11153D]">Live Transaction Stream</h2>
                   <div className="flex items-center gap-3">
                      <input 
                         type="text" 
                         placeholder="Search ID or Station..." 
                         value={searchQuery}
                         onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                         }}
                         className="bg-white border border-slate-200 text-[#11153D] px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm focus:outline-none focus:border-indigo-500 w-64 placeholder:text-slate-400"
                      />
                      <button className="flex items-center gap-2 bg-white border border-slate-200 text-[#11153D] px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide shadow-sm hover:bg-slate-50 transition-colors">
                        <Filter className="w-3.5 h-3.5" /> Filter
                      </button>
                      <button className="flex items-center gap-2 bg-[#11153D] text-white px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide shadow-md hover:bg-indigo-900 transition-colors">
                        <Download className="w-3.5 h-3.5" /> Export CSV
                      </button>
                   </div>
                </div>

                <div className="bg-white rounded-[2rem] p-6 shadow-sm overflow-hidden">
                   <table className="w-full text-left">
                      <thead>
                         <tr>
                            <th className="px-4 pb-4 text-[10px] font-black text-[#A1A5B7] uppercase tracking-widest">Transaction ID</th>
                            <th className="px-4 pb-4 text-[10px] font-black text-[#A1A5B7] uppercase tracking-widest">Station</th>
                            <th className="px-4 pb-4 text-[10px] font-black text-[#A1A5B7] uppercase tracking-widest">Fuel Type</th>
                            <th className="px-4 pb-4 text-[10px] font-black text-[#A1A5B7] uppercase tracking-widest">Amount</th>
                         </tr>
                      </thead>
                      <tbody className="space-y-4">
                         {paginatedTransactions.length === 0 ? (
                           <tr><td colSpan="4" className="py-6 text-center text-slate-400 font-bold">No matching data found.</td></tr>
                         ) : paginatedTransactions.map((tx, idx) => {
                            const fuel = tx.vehicle?.fuel_type || tx.user?.vehicles?.[0]?.fuel_type || "Unknown";
                            const dotColor = fuel.toLowerCase().includes("petrol") || fuel.toLowerCase().includes("octane") ? "bg-[#69F0AE]" : fuel.toLowerCase().includes("diesel") ? "bg-amber-400" : "bg-blue-400";
                            return (
                               <tr key={tx.id || idx}>
                                  <td colSpan="4" className="p-0">
                                     <div className="flex items-center bg-white border border-slate-100 hover:border-indigo-100 rounded-[1rem] p-2 mb-2 shadow-sm transition-all relative group overflow-hidden">
                                        <div className="w-[20%] px-4">
                                           <span className="font-bold text-[#A1A5B7] text-[13px] group-hover:text-[#11153D] transition-colors">TX-{tx.id.toString().padStart(4, '0')}</span>
                                        </div>
                                        <div className="w-[35%] px-4">
                                           <span className="font-black text-[#11153D] text-[14px]">{(tx.station_name || tx.station?.name || ("Station #" + tx.station_id))}</span>
                                        </div>
                                        <div className="w-[25%] px-4 flex items-center gap-2">
                                           <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                                           <span className="font-bold text-[#11153D] text-[13px]">{fuel}</span>
                                        </div>
                                        <div className="w-[20%] px-4 text-right">
                                           <span className="font-black text-red-500 text-[14px]">-{tx.liters_deducted || tx.liters}L</span>
                                        </div>
                                     </div>
                                  </td>
                               </tr>
                            );
                         })}
                      </tbody>
                   </table>

                   {/* Pagination */}
                   <div className="flex items-center justify-between mt-6 px-4">
                      <p className="text-[10px] font-black text-[#A1A5B7] uppercase tracking-widest">
                        Showing {filteredTransactions.length === 0 ? 0 : (currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, filteredTransactions.length)} of {filteredTransactions.length} Results
                      </p>
                      <div className="flex items-center gap-2">
                         <button 
                            disabled={currentPage === 1}
                            onClick={() => setPage(currentPage - 1)}
                            className="w-8 h-8 flex items-center justify-center font-bold text-sm rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-slate-400 bg-slate-50 hover:bg-slate-100"
                         >
                            &lt;
                         </button>
                         
                         <div className="flex items-center px-2">
                            <span className="font-bold text-sm text-[#11153D]">Page {currentPage} of {totalPages}</span>
                         </div>

                         <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setPage(currentPage + 1)}
                            className="w-8 h-8 flex items-center justify-center font-bold text-sm rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-slate-400 bg-slate-50 hover:bg-slate-100"
                         >
                            &gt;
                         </button>
                      </div>
                   </div>
                </div>
            </div>
             </div>
             </div>
          )}
          {activeTab === "stations" && <div className="w-full flex-1 -mt-4"><AdminStationsTable /></div>}
         {activeTab === "inventory" && <div className="w-full flex-1 -mt-4"><AdminVehiclesTable /></div>}
         {activeTab === "user_management" && <div className="w-full flex-1 -mt-4"><AdminUsersTable /></div>}
      </main>



    </div>
  );
}
