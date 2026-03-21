import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ImageUploader from './ImageUploader';

export default function Auth() {
  const [isLogin, setIsLogin]                   = useState(true);
  const [email, setEmail]                        = useState('');
  const [password, setPassword]                  = useState('');
  const [name, setName]                          = useState('');
  const [role, setRole]                          = useState('user');
  const [error, setError]                        = useState('');
  const [nicNumber, setNicNumber]                = useState('');
  const [nicImageUrl, setNicImageUrl]            = useState('');
  const [documentUrl, setDocumentUrl]            = useState('');
  const [district, setDistrict]                  = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const navigate = useNavigate();

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
          payload.nic_number    = nicNumber;
          payload.nic_image_url = nicImageUrl;
        }

        if (role === 'station') {
          if (!documentUrl || !district) {
            setError('Fuel Stations must provide a valid document URL and select a District.');
            return;
          }
          payload.document_url = documentUrl;
          payload.district     = district;
        }

        response = await api.post('/register', payload);
      }

      // Save token AND user object to localStorage
      localStorage.setItem('fuelease_token', response.data.token);
      localStorage.setItem('fuelease_user', JSON.stringify(response.data.user));

      const userRole = response.data.user.role;
      if (userRole === 'admin')        navigate('/admin');
      else if (userRole === 'station') navigate('/station');
      else                             navigate('/user');

    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Check your details.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="glass-strong rounded-3xl w-full max-w-md mx-auto p-8 modal-card">
        <h2 className="text-3xl font-black text-center text-white mb-6">
          {isLogin ? '👋 Welcome Back' : '🚀 Create Account'}
        </h2>

        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-300 p-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <>
              <input
                type="text" placeholder="Full Name" required
                className="glass-input"
                value={name} onChange={e => setName(e.target.value)}
              />
              <select
                className="glass-input"
                value={role} onChange={e => setRole(e.target.value)}
              >
                <option value="user">Vehicle Owner</option>
                <option value="station">Fuel Station</option>
              </select>

              <div className="glass rounded-2xl p-4 flex flex-col gap-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Profile Picture (Optional)</label>
                <ImageUploader onUploadSuccess={url => setProfilePictureUrl(url)} label="Upload Profile Picture" altText="Profile Preview" />
              </div>

              {role === 'user' && (
                <div className="glass rounded-2xl p-4 flex flex-col gap-3">
                  <label className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Vehicle Owner Verification</label>
                  <input
                    type="text" placeholder="NIC Number (e.g. 199012345678)" required
                    className="glass-input uppercase"
                    value={nicNumber} onChange={e => setNicNumber(e.target.value)}
                  />
                  <ImageUploader onUploadSuccess={url => setNicImageUrl(url)} label="Upload NIC Photo" altText="NIC Preview" />
                </div>
              )}

              {role === 'station' && (
                <div className="glass rounded-2xl p-4 flex flex-col gap-3">
                  <label className="text-xs font-semibold text-green-300 uppercase tracking-wider">Fuel Station Verification</label>
                  <select
                    required
                    className="glass-input"
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
                    className="glass-input"
                    value={documentUrl} onChange={e => setDocumentUrl(e.target.value)}
                  />
                  <p className="text-xs text-green-400/70">Admins will review this document before approving your station.</p>
                </div>
              )}
            </>
          )}

          <input
            type="email" placeholder="Email Address" required
            className="glass-input"
            value={email} onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password" placeholder="Password" required minLength="6"
            className="glass-input"
            value={password} onChange={e => setPassword(e.target.value)}
          />

          <button type="submit" className="glass-btn w-full mt-2">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-white/50 hover:text-white/80 underline transition"
          >
            {isLogin ? "Don't have an account? Register here." : "Already have an account? Login here."}
          </button>
        </div>
      </div>
    </div>
  );
}