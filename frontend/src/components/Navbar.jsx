import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const token = localStorage.getItem('token');

  return (
    <nav className="bg-blue-600 p-4 text-white shadow-md flex items-center justify-between">
      <h1
        className="text-2xl font-bold tracking-wider cursor-pointer"
        onClick={() => navigate('/')}
      >
        ⛽ FuelEase
      </h1>

      {token && (
        <button
          onClick={handleLogout}
          className="bg-white text-blue-600 font-bold px-4 py-1 rounded hover:bg-blue-100 transition"
        >
          Logout
        </button>
      )}
    </nav>
  );
}