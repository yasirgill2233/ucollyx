import { useState } from "react";
import { X } from "lucide-react";

// Sub-Component: Invite Modal
function InviteModal({ onClose, onInvite }) {
  const [formData, setFormData] = useState({ email: '', role: 'Developer', team: 'Frontend Team', name:'' });

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
      <div className="bg-white rounded-[28px] w-full max-w-md shadow-2xl border border-slate-100 animate-in zoom-in-95">
        <div className="p-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Invite User</h2>
            <p className="text-slate-500 text-sm">Add member to workspace.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-8 pt-2 space-y-4">
          <input 
            placeholder="Email Address" 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <select 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            onChange={(e) => setFormData({...formData, role: e.target.value})}
          >
            <option value="dev">Developer</option>
            <option value="manager">Manager</option>
            <option value="qa">Quality Assurance</option>
          </select>
        </div>
        <div className="p-6 bg-slate-50/50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm">Cancel</button>
          <button 
            onClick={() => onInvite({ name: formData.email.split('@')[0], ...formData })}
            className="flex-[1.5] py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg"
          >
            Send Invitation
          </button>
        </div>
      </div>
    </div>
  );
}

export default InviteModal