import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../../../../api/services/taskService';
import { MessageSquare, X, Send } from 'lucide-react';

// --- CHAT MODAL COMPONENT ---
const ChatModal = ({ task, onClose }) => {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

  // 1. FETCH COMMENTS QUERY (Database se comments direct fetch honge)
  const { data: databaseComments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ["taskComments", task?.id],
    queryFn: () => taskService.getComments(task.id),
    enabled: !!task?.id,
  });

  // 2. POST COMMENT MUTATION (Naya message insert karne ke liye)
  const postCommentMutation = useMutation({
    mutationFn: (commentText) => taskService.postComment(task.id, commentText),
    onSuccess: () => {
      // Automatic data refresh taake naya message instant list mein show ho
      queryClient.invalidateQueries({ queryKey: ["taskComments", task?.id] });
    },
  });

  // Auto scroll to bottom when new comments load or arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [databaseComments]);

  const handleSend = () => {
    if (!input.trim() || postCommentMutation.isPending) return;
    
    // Mutation push command
    postCommentMutation.mutate(input.trim());
    setInput("");
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[550px]" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-sm tracking-widest uppercase">Card Chatt</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.title || task.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages/Comments Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 scroll-smooth">
          
          {isLoadingComments && (
            <div className="text-center text-xs font-bold text-slate-400 py-4 animate-pulse uppercase tracking-wider">
              Loading discussion...
            </div>
          )}

          {!isLoadingComments && databaseComments.length === 0 && (
            <div className="text-center text-xs font-bold text-slate-300 py-10 italic">
              No comments yet. Start the conversation!
            </div>
          )}

          {databaseComments.map((comment) => {
            // Check Identity: Agar aap khud login hain (Yasir Saleem) toh bubble right side par layout ho
            const isMe = comment.isMe || comment.User?.full_name === "Yasir Saleem";
            
            // Name Initial creation dynamically
            const initial = comment.User?.full_name 
              ? comment.User.full_name.split(" ").map(n => n[0]).join("").toUpperCase() 
              : "U";

            return (
              <div key={comment.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                {/* Avatar Initial Circle */}
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] text-white font-black shadow-sm uppercase ${isMe ? 'bg-indigo-600' : 'bg-orange-500'}`}>
                  {initial}
                </div>
                
                <div className={`max-w-[80%] ${isMe ? 'text-right' : ''}`}>
                  {/* Sender Name for Team Members */}
                  {!isMe && (
                    <span className="text-[9px] font-black text-blue-600 uppercase mb-1 block pl-1">
                      {comment.User?.full_name || "Team Member"}
                    </span>
                  )}
                  
                  {/* Message Bubble Block */}
                  <div className={`p-4 rounded-2xl shadow-sm border border-slate-100 ${isMe ? 'bg-indigo-600 text-white rounded-tr-none border-transparent' : 'bg-white text-slate-700 rounded-tl-none'}`}>
                    <p className="text-xs font-bold leading-relaxed whitespace-pre-wrap">
                      {comment.content || comment.comment_text}
                    </p>
                  </div>
                  
                  {/* Timestamp formatting */}
                  <span className="text-[9px] font-black text-slate-400 uppercase mt-1 block px-1">
                    {comment.createdAt 
                      ? new Date(comment.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
                      : "Just now"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Footer Area */}
        <div className="p-5 border-t border-slate-50 bg-white shrink-0">
          <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 focus-within:border-blue-400 transition-all">
            <input 
              className="flex-1 bg-transparent px-3 py-2 text-xs font-bold text-slate-700 outline-none" 
              placeholder={postCommentMutation.isPending ? "Sending message..." : "Write a message... (Enter to send)"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={postCommentMutation.isPending}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || postCommentMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all shadow-md shadow-indigo-100 active:scale-95 disabled:opacity-50 disabled:scale-100"
            >
              {postCommentMutation.isPending ? "Sending" : "Send"} <Send size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;