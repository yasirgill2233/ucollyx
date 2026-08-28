import React from "react";

const TeamManagementModal = ({
  activeModal,
  setActiveModal,
  selectedProject,
  selectedUserId,
  setSelectedUserId,
  allUsers,
  projectTeam,
  handleAddMember,
  handleRoleChange,
  removeMember,
  handleSaveChanges,
}) => {
  if (activeModal == "team") return null;

  function handleRoleChange1(){
    console.log("hello")
  }

  console.log("lkjklj", projectTeam)
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-10 shadow-2xl animate-in zoom-in duration-200">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Manage Team
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-1 italic">
              Select members for "{selectedProject?.name}"
            </p>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="text-slate-300 hover:text-slate-900 text-xl font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* SEARCHABLE DROPDOWN & ADD BUTTON */}
        <div className="flex gap-3 mb-10">
          <div className="flex-1 relative">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full border border-slate-100 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all bg-slate-50/50 font-bold text-slate-600 appearance-none cursor-pointer"
            >
              <option value="">Choose a member from list...</option>
              {allUsers?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user?.full_name} ({user?.email}){" "}
                  {/* FIX: user.name -> user.full_name */}
                </option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              ↓
            </div>
          </div>
          <button
            onClick={handleAddMember}
            className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            Add
          </button>
        </div>

        {/* MEMBERS LIST (Dynamic) */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 mb-10 custom-scrollbar">
          {selectedProject?.members && selectedProject?.members.length > 0 ? (
            selectedProject?.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-5 border border-slate-50 rounded-2xl bg-white hover:border-indigo-100 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs border border-indigo-100 italic uppercase">
                    {/* SAFE ACCESS: optional chaining and fallback to full_name */}
                    {member?.full_name
                      ? member.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      : "??"}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">
                      {member?.full_name || "Unknown User"}{" "}
                      {/* FIX: member.name -> member.full_name */}
                    </p>
                    <p className="text-[11px] font-bold text-slate-400">
                      {member?.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <select
                    value={member?.ProjectMember?.project_role}
                    onChange={(e) =>
                      handleRoleChange(member.id, e.target.value)
                    }
                    className="border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-blue-500 outline-none bg-slate-50 font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="Member">Member</option>
                    <option value="Manager">Manager</option>
                  </select>
                  <button
                    onClick={() => removeMember(member.id)}
                    className="text-slate-200 hover:text-rose-500 font-bold text-2xl transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                No members added yet
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
          <button
            onClick={() => setActiveModal(null)}
            className="px-8 py-3.5 rounded-2xl font-black text-[10px] text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            Discard
          </button>
          <button
            onClick={() => handleSaveChanges()}
            className="px-10 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamManagementModal;
