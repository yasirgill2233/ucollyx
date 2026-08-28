import React from "react";
import {
  X,
  AtSign,
  MessageSquare,
  Hash,
  UserPlus,
  CheckCheck,
} from "lucide-react";
import API from "../../../api/axios";

import { useNotifications } from '../../../hooks/useNotifications';

const NotificationPopover = ({
  isOpen,
  onClose,
  notifications,
  // setNotifications,
  onSelectChat,
}) => {

  const { data: notifResp, markRead, markAllRead } = useNotifications();
  // notifications = notifResp?.data || [];

  if (!isOpen) return null;

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    markAllRead(); // React Query action
  };

  const handleNotifClick = (notif) => {
    if (!notif.is_read) {
      markRead(notif.id); // Mark as read via mutation
    }
    
    // Aapka switch chat logic
    if (notif.target_url) {
      const parts = notif.target_url.split("/");
        const type = parts[2];
        const name = parts[3]; 
        const id = parts[4];
        onSelectChat(name, id, type);
    }
    onClose();
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  console.log("Notifications in Popover:", notifications);

  return (
    <>
      <div className="fixed inset-0 z-[290] bg-black/5" onClick={onClose} />

      <div className="absolute top-16 right-8 w-[380px] bg-white rounded-lg shadow-md border border-slate-100 z-[300] overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300">
        {/* Header */}
        <div className="p-5 flex justify-between items-center bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <h3 className="font-black text-slate-800 tracking-tight">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">
                {unreadCount} New
              </span>
            )}
          </div>
          <button
            onClick={handleMarkAllRead}
            className="text-[11px] font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:cursor-pointer"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto bg-white">
          {notifications.filter((n) => !n.is_read).length > 0 ? (
            notifications
              .filter((n) => !n.is_read)
              .map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  className="p-4 flex gap-4 cursor-pointer transition-all border-b border-slate-50 group bg-blue-50/30 hover:bg-slate-100"
                >
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      notif.type === "mention"
                        ? "bg-indigo-100 text-indigo-600"
                        : notif.type === "dm"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {notif.type === "mention" ? (
                      <AtSign size={16} />
                    ) : (
                      <MessageSquare size={16} />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-[13px] leading-snug font-bold text-slate-800">
                      {notif.content}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-wider">
                      {new Date(notif.createdAt).toLocaleTimeString([], {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white self-center" />
                </div>
              ))
          ) : (
            <div className="py-20 text-center">
              <p className="text-slate-300 font-bold text-sm">
                All caught up! No unread notifications ☕
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPopover;