// VibeEditorPanel.jsx
import React, { useState } from 'react';
import axios from 'axios';
import API from '../../../api/axios';

export const VibeEditorPanel = ({ activeFilePath, activeCode, fileTree, onApplyCode }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  const handleVibeGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const response = await API.post('/ai/vibe-edit', {
        prompt,
        activeFile: activeFilePath,
        codeContext: activeCode,
        fileTree: fileTree,
      });

      if (response.data.success) {
        setAiResult(response.data.vibeOutput);
      }
    } catch (err) {
      console.error("Vibe Edit Failed:", err);
      alert("Vibe AI Generation fail hui. Console dekhein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vibe-panel p-4 bg-slate-900 text-white rounded-lg border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-indigo-400">
          ⚡ UCollyx Vibe Engine
        </h3>
        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
          {activeFilePath || 'No File Active'}
        </span>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., Add a glassmorphism auth form using Tailwind CSS or refactor this endpoint to use Sequelize..."
        className="w-full h-24 p-2 bg-slate-950 text-slate-200 border border-slate-800 rounded focus:border-indigo-500 focus:outline-none text-sm resize-none"
      />

      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={handleVibeGenerate}
          disabled={loading}
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-medium transition flex items-center gap-1 disabled:opacity-50"
        >
          {loading ? 'Vibing...' : '✨ Generate / Edit'}
        </button>
      </div>

      {aiResult && (
        <div className="mt-4 border-t border-slate-800 pt-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400">Generated Code / Diff</span>
            <button
              onClick={() => onApplyCode(aiResult)}
              className="text-xs bg-emerald-600 hover:bg-emerald-500 px-2 py-1 rounded text-white font-medium"
            >
              Apply to Editor
            </button>
          </div>
          <pre className="p-2 bg-slate-950 text-xs text-emerald-400 overflow-x-auto rounded border border-slate-800 max-h-60">
            <code>{aiResult}</code>
          </pre>
        </div>
      )}
    </div>
  );
};