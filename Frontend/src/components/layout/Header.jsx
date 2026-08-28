import React, { useState } from "react";
import { Search, Bell, ChevronDown, LogOut, Key, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import ProfileModal from "./ProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";
import { useQueryClient } from "@tanstack/react-query";

const Header = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  console.log("Current User in Header:", currentUser?.avatar_url);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await API.get("users/signed-out");
    } catch (err) {
      console.error("Logout API failed:", err);
    } finally {
      queryClient.clear();
      localStorage.clear();
      navigate("/login");
    }
  };

  const updateUserInfo = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  if (!currentUser) return null;

  return (
    <>
      <header className="h-16 border-b border-gray-200 flex items-center justify-between px-8 bg-white relative">
        <div className="relative w-1/2 md:ml-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-all"
            >
              <div className="flex items-center gap-2.5 bg-gradient-to-r from-slate-900/90 to-slate-800/90 text-white p-1 pl-4 rounded-full border border-slate-700/60 shadow-lg shadow-slate-950/20 backdrop-blur-md transition-all duration-300 hover:border-slate-500 hover:shadow-slate-950/40 group">
                <div className="md:text-[11px] text-[8px] font-black tracking-widest uppercase text-slate-200 group-hover:text-white transition-colors">
                  {currentUser?.role
                    ? currentUser.role.split("_").join(" ")
                    : "USER"}
                </div> 
                <div className="relative flex items-center justify-center">
                  <div className="relative md:w-8 md:h-8 w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[2px] shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-xs uppercase overflow-hidden">
                      {currentUser?.avatar_url ? (
                        <img
                          src={currentUser.avatar_url}
                          alt="Avatar"
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <span className="bg-gradient-to-br from-blue-500 to-indigo-600 w-full h-full flex items-center justify-center text-white font-bold text-xs">
                          {currentUser?.full_name
                            ? currentUser.full_name[0]
                            : "U"}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-sm"></span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </div>
            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                ></div>

                <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-2 animate-in fade-in zoom-in duration-150">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {currentUser?.full_name}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium truncate">
                      {currentUser?.email}
                    </p>
                  </div>

                  <div className="p-1">
                    <button
                      onClick={() => {
                        setIsProfileOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                    >
                      <User size={16} className="text-slate-500" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsPasswordOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                    >
                      <Key size={16} className="text-slate-500" />
                      <span>Change Password</span>
                    </button>
                  </div>

                  <div className="border-t border-gray-50 mt-1 p-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-bold"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        onUpdate={updateUserInfo}
      />

      <ChangePasswordModal
        isOpen={isPasswordOpen}
        onClose={() => setIsPasswordOpen(false)}
      />
    </>
  );
};

export default Header;
