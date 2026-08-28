import React, { useState, useEffect, useRef, useMemo } from "react";
import JitsiVideoCall from "./Video/JitsiVideoCall";
import {
  Hash,
  MessageSquare,
  AtSign,
  Paperclip,
  Send,
  Video,
  Mic,
  Settings,
  Search,
  Plus,
  BellIcon,
  MoreHorizontal,
  Smile,
  Calendar,
  X,
  FileText,
  Clock,
  Menu,
} from "lucide-react";

import EmojiPicker from "emoji-picker-react";

import { useQueryClient } from "@tanstack/react-query";

import {
  useMessages,
  useSendMessage,
  useConversations,
} from "../../../hooks/useChat";
import { useNotifications } from "../../../hooks/useNotifications";
import {
  useChannelMembers,
  useChannels,
  useCreateChannel,
  useAddMember,
} from "../../../hooks/useChannels";

import socket from "../../../context/SocketContext";

import CreateChannelModal from "./CreateChannelModal";
import NewDMModal from "./NewDMModal";
import MembersSidebar from "./MembersSidebar";
import GlobalSearchModal from "./GlobalSearchModal";
import NotificationPopover from "./NotificationPopOver";
import UserProfileSidebar from "./UserProfileSidebar";
import AddMemberModal from "./AddMemberModal";
import ScheduleMeetingModal from "./Video/ScheduleMeetingModal";
import { triggerToast } from "../../../utils/toastHelper";
import { useMeeting } from "../../../hooks/useMeeting";
import { TranscriptWrapper } from "../transcript/TranscriptWrapper";

// 1. Helper function to categorize dates (Component ke bahar rakh sakte hain)
const getChatGroupLabel = (dateString) => {
  if (!dateString) return "Unknown Date";
  const messageDate = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (messageDate.toDateString() === today.toDateString()) {
    return "Today";
  } else if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return messageDate.toLocaleDateString([], {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
};

const DevChat = () => {
  const [activeChat, setActiveChat] = useState({});
  const [inputText, setInputText] = useState("");
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [chatMembers, setChatMembers] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [isDMModalOpen, setIsDMModalOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [chatData, setChatData] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [typingStatus, setTypingStatus] = useState({}); // Stores user typing data per room/user
  const typingTimeoutRef = useRef(null);

  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);

  const queryClient = useQueryClient();

  const user = JSON.parse(localStorage.getItem("user"));

  const currentUserId = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))?.id
    : null;

  // Component ke andar
  const { startCall, endCall, scheduleCall, updateStatus } = useMeeting(
    activeChat.id,
  );
  const [currentMeetingId, setCurrentMeetingId] = useState(null);

  // 1. Jab Instant Video Icon par click ho (Start Call)
  const handleStartMeeting = () => {
    const payload = {
      // Logic: Agar channel hai to channel_id, warna DM hai to receiver_id
      channel_id: activeChat.type === "channel" ? activeChat.id : null,
      receiver_id: activeChat.type === "dm" ? activeChat.id : null,
      content: `Video Meeting in ${activeChat.name}`,
      type: "call",
    };

    startCall.mutate(payload, {
      onSuccess: (res) => {
        // res.data.id backend se aane wali message primary key hai
        setCurrentMeetingId(res.data.id);
        setIsVideoModalOpen(true);
      },
    });
  };

  // 2. Jab Schedule Modal submit ho
  const handleScheduleSubmit = (formData) => {
    const payload = {
      channel_id: activeChat.type === "channel" ? activeChat.id : null,
      receiver_id: activeChat.type === "dm" ? activeChat.id : null,
      content: formData.title,
      scheduled_at: `${formData.date} ${formData.time}:00`,
      type: "call",
      call_status: "scheduled",
    };

    scheduleCall.mutate(payload, {
      onSuccess: () => setIsScheduleModalOpen(false),
    });
  };

  const handleOnMeetingClose = () => {
    if (currentMeetingId) {
      endCall.mutate(currentMeetingId);
      setCurrentMeetingId(null);
    }
    setIsVideoModalOpen(false);
  };

  const { data: channelsData } = useChannels((firstChannel) => {
    if (!activeChat.id) {
      setActiveChat({
        name: firstChannel.name,
        type: "channel",
        id: `${firstChannel.id}`,
      });
    }
  });
  const { data: chatResp } = useMessages(activeChat.type, activeChat.id);
  const { data: notifResp } = useNotifications();
  const { data: membersResp } = useChannelMembers(
    activeChat?.id,
    activeChat?.type === "channel",
  );
  const { data: convData } = useConversations();

  // --- Mutations ---
  const { mutate: sendMsg } = useSendMessage();
  const { mutate: makeChannel } = useCreateChannel();
  const { mutate: addMemberMutate } = useAddMember();

  const notifications = notifResp?.data || [];
  const channelMembers = membersResp?.data || [];
  const channels = channelsData?.data || [];
  const dmUsers = convData?.data || [];

  console.log("Hey There##@@##@@:::::", channelMembers);

  const activeRole = channelMembers?.filter((member) => {
    return member?.role_in_channel === "admin";
  });

  console.log(
    "Active Role Active Role::",
    activeRole[0]?.user_id == currentUserId
      ? activeRole[0]?.role_in_channel
      : "member",
  );

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const addNewChannel = (channelData) => {
    const payload = {
      name: channelData.name,
      description: channelData.description,
      is_private: channelData.is_private,
      type: channelData.is_private ? "private" : "public",
    };

    makeChannel(payload, {
      onSuccess: (data) => {
        triggerToast(`Channel '${data.data.name}' created!`, "success");
        switchChat(data.data.name, "channel", data.data.id);
      },
      onError: (err) => {
        const errorMsg = err.response?.data?.errors
          ? err.response.data.errors
              .map((e) => `${e.field}: ${e.message}`)
              .join("\n")
          : err.response?.data?.message || "Creation failed";
        triggerToast(errorMsg, "error");
      },
    });
  };

  const startNewDM = (user) => {
    const isAlreadyAdded = dmUsers.some((existing) => existing.id === user.id);

    if (!isAlreadyAdded) {
      queryClient.setQueryData(["conversations"], (oldData) => {
        return {
          ...oldData,
          data: [user, ...(oldData?.data || [])],
        };
      });
    }

    switchChat(user.full_name, "dm", `${user.id}`);
  };

  const onEmojiClick = (emojiData) => {
    setInputText((prev) => prev + emojiData.emoji);
  };

  const handleAddMember = (memberObj) => {
    if (!memberObj || !activeChat?.id) return;

    const numericId = activeChat.id.toString().split("-").pop();

    const payload = {
      channelId: numericId,
      userId: memberObj.User.id,
      role: "member",
      mainAdmin:
        activeRole[0]?.user_id == currentUserId
          ? activeRole[0]?.role_in_channel
          : "member",
    };

    addMemberMutate(payload, {
      onSuccess: () => {
        triggerToast("Member added successfully", "success");
      },
      onError: (err) =>
        triggerToast(err.response?.data?.message || "Failed", "error"),
    });
  };

  const handleSendMessage = async () => {
    if ((!inputText.trim() && selectedFiles.length === 0) || !activeChat)
      return;

    const formData = new FormData();
    const numericId = activeChat.id.toString().split("-").pop();

    formData.append("text", inputText.trim());
    formData.append("type", activeChat.type);

    formData.append("name", activeChat?.name || "User");

    if (activeChat.type === "channel") {
      formData.append("channelId", numericId);
    } else {
      formData.append("receiverId", numericId);
    }

    selectedFiles.forEach((file) => {
      formData.append("attachments", file);
    });

    sendMsg(formData, {
      onSuccess: (res) => {
        setInputText("");
        setSelectedFiles([]);
        // triggerToast("Message Sent!", "success");
      },
      onError: (err) => {
        triggerToast(err.response?.data?.message || "Failed to send", "error");
      },
    });

    // handleSendMessage function ke andar jahan success hoti hai:
    setInputText("");
    setSelectedFiles([]);
    // Clear typing indicator instantly after sending message
    if (socket && activeChat?.id) {
      const numericId = activeChat.id.toString().split("-").pop();
      const roomName =
        activeChat.type === "channel"
          ? `project_room:${numericId}`
          : `user_room:${numericId}`;
      socket.emit("chat:stop_typing", { roomName });
    }
  };

  const switchChat = (name, type, id) => {
    setActiveChat({ name, type, id });
    setChatMembers([]);
    if (!id) {
      if (!chatData[id]) {
        setChatData((prev) => ({ ...prev, [id]: [] }));
      }
      return;
    }
  };

  const handleUserClick = (userData) => {
    setSelectedUser(userData);
    setIsProfileOpen(true);
  };

  const allUsers1 = [
    { id: 1, name: "Yasir", avatar: "" },
    { id: 2, name: "Ali", avatar: "" },
    { id: 3, name: "Zain", avatar: "" },
    { id: 4, name: "Osama", avatar: "" },
  ];

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputText(value);

    // ----------- ✍️ SOCKET TYPING INDICATOR LOGIC -----------
    if (socket && activeChat?.id) {
      const numericId = activeChat.id.toString().split("-").pop();
      const roomName =
        activeChat.type === "channel"
          ? `project_room:${numericId}`
          : `user_room:${numericId}`; // Target user room for DM

      if (value.trim().length > 0) {
        // Send typing event to backend
        socket.emit("chat:typing", {
          roomName,
          userName: user?.full_name,
          avatarUrl: user?.avatar_url,
        });

        // Agar pehle se koi timeout chal raha hai to clear karein
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // Agar user 2 seconds tak mazeed kuch type nahi karta, to stop typing emit kar dein
        typingTimeoutRef.current = setTimeout(() => {
          socket.emit("chat:stop_typing", { roomName });
        }, 2000);
      } else {
        // Agar text bilkul mita diya hai, to foran stop emit karein
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socket.emit("chat:stop_typing", { roomName });
      }
    }
    // ---------------------------------------------------------

    if (!activeChat || activeChat.type !== "channel") {
      setShowMentions(false);
      return;
    }

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtPos = textBeforeCursor.lastIndexOf("@");

    if (lastAtPos !== -1) {
      const query = textBeforeCursor.substring(lastAtPos + 1);

      if (query.includes(" ")) {
        setShowMentions(false);
        return;
      }
      setMentionSearch(query);
      const filtered = channelMembers?.filter((u) =>
        u?.User?.full_name.toLowerCase().includes(query.toLowerCase()),
      );

      setFilteredUsers(filtered);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  // Real-time Typing Status Tracking Hook
  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = ({ userId, userName, avatarUrl }) => {
      setTypingStatus((prev) => ({
        ...prev,
        [userId]: { userName, avatarUrl },
      }));
    };

    const handleUserStopTyping = ({ userId }) => {
      setTypingStatus((prev) => {
        const updated = { ...prev };
        delete updated[userId]; // User type karna chorh chuka hai, state se hata dein
        return updated;
      });
    };

    socket.on("chat:user_typing", handleUserTyping);
    socket.on("chat:user_stop_typing", handleUserStopTyping);

    return () => {
      socket.off("chat:user_typing", handleUserTyping);
      socket.off("chat:user_stop_typing", handleUserStopTyping);
    };
  }, []);

  // 1. Helper Function: String ko clean slug banane ke liye
  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Saari spaces ko hyphen (-) se replace karein
      .replace(/[^\w\-]+/g, ""); // Baki saare gair-zaroori characters mita dein
  };

  const selectMention = (userName, id) => {
    const nameSlug = slugify(userName);

    const cursorPosition = inputText.lastIndexOf("@");
    const textBeforeAt = inputText.substring(0, cursorPosition);

    // Cursor ke baad agar koi text tha to usko cleanly slice karein
    const textAfterAt = inputText
      .substring(cursorPosition)
      .split(" ")
      .slice(1)
      .join(" ");

    // ✅ FIX: Colons ke darmiyan se extra space khatam kar di (@{slug:id})
    const newText = `${textBeforeAt}@{${nameSlug}:${id}} ${textAfterAt}`;

    setInputText(newText);
    setShowMentions(false);
  };

  const renderMessageWithMentions = (text) => {
    if (!text) return "";

    const mentionRegex = /@\{([^:]+):(\d+)\}/g;
    const renderedElements = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      const slug = match[1];
      const userId = match[2];

      if (matchIndex > lastIndex) {
        renderedElements.push(text.substring(lastIndex, matchIndex));
      }

      renderedElements.push(
        <span
          key={`mention-${matchIndex}-${userId}`}
          onClick={() => console.log(`Opening Profile for User ID: ${userId}`)}
          className="text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 font-bold px-1.5 py-0.5 mx-0.5 rounded-md cursor-pointer hover:bg-blue-200 transition-colors inline-block"
        >
          @{slug}
        </span>,
      );

      lastIndex = mentionRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      renderedElements.push(text.substring(lastIndex));
    }

    return renderedElements.length > 0 ? renderedElements : text;
  };

  const getLatestChat = (channels, dms) => {
    const allChats = [
      ...channels.map((c) => ({ ...c, type: "channel" })),
      ...dms.map((d) => ({ ...d, type: "dm", name: d.full_name })),
    ];

    if (allChats.length === 0) return null;

    return allChats.sort((a, b) => {
      const timeA = new Date(
        a.updatedAt || a.createdAt || a.updated_at || a.created_at,
      ).getTime();
      const timeB = new Date(
        b.updatedAt || b.createdAt || b.updated_at || b.created_at,
      ).getTime();
      return timeB - timeA;
    })[0];
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Current time aur scheduled time ka comparison
  const isMeetingLive = (scheduledAt) => {
    const now = new Date();
    const meetingTime = new Date(scheduledAt);
    // Agar waqt ho chuka hai, lekin abhi shuru hue 1 ghante se kam hua hai
    return now >= meetingTime && now - meetingTime < 3600000;
  };

  const messages = useMemo(() => {
    if (!chatResp) return [];

    const rawMessages = chatResp.data?.messages || chatResp.data || [];

    return rawMessages.map((msg) => ({
      id: msg.id,
      user: msg.Sender?.full_name || "Unknown",
      time: new Date(msg.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text: msg.content,
      type: msg.type,
      call_status: msg.call_status,
      scheduled_at: new Date(msg.scheduled_at).toLocaleDateString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      call_duration: msg.call_duration,
      isMe: msg.sender_id === currentUserId,
      status: msg.Sender?.status || "Active",
      last_login: msg.Sender?.last_login || null,
      email: msg.Sender?.email || "",
      created_at: msg?.createdAt,
      avatar_url: msg.Sender?.avatar_url || null,
      attachments: msg.attachments || [],
      transcript: msg.transcript,
    }));
  }, [chatResp, currentUserId]);

  const upcomingMeeting = useMemo(() => {
    const now = new Date();
    return messages.find(
      (msg) =>
        (msg.type === "call" && msg.call_status === "active") ||
        (msg.call_status === "scheduled" &&
          new Date(msg.scheduled_at) <= now &&
          now - new Date(msg.scheduled_at) < 360000),
      // now >= meetingTime && now - meetingTime < 3600000,
    );
  }, [messages]);

  const scheduledMeetingsList = useMemo(() => {
    const now = new Date();
    return messages
      .filter(
        (msg) =>
          msg.type === "call" &&
          msg.call_status === "scheduled" &&
          new Date(msg.scheduled_at) <= now,
      )
      .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
  }, [messages]);

  const handleJoinScheduledMeeting = (meeting) => {
    if (meeting.call_status === "scheduled") {
      updateStatus.mutate({ id: meeting.id, status: "active" });
    }

    setCurrentMeetingId(meeting.id);
    setIsVideoModalOpen(true);
  };

  console.log(
    "##################################################################################",
    chatData,
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [chatData, activeChat, messages.length]);

  useEffect(() => {
    if ((channels.length > 0 || dmUsers.length > 0) && !activeChat?.id) {
      const latest = getLatestChat(channels, dmUsers);

      if (latest) {
        switchChat(
          latest.name || latest.full_name,
          latest.type || (latest.full_name ? "dm" : "channel"),
          latest.id,
        );
      }
    }
  }, [channels, dmUsers]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 2. Memoized Grouping Logic (Taake har render par database arrays heavy computation na karein)
  const groupedMessages = useMemo(() => {
    const groups = {};
    messages.forEach((msg) => {
      // created_at prefer karenge, fallback to timestamp ya msg.time
      const dateLabel = getChatGroupLabel(
        msg.sent_at || msg.created_at || msg.timestamp,
      );
      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(msg);
    });
    return groups;
  }, [messages]);

  // ==========================================
  // 🎯 SOCKET ENGINE INTEGRATION FOR YASIR
  // ==========================================

  // 1. Hook: User Presence Register (Online Synchronization)
  useEffect(() => {
    if (currentUserId && socket) {
      // Backend ko batayein ke hum online hain aur hamara room open kiya jaye
      socket.emit("user_online", currentUserId);
    }
  }, [currentUserId]);

  // 2. Hook: Dynamic Room Subscriptions (Jab bhi activeChat change ho)
  useEffect(() => {
    if (!activeChat?.id || !socket) return;

    const numericId = activeChat.id.toString().split("-").pop();

    // Dynamic room string pattern generation matching controller specs
    const roomName =
      activeChat.type === "channel"
        ? `project_room:${numericId}`
        : `user_room:${currentUserId}`; // Direct DM inbound pipeline

    // Signal backend to map network layer context
    socket.emit("join_chat_room", { roomName });
    console.log(
      `📡 Client tracking active matrix subscription room: ${roomName}`,
    );
  }, [activeChat?.id, activeChat?.type, currentUserId]);

  // 3. Hook: Live Message Capturing Engine & React Query Cache Insertion
  useEffect(() => {
    if (!socket) return;

    const handleIncomingLiveMessage = (newIncomingMessage) => {
      console.log(
        "🔥 Fresh Real-time message landed on frontend:",
        newIncomingMessage,
      );

      // Dynamic verification logic: Ensure it belongs to our current open layout screen context
      const currentActiveNumericId = activeChat?.id
        ?.toString()
        .split("-")
        .pop();

      const isTargetChannel =
        activeChat.type === "channel" &&
        Number(newIncomingMessage.channel_id) ===
          Number(currentActiveNumericId);

      // Check if the message is a DM and involves the active chat user
      const isTargetDM =
        activeChat.type === "dm" &&
        ((Number(newIncomingMessage.sender_id) ===
          Number(currentActiveNumericId) &&
          Number(newIncomingMessage.receiver_id) === Number(currentUserId)) ||
          (Number(newIncomingMessage.sender_id) === Number(currentUserId) &&
            Number(newIncomingMessage.receiver_id) ===
              Number(currentActiveNumericId)));

      if (isTargetChannel || isTargetDM) {
        // ⚡ REACT QUERY CACHE UPDATE INSTANTLY: Modifying active text messages stack
        queryClient.setQueryData(
          ["messages", activeChat.type, activeChat.id],
          (oldData) => {
            if (!oldData) return oldData;

            // Handling both structural scenarios (raw arrays vs nested metadata frames)
            if (Array.isArray(oldData)) {
              return [...oldData, newIncomingMessage];
            } else if (oldData.data && Array.isArray(oldData.data)) {
              return {
                ...oldData,
                data: [...oldData.data, newIncomingMessage],
              };
            } else if (
              oldData.data?.messages &&
              Array.isArray(oldData.data.messages)
            ) {
              return {
                ...oldData,
                data: {
                  ...oldData.data,
                  messages: [...oldData.data.messages, newIncomingMessage],
                },
              };
            }
            return oldData;
          },
        );

        // Smooth auto scroll view trigger to bottom boundary layout
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        }, 80);
      }

      // Trigger update on sidebar conversation tracking lists to pull latest timestamps
      queryClient.invalidateQueries(["conversations"]);
      queryClient.invalidateQueries(["channels"]);
    };

    // Turn listener ON
    socket.on("chat:receive_message", handleIncomingLiveMessage);

    // Cleanup layer on component drop to avoid duplicate listener leaks
    return () => {
      socket.off("chat:receive_message", handleIncomingLiveMessage);
    };
  }, [activeChat?.id, activeChat?.type, currentUserId, queryClient]);

  const getOnlineStatus = (lastActive) => {
    console.log("Login::::", lastActive);
    if (!lastActive) {
      return "OFFLINE_CLUSTER";
    } else {
      return "LIVE_ON_NODE";
    }
    // const diffInSeconds = (new Date() - new Date(lastActive)) / 1000;
    // console.log("Login Minutes:::::",diffInSeconds)
    // return diffInSeconds < 20 ? "LIVE_ON_NODE" : "OFFLINE_CLUSTER";
  };

  // ==========================================

  console.log(
    "#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$",
    groupedMessages,
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#F8FAFC] font-sans overflow-hidden text-slate-900">
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-72 bg-white flex flex-col border-r border-slate-300
          transition-transform duration-300 ease-in-out md:static md:translate-x-0
          ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
        `}
      >
        {/* Sidebar Header */}
        <div className=" h-[68px] px-6 flex justify-between items-center border-b border-slate-300 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center">
              <MessageSquare size={22} className="text-gray-400" />
            </div>
            <h2 className="font-black text-slate-800 tracking-tight text-lg">
              Chatt
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-slate-50 rounded-full transition-colors md:hidden text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
          <div className="relative group" onClick={() => setIsSearchOpen(true)}>
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              size={15}
            />
            <input
              readOnly
              className="w-full bg-slate-100/50 border-transparent border focus:border-blue-500/20 focus:bg-white rounded-xl py-2.5 pl-10 pr-3 text-[13px] outline-none transition-all font-medium cursor-pointer"
              placeholder="Jump to..."
            />
          </div>
          <div>
            <div className="flex justify-between items-center px-2 mb-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                Project Channels
              </span>
              <Plus
                size={16}
                className="text-slate-400 cursor-pointer hover:text-blue-600 transition-all"
                onClick={() => setIsCreateChannelOpen(true)}
              />
            </div>
            <div className="space-y-1">
              {channels.map((ch) => {
                const isChannelActive = activeChat.id === ch.id;
                return (
                  <div
                    key={ch.id}
                    onClick={() => {
                      switchChat(ch.name, "channel", ch.id);
                      setIsSidebarOpen(false); // Mobile par select karte hi sidebar auto-close ho jaye
                    }}
                    className={`flex items-center justify-between group px-3 py-2 rounded-xl text-[13px] cursor-pointer transition-all ${
                      isChannelActive
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Hash
                        size={16}
                        className={`flex-shrink-0 ${isChannelActive ? "text-blue-500" : "text-slate-400"}`}
                      />
                      <span className="truncate">
                        {(() => {
                          const name = ch?.name?.substring(1) || "";

                          if (name.startsWith("announcements"))
                            return "Announcements";
                          if (name.startsWith("random")) return "Random";
                          if (name.startsWith("ai-assistant"))
                            return "AI Assistant";

                          return name
                            .split("-")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase(),
                            )
                            .join(" ");
                        })()}
                      </span>
                    </div>
                    {isChannelActive && (
                      <div
                        className={`flex-shrink-0 w-1.5 h-1.5 ${upcomingMeeting ? "w-2 h-2 animate-ping bg-green-600" : "bg-blue-600"} rounded-full`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Direct Messages Section */}
          <div>
            <div className="flex justify-between items-center px-2 mb-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                Direct Messages
              </span>
              <Plus
                size={16}
                className="text-slate-400 cursor-pointer hover:text-blue-600 transition-all"
                onClick={() => setIsDMModalOpen(true)}
              />
            </div>
            <div className="space-y-1">
              {dmUsers.map((member) => {
                const isDmActive = activeChat.name === member.full_name;
                return (
                  <div
                    key={member.id}
                    onClick={() => {
                      switchChat(member.full_name, "dm", member.id);
                      setIsSidebarOpen(false); // Mobile view screen optimization touch close toggle
                    }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-all cursor-pointer ${
                      isDmActive
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-slate-200 backdrop-blur-md border border-white/20 flex items-center justify-center text-[11px] font-bold text-slate-600 overflow-hidden">
                        {member?.avatar_url ? (
                          <img
                            src={member?.avatar_url}
                            alt="Avatar"
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          member?.full_name[0].toUpperCase()
                        )}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <span className="font-semibold truncate">
                      {member?.full_name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop Backdrop overlay layer for mobile states clicks */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* 2. Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white min-w-0 w-full h-full relative">
        {/* Chat Top Navbar Header */}
        <div className="h-[68px] w-full border-b border-slate-200/80 flex items-center justify-between px-2.5 sm:px-6 bg-white/80 backdrop-blur-md sticky top-0 z-20 flex-shrink-0 transition-all select-none">
          {/* LEFT SECTION: Hamburger + Title + Online Badge */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1 mr-1">
            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 hover:bg-slate-100 rounded-xl md:hidden text-slate-600 flex-shrink-0 transition-colors touch-manipulation"
              aria-label="Open Sidebar"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {/* Icon + Channel Name */}
              <div className="flex items-center gap-1 min-w-0 flex-shrink">
                {activeChat.type === "channel" ? (
                  <Hash size={17} className="text-indigo-500 flex-shrink-0" />
                ) : (
                  <MessageSquare
                    size={17}
                    className="text-indigo-500 flex-shrink-0"
                  />
                )}
                <h3 className="font-extrabold text-slate-800 text-xs sm:text-base tracking-tight truncate max-w-[110px] xs:max-w-[160px] sm:max-w-none">
                  {activeChat.type === "channel"
                    ? activeChat.name?.substring(1)
                    : activeChat.name}
                </h3>
              </div>

              {/* Active Members Metric Badge (Mobile Responsive Compact) */}
              {!isChatLoading && activeChat?.type === "channel" && (
                <button
                  onClick={() => setIsMembersOpen(true)}
                  className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200/60 font-black px-1.5 sm:px-2 py-0.5 rounded-full hover:bg-emerald-100 transition-all flex items-center gap-1 flex-shrink-0 whitespace-nowrap touch-manipulation"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    {
                      channelMembers.filter((u) => u.User?.last_login !== null)
                        .length
                    }
                    <span> / {channelMembers.length}</span>
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* RIGHT SECTION: Avatars + Action Utilities */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Avatar Stack (Desktop Only) */}
            {activeChat?.type === "channel" && (
              <div className="hidden lg:flex items-center -space-x-2 mr-1">
                <div
                  className="flex -space-x-2 cursor-pointer"
                  onClick={() => setIsMembersOpen(true)}
                >
                  {channelMembers
                    ?.filter((member) => member.User?.last_login !== null)
                    .slice(0, 3)
                    .map((i) => (
                      <div
                        key={i.User?.id || i}
                        className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-extrabold overflow-hidden uppercase text-slate-600 shadow-2xs"
                      >
                        {i.User?.avatar_url ? (
                          <img
                            src={i.User?.avatar_url}
                            alt={i.User?.full_name}
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{i?.full_name?.charAt(0) || "U"}</span>
                        )}
                      </div>
                    ))}

                  {channelMembers?.filter((m) => m.User?.last_login !== null)
                    .length > 3 && (
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-extrabold shadow-2xs">
                      +
                      {channelMembers.filter((m) => m.User?.last_login !== null)
                        .length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Primary Communication Control Group */}
            <div className="flex items-center gap-0.5 bg-slate-100/70 p-0.5 sm:p-1 rounded-xl border border-slate-200/50">
              {/* Video Call */}
              <button
                onClick={handleStartMeeting}
                className="p-1.5 sm:p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all active:scale-95 touch-manipulation"
                title="Start Video Meeting"
              >
                <Video size={17} />
              </button>

              {/* Schedule Meeting */}
              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="p-1.5 sm:p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all active:scale-95 touch-manipulation"
                title="Schedule a meeting"
              >
                <Plus size={17} strokeWidth={2.5} />
              </button>

              {/* Notifications */}
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-1.5 sm:p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all active:scale-95 touch-manipulation"
                title="Notifications"
              >
                {notifications.some((n) => !n.is_read) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 border-2 border-white rounded-full animate-pulse" />
                )}
                <BellIcon size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Meeting Banner Alert Element */}
        {upcomingMeeting && (
          <div className="bg-gradient-to-r from-indigo-400 to-blue-500 px-4 md:px-6 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl shadow-indigo-100 animate-in fade-in slide-in-from-top-4 duration-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1.5 rounded-lg text-white flex-shrink-0">
                <Clock size={16} />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-black text-white/70 uppercase tracking-widest block">
                  Upcoming Sync
                </span>
                <h4 className="text-white text-xs md:text-sm font-bold truncate">
                  {upcomingMeeting.text}
                </h4>
              </div>
            </div>
            <button
              onClick={() => handleJoinScheduledMeeting(upcomingMeeting)}
              className="w-full sm:w-auto bg-white text-indigo-600 px-4 py-1.5 rounded-xl text-xs font-black shadow-md hover:scale-[1.02] active:scale-95 transition-transform text-center"
            >
              Join Now
            </button>
          </div>
        )}

        {/* Main Chat Message Stream Scroller Node */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-[#eeeeee8a]">
          {isChatLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] animate-pulse">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : Object.keys(groupedMessages).length > 0 ? (
            <>
              {/* WHATSAPP STYLE NESTED DATE SECTIONS LOOP */}
              {Object.entries(groupedMessages).map(
                ([dateLabel, groupMessages]) => (
                  <div key={dateLabel} className="space-y-6 relative">
                    {/* Sticky Header Type WhatsApp Date Bubble */}
                    <div className="flex justify-center my-4 sticky top-2 z-20 select-none">
                      <span className="px-3.5 py-1.5 bg-[#e1f5fe] text-[#0288d1] md:bg-white/90 md:backdrop-blur-md rounded-xl text-[11px] font-black shadow-sm border border-slate-200/40 uppercase tracking-wider">
                        {dateLabel}
                      </span>
                    </div>

                    {/* Messages inside this specific date label */}
                    <div className="space-y-6">
                      {groupMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-2.5 md:gap-4 group ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}
                        >
                          {/* User Avatar Circle Node */}
                          <div
                            onClick={() => handleUserClick(msg)}
                            className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-xs shadow-sm cursor-pointer hover:scale-105 transition-transform overflow-hidden ${
                              msg.isMe
                                ? "bg-blue-600 text-white"
                                : "bg-slate-800 text-white"
                            }`}
                          >
                            {msg?.avatar_url ? (
                              <img
                                src={msg?.avatar_url}
                                alt="Avatar"
                                crossOrigin="anonymous"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              msg?.user[0].toUpperCase()
                            )}
                          </div>

                          {/* Bubble Layout Block */}
                          <div
                            className={`flex flex-col max-w-[85%] md:max-w-xl ${msg.isMe ? "items-end" : "items-start"}`}
                          >
                            <div className="flex items-center gap-2 mb-1 px-1 flex-wrap">
                              {!msg.isMe && (
                                <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">
                                  {msg.user || "Unknown User"}
                                </span>
                              )}
                              <span className="text-[9px] md:text-[10px] text-slate-400 font-medium">
                                {msg.time}
                              </span>
                              {msg.isMe && (
                                <span className="text-xs font-bold text-blue-600">
                                  You
                                </span>
                              )}
                            </div>

                            {/* Core Context Bubble */}
                            <div
                              className={`px-4 py-2 md:px-5 md:py-3 text-[16px] md:text-[17px] leading-relaxed shadow-xs rounded-2xl ${
                                msg.isMe
                                  ? "bg-blue-50 text-slate-700 rounded-tr-none border border-blue-100 shadow-sm"
                                  : "bg-white text-slate-600 rounded-tl-none border border-slate-200 shadow-sm"
                              } w-full`}
                            >
                              {msg.type === "call" ? (
                                <div
                                  className={`p-3 md:p-4 rounded-xl md:rounded-[22px] w-full min-w-0 sm:min-w-[260px] shadow-sm border ${
                                    msg.call_status === "active"
                                      ? "bg-indigo-600 text-white border-indigo-400"
                                      : "bg-white text-slate-800 border-slate-300"
                                  }`}
                                >
                                  <div className="flex items-center gap-3 md:gap-4">
                                    <div
                                      className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex-shrink-0 flex items-center justify-center ${
                                        msg.call_status === "active"
                                          ? "bg-white/20 animate-pulse"
                                          : "bg-slate-100"
                                      }`}
                                    >
                                      {msg.call_status === "scheduled" ? (
                                        <Calendar
                                          size={18}
                                          className={
                                            msg.call_status === "active"
                                              ? "text-white"
                                              : "text-blue-600"
                                          }
                                        />
                                      ) : (
                                        <Video
                                          size={18}
                                          className={
                                            msg.call_status === "active"
                                              ? "text-white"
                                              : "text-indigo-600"
                                          }
                                        />
                                      )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-xs md:text-[14px] font-black truncate">
                                        {msg.call_status === "active"
                                          ? "Live Meeting"
                                          : msg.call_status === "scheduled"
                                            ? "Scheduled Meeting"
                                            : "Call Ended"}
                                      </h4>
                                      <p
                                        className={`text-[9px] md:text-[10px] truncate ${msg.call_status === "active" ? "text-indigo-100" : "text-slate-500"}`}
                                      >
                                        {msg.call_status === "scheduled"
                                          ? `Starts: ${new Date(msg.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                                          : msg.call_status === "ended"
                                            ? `Duration: ${Math.floor(msg.call_duration / 60)}m ${msg.call_duration % 60}s`
                                            : `Started by ${msg.sender_id === user.id ? "You" : "Team Member"}`}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mt-3 md:mt-4">
                                    {msg.call_status === "active" ||
                                    (msg.call_status === "scheduled" &&
                                      isMeetingLive(msg.scheduled_at)) ? (
                                      <button
                                        onClick={() =>
                                          msg.call_status === "scheduled"
                                            ? handleJoinScheduledMeeting(msg)
                                            : setIsVideoModalOpen(true)
                                        }
                                        className={`w-full py-2 rounded-lg md:rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                                          msg.call_status === "active"
                                            ? "bg-white text-indigo-600 hover:bg-indigo-50"
                                            : "bg-green-600 text-white hover:bg-green-700"
                                        }`}
                                      >
                                        Join Now{" "}
                                        <Plus size={14} strokeWidth={3} />
                                      </button>
                                    ) : msg.call_status === "scheduled" ? (
                                      <div className="text-center py-2 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                          Waiting for Time
                                        </span>
                                      </div>
                                    ) : null}
                                  </div>

                                  {msg.call_status === "ended" &&
                                    msg.transcript && (
                                      <TranscriptWrapper
                                        transcript={msg.transcript}
                                      />
                                    )}
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {msg.text && (
                                    <p className="whitespace-pre-wrap break-words">
                                      {renderMessageWithMentions(msg.text)}
                                    </p>
                                  )}

                                  {msg.attachments &&
                                    msg.attachments.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {msg.attachments.map((file, idx) => {
                                          const fileUrl = `/${file.path.replace(/\\/g, "/")}`;
                                          const isImage =
                                            file.mimetype.startsWith("image/");

                                          return (
                                            <div
                                              key={idx}
                                              className="w-full sm:max-w-[250px]"
                                            >
                                              {isImage ? (
                                                <a
                                                  href={fileUrl}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="block w-full"
                                                >
                                                  <img
                                                    src={fileUrl}
                                                    alt={file.filename}
                                                    crossOrigin="anonymous"
                                                    className="rounded-xl max-h-48 w-full object-cover border border-slate-200 hover:opacity-90 transition-opacity cursor-zoom-in"
                                                  />
                                                </a>
                                              ) : (
                                                <a
                                                  href={fileUrl}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="flex items-center gap-3 p-3 bg-white/50 border border-slate-200 rounded-xl hover:bg-white transition-all group w-full"
                                                >
                                                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    <FileText size={20} />
                                                  </div>
                                                  <div className="flex flex-col overflow-hidden min-w-0">
                                                    <span className="text-[12px] font-bold text-slate-700 truncate w-32">
                                                      {file.filename}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 uppercase font-black">
                                                      {(
                                                        file.size / 1024
                                                      ).toFixed(1)}{" "}
                                                      KB
                                                    </span>
                                                  </div>
                                                </a>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              )}

              {Object.keys(typingStatus).length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* 👥 LAYERED AVATARS CONTAINER */}
                  <div className="flex items-center -space-x-3.5 invisible-scrollbar">
                    {Object.keys(typingStatus).map((userId, index) => {
                      const typingUser = typingStatus[userId];
                      return (
                        <div
                          key={userId}
                          className="relative rounded-full border-2 border-white dark:border-zinc-950 bg-blue-600 w-8 h-8 flex items-center justify-center text-white font-black text-xs shadow-sm uppercase overflow-hidden transition-all duration-300 transform hover:translate-y-[-2px]"
                          style={{ zIndex: index + 1 }} // Taake overlapping layers sahi order mein hon
                        >
                          {typingUser.avatarUrl ? (
                            <img
                              src={typingUser.avatarUrl}
                              alt="Avatar"
                              crossOrigin="anonymous"
                              className="w-full h-full object-cover"
                            />
                          ) : typingUser.userName ? (
                            typingUser.userName[0]
                          ) : (
                            "U"
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* 💬 DYNAMIC TEXT WITH BOUNCING DOTS INDICATOR */}
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800/60 px-3 py-1.5 rounded-full shadow-sm max-w-xs sm:max-w-md">
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[180px]">
                      {Object.keys(typingStatus).length === 1
                        ? typingStatus[Object.keys(typingStatus)[0]]
                            ?.userName || "Someone"
                        : Object.keys(typingStatus).length === 2
                          ? `${typingStatus[Object.keys(typingStatus)[0]]?.userName.split(" ")[0]}, ${typingStatus[Object.keys(typingStatus)[1]]?.userName.split(" ")[0]}`
                          : `${typingStatus[Object.keys(typingStatus)[0]]?.userName.split(" ")[0]} and ${Object.keys(typingStatus).length - 1} others`}
                    </span>

                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                      {Object.keys(typingStatus).length > 1
                        ? "are typing"
                        : "is typing"}
                    </span>

                    {/* Realtime bouncing CSS dots indicator */}
                    <span className="flex gap-0.5 items-center ml-0.5 min-w-[14px]">
                      <span className="w-1 h-1 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1 h-1 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1 h-1 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce"></span>
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] px-4 text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50/50 rounded-2xl md:rounded-[28px] flex items-center justify-center mb-6 border border-blue-100/50">
                <span className="text-3xl md:text-4xl">👋</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-1.5 tracking-tight">
                Start a conversation with {activeChat.name}
              </h2>
              <p className="text-slate-400 font-medium text-xs md:text-sm max-w-xs">
                Send a message to sync and kickstart your workflow.
              </p>
            </div>
          )}
        </div>

        {/* Native Mobile App Style Input Area */}
        <div className="px-2 pb-3 pt-1 md:px-8 md:pb-8 bg-[#eeeeee8a] flex-shrink-0 transition-all flex w-full justify-center items-center gap-2">
          <div className="w-full relative bg-white border border-slate-200/80 rounded-2xl md:rounded-[24px] shadow-sm md:shadow-sm md:shadow-slate-200/40 focus-within:border-blue-500/40 focus-within:ring-4 ring-blue-500/5 transition-all">
            {showMentions &&
              activeChat?.type === "channel" &&
              filteredUsers?.length > 0 && (
                <div className="absolute bottom-full left-0 mb-2 w-full sm:w-64 bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden z-50">
                  <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-300">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      People
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredUsers?.map((user) => (
                      <div
                        key={user?.User?.id}
                        onClick={() =>
                          selectMention(user?.User?.full_name, user?.User?.id)
                        }
                        className="flex items-center gap-2.5 px-3 py-2 hover:bg-blue-50 cursor-pointer transition-all border-b border-slate-50 last:border-0"
                      >
                        <div className="rounded-full border border-blue-100 bg-blue-600 w-7 h-7 flex items-center justify-center text-white font-black text-[10px] uppercase overflow-hidden flex-shrink-0">
                          {user?.User?.avatar_url ? (
                            <img
                              src={user?.User?.avatar_url}
                              alt="Avatar"
                              crossOrigin="anonymous"
                              className="w-full h-full object-cover"
                            />
                          ) : user?.User?.full_name ? (
                            user?.User?.full_name[0]
                          ) : (
                            "U"
                          )}
                        </div>
                        <span className="text-xs font-semibold text-slate-700 truncate">
                          {user?.User?.full_name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {selectedFiles?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-4 py-2 border-b border-slate-300 bg-slate-50/50 rounded-t-2xl">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative group bg-white border border-slate-200 rounded-lg p-1.5 flex items-center gap-2 pr-6 shadow-2xs"
                  >
                    <Paperclip size={12} className="text-blue-500" />
                    <span className="text-[11px] font-medium text-slate-600 truncate max-w-[100px]">
                      {file.name}
                    </span>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1/2 -translate-y-1/2 right-1.5 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between px-3 rounded-b-2xl md:rounded-b-[23px]">
              <div className="flex items-center w-full h-[45px] justify-between gap-3.5 md:gap-5 text-slate-400">
                

                 <div
                  className="relative flex items-center"
                  ref={emojiPickerRef}
                >
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`hover:text-blue-600 transition-colors p-1 rounded-lg ${showEmojiPicker ? "text-blue-600 bg-blue-50" : "text-slate-500"}`}
                  >
                    <Smile size={18} />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-12 left-0 shadow-2xl border border-slate-300 rounded-xl overflow-hidden z-50 max-w-[280px] sm:max-w-none">
                      <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        autoFocusSearch={false}
                        theme="light"
                        width={280}
                        height={350}
                        previewConfig={{ showPreview: false }}
                        skinTonesDisabled
                      />
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.zip"
                />

                <textarea
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="w-full pt-5 text-[14px] text-slate-700 outline-none resize-none min-h-[44px] md:min-h-[60px] font-medium bg-transparent"
                  placeholder={`Text...`}
                />

               <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="hover:text-blue-600 text-slate-500 transition-colors p-1 rounded-lg active:bg-slate-200/50"
                >
                  <Paperclip size={18} />
                </button>

                <button
                  type="button"
                  className="hidden sm:inline-block hover:text-blue-600 text-slate-500 transition-colors p-0.5"
                >
                  <Mic size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleStartMeeting}
                  className="hidden sm:inline-block hover:text-blue-600 text-slate-500 transition-colors p-0.5"
                >
                  <Video size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="hidden sm:inline-block hover:text-blue-600 text-slate-500 transition-colors p-0.5"
                  title="Schedule a meeting"
                >
                  <Plus size={14} strokeWidth={3} />
                </button>
              </div>

            </div>
          </div>
              <button
                onClick={handleSendMessage}
                className="flex justify-center items-center bg-blue-600 text-white rounded-full w-10 h-10 text-xs md:text-[13px] font-black flex items-center gap-1.5 hover:bg-blue-700 shadow-md shadow-blue-200 active:scale-95 transition-all flex-shrink-0"
              >
                {/* <span className="hidden sm:inline">Send</span> */}
                <Send size={20} className="mr-1 rotate-45" />
              </button>
        </div>
      </div>

      {/* Modals & Sidebars */}
      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
        onCreateChannel={addNewChannel}
      />
      <NewDMModal
        isOpen={isDMModalOpen}
        onClose={() => setIsDMModalOpen(false)}
        onSelectUser={startNewDM}
      />
      <MembersSidebar
        isOpen={isMembersOpen}
        onClose={() => setIsMembersOpen(false)}
        channelName={activeChat.name}
        members={channelMembers}
        onAddMember={() => setIsAddMemberModalOpen(true)}
        memberRole={
          activeRole[0]?.user_id == currentUserId
            ? activeRole[0]?.role_in_channel
            : "member"
        }
      />
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        channels={channels}
        users={dmUsers}
        chatData={chatData}
        onSelect={(name, type, id) => switchChat(name, type, id)}
      />
      <NotificationPopover
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onSelectChat={(name, id, type) => switchChat(name, type, id)}
      />
      <UserProfileSidebar
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userData={selectedUser}
      />
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onAdd={handleAddMember}
        existingMembers={chatData[activeChat.id] || []}
      />
      <JitsiVideoCall
        isOpen={isVideoModalOpen}
        onClose={() => {
          handleOnMeetingClose();
        }}
        roomName={activeChat.name}
        userName={user.full_name}
        activeChat={activeChat.id}
        userEmail={user.email}
        currentMeetingId={currentMeetingId}
      />

      <ScheduleMeetingModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSchedule={handleScheduleSubmit}
        roomName={activeChat.name}
        userName="Yasir"
      />
    </div>
  );
};

export default DevChat;
