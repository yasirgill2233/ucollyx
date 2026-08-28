import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  X,
  Plus,
  ChevronDown,
  MoreVertical,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router";
import axios from "axios"; // Make sure to npm i axios
import { triggerToast } from "../../../utils/toastHelper";
import API from "../../../api/axios";

const OrganizationsScreen = () => {
  // --- States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("Last 30 Days");
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [modals, setModals] = useState({ suspend: false, reactivate: false });
  
  // Real API integration state
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // --- Fetch Data from Backend API ---
  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/organizations`, {
        params: { search: searchTerm, status: statusFilter }
      });

      console.log("######################",response)

      if (response.data.success) {
        setOrgs(response.data.data);
      }
    } catch (error) {
      triggerToast(error.response?.data?.message || "Error loading dashboards", "error");
    } finally {
      setLoading(false);
    }
  };

  // Retrigger upon search or filters updating
  useEffect(() => {
    fetchOrganizations();
  }, [searchTerm, statusFilter]);

  // Modal Submit Function
  const handleAddOrg = async (newOrg) => {
    try {
      const response = await API.post(`/organizations`, newOrg);
      if (response.data.success) {
        triggerToast("Organization Created Successfully!", "success");
        setIsModalOpen(false);
        fetchOrganizations(); // Refresh Table
      }
    } catch (error) {
      triggerToast(error.response?.data?.message || "Creation failed", "error");
    }
  };

  // Status Change API Caller (Active / Suspended)
  const handleStatusChange = async (db_id, newStatus) => {
    try {
      const response = await API.patch(`/organizations/${db_id}/status`, { status: newStatus });
      if (response.data.success) {
        triggerToast(`Status modified to ${newStatus}`, "success");
        setModals({ suspend: false, reactivate: false });
        setIsSidebarOpen(false);
        fetchOrganizations(); // Refresh Table UI
      }
    } catch (error) {
      triggerToast(error.response?.data?.message || "Status change failed", "error");
    }
  };

  // --- Helper Functions ---
  const getStatusStyle = (status) => {
    const base = "px-3 py-1 rounded-md text-xs font-medium border bg-white ";
    switch (status) {
      case "Active":
        return base + "text-emerald-600 border-emerald-200";
      case "Suspended":
        return base + "text-red-600 border-red-200";
      case "Trial":
        return base + "text-blue-600 border-blue-200";
      case "Pending":
        return base + "text-amber-600 border-amber-200";
      default:
        return base + "text-gray-600 border-gray-200";
    }
  };

  const getBarColor = (usage) => {
    if (usage > 90) return "bg-red-500";
    if (usage > 70) return "bg-amber-400";
    return "bg-blue-600";
  };

  const handleRowClick = (org) => {
    setSelectedOrg(org);
    setIsSidebarOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900 w-full">
      <div className="p-10 mx-auto w-full max-w-7xl">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Organizations</h1>
            <p className="text-gray-500 text-sm mt-1">Manage tenant organizations and monitor compliance</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#2563eb] text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Organizations
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="relative flex-1 min-w-[300px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by organization name..."
              className="w-full border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none border border-gray-200 px-4 py-2 pr-10 rounded-lg text-sm text-gray-600 bg-white hover:border-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="All">All Organizations</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Trial">Trial</option>
              <option value="Pending">Pending</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Organization</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Total Users</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Projects</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Resource Usage</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Created Date</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-400 text-sm">Loading data records...</td>
                </tr>
              ) : orgs.length > 0 ? (
                orgs.map((org) => (
                  <tr
                    key={org.db_id}
                    onClick={() => handleRowClick(org)}
                    className="group hover:bg-gray-50/80 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-5 text-sm font-semibold text-gray-800">{org.name}</td>
                    <td className="px-6 py-5">
                      <span className={getStatusStyle(org.status)}>{org.status}</span>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600 text-center font-medium">{org.users}</td>
                    <td className="px-6 py-5 text-sm text-gray-600 text-center font-medium">{org.projects}</td>
                    <td className="px-6 py-5">
                      <div className="w-36">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className={`text-[10px] font-bold ${org.usage > 90 ? "text-red-500" : "text-gray-500"}`}>
                            {org.usage}% of limit
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-700 ease-out ${getBarColor(org.usage)}`}
                            style={{ width: `${org.usage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-500">{org.date}</td>
                    <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setSelectedOrg(org);
                          org.status === "Active"
                            ? setModals({ ...modals, suspend: true })
                            : setModals({ ...modals, reactivate: true });
                        }}
                        className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <AlertCircle className="w-10 h-10 mb-2 opacity-20" />
                      <p className="text-sm font-medium">No organizations found matching filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- SIDEBAR --- */}
      <div className={`fixed top-0 right-0 h-full w-[420px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.05)] border-l border-slate-200 z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
        {selectedOrg && (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Organization Details</h2>
                <p className="text-[11px] font-bold text-slate-400 mt-2 tracking-widest">{selectedOrg.id}</p>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#E0EBFF] rounded-2xl flex items-center justify-center text-[#2563eb] text-xl font-black">
                  {selectedOrg.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{selectedOrg.admin}</h3>
                  <p className="text-sm text-slate-500">{selectedOrg.email}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-4">Organization Profile</h4>
                  <div className="space-y-4">
                    <DetailRow label="Organization Name" value={selectedOrg.name} />
                    <DetailRow label="Organization ID" value={selectedOrg.id} />
                    <DetailRow label="Status" value={selectedOrg.status} isStatus />
                    <DetailRow label="Created Date" value={selectedOrg.date} />
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-4">Usage Metrics</h4>
                  <div className="space-y-4">
                    <DetailRow label="Total Users" value={selectedOrg.users} />
                    <DetailRow label="Active Projects" value={selectedOrg.projects} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex gap-4">
              <button
                onClick={() => navigate(`/super-admin/roles/${selectedOrg.id}`, { state: selectedOrg })}
                className="flex-1 bg-white border border-slate-200 py-3 rounded-xl text-sm font-bold text-slate-700"
              >
                Members
              </button>
              {selectedOrg.status === "Active" ? (
                <button
                  onClick={() => setModals({ ...modals, suspend: true })}
                  className="flex-1 bg-white border border-rose-200 py-3 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50"
                >
                  Suspend
                </button>
              ) : (
                <button
                  onClick={() => setModals({ ...modals, reactivate: true })}
                  className="flex-1 bg-[#2563eb] py-3 rounded-xl text-sm font-bold text-white hover:bg-blue-700"
                >
                  Reactivate
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals Rendering */}
      {isModalOpen && <CreateOrgModal onClose={() => setIsModalOpen(false)} onSubmit={handleAddOrg} />}
      {modals.suspend && <SuspendModal org={selectedOrg} onClose={() => setModals({ ...modals, suspend: false })} onConfirm={(id) => handleStatusChange(selectedOrg.db_id, "Suspended")} />}
      {modals.reactivate && <ReactivateModal org={selectedOrg} onClose={() => setModals({ ...modals, reactivate: false })} onConfirm={(id) => handleStatusChange(selectedOrg.db_id, "Active")} />}
    </div>
  );
};

// Sub Components
const DetailRow = ({ label, value, isStatus }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
    <span className="text-sm text-slate-500 font-medium">{label}</span>
    {isStatus ? (
      <span className="bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase">{value}</span>
    ) : (
      <span className="text-sm font-bold text-slate-800">{value}</span>
    )}
  </div>
);

// --- Modals definitions (CreateOrgModal, SuspendModal, ReactivateModal should follow below exactly as you sent them) ---

// --- Modal Component ---
const CreateOrgModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    adminName: "",
    adminEmail: "",
    plan: "Pro",
    status: "Active",
    maxUsers: 100,
  });

  const handleSubmit = (e) => {
    console.log(formData)
    e.preventDefault();
    if (!formData.name || !formData.adminEmail) return triggerToast("Please fill required fields","error")
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[600px] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏢</span>
            <h2 className="text-lg font-bold text-[#111827]">
              Add New Organization
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-5 mb-5">
            {/* Org Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Organization Name *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Acme Corporation"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {/* Org ID (Read Only) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Organization ID
              </label>
              <input
                disabled
                placeholder="Auto-generated"
                className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-400 italic"
              />
            </div>

            {/* Admin Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Admin Name *
              </label>
              <input
                required
                type="text"
                placeholder="Full name"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                onChange={(e) =>
                  setFormData({ ...formData, adminName: e.target.value })
                }
              />
            </div>

            {/* Admin Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Admin Email *
              </label>
              <input
                required
                type="email"
                placeholder="admin@company.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                onChange={(e) =>
                  setFormData({ ...formData, adminEmail: e.target.value })
                }
              />
            </div>

            {/* Plan Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Plan
              </label>
              <div className="relative">
                <select
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
                  onChange={(e) =>
                    setFormData({ ...formData, plan: e.target.value })
                  }
                >
                  <option>Pro</option>
                  <option>Enterprise</option>
                  <option>Free</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Status Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Status
              </label>
              <div className="relative">
                <select
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option>Active</option>
                  <option>Trial</option>
                  <option>Pending</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Max Users */}
          <div className="space-y-1.5 mb-8">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Max Users
            </label>
            <input
              type="number"
              defaultValue="100"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
              onChange={(e) =>
                setFormData({ ...formData, maxUsers: e.target.value })
              }
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg text-sm font-semibold bg-[#2563eb] text-white hover:bg-blue-700 shadow-md transition-all active:scale-95"
            >
              Create Organization
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Suspend Modal Component ---
const SuspendModal = ({ org, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[400px] rounded-2xl shadow-2xl overflow-hidden p-6 animate-in zoom-in duration-200">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-400 hover:bg-gray-100 rounded-full p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 fill-amber-50" />
            <h2 className="text-lg font-bold text-slate-800">
              Suspend Organization
            </h2>
          </div>

          <div className="w-16 h-16 bg-red-500 rounded-full mb-4 flex items-center justify-center shadow-lg shadow-red-200">
            <div className="w-10 h-10 bg-white/20 rounded-full"></div>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2">{org?.name}</h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            This will immediately revoke access for all users and make all
            projects read-only. You can reactivate at any time.
          </p>

          <div className="w-full text-left mb-6">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Billing issue, policy violation, etc."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500/10 focus:border-red-400 outline-none h-24 resize-none transition-all"
            />
          </div>

          <div className="flex w-full gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(org.id, reason)}
              className="flex-1 py-2.5 bg-red-50/50 text-red-600 border border-red-100 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
            >
              Suspend Organization
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Reactivate Modal Component ---
const ReactivateModal = ({ org, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[450px] rounded-xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-slate-800">
            Confirm Organization Reactivation
          </h2>
        </div>

        <div className="p-8">
          <p className="text-gray-600 text-sm leading-relaxed">
            Are you sure you want to reactivate{" "}
            <span className="font-bold text-slate-900">{org?.name}</span>? This
            will restore access for all users within the organization and make
            all projects accessible again.
          </p>
        </div>

        <div className="px-6 py-4 bg-gray-50/50 flex justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-200 bg-white rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(org.id)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            Reactivate Organization
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationsScreen;
