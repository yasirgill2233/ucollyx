import React from 'react';
import { X, Mail, Phone, Calendar, MessageSquare } from 'lucide-react';

const UserProfileSidebar = ({ isOpen, onClose, userData }) => {
  if (!isOpen) return null;

  console.log("Hm check kr rha hain data in user profile::::::::::::",userData)

  // Default data agar userData provide na ho
  const user = userData || {
    // const user = {
    user: 'default',
    email: 'default@gmail.com',
    status: 'Active',
    localTime: '3:30 PM Local Time',
  };

  return (
    <>
      {/* Backdrop for mobile or focus */}
      <div className="fixed inset-0 bg-slate-300/40 z-[250]" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-gray-100 shadow-2xl z-[300] animate-in slide-in-from-right duration-300 flex flex-col">
        
        {/* Header */}
        <div className="p-5 flex justify-between items-center border-b border-gray-50">
          <h3 className="font-bold text-slate-800 text-base">Profile</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          
          {/* Large Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 rounded-3xl bg-slate-100 border border-gray-100 overflow-hidden relative shadow-inner">
               {/* Placeholder for User Image */}
               <div className="w-full h-full flex items-center justify-center bg-slate-200">
                  <div className="w-24 h-24 bg-slate-800 rounded-full" />
               </div>
            </div>
          </div>

          {/* User Basic Info */}
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-black text-slate-800 leading-none">{user.user}</h2>
                <div className="flex items-center gap-2 mt-2">
                  {user.last_login !== null ? (<div className="w-2 h-2 bg-green-500 rounded-full" />):(<div className="w-2 h-2 bg-gray-400 rounded-full" />)}
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{user.last_login !== null ? 'Online' : 'Offline'}</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">{user.localTime}</p>
              </div>
              <button className="text-blue-600 text-xs font-bold hover:underline">Edit</button>
            </div>
            {/* <button className="text-blue-600 text-[11px] font-bold flex items-center gap-1">
              + Add name pronunciation
            </button> */}
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Contact Information</h4>
              <button className="text-blue-600 text-xs font-bold hover:underline">Edit</button>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-slate-600 border border-gray-100">
                <Mail size={16} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter leading-none mb-1">Email Address</p>
                <p className="text-sm font-semibold text-slate-600 break-all">{user.email}</p>
              </div>
            </div>

            {user.phone ? (<div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-slate-600 border border-gray-100">
                <Phone size={16} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter leading-none mb-1">Phone</p>
                <p className="text-sm font-semibold text-slate-600 break-all">{user.phone}</p>
              </div>
            </div>):(

            <button className="text-blue-600 text-[11px] font-bold flex items-center gap-1 pl-1">
              + Add Phone
            </button>)}
          </div>

          {/* About Me */}
          <div className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">About me</h4>
              <button className="text-blue-600 text-xs font-bold hover:underline">Edit</button>
            </div>

            {user.startdate ? (<div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-slate-600 border border-gray-100">
                <Calendar size={16} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter leading-none mb-1">Start Date</p>
                <p className="text-sm font-semibold text-slate-600 break-all">{user.startdate}</p>
              </div>
            </div>):
            
            (<button className="text-blue-600 text-[11px] font-bold flex items-center gap-1">
              + Add Start Date
            </button>)}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-50 bg-gray-50/30">
          <button className="w-full bg-white border border-gray-200 py-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
            <MessageSquare size={16} />
            Message
          </button>
        </div>
      </div>
    </>
  );
};

export default UserProfileSidebar;