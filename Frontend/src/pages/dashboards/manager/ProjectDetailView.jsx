import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Bell,
  ChevronDown,
  AlertCircle,
  Info,
  Users,
  Layout,
  Clock,
  CheckCircle2,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import API from "../../../api/axios";
import { useIssues } from "../../../hooks/useIssues";

const ProjectDetailView = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [selectedLog, setSelectedLog] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const project = location.state?.project;

  // 🌟 LIVE DATA FETCH: Deployments from MySQL Database
  const { data: dbDeployments = [], isLoading } = useQuery({
    queryKey: ["project_deployments", Number(project?.id)],
    queryFn: async () => {
      if (!project?.id) return [];
      const res = await API.get(`/deployments/project/${project.id}`); // Apne backend ka exact endpoint url likho
      return res.data; // Expecting array from database
    },
    enabled: !!project?.id,
  });

  console.log(
    "Check Github Logs Status:::::::::::::::::::::::::::::::",
    dbDeployments,
  );

  // alert(project.name)

  const [projectData, setProjectData] = useState(null);
  useEffect(() => {
    const fetchTeamActivity = async () => {
      try {
        const response = await API.get(`/team/activity/${project.name}`);
        // Axios response se nested data extract karna (response.data.data)
        if (response.data && response.data.success) {
          setProjectData(response.data.data);
        } else {
          console.log("Failed to fetch accurate data structure");
        }
      } catch (err) {
        console.log(err.message, "Something went wrong while fetching logs");
      }
    };

    fetchTeamActivity();
  }, [project]);

  const members = useMemo(() => {
    if (!projectData || !projectData.Tasks) return [];

    const memberMap = new Map();
    const projectName = projectData.name || "Mobile App";

    projectData.Tasks.forEach((task) => {
      if (task.assignees && Array.isArray(task.assignees)) {
        task.assignees.forEach((assignee) => {
          if (!memberMap.has(assignee.id)) {
            // Dynamic Workload Logic based on task counts
            const totalAssignedTasks = projectData.Tasks.filter((t) =>
              t.assignees.some((a) => a.id === assignee.id),
            ).length;

            const doneTasks = projectData.Tasks.filter(
              (t) =>
                t.status === "done" &&
                t.assignees.some((a) => a.id === assignee.id),
            ).length;

            // Simple conditional metrics computation
            let status = "Balanced";
            let color = "bg-green-500";
            let percentage = 85;
            let hours = "34h / 40h";

            if (totalAssignedTasks > 4) {
              status = "Overloaded";
              color = "bg-red-500";
              percentage = 120;
              hours = "48h / 40h";
            } else if (totalAssignedTasks < 2) {
              status = "Underutilized";
              color = "bg-yellow-500";
              percentage = 45;
              hours = "18h / 40h";
            }

            memberMap.set(assignee.id, {
              id: assignee.id,
              name: assignee.full_name || "Unknown Developer",
              email: assignee.email,
              avatar: assignee?.avatar_url,
              role: assignee.email.includes("admin") ? "Admin" : "Full Stack", // Dummy role dynamic match
              projects: [projectName],
              tasks: `${doneTasks}/${totalAssignedTasks}`,
              hours: hours,
              status: status,
              color: color,
              percentage: percentage,
            });
          }
        });
      }
    });

    return Array.from(memberMap.values());
  }, [projectData]);

  console.log("Hey This is members list according to overload::", members);

  // 🌟 Dynamic counts nikalne ke liye filter lagao
  const overloadedCount = members.filter(
    (m) => m.status === "Overloaded",
  ).length;
  const underutilizedCount = members.filter(
    (m) => m.status === "Underutilized",
  ).length;

  // Dynamic string tayar karne ki logic
  const getNoteText = () => {
    if (overloadedCount === 0 && underutilizedCount === 0) {
      return "All developers have a balanced workload. Team efficiency is optimal!";
    }

    let parts = [];
    if (overloadedCount > 0) {
      parts.push(
        `${overloadedCount} developer${overloadedCount > 1 ? "s are" : " is"} overloaded`,
      );
    }
    if (underutilizedCount > 0) {
      parts.push(
        `${underutilizedCount} developer${underutilizedCount > 1 ? "s are" : " is"} underutilized`,
      );
    }

    return `${parts.join(" and ")}. Consider workload rebalancing.`;
  };

  const { data: serverBugs = [] } = useIssues(project?.id);

  console.log(
    "#######################@@@@@@@@@@@@@@@@#########################",
    serverBugs,
  );

  if (!project) {
    return (
      <div className="p-10 text-center font-bold">Project data not found!</div>
    );
  }

  // --- Overview Tab Content ---
  const renderOverview = () => (
    <div className="animate-in fade-in duration-500">
      {/* Dynamic Stats Row */}
      <div className="grid grid-cols-3 gap-6 mb-8 mt-8">
        <DetailStatCard
          label="Sprint Status"
          value={project.status}
          sub={
            new Date(project.start_date).toLocaleString() +
            " - " +
            new Date(project.end_date).toLocaleString()
          }
          color="text-slate-800"
        />
        <DetailStatCard
          label="Open Red Cards"
          value={project.redCards}
          sub="Active Critical Issues"
          color="text-slate-800"
        />
        <DetailStatCard
          label="Last Deployment"
          value={dbDeployments[0]?.status}
          sub={
            "Production - " +
            new Date(dbDeployments[0]?.deployed_at).toLocaleString()
          }
          color={
            dbDeployments[0]?.status === "Failed"
              ? "text-red-600"
              : "text-green-600"
          }
        />
      </div>

      {/* Dynamic Progress Bar */}
      <div className="bg-white border border-slate-100 rounded-md p-8 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-black text-slate-800 tracking-tight">
            Sprint Progress & Task Distribution
          </h2>
          <span className="text-sm font-black text-slate-800">
            {project.progress}%
          </span>
        </div>
        <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden mb-8">
          <div
            className={`bg-blue-500 h-full transition-all duration-700`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <div className="grid grid-cols-4 gap-6">
          {[
            { label: "To Do", val: project.todoCount },
            { label: "In Progress", val: project.inprogressCount },
            { label: "Blocked", val: project.blockedCount },
            { label: "Done", val: project.doneCount },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 p-6 rounded-md text-center shadow-sm"
            >
              <h3 className="text-2xl font-black text-slate-800 mb-1">
                {item.val}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        

        {/* Team Load */}
        <div className="bg-white border border-slate-100 rounded-[24px] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-black text-slate-800 tracking-tight">
              Team Load Snapshot
            </h2>

            {/* 🌟 Dynamic Badge Area */}
            {overloadedCount > 0 || underutilizedCount > 0 ? (
              <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-[10px] font-black text-yellow-700 uppercase tracking-wider">
                  Load Imbalance Detected
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] font-black text-green-700 uppercase tracking-wider">
                  Team Load Balanced
                </span>
              </div>
            )}
          </div>

          {/* 👥 Grid container looping updated cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {members.map((mem) => (
              <TeamMemberCard
                key={mem.id}
                name={mem.name}
                tasks={mem.tasks}
                status={mem.status}
                color={mem.color}
                avatar={mem.avatar} // 🌟 Passed user avatar url dynamically here
              />
            ))}
          </div>

          {/* 🌟 Dynamic Note Area */}
          <div
            className={`p-4 rounded-xl border transition-all duration-300 ${
              overloadedCount > 0 || underutilizedCount > 0
                ? "bg-yellow-50/50 border-yellow-100 text-yellow-800"
                : "bg-green-50/50 border-green-100 text-green-800"
            }`}
          >
            <p className="text-[11px] font-medium">
              <span className="font-black italic mr-1">Note:</span>
              {getNoteText()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // ProjectDetailView.jsx ke andar ye function add ya update karein:

  const renderRisksAndCards = () => {
    const riskCards = [
      {
        id: 1,
        title: "Payment Gateway timeout causing order failures",
        module: "E-Commerce Platform - Checkout Module",
        assignee: "Yasir Saleem",
        time: "23h 12m",
        status: "OPEN",
        borderColor: "border-l-red-500",
        statusClass: "text-red-500 bg-red-50 border-red-100",
      },
      {
        id: 2,
        title: "Security vulnerability in user authentication flow",
        module: "E-Commerce Platform - Checkout Module",
        assignee: "Yasir Saleem",
        time: "23h 12m",
        status: "ACKNOWLEDGED",
        borderColor: "border-l-yellow-500",
        statusClass: "text-yellow-600 bg-yellow-50 border-yellow-100",
      },
      {
        id: 3,
        title: "Database connection pool exhausted under load",
        module: "E-Commerce Platform - Checkout Module",
        assignee: "Yasir Saleem",
        time: "23h 12m",
        status: "IN PROGRESS",
        borderColor: "border-l-blue-500",
        statusClass: "text-blue-500 bg-blue-50 border-blue-100",
      },
    ];

    return (
      <div className="space-y-4 mt-8 animate-in slide-in-from-bottom-4 duration-500">
        {serverBugs.map((card) => (
          <div
            key={card.id}
            className={`bg-white border border-slate-100 border-l-4 ${card.status === "In Progress" ? "border-l-blue-500" : card.status === "New" ? "border-l-red-500" : card.status === "Acknowledged" ? "border-l-yellow-500" : card.status === "Resolved" ? "border-l-green-500" : "border-l-purple-500"} rounded-md p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-all`}
          >
            <div className="flex items-start gap-6">
              <div className="mt-1">
                {card.status === "In Progress" ? (
                  <AlertCircle size={24} className="text-slate-400" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center font-bold text-xs italic">
                    !
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-base font-black text-slate-800 leading-tight mb-1">
                  {card.title}
                </h3>
                <p className="text-[11px] text-slate-400 font-bold mb-4">
                  {card.description}
                </p>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full border border-blue-100 bg-blue-600 w-10 h-10 flex items-center justify-center text-white font-black text-xs shadow-sm uppercase overflow-hidden">
                      {card?.assignee?.avatar_url ? (
                        <img
                          src={card?.assignee?.avatar_url}
                          alt="Avatar"
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover"
                        />
                      ) : card?.assignee?.full_name ? (
                        card?.assignee?.full_name[0]
                      ) : (
                        "U"
                      )}
                    </div>
                    {/* Avatar Placeholder */}
                    <span className="text-xs font-bold text-slate-700">
                      {card?.assignee?.full_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock size={14} />
                    <span className="text-xs font-bold">{card?.createdAt}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span
                className={`text-[9px] font-black px-3 py-1 rounded-full border ${card.status === "In Progress" ? "text-blue-600 bg-blue-50 border-blue-100" : card.status === "New" ? "text-red-600 bg-red-50 border-red-100" : card.status === "Acknowledged" ? "text-yellow-600 bg-yellow-50 border-yellow-100" : card.status === "Resolved" ? "text-green-600 bg-green-50 border-green-100" : "text-purple-600 bg-purple-50 border-purple-100"}`}
              >
                {card.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ProjectDetailView.jsx ke andar ye state aur functions add karein:

  // Modal control ke liye

  const renderDeployments = () => {
    // Loading State
    if (isLoading) {
      return (
        <div className="mt-8 text-center py-10 text-xs font-bold text-slate-400">
          Loading deployment logs from database...
        </div>
      );
    }

    // Empty State
    if (dbDeployments.length === 0) {
      return (
        <div className="mt-8 text-center py-10 border-2 border-dashed border-slate-100 rounded-md text-xs font-bold text-slate-400">
          No deployments found for this project yet.
        </div>
      );
    }

    return (
      <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-sm font-black text-slate-800 mb-4">
          Deployment History
        </h2>

        <div className="space-y-3">
          {dbDeployments.map((dep) => {
            // Check success dynamically (supports casing safely)
            const isSuccess =
              dep.status?.toLowerCase() === "success" ||
              dep.status?.toLowerCase() === "passed";

            return (
              <div
                key={dep.id}
                className="bg-white border border-slate-100 rounded-md p-4 flex items-center justify-between group hover:border-blue-200 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs ${
                      isSuccess
                        ? "text-green-600 bg-green-50"
                        : "text-red-500 bg-red-50"
                    }`}
                  >
                    {isSuccess ? "✓" : "✕"}
                  </div>
                  <span className="text-sm font-black text-slate-800">
                    {dep.version || "v1.0.0"}
                  </span>

                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                      isSuccess
                        ? "bg-green-50 text-green-600 border-green-100"
                        : "bg-red-50 text-red-500 border-red-100"
                    }`}
                  >
                    {dep.status?.toUpperCase()}
                  </span>

                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 uppercase">
                    {dep.trigger || "Auto"}
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  <span className="text-[11px] font-bold text-slate-400">
                    {dep.deployed_at
                      ? new Date(dep.deployed_at).toLocaleString()
                      : new Date(dep.createdAt).toLocaleString()}
                  </span>
                  <button
                    onClick={() => setSelectedLog(dep)}
                    className="text-xs font-black text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Logs →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* --- Deployment Log Modal --- */}
        {selectedLog && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-md w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black text-slate-800">
                    {selectedLog.version || "v1.0.0"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    {selectedLog.deployed_at
                      ? new Date(selectedLog.deployed_at).toLocaleString()
                      : new Date(selectedLog.createdAt).toLocaleString()}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded ${
                        selectedLog.status?.toLowerCase() === "success"
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {selectedLog.status?.toUpperCase()}
                    </span>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-50 text-slate-400 border border-slate-100">
                      Trigger: {selectedLog.trigger || "Auto"}
                    </span>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-50 text-slate-400 border border-slate-100">
                      Env: {selectedLog.env?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="bg-slate-50 p-1.5 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">
                  Deployment Log Output
                </p>
                {/* Terminal Style view */}
                <div className="bg-[#0f172a] rounded-md p-4 font-mono text-[11px] text-emerald-400 leading-relaxed shadow-inner border border-slate-800 max-h-[250px] overflow-y-auto whitespace-pre-wrap">
                  {selectedLog.log_output ||
                    "$ No terminal output log captured."}
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="w-full bg-blue-600 text-white font-black py-3 rounded-md mt-6 text-xs shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors"
                >
                  Close Logs Window
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#fcfcfc] min-h-screen font-sans pb-10">
      <main className="p-8 mx-auto">
        {/* Project Header & Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {project.name}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-white border border-slate-100 rounded-md p-1">
              {["Overview", "Risks & Cards", "Deployments"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === tab ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {/* <button className="flex items-center gap-2 border border-slate-200 px-3 py-2 rounded-md text-xs font-bold text-slate-500 hover:bg-white">
              This Sprint <ChevronDown size={14} />
            </button> */}
          </div>
        </div>

        {/* --- Tab Content Switching Logic --- */}
        {activeTab === "Overview" && renderOverview()}

        {activeTab === "Risks & Cards" && renderRisksAndCards()}

        {activeTab === "Deployments" && renderDeployments()}
      </main>
    </div>
  );
};

// ... (Sub-components like DetailStatCard, RiskItem, TeamMemberCard stay exactly as you had them)
// Sub-components for Detail View
const DetailStatCard = ({ label, value, sub, color }) => (
  <div className="bg-white border border-slate-100 p-6 rounded-md shadow-sm">
    <p className="text-[10px] font-black uppercase text-slate-400 mb-2">
      {label}
    </p>
    <h3 className={`text-xl font-black mb-1 ${color}`}>{value}</h3>
    <p className="text-[10px] font-medium text-slate-400">{sub}</p>
  </div>
);

const RiskItem = ({ id, title, priority, status, color }) => (
  <div
    className={`border rounded-md p-4 border-${color}-100 bg-${color}-50/10`}
  >
    <div className="flex gap-2 mb-2">
      <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
        {id}
      </span>
      <span
        className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${priority === "Critical" ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"}`}
      >
        {priority}
      </span>
      <span className="text-[9px] font-bold text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded">
        {status}
      </span>
    </div>
    <h4 className="text-[13px] font-black text-slate-800 mb-2 leading-tight">
      {title}
    </h4>
    <div className="flex gap-4 text-[10px] font-bold text-slate-400">
      <span>
        Module: <span className="text-slate-600">Payment Processing</span>
      </span>
      <span>
        Open For: <span className="text-slate-600">2 hours</span>
      </span>
    </div>
  </div>
);

const TeamMemberCard = ({ name, tasks, status, color, avatar }) => {
  // Name ke initials nikalne ke liye logic (e.g., "Yasir Saleem" -> "YS")
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="p-4 rounded-2xl border border-slate-100 bg-white relative group hover:border-blue-400 transition-all cursor-pointer shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {/* 🖼️ Avatar Section */}
          <div className="rounded-full border border-blue-100 bg-blue-600 w-10 h-10 flex items-center justify-center text-white font-black text-xs shadow-sm uppercase overflow-hidden">
            {avatar ? (
              <img
                src={avatar}
                alt="Avatar"
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
              />
            ) : name ? (
              initials
            ) : (
              "U"
            )}
          </div>

          <div>
            <p className="text-xs font-black text-slate-800 leading-tight">
              {name}
            </p>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              {tasks} tasks assigned
            </p>
          </div>
        </div>

        {/* Dynamic Status Dot */}
        <div
          className={`w-2 h-2 rounded-full mt-1 ${
            status === "Overloaded"
              ? "bg-red-500"
              : status === "Underutilized"
                ? "bg-yellow-500"
                : "bg-green-500"
          }`}
        />
      </div>

      <div className="mt-4 flex justify-end">
        <span
          className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${
            status === "Overloaded"
              ? "bg-red-50 text-red-600"
              : status === "Underutilized"
                ? "bg-yellow-50 text-yellow-600"
                : "bg-green-50 text-green-600"
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  );
};

export default ProjectDetailView;
