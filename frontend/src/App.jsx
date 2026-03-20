import { BrowserRouter, Routes, Route } from 'react-router-dom';


const Login = () => <div className="p-10 text-center font-display text-3xl">Login Page Coming Soon</div>;
const UserDashboard = () => <div className="p-10 font-sans">User Dashboard Coming Soon</div>;
const StationDashboard = () => <div className="p-10 font-sans">Station Dashboard Coming Soon</div>;
const AdminDashboard = () => <div className="p-10 font-sans">Admin Dashboard Coming Soon</div>;

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen font-sans text-gray-800">
        
        {/* Simple Navigation Bar */}
        <nav className="bg-blue-600 p-4 text-white shadow-md">
          <h1 className="text-2xl font-display font-bold tracking-wider">FuelEase</h1>
        </nav>

        {/* Page Routes */}
        <main className="max-w-4xl mx-auto mt-8 bg-white p-6 rounded-lg shadow">
          <Routes>
            <Route path="/" element={<Login />} />
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