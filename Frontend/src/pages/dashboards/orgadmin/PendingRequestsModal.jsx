import React, { useEffect } from 'react';
import { X, Check, UserX, User, Loader2 } from 'lucide-react';
import API from '../../../api/axios';
import { useHandleRequestMutation } from '../../../hooks/useWorkspace';
import { triggerToast } from '../../../utils/toastHelper';

const PendingRequestsModal = ({ isOpen, onClose, requests, onActionSuccess }) => {

  const requestMutation = useHandleRequestMutation();

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const handleAction = (requestId, action, role, fullName, email) => {
    requestMutation.mutate(
      { requestId, action, role, fullName, email },
      {
        onSuccess: (res) => {
          triggerToast(`User ${action === 'approve' ? 'approved' : 'rejected'} successfully!`, "success");
          // Agar list khali ho jaye to modal band bhi kr skte hain
          if (requests.length <= 1) onClose();
        },
        onError: (err) => {
          triggerToast(err.response?.data?.message || "Action failed", "error");
        }
      }
    );
  };

  return (
    // --- Dark Overlay (Backdrop) ---
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* --- Modal Content Container --- */}
      <div 
        className="bg-white w-full max-w-[500px] rounded-md shadow-[0_20px_70px_rgba(0,0,0,0.1)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()} // Click modal ke andar hi rahe
      > 
        {/* Header Section */}
        <div className="p-8 pb-4 flex justify-between items-start">
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-2">
              <span>Admin</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-400">Join Requests</span>
            </nav>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pending Invitations</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* List Section */}
        <div className="px-8 pb-10">
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar scroll-smooth">
            {requests && requests.length > 0 ? (
              requests.map((req) => (
                <div 
                  key={req.id} 
                  className="flex justify-between items-center bg-white border border-slate-100 p-5 rounded-md hover:border-indigo-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar placeholder with Initials */}
                    <div className="w-11 h-11 bg-indigo-50 rounded-md flex items-center justify-center font-black text-indigo-600 text-sm">
                      {req.User?.full_name?.charAt(0) || <User size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{req.User?.full_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{req.User?.email}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAction(req.id, 'approved', req.requested_role, req.User?.full_name, req.User?.email)}
                      className="w-10 h-10 bg-indigo-600 text-white rounded-md flex items-center justify-center hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-90"
                      title="Approve Member"
                    >
                      {/* <Check size={18} /> */}
                      {requestMutation.isPending && requestMutation.variables?.requestId === req.id && requestMutation.variables?.action === 'approved' ? (
                      <Loader2 size={18} className="animate-spin text-green-500" />
                    ) : (
                      <Check size={18} />
                    )}
                    </button>
                    <button 
                      onClick={() => handleAction(req.id, 'rejected', req.requested_role, req.User?.full_name, req.User?.email)}
                      className="w-10 h-10 bg-white text-slate-400 border border-slate-200 rounded-md flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-90"
                      title="Reject Request"
                    >
                      {/* <UserX size={18} /> */}
                      {requestMutation.isPending && requestMutation.variables?.requestId === req.id && requestMutation.variables?.action === 'rejected' ? (
                      <Loader2 size={18} className="animate-spin text-red-500" />
                    ) : (
                      <UserX size={18} />
                    )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-50 rounded-md flex items-center justify-center mx-auto mb-4">
                  <UserX size={24} className="text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-400">All caught up! No pending requests.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-slate-50/50 p-6 text-center border-t border-slate-50">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             UCOLLYX SECURITY PROTOCOL ACTIVE
           </p>
        </div>
      </div>
    </div>
  );
};

export default PendingRequestsModal;