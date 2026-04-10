import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, LogIn, Upload, FileCheck, Camera, X } from "lucide-react";
import api from "../api/axios";
import ImageUploader from "./ImageUploader";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [nicNumber, setNicNumber] = useState("");
  const [nicImageUrl, setNicImageUrl] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [district, setDistrict] = useState("");
  const [location, setLocation] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("fuelease_token");
    const userStr = localStorage.getItem("fuelease_user");
    if (token && userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.role === "admin") navigate("/admin");
        else if (u.role === "station") navigate("/station");
        else navigate("/user");
      } catch (e) {}
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      let response;
      if (isLogin) {
        response = await api.post("/login", { email, password });
      } else {
        const payload = { name, email, password, role };
        if (profilePictureUrl) payload.profile_picture_url = profilePictureUrl;

        if (role === "user") {
          if (!nicNumber || !nicImageUrl) {
            setError("Vehicle Owners must provide a NIC number and NIC photo.");
            return;
          }
          payload.nic_number = nicNumber;
          payload.nic_image_url = nicImageUrl;
        }

        if (role === "station") {
          if (!documentUrl || !district || !location) {
            setError(
              "Fuel Stations must provide a valid document URL, select a District, and specify a Location.",
            );
            return;
          }
          payload.document_url = documentUrl;
          payload.district = district;
          payload.location = location;
        }

        response = await api.post("/register", payload);
      }

      localStorage.setItem("fuelease_token", response.data.token);
      localStorage.setItem("fuelease_user", JSON.stringify(response.data.user));

      const userRole = response.data.user.role;
      if (userRole === "admin") navigate("/admin");
      else if (userRole === "station") navigate("/station");
      else navigate("/user");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Check your details.",
      );
    }
  };

  return (
    <div className="min-h-screen py-8 flex items-center justify-center p-4 bg-slate-50/50">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row min-h-[750px] border border-slate-100">
        {/* Left Side - Informational/Branding */}
        <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-teal-200 via-emerald-100 to-cyan-100 p-12 flex-col justify-center relative overflow-hidden">
          <div className="relative z-20">
            <h1 className="text-[2.75rem] font-extrabold text-[#1e1e40] leading-[1.1] mb-6 tracking-tight">
              Fueling the <br />
              <span className="text-emerald-700">Future of</span> <br />
              Logistics
            </h1>
            <p className="text-slate-700 text-[15px] mb-12 max-w-[280px] font-medium leading-relaxed">
              Experience kinetic precision in fuel management. Join thousands of
              vehicle owners and station managers optimizing their energy flow.
            </p>

            <div className="flex gap-4">
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-5 flex-1 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-emerald-700">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v2h2v5h2v-5h2v2h2v-2h2v-2h-2v-2zm4 0h-2V7h2v5z" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl font-black text-[#1e1e40] mb-0.5">
                  500+
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Stations
                </div>
              </div>
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-5 flex-1 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-emerald-700">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl font-black text-[#1e1e40] mb-0.5">
                  99.9%
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Trust Score
                </div>
              </div>
            </div>
          </div>

          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform translate-y-1/2 -translate-x-1/4"></div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-7/12 p-8 md:p-12 lg:p-14 flex flex-col justify-center bg-white relative">
          <div className="max-w-md mx-auto w-full">
            {/* Top Navigation Tab for Login / Register */}
            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl mb-8">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 text-sm font-extrabold tracking-wide rounded-xl transition-all flex items-center justify-center gap-2 ${isLogin ? "bg-white text-[#1e1e4e] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                <LogIn className="w-4 h-4" /> Login
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 text-sm font-extrabold tracking-wide rounded-xl transition-all flex items-center justify-center gap-2 ${!isLogin ? "bg-white text-[#1e1e4e] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                <UserPlus className="w-4 h-4" /> Register
              </button>
            </div>

            <h2 className="text-3xl font-bold text-[#1e1e40] mb-2 tracking-tight">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-slate-500 text-sm mb-8 font-medium">
              {isLogin
                ? "Sign in to your FuelEase account to continue."
                : "Join the FuelEase ecosystem today."}
            </p>

            {error && (
              <div className="bg-red-50/80 border border-red-100 text-red-600 p-3.5 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {!isLogin && (
                <>
                  {/* Custom Segmented Control for Role */}
                  <div className="flex bg-slate-100/80 p-1.5 rounded-xl mb-2">
                    <button
                      type="button"
                      onClick={() => setRole("user")}
                      className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${role === "user" ? "bg-[#1e1e4e] text-white shadow-md" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      Vehicle Owner
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("station")}
                      className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${role === "station" ? "bg-[#1e1e4e] text-white shadow-md" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      Fuel Station
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-[10px] font-bold text-[#1e1e4e] mb-1.5 uppercase tracking-widest flex items-center gap-1.5 opacity-80">
                        <UserPlus className="w-3.5 h-3.5" /> Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        required
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium placeholder-slate-400"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#1e1e4e] mb-1.5 uppercase tracking-widest flex items-center gap-1.5 opacity-80">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        required
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium placeholder-slate-400"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-[10px] font-bold text-[#1e1e4e] mb-1.5 uppercase tracking-widest flex items-center gap-1.5 opacity-80">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                        Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        required
                        minLength="6"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium placeholder-slate-400"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#1e1e4e] mb-1.5 uppercase tracking-widest flex items-center gap-1.5 opacity-80">
                        <Camera className="w-3.5 h-3.5" /> Profile Picture
                      </label>
                      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center p-2 min-h-[46px]">
                        {profilePictureUrl ? (
                          <div className="flex items-center justify-between w-full px-2">
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 truncate">
                              <FileCheck className="w-3.5 h-3.5 flex-none" />{" "}
                              Uploaded
                            </span>
                            <button
                              type="button"
                              onClick={() => setProfilePictureUrl("")}
                              className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                              title="Remove image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <ImageUploader
                            onUploadSuccess={(url) => setProfilePictureUrl(url)}
                            label="Upload Avatar"
                            altText="Avatar"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {role === "user" && (
                    <div className="bg-slate-100/60 rounded-[1.5rem] p-5 border border-slate-200/60 relative mt-2">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                      <label className="text-xs font-bold text-[#1e1e40] uppercase tracking-wider flex items-center gap-2 mb-4">
                        <div className="bg-indigo-100 text-indigo-600 p-1 rounded-md">
                          <FileCheck className="w-4 h-4" />
                        </div>
                        Identity Verification
                      </label>

                      <div className="mb-4 relative z-10">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest ml-1">
                          NIC Number
                        </label>
                        <input
                          type="text"
                          placeholder="123456789V"
                          required
                          className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all font-medium uppercase placeholder-slate-300"
                          value={nicNumber}
                          onChange={(e) => setNicNumber(e.target.value)}
                        />
                      </div>
                      <div className="relative z-10">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest ml-1">
                          NIC Photo Upload
                        </label>
                        {nicImageUrl ? (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                            <span className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                              <FileCheck className="w-5 h-5 flex-none" /> NIC
                              Photo Uploaded
                            </span>
                            <button
                              type="button"
                              onClick={() => setNicImageUrl("")}
                              className="text-xs font-bold text-red-600 uppercase tracking-wide hover:underline px-2 py-1"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <ImageUploader
                            onUploadSuccess={(url) => setNicImageUrl(url)}
                            label="Drag & drop or Browse"
                            altText="NIC"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {role === "station" && (
                    <div className="bg-slate-100/60 rounded-[1.5rem] p-5 border border-slate-200/60 relative mt-2">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                      <label className="text-xs font-bold text-[#1e1e40] uppercase tracking-wider flex items-center gap-2 mb-4">
                        <div className="bg-emerald-100 text-emerald-600 p-1 rounded-md">
                          <FileCheck className="w-4 h-4" />
                        </div>
                        Station Verification
                      </label>

                      <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                            Location
                          </label>
                          <input
                            type="text"
                            placeholder="Colombo 03"
                            required
                            className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-all font-medium"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                            District
                          </label>
                          <select
                            required
                            className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-all font-medium appearance-none"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                          >
                            <option value="" disabled>
                              Select District
                            </option>
                            {[
                              "Ampara",
                              "Anuradhapura",
                              "Badulla",
                              "Batticaloa",
                              "Colombo",
                              "Galle",
                              "Gampaha",
                              "Hambantota",
                              "Jaffna",
                              "Kalutara",
                              "Kandy",
                              "Kegalle",
                              "Kilinochchi",
                              "Kurunegala",
                              "Mannar",
                              "Matale",
                              "Matara",
                              "Monaragala",
                              "Mullaitivu",
                              "Nuwara Eliya",
                              "Polonnaruwa",
                              "Puttalam",
                              "Ratnapura",
                              "Trincomalee",
                              "Vavuniya",
                            ].map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="relative z-10">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                          BR Document URL
                        </label>
                        <input
                          type="url"
                          placeholder="Google Drive / Dropbox Link"
                          required
                          className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-all font-medium"
                          value={documentUrl}
                          onChange={(e) => setDocumentUrl(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {isLogin && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-[#1e1e4e] mb-1.5 uppercase tracking-widest flex items-center gap-1.5 opacity-80">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium placeholder-slate-400"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[10px] font-bold text-[#1e1e4e] uppercase tracking-widest flex items-center gap-1.5 opacity-80">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                        Password
                      </label>
                      <a
                        href="#"
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        Forgot?
                      </a>
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••"
                      required
                      minLength="6"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium placeholder-slate-400"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full bg-[#1e1e6e] hover:bg-[#151550] text-white font-bold text-sm py-4 px-4 rounded-xl mt-4 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#1e1e6e]/20 active:scale-[0.98]"
              >
                {isLogin ? "Sign In" : "Register"}
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </form>

            <div className="mt-8 text-center border-t border-slate-100 pt-6">
              <span className="text-slate-500 text-sm font-medium">
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
              </span>
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-[#1e1e6e] hover:text-indigo-700 font-bold transition"
              >
                {isLogin ? "Register here" : "Login \u2192"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
