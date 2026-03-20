import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Auth from './components/Auth';
import UserDashboard from './components/UserDashboard';
import StationDashboard from './components/StationDashboard';
import AdminDashboard from './components/AdminDashboard';
import Navbar from './components/Navbar'; // <-- 1. Import the new Navbar!

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen font-sans text-gray-800 bg-gray-100">
        
        {/* Simple Navigation Bar */}
        <Navbar />
        {/* Page Routes */}
        <main className="max-w-4xl mx-auto mt-8 bg-white p-6 rounded-lg shadow">
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/user" element={<UserDashboard />} />
            <Route path="/station" element={<StationDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        
      </div>
    </BrowserRouter>
  );
}

export default App;