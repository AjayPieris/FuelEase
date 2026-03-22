import { useState, useEffect } from "react";
import { Receipt, CheckCircle } from "lucide-react";
import api from "../api/axios";

export default function AdminDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get("/admin/transactions")
      .then((res) => {
        setTransactions(res.data || []);
      })
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400 text-lg font-bold animate-pulse">Loading system transactions…</div>
      </div>
    );

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      <div className="solid-card p-6 sm:p-8 animate-[slideUp_0.4s_ease]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
              <Receipt className="w-6 h-6 text-indigo-500" /> All System Transactions
            </h2>
            <p className="text-slate-400 text-sm mt-1.5 font-medium">
              Overview of all fuel dispensed across the network.
            </p>
          </div>
          <div className="hidden sm:block">
            <span className="badge-indigo">Total: {transactions.length} Records</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Transaction ID</th>
                <th className="px-6 py-4 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Station Name</th>
                <th className="px-6 py-4 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">User QR ID</th>
                <th className="px-6 py-4 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Fuel Type</th>
                <th className="px-6 py-4 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Amount</th>
                <th className="px-6 py-4 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Date & Time</th>
                <th className="px-6 py-4 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map((tx, idx) => (
                <tr key={tx.id || idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-md">
                      TX-{tx.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">
                    {tx.station_name || tx.station?.name || `Station #${tx.station_id}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs text-slate-500 border border-slate-200 px-2 py-1 rounded-md bg-slate-50">
                      {tx.user?.vehicles?.[0]?.qr_code || `USER-${tx.user_id}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                    {tx.user?.vehicles?.[0]?.fuel_type || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-black text-red-500">
                    -{tx.liters_deducted || tx.liters}L
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-medium">
                    {new Date(tx.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="badge-green"><CheckCircle className="w-3 h-3" /> Completed</span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-medium italic">
                    No transactions found in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-300 tracking-wider">PAGE {page} OF 1</p>
          <div className="flex gap-2">
            <button className="solid-btn-outline text-sm py-2 px-4 opacity-50 cursor-not-allowed">Previous</button>
            <button className="solid-btn text-sm py-2 px-4">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
