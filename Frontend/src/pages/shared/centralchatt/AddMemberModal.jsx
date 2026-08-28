import React, { useEffect, useState } from 'react';
import { X, Search, UserPlus } from 'lucide-react';
import API from '../../../api/axios';

import { useWorkspaceMembers } from '../../../hooks/useWorkspace';

const AddMemberModal = ({ isOpen, onClose, onAdd, existingMembers = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // React Query Hook
  const { data: membersResp } = useWorkspaceMembers();
  const allUsers = membersResp || [];

  console.log("Users:",membersResp)

  // Filter Logic: Jo pehle se member nahi hain aur search match kar rahe hain
  const availableToAdd = allUsers.filter(member => {
    const isAlreadyMember = existingMembers.some(
      (em) => em.email === member.User.email // ID ya Email se check karna behtar ha
    );
    const matchesSearch = member.User.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return !isAlreadyMember && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[250] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[380px] rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="p-6 pb-2 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Add to Channel</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 pt-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400"
            />
          </div>

          <div className="space-y-1 max-h-[250px] overflow-y-auto custom-scrollbar">
            {availableToAdd.length > 0 ? (
              availableToAdd.map((member) => (
                <div 
                  key={member.User.id}
                  onClick={() => { onAdd(member); onClose(); }}
                  className="flex items-center justify-between group cursor-pointer hover:bg-blue-50 p-2 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${'bg-red-500'} flex items-center justify-center text-white font-bold text-xs`}>
                      {member.User.full_name[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{member.User.full_name}</h4>
                      <p className="text-[10px] text-gray-400">{member.User.role}</p>
                    </div>
                  </div>
                  <UserPlus size={16} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 text-xs py-10">No new members to add</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;