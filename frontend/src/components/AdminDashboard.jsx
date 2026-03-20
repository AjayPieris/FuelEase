import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [stations, setStations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch everything at once
      const [usersRes, stationsRes, txRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stations'),
        api.get('/admin/transactions')
      ]);
      
      setUsers(usersRes.data);
      setStations(stationsRes.data);
      setTransactions(txRes.data);
    } catch (err) {
      setError("Failed to load admin data. Are you sure you are an admin?");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-10 font-sans">Loading system data...</div>;

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-100 text-red-700 rounded-lg text-center font-bold font-sans">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <h2 className="text-4xl font-display font-bold text-gray-800 mb-8 text-center border-b pb-4">
        System Administration
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
        {/* USERS TABLE */}
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <h3 className="text-2xl font-display font-bold text-blue-600 mb-4">All Users</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-2 border-b">ID</th>
                <th className="p-2 border-b">Name</th>
                <th className="p-2 border-b">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{u.id}</td>
                  <td className="p-2 font-bold">{u.name}</td>
                  <td className="p-2 uppercase text-xs text-gray-500">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* STATIONS TABLE */}
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <h3 className="text-2xl font-display font-bold text-blue-600 mb-4">Fuel Stations</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-2 border-b">ID</th>
                <th className="p-2 border-b">Name</th>
                <th className="p-2 border-b">Location</th>
              </tr>
            </thead>
            <tbody>
              {stations.map(s => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{s.id}</td>
                  <td className="p-2 font-bold">{s.name}</td>
                  <td className="p-2 text-gray-600">{s.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* TRANSACTIONS TABLE (Full Width) */}
      <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        <h3 className="text-2xl font-display font-bold text-blue-600 mb-4">All Transactions</h3>
        {transactions.length === 0 ? (
          <p className="text-gray-500 italic">No transactions recorded yet.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-2 border-b">Date</th>
                <th className="p-2 border-b">User ID</th>
                <th className="p-2 border-b">Station ID</th>
                <th className="p-2 border-b text-right">Liters Deducted</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 text-sm text-gray-500">
                    {new Date(tx.created_at).toLocaleString()}
                  </td>
                  <td className="p-2">User #{tx.user_id}</td>
                  <td className="p-2">Station #{tx.station_id}</td>
                  <td className="p-2 text-right font-bold text-red-500">-{tx.liters_deducted} L</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}