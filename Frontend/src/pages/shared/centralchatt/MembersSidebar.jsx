import React from "react";
import { X, Plus } from "lucide-react";

const MembersSidebar = ({
  isOpen,
  onClose,
  channelName,
  members = [],
  onAddMember,
  memberRole,
}) => {
  if (!isOpen) return null;

  console.log(
    "Members Data:",
    members,
    "Channel Name:",
    channelName,
    memberRole,
  );

  const onlineMembers = members.filter((m) => m.User.last_login !== null);
  const offlineMembers = members.filter((m) => m.User.last_login === null);

  return (
    <div className="fixed inset-y-0 right-0 w-72 bg-white border-l border-gray-100 shadow-2xl z-[200] animate-in slide-in-from-right duration-300">
      <div className="p-5 flex justify-between items-center border-b border-gray-50">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Members</h3>
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
            #{channelName}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
        {memberRole === "admin" ? (
          <div>
            <button
              onClick={onAddMember}
              className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-gray-100 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600">
                <Plus size={16} />
              </div>
              <span className="text-sm font-bold">Add Member</span>
            </button>
          </div>
        ) : (
          ""
        )}

        {/* Online Section */}
        {onlineMembers.length > 0 && (
          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">
              Online — {onlineMembers.length}
            </h4>
            <div className="space-y-4">
              {onlineMembers.map((member, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-2 group cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-all"
                >
                  <div className="relative">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs`}
                    >
                      {member.User?.avatar_url ? (
                        <img
                          src={
                            member.User?.avatar_url
                          }
                          alt="Avatar"
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        <div className="w-full h-full bg-black rounded-2xl flex justify-center items-center">
                          {member?.User?.full_name[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">
                        {member?.User?.full_name}
                      </span>
                      {member.isMe && (
                        <span className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md font-black uppercase">
                          you
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {member?.role_in_channel || "Member"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {offlineMembers.length > 0 && (
          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">
              Offline — {offlineMembers.length}
            </h4>
            <div className="space-y-4">
              {offlineMembers.map((member, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-2 opacity-60"
                >
                  <div className="relative">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs grayscale`}
                    >
                      {member.User?.avatar_url ? (
                        <img
                          src={
                            member.User?.avatar_url
                          }
                          alt="Avatar"
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        <div className="w-full h-full bg-black rounded-2xl flex justify-center items-center">
                          {member?.User?.full_name[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gray-300 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {member?.User?.full_name}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {member?.role_in_channel || "Member"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersSidebar;
