import { useState } from "react";
import { Settings, Save, Loader, X } from "lucide-react";
import api from "../api/axios";

export default function ManageAccountPanel({ onClose, user }) {
  const [name, setName] = useState(user?.name || "");
  const [password, setPass] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {};
      if (name && name !== user?.name) payload.name = name;
      if (password) payload.password = password;

      if (Object.keys(payload).length === 0) {
        setError("No changes to save.");
        setSaving(false);
        return;
      }

      const res = await api.put("/account", payload);
      const updatedUser = { ...user, ...res.data.user };
      localStorage.setItem("fuelease_user", JSON.stringify(updatedUser));
      setSuccess("Account updated successfully!");
      setPass("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update account.");
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="solid-card modal-card w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-500" /> Manage Account
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Update your name or password
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex justify-center pt-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-2xl font-black text-white shadow-xl overflow-hidden">
            {user?.profile_picture_url || user?.profile_image ? (
              <img
                src={user?.profile_picture_url || user?.profile_image}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg">{initials}</span>
            )}
          </div>
        </div>

        <form
          onSubmit={handleSave}
          className="px-6 pt-5 pb-7 flex flex-col gap-4"
        >
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-2.5 rounded-xl font-medium">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="solid-input text-sm"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPass(e.target.value)}
              className="solid-input text-sm"
              placeholder="Leave blank to keep current"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="solid-btn w-full mt-2 flex items-center justify-center gap-2"
          >
            {saving ? (
              <><Loader className="w-4 h-4 animate-spin" /> Saving…</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
