import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react'; // This turns our text into a real QR image!
import api from '../api/axios';

export default function UserDashboard() {
  const [vehicle, setVehicle] = useState(null);
  const [quota, setQuota] = useState(null);
  const [history, setHistory] = useState([]);
  
  // Form states for registering a new vehicle
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [fuelType, setFuelType] = useState('Petrol');
  const [loading, setLoading] = useState(true);

  // When the page loads, fetch the user's data
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // 1. Get their vehicle
      const vehicleRes = await api.get('/vehicle');
      if (vehicleRes.data) {
        setVehicle(vehicleRes.data);
        
        // 2. If they have a vehicle, get their quota and history
        const quotaRes = await api.get('/quota');
        setQuota(quotaRes.data);
        
        const historyRes = await api.get('/history');
        setHistory(historyRes.data);
      }
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterVehicle = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vehicles', { 
        vehicle_number: vehicleNumber, 
        fuel_type: fuelType 
      });
      // Refresh the page data after successful registration
      fetchUserData();
    } catch (error) {
      alert(error.response?.data?.message || "Error registering vehicle");
    }
  };

  if (loading) return <div className="text-center p-10 font-sans">Loading your dashboard...</div>;

  // --- IF THEY DON'T HAVE A VEHICLE YET ---
  if (!vehicle) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md font-sans">
        <h2 className="text-2xl font-display font-bold text-blue-600 mb-4">Register Your Vehicle</h2>
        <p className="text-gray-600 mb-4">You need to register a vehicle to get your fuel QR code.</p>
        
        <form onSubmit={handleRegisterVehicle} className="flex flex-col gap-4">
          <input 
            type="text" placeholder="Vehicle Number (e.g., CBA-1234)" required
            className="border p-2 rounded focus:outline-blue-500 uppercase"
            value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)}
          />
          <select 
            className="border p-2 rounded focus:outline-blue-500 bg-white"
            value={fuelType} onChange={(e) => setFuelType(e.target.value)}
          >
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white font-bold p-2 rounded hover:bg-blue-700">
            Register Vehicle
          </button>
        </form>
      </div>
    );
  }

  // --- IF THEY ALREADY HAVE A VEHICLE (MAIN DASHBOARD) ---
  return (
    <div className="flex flex-col md:flex-row gap-6 font-sans">
      
      {/* Left Column: QR Code & Quota */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
        <h2 className="text-3xl font-display font-bold text-blue-600 mb-2">Your Fuel QR</h2>
        <p className="text-gray-500 mb-6">{vehicle.vehicle_number} • {vehicle.fuel_type}</p>
        
        {/* The Magic QR Code Generator */}
        <div className="bg-white p-4 border-4 border-blue-100 rounded-xl mb-6">
          <QRCodeSVG value={vehicle.qr_code} size={200} />
        </div>

        {quota && (
          <div className="w-full bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-lg font-bold text-gray-700">Weekly Quota</h3>
            <p className="text-4xl font-display font-bold text-blue-600 my-2">
              {quota.remaining_quota} <span className="text-lg text-gray-500">Liters</span>
            </p>
            <p className="text-sm text-gray-500">of {quota.weekly_quota} Liters total</p>
          </div>
        )}
      </div>

      {/* Right Column: Transaction History */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">Fuel History</h2>
        
        {history.length === 0 ? (
          <p className="text-gray-500 italic">No fuel transactions yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-bold text-gray-700">Fuel Station #{tx.station_id}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-red-500 font-bold">
                  -{tx.liters_deducted} L
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}