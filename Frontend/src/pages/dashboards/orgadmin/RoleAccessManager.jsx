// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Shield, Users, Terminal, Eye, CheckCircle, AlertTriangle, Building, ShieldCheck } from 'lucide-react';
// import API from '../../../api/axios';

// const RoleAccessManager = () => {
//   // 1. Active Tab Role State
//   const [activeRole, setActiveRole] = useState('manager');

//   // 2. Backend Permissions State Flat Array
//   const [permissions, setPermissions] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Fallback map descriptors jo features ki detailed info screen par display karain ge
//   const routeDescriptions = {
//     '/dev/dashboard': 'Personal task queues, daily schedules, and project stats',
//     '/dev/my-projects': 'Manage access keys, git configurations, and repository states',
//     '/dev/issues': 'View reported platform bugs and log execution crashes',
//     '/dev/board': 'Interactive agile board to update task workflows',
//     '/dev/ide': 'Write and test platform code natively inside custom workspace',
//     '/dev/chat': 'Instant socket communication frame with internal teams',
//     '/dev/projects-dir': 'Access hierarchical cloud directory trees and source assets',
//     '/dev/meetings': 'Schedule and connect to WebRTC active room grids',

//     '/manager/portfolio': 'View global project financial health and progress indicators',
//     '/manager/activity': 'Monitor task counts, workloads, and developer tracking states',
//     '/manager/tasks': 'Create, modify, and distribute batch tasks across roles',
//     '/manager/ide': 'Review code repositories natively inside project context',
//     '/manager/chat': 'Collaborate via workspace direct channels',
//     '/manager/projects-dir': 'Check tree structures of manager sub-directories',
//     '/manager/meetings': 'Initialize meeting scopes for cross-functional sprint checks',

//     '/qa/dashboard': 'Track test-case counts and overall test coverage percentage',
//     '/qa/alerts': 'Trigger high-priority alerts for pipeline execution delays',
//     '/qa/report-bug': 'File new logs and tag relevant development scopes',
//     '/qa/verify-task': 'Cross-examine dev tasks pending quality control approval',
//     '/qa/board': 'Access specific bug-tracking and sprint test boards',
//     '/qa/chat': 'Connect instantly with developers regarding execution failures',
//     '/qa/meetings': 'Join quality audit discussions and deployment sync calls',

//     '/org-admin/dashboard': 'Access overarching tenant settings, usage graphs, and tiers',
//     '/org-admin/projects': 'Initialize master configurations for new client spaces',
//     '/org-admin/users': 'Alter roles, revoke invite links, and audit active sessions',
//     '/org-admin/chat': 'System-wide broadcast tool and administrative workspace log',
//     '/org-admin/meetings': 'Host general assembly configurations and manager arrays',
//     '/org-admin/permissions': 'Configure role feature visibility rules globally',

//     '/super-admin/dashboard': 'Master control setup for multiple organizational environments',
//     '/super-admin/orgs': 'Provision or terminate system licenses for organizations',
//     '/super-admin/roles': 'Assign system administrators and monitor root operations'
//   };

//   // 🔄 1. Load data from Backend Database
//   const fetchPermissions = async () => {
//     try {
//       const response = await API.get('/permissions'); // API path check kar lena
//       if (response.data.success) {
//         setPermissions(response.data.data);
//       }
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching permissions inside control panel:", error);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPermissions();
//   }, []);

//   // 🔄 2. Permission Toggle Switch Sync Handler
//   const handleTogglePermission = async (id, currentStatus) => {
//     try {
//       // Optimistic UI state update (Fauran UI change karo bina backend delay ke)
//       setPermissions(prev =>
//         prev.map(item => item.id === id ? { ...item, enabled: !currentStatus } : item)
//       );

//       // Backend API sync trigger update
//       await API.put(`/permissions/toggle/${id}`, {
//         enabled: !currentStatus
//       });

//     } catch (error) {
//       console.error("Failed syncing dynamic permission update:", error);
//       // Revert screen state if network breaks down
//       setPermissions(prev =>
//         prev.map(item => item.id === id ? { ...item, enabled: currentStatus } : item)
//       );
//     }
//   };

//   // Roles Configuration Matrix for Tabs
//   const roleTabs = [
//     { id: 'dev', label: 'Developer', icon: Terminal, color: 'text-blue-500 bg-blue-50' },
//     { id: 'manager', label: 'Project Manager', icon: Shield, color: 'text-amber-500 bg-amber-50' },
//     { id: 'qa', label: 'QA Engineer', icon: Eye, color: 'text-rose-500 bg-rose-50' },
//     { id: 'orgadmin', label: 'Organization Admin', icon: ShieldCheck, color: 'text-emerald-500 bg-emerald-50' },
//     { id: 'superadmin', label: 'Super Admin', icon: Building, color: 'text-slate-700 bg-slate-100' }
//   ];

//   // Helper arrays for items counting and active context rendering
//   const filteredPermissionsForRole = permissions.filter(p => p.role === activeRole);

//   if (loading) {
//     return (
//       <div className="w-full max-w-5xl mx-auto p-12 text-center text-slate-500 font-medium">
//         Loading operational access keys from backend cluster...
//       </div>
//     );
//   }

//   return (
//     <div className="w-full max-w-5xl mx-auto p-6 bg-white border border-slate-100 rounded-[24px] shadow-sm">
//       {/* Header Info */}
//       <div className="mb-8">
//         <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
//           <Users size={22} className="text-indigo-600" /> Global Access Control Panel
//         </h1>
//         <p className="text-xs text-slate-400 font-medium mt-1">
//           Dynamically toggle module accessibility and control feature scope parameters for workspace tiers.
//         </p>
//       </div>

//       {/* 🔘 Step 1: Upper Role Selection Tabs */}
//       <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
//         {roleTabs.map((tab) => {
//           const Icon = tab.icon;
//           const isSelected = activeRole === tab.id;
//           const totalFeaturesCount = permissions.filter(p => p.role === tab.id).length;

//           return (
//             <button
//               key={tab.id}
//               onClick={() => setActiveRole(tab.id)}
//               className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-28 ${
//                 isSelected
//                   ? 'border-indigo-600 bg-indigo-50/30 shadow-sm shadow-indigo-50'
//                   : 'border-slate-100 bg-white hover:bg-slate-50'
//               }`}
//             >
//               <div className="flex items-start justify-between w-full">
//                 <div className={`p-2.5 rounded-xl ${tab.color}`}>
//                   <Icon size={18} />
//                 </div>
//                 <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-indigo-600 animate-pulse' : 'bg-transparent'}`} />
//               </div>

//               <div className="mt-2">
//                 <p className="text-xs font-black text-slate-800 leading-none">{tab.label}</p>
//                 <p className="text-[10px] text-slate-400 font-bold mt-1">
//                   {totalFeaturesCount} Features Managed
//                 </p>
//               </div>
//             </button>
//           );
//         })}
//       </div>

//       {/* 📋 Step 2: Selected Role Permissions Details Frame */}
//       <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
//         <div className="px-6 py-4 border-b border-slate-100 bg-white flex justify-between items-center">
//           <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
//             Active Layout Rules for: <span className="text-indigo-600 font-black lowercase">@{activeRole}</span>
//           </h3>
//           <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
//             Live Synchronization Active
//           </span>
//         </div>

//         <div className="p-6 space-y-4">
//           {filteredPermissionsForRole.map((feature) => (
//             <div
//               key={feature.id}
//               className={`p-4 rounded-xl border bg-white transition-all duration-300 flex items-center justify-between ${
//                 feature.enabled ? 'border-slate-100 shadow-sm' : 'border-slate-100 opacity-60'
//               }`}
//             >
//               <div className="flex items-start gap-4 max-w-[75%]">
//                 <div className={`mt-0.5 p-1.5 rounded-lg ${feature.enabled ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
//                   <CheckCircle size={14} />
//                 </div>
//                 <div>
//                   <div className="flex items-center gap-2 flex-wrap">
//                     <p className="text-xs font-black text-slate-800 leading-tight">{feature.label}</p>
//                     <code className="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-500 font-mono rounded">
//                       {feature.route}
//                     </code>
//                   </div>
//                   <p className="text-[10px] text-slate-400 font-medium mt-1 leading-relaxed">
//                     {routeDescriptions[feature.route] || 'System layout authorization module route rule description.'}
//                   </p>
//                 </div>
//               </div>

//               <button
//                 onClick={() => handleTogglePermission(feature.id, feature.enabled)}
//                 className={`w-10 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
//                   feature.enabled ? 'bg-green-500' : 'bg-slate-200'
//                 }`}
//               >
//                 <div
//                   className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${
//                     feature.enabled ? 'translate-x-4' : 'translate-x-0'
//                   }`}
//                 />
//               </button>
//             </div>
//           ))}

//           {filteredPermissionsForRole.length === 0 && (
//             <div className="text-center py-6 text-xs text-slate-400 font-bold">
//               No features registered under this tier workspace configuration.
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Warning Tracker Info Alert Footer */}
//       <div className="mt-6 flex items-center gap-3 bg-amber-50/50 border border-amber-100 rounded-xl p-4 text-amber-800">
//         <AlertTriangle size={16} className="text-amber-600 shrink-0" />
//         <p className="text-[10px] font-bold leading-normal">
//           <span className="font-black italic mr-1">Security Note:</span> Toggling these features will instantly modify the visible routing configurations inside the central navigation modules globally for active tokens.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default RoleAccessManager;

import React, { useState, useEffect } from "react";
import {
  Shield,
  Users,
  Terminal,
  Eye,
  CheckCircle,
  AlertTriangle,
  Building,
  ShieldCheck,
} from "lucide-react";
import API from "../../../api/axios";

const RoleAccessManager = () => {
  const [activeRole, setActiveRole] = useState("manager");
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const workspaceSlug = JSON.parse(localStorage.getItem("user"))?.workspace_id;

  const routeDescriptions = {
    "/dev/dashboard":
      "Personal task queues, daily schedules, and project stats",
    "/dev/my-projects":
      "Manage access keys, git configurations, and repository states",
    "/dev/issues": "View reported platform bugs and log execution crashes",
    "/dev/board": "Interactive agile board to update task workflows",
    "/dev/ide": "Write and test platform code natively inside custom workspace",
    "/dev/chat": "Instant socket communication frame with internal teams",
    "/dev/projects-dir":
      "Access hierarchical cloud directory trees and source assets",
    "/dev/meetings": "Schedule and connect to WebRTC active room grids",

    "/manager/portfolio":
      "View global project financial health and progress indicators",
    "/manager/activity":
      "Monitor task counts, workloads, and developer tracking states",
    "/manager/tasks": "Create, modify, and distribute batch tasks across roles",
    "/manager/ide": "Review code repositories natively inside project context",
    "/manager/chat": "Collaborate via workspace direct channels",
    "/manager/projects-dir": "Check tree structures of manager sub-directories",
    "/manager/meetings":
      "Initialize meeting scopes for cross-functional sprint checks",

    "/qa/dashboard":
      "Track test-case counts and overall test coverage percentage",
    "/qa/alerts": "Trigger high-priority alerts for pipeline execution delays",
    "/qa/report-bug": "File new logs and tag relevant development scopes",
    "/qa/verify-task":
      "Cross-examine dev tasks pending quality control approval",
    "/qa/board": "Access specific bug-tracking and sprint test boards",
    "/qa/chat":
      "Connect instantly with developers regarding execution failures",
    "/qa/meetings": "Join quality audit discussions and deployment sync calls",

    "/org-admin/dashboard":
      "Access overarching tenant settings, usage graphs, and tiers",
    "/org-admin/projects":
      "Initialize master configurations for new client spaces",
    "/org-admin/users":
      "Alter roles, revoke invite links, and audit active sessions",
    "/org-admin/chat":
      "System-wide broadcast tool and administrative workspace log",
    "/org-admin/meetings":
      "Host general assembly configurations and manager arrays",
    "/org-admin/permissions":
      "Configure role feature visibility rules globally",

    "/super-admin/dashboard":
      "Master control setup for multiple organizational environments",
    "/super-admin/orgs":
      "Provision or terminate system licenses for organizations",
    "/super-admin/roles":
      "Assign system administrators and monitor root operations",
  };

  const fetchPermissions = async () => {
    try {
      if (!workspaceSlug) return;
      const response = await API.get(`/permissions/workspace/${workspaceSlug}`);
      console.log("Fetched isolated workspace permissions:", response);
      if (response.data.success) {
        setPermissions(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching isolated workspace permissions:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [workspaceSlug]);

  const handleTogglePermission = async (permissionId, currentStatus) => {
    try {
      setPermissions((prev) =>
        prev.map((item) =>
          item.id === permissionId
            ? { ...item, enabled: !currentStatus }
            : item,
        ),
      );

      await API.put(`/permissions/workspace/${workspaceSlug}/${permissionId}`, {
        enabled: !currentStatus,
      });
    } catch (error) {
      console.error("Failed syncing customized workspace parameter:", error);
      setPermissions((prev) =>
        prev.map((item) =>
          item.id === permissionId ? { ...item, enabled: currentStatus } : item,
        ),
      );
    }
  };

  const roleTabs = [
    {
      id: "dev",
      label: "Developer",
      icon: Terminal,
      color: "text-blue-500 bg-blue-50",
    },
    {
      id: "manager",
      label: "Project Manager",
      icon: Shield,
      color: "text-amber-500 bg-amber-50",
    },
    {
      id: "qa",
      label: "QA Engineer",
      icon: Eye,
      color: "text-rose-500 bg-rose-50",
    },
  ];

  const filteredPermissionsForRole = permissions.filter(
    (p) =>
      p.role === activeRole &&
      p.role !== "orgadmin" &&
      p.role !== "superadmin" &&
      p.role !== "org_admin" &&
      p.role !== "super_admin",
  );

  console.log(
    "Workspace Slug:",
    workspaceSlug,
    "Active Role:",
    activeRole,
    "Filtered Permissions:",
    filteredPermissionsForRole,
  );

  return (
    <div className="w-full mx-auto p-4 sm:p-8 lg:p-12 bg-white border border-slate-100 shadow-sm">
      {/* Header Info */}
      <div className="mb-8">
        <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Users size={22} className="text-indigo-600" /> Control Panel —{" "}
          <span className="text-indigo-600 font-mono text-sm">
            [{workspaceSlug}]
          </span>
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Dynamically toggle module accessibility and control feature scope
          parameters for workspace tiers.
        </p>
      </div>

      {/* 🔘 Step 1: Upper Role Selection Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {roleTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeRole === tab.id;
          const totalFeaturesCount = permissions.filter(
            (p) => p.role === tab.id,
          ).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveRole(tab.id)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-28 ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50/30 shadow-sm shadow-indigo-50"
                  : "border-slate-100 bg-white hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between w-full">
                <div className={`p-2.5 rounded-xl ${tab.color}`}>
                  <Icon size={18} />
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${isSelected ? "bg-indigo-600 animate-pulse" : "bg-transparent"}`}
                />
              </div>

              <div className="mt-2">
                <p className="text-xs font-black text-slate-800 leading-none">
                  {tab.label}
                </p>
                <p className="text-[10px] text-slate-400 font-bold mt-1">
                  {totalFeaturesCount} Features Managed
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 📋 Step 2: Selected Role Permissions Details Frame */}
      <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
        <div className="px-6 py-4 border-b border-slate-100 bg-white flex justify-between items-center">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Active Layout Rules for:{" "}
            <span className="text-indigo-600 font-black lowercase">
              @{activeRole}
            </span>
          </h3>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
            Live Synchronization Active
          </span>
        </div>

        <div className="p-6 space-y-4">
          {filteredPermissionsForRole.map((feature) => (
            <div
              key={feature.id}
              className={`p-4 rounded-xl border bg-white transition-all duration-300 flex items-center justify-between ${
                feature.enabled
                  ? "border-slate-100 shadow-sm"
                  : "border-slate-100 opacity-60"
              }`}
            >
              <div className="flex items-start gap-4 max-w-[75%]">
                <div
                  className={`mt-0.5 p-1.5 rounded-lg ${feature.enabled ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"}`}
                >
                  <CheckCircle size={14} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-black text-slate-800 leading-tight">
                      {feature.label}
                    </p>
                    <code className="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-500 font-mono rounded">
                      {feature.route}
                    </code>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-1 leading-relaxed">
                    {routeDescriptions[feature.route] ||
                      "System layout authorization module route rule description."}
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  handleTogglePermission(feature.id, feature.enabled)
                }
                className={`w-10 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
                  feature.enabled ? "bg-green-500" : "bg-slate-200"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${
                    feature.enabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}

          {filteredPermissionsForRole.length === 0 && (
            <div className="text-center py-6 text-xs text-slate-400 font-bold">
              No features registered under this tier workspace configuration.
            </div>
          )}
        </div>
      </div>

      {/* Warning Tracker Info Alert Footer */}
      <div className="mt-6 flex items-center gap-3 bg-amber-50/50 border border-amber-100 rounded-xl p-4 text-amber-800">
        <AlertTriangle size={16} className="text-amber-600 shrink-0" />
        <p className="text-[10px] font-bold leading-normal">
          <span className="font-black italic mr-1">Security Note:</span>{" "}
          Toggling these features will instantly modify the visible routing
          configurations inside the central navigation modules globally for this
          active workspace.
        </p>
      </div>
    </div>
  );
};

export default RoleAccessManager;
