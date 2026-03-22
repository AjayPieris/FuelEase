import { useState, useEffect } from "react";
import { Receipt, X, CheckCircle } from "lucide-react";
import api from "../api/axios";

export default function TransactionsModal({ onClose }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get("/history")
      .then((res) => setTransactions(res.data || []))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="solid-card modal-card w-full max-w-5xl mx-4 max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2.5">
              <Receipt className="w-5 h-5 text-indigo-500" /> Recent Transactions
            </h2>
            <p className="text-slate-400 text-sm mt-1 font-medium">
              Review your station's latest fuel distributions
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition hover:scale-105 active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-slate-400 font-medium">Loading transactions…</div>
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-medium italic">No transactions found.</div>
          ) : (
            <div className="min-w-[700px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Date / Time</th>
                    <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">User QR ID</th>
                    <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Fuel Type</th>
                    <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Quota Dispensed</th>
                    <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 text-sm font-semibold text-slate-700">
                        {new Date(tx.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-mono text-xs font-bold">
                          {tx.vehicle?.qr_code || tx.user?.vehicles?.[0]?.qr_code || `USER-${tx.user_id}`}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-slate-500">
                        {tx.vehicle?.fuel_type || tx.user?.vehicles?.[0]?.fuel_type || "N/A"}
                      </td>
                      <td className="py-4 px-6 text-sm font-black text-slate-700 text-right">
                        {tx.liters_deducted}L
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="badge-green">
                          <CheckCircle className="w-3 h-3" /> Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {transactions.length > 0 && (
          <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-sm text-slate-400 font-medium">
              Showing <span className="font-bold text-slate-700">{transactions.length}</span> records
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
