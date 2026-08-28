// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { X, Maximize2, Minimize2 } from "lucide-react";
// import { useMediaRecorder } from "../../../../hooks/useMediaRecorder";
// import { finalizeMeetingApi } from "../../../../api/services/meetingService";

// const JitsiVideoCall = ({ isOpen, onClose, roomName, userName, activeChat, userEmail, currentMeetingId }) => {
//   const jitsiContainerRef = useRef(null);
//   const [apiInstance, setApiInstance] = useState(null);
//   const [isMinimized, setIsMinimized] = useState(false);

//   const { startRecording, stopRecording } = useMediaRecorder(async (blob) => {
//     await finalizeMeetingApi(blob, currentMeetingId);
// });

//     const handleClose = () => {
//     if (apiInstance) apiInstance.dispose();
//     setApiInstance(null);
//     onClose();
//   };

//   const secureRoomName = useMemo(() => {
//   const baseName = `UCollyx-${activeChat}-${roomName}`;
//   const hashedName = btoa(baseName).replace(/[=+/]/g, ''); 
  
//   return `UCollyx-${hashedName}`;
// }, [roomName, activeChat]);

//   useEffect(() => {
//     if (isOpen && window.JitsiMeetExternalAPI && !apiInstance) {
//       const domain = "meet.jit.si";
//       const options = {
//         roomName: secureRoomName,        
//         parentNode: jitsiContainerRef.current,
//         userInfo: { displayName: userName, email: userEmail },
//         configOverwrite: {
//           prejoinPageEnabled: false,
//           disableDeepLinking: true,
//           defaultBackgroundColor: "#0f172a",
//         },
//         interfaceConfigOverwrite: {
//           TOOLBAR_BUTTONS: [
//             "microphone", "camera", "chat", "raisehand", 
//             "videoquality", "tileview", "settings"
//           ],
//           SETTINGS_SECTIONS: ['devices', 'language', 'profile'],
//         },
//       };

//       const api = new window.JitsiMeetExternalAPI(domain, options);
//       setApiInstance(api);

//       api.on("readyToClose", () => {
//         handleClose();
//       });

//        if (apiInstance) {
//     apiInstance.on('videoConferenceJoined', () => {
//       startRecording();
//     });

//     apiInstance.on('videoConferenceLeft', () => {
//       stopRecording();
//       handleClose();
//     });
//   }

//       return () => {
//         if (api) api.dispose();
//       };
//     }
//   }, [isOpen]);

//   if (!isOpen) return null;

//   return (
//     <div className={`fixed z-[100] transition-all duration-500 ease-in-out ${
//       isMinimized 
//       ? "bottom-4 right-4 w-80 h-48 shadow-2xl overflow-hidden rounded-2xl border-2 border-indigo-500" 
//       : "inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
//     }`}>
//       <div className={`relative bg-slate-900 overflow-hidden shadow-2xl transition-all duration-500 ${
//         isMinimized ? "w-full h-full" : "w-full max-w-6xl h-[85vh] rounded-[32px] border border-slate-700/50"
//       }`}>
//         <div className="absolute top-4 right-6 z-[110] flex items-center gap-3">
//           <button 
//             onClick={() => setIsMinimized(!isMinimized)}
//             className="p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full backdrop-blur-md transition-colors"
//           >
//             {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
//           </button>
//           <button 
//             onClick={handleClose}
//             className="p-2 bg-rose-500/80 hover:bg-rose-600 text-white rounded-full backdrop-blur-md transition-colors"
//           >
//             <X size={18} />
//           </button>
//         </div>

//         <div ref={jitsiContainerRef} className="w-full h-full" />
//       </div>
//     </div>
//   );
// };

// export default JitsiVideoCall;



import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Maximize2, Minimize2, Loader2 } from "lucide-react";
import axios from "axios";
import { useMediaRecorder } from "../../../../hooks/useMediaRecorder";
import API from "../../../../api/axios";

const JitsiVideoCall = ({ 
  isOpen, 
  onClose, 
  roomName, 
  userName, 
  activeChat, 
  userEmail, 
  currentMeetingId 
}) => {
  const jitsiContainerRef = useRef(null);
  const [apiInstance, setApiInstance] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isProcessingTranscript, setIsProcessingTranscript] = useState(false);

  const isUnloadingRef = useRef(false);

  // 1. DIRECT IN-COMPONENT MEDIA RECORDER & API LOGIC
  const { startRecording, stopRecording } = useMediaRecorder(async (audioBlob) => {
    if (!audioBlob || !currentMeetingId) {
      console.warn("⚠️ Audio blob or currentMeetingId missing. Skipping transcript processing.");
      onClose();
      return;
    }

    try {
      setIsProcessingTranscript(true);
      console.log("🎙️ Capturing meeting audio blob:", audioBlob);

      // --- Inline FormData & Axios POST Request ---
      const formData = new FormData();
      // 'audio' fieldname backend Multer upload.single('audio') se match karni chahiye
      formData.append("audio", audioBlob, `meeting_${currentMeetingId}.webm`);
      formData.append("meetingId", currentMeetingId);

      const response = await API.post("/meetings/finalize", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const transcriptText = response.data?.transcript || "Transcript generated successfully!";
      
      console.log("✅ Transcript Generated:", transcriptText);
      alert(`✅ Meeting Ended & Transcribed!\n\n[Meeting Script]:\n${transcriptText}`);

    } catch (error) {
      console.error("❌ Error sending meeting audio to backend:", error);
      alert("❌ Failed to process meeting transcript.");
    } 
    finally {
      setIsProcessingTranscript(false);
      onClose();
    }
  });

  // Manual Close (Top Right X Button)
  const handleManualClose = () => {
    if (apiInstance) {
      try {
        apiInstance.dispose();
      } catch (err) {
        console.warn("Jitsi dispose warning:", err);
      }
    }
    setApiInstance(null);
    if (typeof stopRecording === "function") stopRecording();
  };

  // Normal / System Close
  const handleClose = () => {
    if (apiInstance) {
      try {
        apiInstance.dispose();
      } catch (err) {
        console.warn("Jitsi dispose warning:", err);
      }
    }
    setApiInstance(null);
    onClose();
  };

  const secureRoomName = useMemo(() => {
    const baseName = `UCollyx-${activeChat}-${roomName}`;
    const hashedName = btoa(baseName).replace(/[=+/]/g, ""); 
    return `UCollyx-${hashedName}`;
  }, [roomName, activeChat]);

  // Window Unload Protection (Refresh/Tab Close Guard)
  useEffect(() => {
    const handleBeforeUnload = () => {
      isUnloadingRef.current = true;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Jitsi iFrame Initialization & Event Listeners
  useEffect(() => {
    let api = null;

    if (isOpen && window.JitsiMeetExternalAPI && jitsiContainerRef.current) {
      const domain = "meet.jit.si";
      const options = {
        roomName: secureRoomName,        
        parentNode: jitsiContainerRef.current,
        userInfo: { displayName: userName, email: userEmail },
        configOverwrite: {
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          defaultBackgroundColor: "#0f172a",
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            "microphone", "camera", "chat", "raisehand", 
            "videoquality", "tileview", "settings"
          ],
          SETTINGS_SECTIONS: ["devices", "language", "profile"],
        },
      };

      api = new window.JitsiMeetExternalAPI(domain, options);
      setApiInstance(api);

      // Meeting Join Event -> Start Audio Recording
      api.addEventListener("videoConferenceJoined", () => {
        console.log("🟢 Jitsi Joined! Starting Media Recorder...");
        if (typeof startRecording === "function") startRecording();
      });

      // Meeting Leave Event -> Stop Audio Recording & Send to Server
      api.addEventListener("videoConferenceLeft", () => {
        console.log("🔴 Jitsi Left!");
        if (typeof stopRecording === "function") stopRecording();
      });

      // Jitsi UI Ready To Close
      api.addEventListener("readyToClose", () => {
        handleClose();
      });
    }

    return () => {
      if (api) {
        api.dispose();
      }
    };
  }, [isOpen, secureRoomName]);

  if (!isOpen) return null;

  return (
    <div className={`fixed z-[100] transition-all duration-500 ease-in-out ${
      isMinimized 
      ? "bottom-4 right-4 w-80 h-48 shadow-2xl overflow-hidden rounded-2xl border-2 border-indigo-500" 
      : "inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    }`}>
      <div className={`relative bg-slate-900 overflow-hidden shadow-2xl transition-all duration-500 ${
        isMinimized ? "w-full h-full" : "w-full max-w-6xl h-[85vh] rounded-[32px] border border-slate-700/50"
      }`}>

        {/* TOP CONTROL BUTTONS */}
        <div className="absolute top-4 right-6 z-[110] flex items-center gap-3">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full backdrop-blur-md transition-colors"
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>

          <button 
            onClick={handleManualClose}
            className="p-2 bg-rose-500/80 hover:bg-rose-600 text-white rounded-full backdrop-blur-md transition-colors"
            title="End / Close Call"
          >
            <X size={18} />
          </button>
        </div>

        {/* LOADING OVERLAY WHEN PROCESSING TRANSCRIPT */}
        {isProcessingTranscript && (
          <div className="absolute inset-0 bg-slate-950/90 z-[120] flex flex-col items-center justify-center text-white gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Generating meeting transcript & summary via Whisper AI...</p>
          </div>
        )}

        {/* JITSI CONTAINER */}
        <div ref={jitsiContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default JitsiVideoCall;