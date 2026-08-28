import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';

const CreateChannelModal = ({ isOpen, onClose, onCreateChannel }) => {
  const [isPrivate, setIsPrivate] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!channelName.trim()) return;
    
    onCreateChannel({
      name: channelName.trim(),
      description: description.trim() || null,
      is_private: isPrivate
    });
    
    setChannelName("");
    setDescription("");
    setIsPrivate(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[150] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[400px] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Create Channel</h2>
            <p className="text-xs text-gray-400 mt-1">Channels are for project or team discussions</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="px-6 pb-6 space-y-5">
          {/* Channel Name */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
              Channel Name
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">#</span>
              <input 
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                type="text" 
                placeholder="e.g design-reviews"
                className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-8 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
              Description <span className="lowercase font-medium">(optional)</span>
            </label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this channel about?"
              className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all min-h-[100px] resize-none"
            />
          </div>

          {/* Private Channel Toggle */}
          <div className="bg-slate-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                <Lock size={16} className={isPrivate ? "text-blue-600" : "text-gray-400"} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Private Channel</p>
                <p className="text-[10px] text-gray-400 font-medium">Only invited members can join</p>
              </div>
            </div>
            {/* Custom Toggle Switch */}
            <button 
              onClick={() => setIsPrivate(!isPrivate)}
              className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${isPrivate ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${isPrivate ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-6 py-4 bg-gray-50/50 flex gap-3 justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all border border-gray-200 bg-white"
          >
            Cancel
          </button>
          <button onClick={handleCreate} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
            Create Channel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateChannelModal;