import { Brain, Send, X } from "lucide-react";
import React from "react";
import AIChatMessage from "../ai/AIChatMessage";
 // Path apne folder structure ke mutabiq adjust kar lein

const AIPanel = ({
  onClose,
  chatHistory,
  aiInput,
  setAiInput,
  handleAISend,
  isTyping,
}) => {
  // Auto-scroll logic
  const chatEndRef = React.useRef(null);
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  return (
    <aside className="flex-shrink-0 border-l border-zinc-800 bg-[#0c0c0e] flex flex-col animate-in slide-in-from-right duration-300 w-full md:w-[450px] lg:w-[500px]">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/20">
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-blue-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
            Assistant
          </span>
        </div>
        <X
          size={18}
          className="cursor-pointer text-zinc-600 hover:text-white transition-colors"
          onClick={onClose}
        />
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "user" ? (
              /* User Bubble */
              <div className="max-w-[80%] p-3 rounded-xl text-xs leading-relaxed bg-blue-600 text-white rounded-br-none shadow-sm">
                {msg.text}
              </div>
            ) : (
              /* AI Response Container with Markdown & Syntax Highlighting */
              <div className="max-w-[88%] p-3.5 rounded-xl text-xs leading-relaxed bg-zinc-900/80 text-zinc-200 border border-zinc-800 rounded-bl-none shadow-md overflow-hidden">
                <AIChatMessage content={msg.text} />
              </div>
            )}
          </div>
        ))}

        {/* Typing / Loading Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-zinc-900/80 p-3 rounded-xl rounded-bl-none border border-zinc-800">
              <div className="flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/20">
        <div className="relative">
          <textarea
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAISend();
              }
            }}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 pr-10 text-xs text-zinc-200 outline-none focus:border-blue-500/50 resize-none h-20 transition-all placeholder:text-zinc-600"
            placeholder="Ask anything..."
          />
          <button
            onClick={handleAISend}
            disabled={!aiInput.trim() || isTyping}
            className="absolute right-2 bottom-3 bg-blue-600 p-1.5 rounded-lg hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 transition-all text-white"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AIPanel;