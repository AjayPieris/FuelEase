import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, LogIn, Upload, FileCheck, Camera } from 'lucide-react';
import api from '../api/axios';
import ImageUploader from './ImageUploader';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [nicNumber, setNicNumber] = useState('');
  const [nicImageUrl, setNicImageUrl] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [district, setDistrict] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('fuelease_token');
    const userStr = localStorage.getItem('fuelease_user');
    if (token && userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.role === 'admin') navigate('/admin');
        else if (u.role === 'station') navigate('/station');
        else navigate('/user');
      } catch (e) {}
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let response;
      if (isLogin) {
        response = await api.post('/login', { email, password });
      } else {
        const payload = { name, email, password, role };
        if (profilePictureUrl) payload.profile_picture_url = profilePictureUrl;

        if (role === 'user') {
          if (!nicNumber || !nicImageUrl) {
            setError('Vehicle Owners must provide a NIC number and NIC photo.');
            return;
          }
          payload.nic_number = nicNumber;
          payload.nic_image_url = nicImageUrl;
        }

        if (role === 'station') {
          if (!documentUrl || !district) {
            setError('Fuel Stations must provide a valid document URL and select a District.');
            return;
          }
          payload.document_url = documentUrl;
          payload.district = district;
        }

        response = await api.post('/register', payload);
      }

      localStorage.setItem('fuelease_token', response.data.token);
      localStorage.setItem('fuelease_user', JSON.stringify(response.data.user));

      const userRole = response.data.user.role;
      if (userRole === 'admin') navigate('/admin');
      else if (userRole === 'station') navigate('/station');
      else navigate('/user');

    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Check your details.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="solid-card w-full max-w-md mx-auto p-8 modal-card">
        <h2 className="text-3xl font-black text-center text-slate-800 mb-1">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-center text-slate-400 text-sm mb-6">
          {isLogin ? 'Sign in to your FuelEase account' : 'Register for your National Fuel Pass'}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Full Name</label>
                <input
                  type="text" placeholder="Enter your full name" required
                  className="solid-input"
                  value={name} onChange={e => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Account Type</label>
                <select className="solid-input" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="user">Vehicle Owner</option>
                  <option value="station">Fuel Station</option>
                </select>
              </div>

              <div className="solid-card p-4 flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" /> Profile Picture (Optional)
                </label>
                <ImageUploader onUploadSuccess={url => setProfilePictureUrl(url)} label="Upload Profile Picture" altText="Profile Preview" />
              </div>

              {role === 'user' && (
                <div className="solid-card p-4 flex flex-col gap-3 border-l-4 border-indigo-400">
                  <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5" /> Vehicle Owner Verification
                  </label>
                  <input
                    type="text" placeholder="NIC Number (e.g. 199012345678)" required
                    className="solid-input uppercase"
                    value={nicNumber} onChange={e => setNicNumber(e.target.value)}
                  />
                  <ImageUploader onUploadSuccess={url => setNicImageUrl(url)} label="Upload NIC Photo" altText="NIC Preview" />
                </div>
              )}

              {role === 'station' && (
                <div className="solid-card p-4 flex flex-col gap-3 border-l-4 border-emerald-400">
                  <label className="text-xs font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5" /> Fuel Station Verification
                  </label>
                  <select
                    required className="solid-input"
                    value={district} onChange={e => setDistrict(e.target.value)}
                  >
                    <option value="" disabled>Select District</option>
                    {[
                      "Ampara","Anuradhapura","Badulla","Batticaloa","Colombo","Galle","Gampaha",
                      "Hambantota","Jaffna","Kalutara","Kandy","Kegalle","Kilinochchi","Kurunegala",
                      "Mannar","Matale","Matara","Monaragala","Mullaitivu","Nuwara Eliya","Polonnaruwa",
                      "Puttalam","Ratnapura","Trincomalee","Vavuniya"
                    ].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input
                    type="url" placeholder="Paste Document URL (e.g. Google Drive link)" required
                    className="solid-input"
                    value={documentUrl} onChange={e => setDocumentUrl(e.target.value)}
                  />
                  <p className="text-xs text-emerald-600/70">Admins will review this document before approving your station.</p>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Email Address</label>
            <input
              type="email" placeholder="you@example.com" required
              className="solid-input"
              value={email} onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password" placeholder="••••••••" required minLength="6"
              className="solid-input"
              value={password} onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="solid-btn w-full mt-2 flex items-center justify-center gap-2">
            {isLogin ? <><LogIn className="w-4 h-4" /> Login</> : <><UserPlus className="w-4 h-4" /> Register</>}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-indigo-500 hover:text-indigo-700 font-medium transition"
          >
            {isLogin ? "Don't have an account? Register here." : "Already have an account? Login here."}
          </button>
        </div>
      </div>
    </div>
  );
}