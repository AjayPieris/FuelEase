import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function StationDashboard() {
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // States for setting up the station
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  // States for scanning and deducting fuel
  const [qrCode, setQrCode] = useState('');
  const [liters, setLiters] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStationData();
  }, []);

  const fetchStationData = async () => {
    try {
      const res = await api.get('/station');
      if (res.data) setStation(res.data);
    } catch (err) {
      console.error("Error fetching station", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupStation = async (e) => {
    e.preventDefault();
    try {
      await api.post('/stations', { name, location });
      fetchStationData(); // Refresh to show the main dashboard
    } catch (err) {
      alert("Error setting up station");
    }
  };

  const handleDeductFuel = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await api.post('/stations/scan', { 
        qr_code: qrCode, 
        liters: liters 
      });
      // Show success message and clear the form
      setMessage(`Success! ${liters}L deducted. User has ${res.data.remaining_quota}L remaining.`);
      setQrCode('');
      setLiters('');
    } catch (err) {
      // Show error if they don't have enough fuel or QR is wrong
      setError(err.response?.data?.message || "Transaction failed.");
    }
  };

  if (loading) return <div className="text-center p-10 font-sans">Loading station...</div>;

  // --- IF THEY HAVEN'T SET UP THEIR STATION YET ---
  if (!station) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md font-sans">
        <h2 className="text-2xl font-display font-bold text-blue-600 mb-4">Set Up Fuel Station</h2>
        <p className="text-gray-600 mb-4">Enter your station details to start scanning QR codes.</p>
        
        <form onSubmit={handleSetupStation} className="flex flex-col gap-4">
          <input 
            type="text" placeholder="Station Name (e.g., City Main Branch)" required
            className="border p-2 rounded focus:outline-blue-500"
            value={name} onChange={(e) => setName(e.target.value)}
          />
          <input 
            type="text" placeholder="Location/City" required
            className="border p-2 rounded focus:outline-blue-500"
            value={location} onChange={(e) => setLocation(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 text-white font-bold p-2 rounded hover:bg-blue-700">
            Complete Setup
          </button>
        </form>
      </div>
    );
  }

  // --- MAIN STATION DASHBOARD ---
  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md font-sans">
      <div className="text-center mb-8 border-b pb-4">
        <h2 className="text-3xl font-display font-bold text-blue-600">{station.name}</h2>
        <p className="text-gray-500 text-sm">📍 {station.location}</p>
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Scan & Deduct Fuel</h3>
      
      {/* Status Messages */}
      {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 font-bold text-center">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 font-bold text-center">{error}</div>}

      <form onSubmit={handleDeductFuel} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">User QR Code Text</label>
          <input 
            type="text" placeholder="e.g., QR-ABC123XYZ" required
            className="border-2 border-gray-300 p-3 rounded w-full focus:outline-blue-500 uppercase font-mono tracking-widest"
            value={qrCode} onChange={(e) => setQrCode(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Liters to Deduct</label>
          <input 
            type="number" placeholder="Enter amount (e.g., 5)" required min="1" step="0.01"
            className="border-2 border-gray-300 p-3 rounded w-full focus:outline-blue-500"
            value={liters} onChange={(e) => setLiters(e.target.value)}
          />
        </div>

        <button type="submit" className="bg-green-600 text-white font-bold p-3 rounded-lg hover:bg-green-700 text-lg shadow mt-2">
          Deduct Fuel
        </button>
      </form>
    </div>
  );
}