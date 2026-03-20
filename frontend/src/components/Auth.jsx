import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; // This is the shortcut we made earlier!

export default function Auth() {
  // 1. Set up our "state" (React's memory for what the user is typing)
  const [isLogin, setIsLogin] = useState(true); // Toggles between Login and Register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  
  // 2. This hook lets us change pages automatically
  const navigate = useNavigate();

  // 3. What happens when the user clicks Submit?
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stops the page from refreshing
    setError(''); // Clear any old errors

    try {
      let response;
      
      // Send the data to the correct Laravel URL
      if (isLogin) {
        response = await api.post('/login', { email, password });
      } else {
        response = await api.post('/register', { name, email, password, role });
      }

      // 4. Save the "VIP Token" to the browser's memory
      localStorage.setItem('fuelease_token', response.data.token);
      
      // 5. Look at the user's role and send them to the correct dashboard!
      const userRole = response.data.user.role;
      if (userRole === 'admin') navigate('/admin');
      else if (userRole === 'station') navigate('/station');
      else navigate('/user'); // Default to standard user
      
    } catch (err) {
      // If Laravel rejects the login, show the error message
      setError(err.response?.data?.message || 'Something went wrong. Check your details.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-3xl font-display font-bold text-center text-blue-600 mb-6">
        {isLogin ? 'Welcome Back!' : 'Create an Account'}
      </h2>

      {/* Show error messages if there are any */}
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans">
        
        {/* Only show Name and Role inputs if the user is Registering */}
        {!isLogin && (
          <>
            <input 
              type="text" placeholder="Full Name" required
              className="border p-2 rounded focus:outline-blue-500"
              value={name} onChange={(e) => setName(e.target.value)}
            />
            <select 
              className="border p-2 rounded focus:outline-blue-500 bg-white"
              value={role} onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">Vehicle Owner</option>
              <option value="station">Fuel Station</option>
            </select>
          </>
        )}

        {/* Email and Password are required for both Login and Register */}
        <input 
          type="email" placeholder="Email Address" required
          className="border p-2 rounded focus:outline-blue-500"
          value={email} onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" placeholder="Password" required minLength="6"
          className="border p-2 rounded focus:outline-blue-500"
          value={password} onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="bg-blue-600 text-white font-bold p-2 rounded mt-2 hover:bg-blue-700 transition">
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>

      {/* Button to toggle between Login and Register modes */}
      <div className="mt-4 text-center">
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="text-sm text-gray-500 hover:text-blue-600 underline"
        >
          {isLogin ? "Don't have an account? Register here." : "Already have an account? Login here."}
        </button>
      </div>
    </div>
  );
}