import React, { useState, useMemo, useEffect } from 'react';
import { Search, ArrowLeft, Clock, AlertCircle, Zap } from 'lucide-react';
import { useReadyForQAIssues, useVerifyIssueVerdict } from '../../../hooks/useIssues';

const VerificationPage = () => {
  // --- 1. LIVE DATABASE FETCHING HOOKS ---
  const { data: incomingBugs, isLoading, isError } = useReadyForQAIssues();
  const verifyVerdictMutation = useVerifyIssueVerdict();

  console.log(incomingBugs)


  const [data, setData] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('steps'); 
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("All Projects");
  const [activeModal, setActiveModal] = useState(null); 
  const [failComment, setFailComment] = useState("");

  // --- 2. DB RESPONSE DATA SYNCHRONIZATION ---
  useEffect(() => {
    if (incomingBugs && Array.isArray(incomingBugs) && incomingBugs.length > 0) {
      const formatted = incomingBugs.map((bug, index) => {
        let stepsArray = ["No execution steps provided for this bug."];
        if (Array.isArray(bug.steps)) {
          stepsArray = bug.steps;
        } else if (typeof bug.steps_to_repro === "string" && bug.steps_to_repro.trim()) {
          stepsArray = bug.steps_to_repro.split("\n");
        }

        return {
          id: bug.id,
          tc: bug.tc || `TC-${2300 + index}`, 
          title: bug.title || "Untitled Bug Report",
          project: bug.project?.name || bug.module || "General Module",
          status: bug.status || 'Ready for QA',
          priority: (bug.severity || "MEDIUM").toUpperCase(),
          steps: stepsArray, 
          expected: bug.expected_result || "No specific expected result defined.",
          actual: bug.actual_result || bug.title || "Observed metrics undefined.",
          summary: bug.description || "No operational summary or recap logged.",
          commit: bug.commit_hash || "N/A",
          sprint: bug.sprint_identifier || "Current Sprint"
        };
      });
      setData(formatted);
      
      // Keep previous selection active if it still exists in updated pool, otherwise select first item
      setSelectedId(prev => formatted.some(item => item.id === prev) ? prev : formatted[0].id);
    } else {
      setData([]);
      setSelectedId(null);
    }
  }, [incomingBugs]);

  // --- 3. SEARCH & PROJECT FILTER LOGIC ---
  const filteredList = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = 
        (item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
        String(item.id).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProject = 
        projectFilter === "All Projects" || item.project === projectFilter;
      return matchesSearch && matchesProject;
    });
  }, [searchQuery, projectFilter, data]);

  const activeData = useMemo(() => {
    return data.find(d => d.id === selectedId) || filteredList[0] || null;
  }, [selectedId, data, filteredList]);

  // --- 4. VERDICT DECISION HANDLER ---
  const handleStatusUpdate = (verdictStatus) => {

    console.log("Hello How are you:::::::::::::::::::::",verdictStatus)
    if (!activeData) return;

    verifyVerdictMutation.mutate(
      {
        issueId: activeData.id,
        status: verdictStatus, // 'PASSED' or 'FAILED'
        failComment: verdictStatus === 'Failed' ? failComment : undefined
      },
      {
        onSuccess: () => {
          setActiveModal(null);
          setFailComment("");
          // Note: Local state manually clear karne ki zaroorat nahi hai, 
          // react-query custom hook mutation onSuccess pr auto-refetch trigger kar rha hai.
        },
        onError: (err) => {
          console.error("Verification processing encountered an error:", err);
          alert("Failed to submit verification status back to workspace context.");
        }
      }
    );
  };

  const projectOptions = useMemo(() => {
    const list = new Set(data.map(item => item.project));
    return ["All Projects", ...Array.from(list)];
  }, [data]);

  // --- 5. RENDER STATES (LOADING / ERROR) ---
  if (isLoading) {
    return (
      <div className="flex-1 h-[calc(100vh-64px)] bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#F8FAFC] overflow-hidden font-sans text-slate-900 w-full">
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Lab Header Controls */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => window.history.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft size={18}/>
            </button>
            <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">Verification Lab</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search ID or Title..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none w-64 focus:ring-2 focus:ring-indigo-500/20 font-bold" />
            </div>
            <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-slate-500 outline-none cursor-pointer">
              {projectOptions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </header>

        {data.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white m-6 rounded-[2rem] border border-dashed border-slate-200">
            <Zap size={40} className="text-indigo-400 mb-3 animate-pulse" />
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Queue is Completely Clear</h3>
            <p className="text-xs text-slate-400 font-bold mt-1">No bugs currently matching "Ready for QA" status.</p>
          </div>
        ) : (
          <main className="flex-1 flex overflow-hidden">
            {/* Left Queue Panel */}
            <div className="w-[30%] border-r border-slate-200 bg-white flex flex-col shrink-0">
              <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retest Queue</h2>
                <span className="bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded font-black">{filteredList.length} ITEMS</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {filteredList.map((item) => (
                  <button 
                    key={item.id} 
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full p-5 rounded-[1.5rem] border-2 text-left transition-all ${
                      selectedId === item.id ? 'border-indigo-600 bg-white shadow-lg -translate-y-0.5' : 'border-slate-50 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase">#{item.id}</span>
                      <span className="text-[9px] font-black px-2 py-1 rounded-md uppercase border bg-amber-50 text-amber-600 border-amber-100">
                        {item.status}
                      </span>
                    </div>
                    <h4 className={`text-[13px] font-bold mb-3 leading-snug line-clamp-2 ${selectedId === item.id ? 'text-indigo-600' : 'text-slate-800'}`}>{item.title}</h4>
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded text-white ${item.priority === 'CRITICAL' ? 'bg-red-500' : 'bg-orange-400'}`}>{item.priority}</span>
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter max-w-[100px] truncate">{item.project}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Details Workspace */}
            {activeData && (
              <div className="flex-1 bg-white flex flex-col overflow-hidden">
                <div className="px-10 py-8 border-b border-slate-100 shrink-0">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1 uppercase">Verification: {activeData.id}</h2>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{activeData.project} • {activeData.sprint}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                       <Clock size={14} className="text-slate-400"/>
                       <span className="text-[10px] font-black text-slate-500 uppercase">Verification Active</span>
                    </div>
                  </div>

                  <div className="flex gap-10">
                    {['steps', 'summary'].map((t) => (
                      <button key={t} onClick={() => setActiveTab(t)} className={`pb-4 text-[10px] font-black tracking-[0.2em] relative transition-colors ${activeTab === t ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-500'}`}>
                        {/* {t === 'steps' ? 'EXECUTION PROCEDURE' : 'BUG RECAP'} */}
                        {t === 'steps' ? 'EXECUTION PROCEDURE' : ''}
                        {activeTab === t && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
                  {activeTab === 'steps' ? (
                    <div className="space-y-10 max-w-4xl">
                      <section>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Step-by-Step Execution</label>
                        <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50 overflow-hidden shadow-sm">
                          {activeData.steps.map((step, i) => (
                            <div key={i} className="flex gap-5 p-5 text-[13px] font-bold text-slate-600 hover:bg-slate-50/50 transition-colors">
                              <span className="text-indigo-300 font-black">{i + 1}.</span> 
                              <p className="leading-relaxed">{step}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-3xl border border-emerald-100 bg-emerald-50/10">
                          <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-3 block">Expected Result</label>
                          <p className="text-[12px] font-bold text-slate-600 leading-relaxed">{activeData.expected}</p>
                        </div>
                        <div className="p-6 rounded-3xl border border-red-100 bg-red-50/10">
                          <label className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-3 block">Observed Bug</label>
                          <p className="text-[12px] font-bold text-slate-600 leading-relaxed">{activeData.actual}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-10 max-w-3xl">
                      <section>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Resolution Summary</label>
                        <div className="p-8 rounded-[2.5rem] bg-indigo-50/30 border border-indigo-100 text-slate-800 text-lg font-bold leading-relaxed shadow-inner">
                          "{activeData.summary}"
                        </div>
                      </section>
                      <section>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Developer Handover</label>
                        <div className="flex items-center justify-between p-6 bg-slate-900 rounded-2xl shadow-xl">
                          <div className="flex items-center gap-4 text-white">
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-black">GIT</div>
                            <div>
                              <p className="text-[9px] text-indigo-400 font-black tracking-widest">REFERENCE COMMIT</p>
                              <code className="text-sm font-bold text-indigo-100 select-all">{activeData.commit}</code>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  )}
                </div>

                {/* Operations Footers Footer Actions */}
                <div className="p-8 bg-white border-t border-slate-100 shrink-0">
                  <div className="flex gap-4">
                    <button disabled={verifyVerdictMutation.isPending} onClick={() => setActiveModal('pass')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl text-xs font-black shadow-lg shadow-emerald-100 transition-all uppercase tracking-widest disabled:opacity-50">
                      Verify & Pass ✓
                    </button>
                    <button disabled={verifyVerdictMutation.isPending} onClick={() => setActiveModal('fail')} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl text-xs font-black shadow-lg shadow-red-100 transition-all uppercase tracking-widest disabled:opacity-50">
                      Reject & Reopen ↺
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        )}
      </div>

      {/* --- Action Verification Modals (Pass/Fail) --- */}
      {activeModal === 'pass' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-[400px] rounded-[2.5rem] p-10 shadow-2xl text-center">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-black italic">✓</div>
            <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Confirm Pass?</h3>
            <p className="text-xs text-slate-400 font-bold mb-10 uppercase tracking-widest">Marking this bug as resolved permanently.</p>
            <div className="flex gap-3">
              <button onClick={() => setActiveModal(null)} className="flex-1 py-4 border border-slate-100 rounded-2xl font-black text-slate-400 text-[10px] uppercase tracking-wide">Cancel</button>
              <button disabled={verifyVerdictMutation.isPending} onClick={() => handleStatusUpdate('Passed')} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-emerald-100 disabled:opacity-50">
                {verifyVerdictMutation.isPending ? "Processing..." : "Confirm Pass"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'fail' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-[440px] rounded-[2.5rem] p-10 shadow-2xl text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-black italic">✕</div>
            <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Confirm Fail?</h3>
            <textarea value={failComment} onChange={(e) => setFailComment(e.target.value)} placeholder="Provide specific failure parameters or logging outputs..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs font-bold h-32 mb-8 outline-none focus:ring-2 focus:ring-red-500/20 resize-none" />
            <div className="flex gap-3">
              <button onClick={() => setActiveModal(null)} className="flex-1 py-4 border border-slate-100 rounded-2xl font-black text-slate-400 text-[10px] uppercase tracking-wide">Cancel</button>
              <button disabled={!failComment.trim() || verifyVerdictMutation.isPending} onClick={() => handleStatusUpdate('Failed')} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-red-100 disabled:opacity-50">
                {verifyVerdictMutation.isPending ? "Reopening..." : "Reject Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationPage;