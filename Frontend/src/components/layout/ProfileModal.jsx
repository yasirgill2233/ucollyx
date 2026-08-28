import React, { useState, useRef } from "react";
import { X, Camera } from "lucide-react";
import API from "../../api/axios";

const ProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "");

  // URL strategy handle karne ke liye hum check karenge ke image full URL hai ya server path
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  console.log("Current User in Profile Modal:", currentUser?.avatar_url);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      // Instant preview ke liye local blob URL banayein
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("full_name", fullName);
      formData.append("phone", phone);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await API.put("/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        // Backend hamesha humein naye file ka avatar_url return karega
        const serverAvatarUrl = res.data.data?.avatar_url;

        const updatedUser = {
          ...user,
          full_name: fullName,
          phone: phone,
          // Agar backend se url aye to wo use karein warna fallback to existing preview
          avatar_url: serverAvatarUrl || avatarPreview,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        onUpdate(updatedUser);
        onClose();
      }
    } catch (err) {
      console.error("Profile update error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[300] flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <h3 className="text-base font-bold text-slate-800">My Profile</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 bg-slate-50/30">
          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center gap-3 py-2">
            <div className="relative group">
              {avatarPreview || currentUser?.avatar_url ? (
                <img
                  src={
                    avatarPreview
                      ? avatarPreview
                      : currentUser?.avatar_url
                  }
                  alt="Profile Preview"
                  crossOrigin="anonymous"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md transition-all group-hover:opacity-90"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-md uppercase">
                  {fullName ? fullName[0] : "U"}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg border border-slate-100 text-blue-600 hover:bg-slate-50 hover:scale-105 transition-all"
              >
                <Camera size={16} />
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <p className="text-[10px] text-slate-400 font-semibold tracking-wide">
              PNG, JPG or JPEG (Max 2MB)
            </p>
          </div>

          {/* Email (Read Only) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="text"
              disabled
              value={user?.email || ""}
              className="w-full bg-gray-100 border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-gray-500 cursor-not-allowed outline-none"
            />
          </div>

          {/* Full Name Field */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-slate-700 focus:border-blue-500 focus:outline-none transition-all shadow-sm"
            />
          </div>

          {/* Phone Number Field */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+92 300 1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-slate-700 focus:border-blue-500 focus:outline-none transition-all shadow-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {loading ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
