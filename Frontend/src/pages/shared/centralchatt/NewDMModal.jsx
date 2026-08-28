import { useState } from "react";
import { X, Search } from "lucide-react";
import { useWorkspaceMembers } from "../../../hooks/useWorkspace";

const NewDMModal = ({ isOpen, onClose, onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: allUsers = [] } = useWorkspaceMembers();

  console.log(onSelectUser, "onSelectUser in new dm modal");
  console.log(allUsers, "allUsers in new dm modal");

  const filteredMembers = allUsers.filter((member) =>
    member.User?.full_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[150] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[400px] rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 pb-2 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">
            New Direct Message
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 pt-2 space-y-6">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search team members..."
              className="w-full bg-gray-50/50 border border-gray-100 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all"
            />
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <div
                  key={member.User.id}
                  onClick={() => {
                    onSelectUser(member.User);
                    onClose();
                  }}
                  className="flex items-center justify-between group cursor-pointer hover:bg-blue-50/50 p-2.5 rounded-xl transition-all border border-transparent hover:border-blue-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20 font-bold shadow-sm transition-transform group-hover:scale-105`}
                      >
                        {/* {member.User.full_name} */}
                        {member.User?.avatar_url ? (
                          <img
                            src={
                              member?.User?.avatar_url
                            }
                            alt="Avatar"
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <div className="text-black w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center">
                            {member?.User?.full_name[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${member.User.last_login !== null ? "bg-green-500" : "bg-gray-300"}`}
                      />
                    </div>

                    <div>
                      <h4 className="text-[13px] font-bold text-slate-800">
                        {member?.User?.full_name}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {member.role} •{" "}
                        <span
                          className={
                            member.status === "active"
                              ? "text-green-500"
                              : "text-gray-400"
                          }
                        >
                          {member.status}
                        </span>
                      </p>
                    </div>
                  </div>

                  <button className="text-blue-600 text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 pr-2">
                    Message <span className="text-sm">→</span>
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 text-xs py-4">
                No members found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDMModal;
