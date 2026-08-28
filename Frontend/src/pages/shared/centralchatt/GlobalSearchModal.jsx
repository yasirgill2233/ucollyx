import React, { useState } from 'react';
import { Search, Hash, MessageSquare, Clock, User } from 'lucide-react';

const GlobalSearchModal = ({ isOpen, onClose, channels, users, chatData, onSelect }) => {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  console.log("Search Modal Data:", { channels, users, chatData });

  // 1. Filter Channels
  const filteredChannels = channels.filter(ch => 
    ch.name.toLowerCase().includes(query.toLowerCase())
  );

  console.log("Filtered Channels:", filteredChannels);

  // 2. Filter People
  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(query.toLowerCase())
  );

  console.log("Filtered Users:", filteredUsers);

  // 3. Filter MESSAGES (The "Wide" Search)
  const filteredMessages = [];
  if (query.length > 1) { 
    Object.keys(chatData).forEach(chatName => {
      // Pata lagayein ke ye chat name channel ka hai ya user ka
      const matchedChannel = channels.find(c => c.name === chatName);
      const matchedUser = users.find(u => u.full_name === chatName);

      const type = matchedChannel ? 'channel' : 'dm';
      // Agar channel hai toh channel.id uthayen, agar dm hai toh user.id uthayen
      const targetId = matchedChannel ? matchedChannel.id : (matchedUser ? matchedUser.id : null);

      chatData[chatName]?.forEach(msg => {
        if (msg.text && msg.text.toLowerCase().includes(query.toLowerCase())) {
          filteredMessages.push({
            ...msg,
            chatName: chatName,
            type: type,
            id: targetId // Sahi ID jis pr redirect hona ha
          });
        }
      });
    });
  }

  const hasResults = filteredChannels.length > 0 || filteredUsers.length > 0 || filteredMessages.length > 0;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[300] flex items-start justify-center pt-20 px-4">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="bg-white w-full max-w-[600px] rounded-[24px] shadow-2xl overflow-hidden relative animate-in fade-in slide-in-from-top-4 duration-200">
        
        {/* Search Input Area */}
        <div className="p-5 border-b border-gray-100 flex items-center gap-4 bg-white">
          <Search size={22} className="text-blue-500" />
          <input 
            autoFocus
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages, channels or people..."
            className="flex-1 bg-transparent border-none outline-none text-lg text-slate-700 placeholder:text-gray-300 font-medium"
          />
          <div className="flex gap-1">
             <kbd className="px-2 py-1 bg-gray-100 text-gray-400 text-[10px] font-black rounded-md border border-gray-200">ESC</kbd>
          </div>
        </div>

        {/* Results Body */}
        <div className="max-h-[500px] overflow-y-auto p-4 custom-scrollbar bg-slate-50/30">
          
          {hasResults ? (
            <div className="space-y-8">
              
              {/* MESSAGES SECTION (New & Powerful) */}
              {filteredMessages.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3 px-2 flex items-center gap-2">
                    <MessageSquare size={12} /> Matching Messages
                  </h4>
                  <div className="space-y-2">
                    {filteredMessages.slice(0, 5).map((msg, i) => (
                      <div 
                        key={i}
                        onClick={() => { onSelect(msg.chatName, msg.type, msg.id); onClose(); }}
                        className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md cursor-pointer transition-all group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-slate-800 text-white text-[10px] flex items-center justify-center font-bold">
                              {msg.user[0]}
                            </div>
                            <span className="text-xs font-black text-slate-800">{msg.user}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">in {msg.chatName}</span>
                          </div>
                          <span className="text-[9px] text-gray-300 font-bold">{msg.time}</span>
                        </div>
                        <p className="text-[13px] text-slate-600 line-clamp-2 leading-relaxed">
                          {msg.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CHANNELS & PEOPLE (Compact View) */}
              <div className="grid gap-8">
                {filteredChannels.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">Channels</h4>
                    {filteredChannels.map(ch => (
                      <div key={ch.id} onClick={() => { onSelect(ch.name, 'channel', ch.id); onClose(); }} className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-sm font-bold text-slate-700">
                        <Hash size={14} className="text-blue-500" /> {ch.name}
                      </div>
                    ))}
                  </div>
                )}
                {filteredUsers.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">People</h4>
                    {filteredUsers.map(user => (
                      <div key={user.id} onClick={() => { onSelect(user.full_name, 'dm',user.id); onClose(); }} className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-sm font-bold text-slate-700">
                        <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px]">{user.full_name[0]}</div> {user.full_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="py-20 text-center space-y-3">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <Search size={30} className="text-gray-200" />
              </div>
              <p className="text-gray-400 text-sm font-medium">No messages or people found for "{query}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;