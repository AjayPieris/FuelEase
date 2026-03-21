import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Auth from './components/Auth';
import UserDashboard from './components/UserDashboard';
import StationDashboard from './components/StationDashboard';
import AdminDashboard from './components/AdminDashboard';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen text-white relative">
        <Navbar />
        <main className="pt-28 pb-10 px-4 max-w-5xl mx-auto">
          <Routes>
            <Route path="/"       element={<Auth />} />
            <Route path="/user"   element={<UserDashboard />} />
            <Route path="/station" element={<StationDashboard />} />
            <Route path="/admin"  element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;