import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Auth from './components/Auth';
import UserDashboard from './components/UserDashboard';
import StationDashboard from './components/StationDashboard';
import AdminDashboard from './components/AdminDashboard';
import AdminUsersTable from './components/AdminUsersTable';
import AdminStationsTable from './components/AdminStationsTable';
import AdminVehiclesTable from './components/AdminVehiclesTable';
import Navbar from './components/Navbar';

function Layout({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  
  if (isAdmin) {
    return (
      <main className="pt-24 lg:pt-28 min-h-screen min-w-0 w-full overflow-x-hidden bg-white">
        {children}
      </main>
    );
  }

  return (
    <main className="pt-28 pb-10 px-4 max-w-5xl mx-auto overflow-x-hidden">
      {children}
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen relative overflow-x-hidden">
        <Navbar />
        <Layout>
          <Routes>
            <Route path="/"       element={<Auth />} />
            <Route path="/user"   element={<UserDashboard />} />
            <Route path="/station" element={<StationDashboard />} />
            <Route path="/admin"          element={<AdminDashboard />} />
            <Route path="/admin/users"    element={<AdminUsersTable />} />
            <Route path="/admin/stations" element={<AdminStationsTable />} />
            <Route path="/admin/vehicles" element={<AdminVehiclesTable />} />
          </Routes>
        </Layout>
      </div>
    </BrowserRouter>
  );
}

export default App;