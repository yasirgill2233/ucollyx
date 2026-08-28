import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, ArrowLeft, X, Mail, Phone, Building2, Clock, Calendar } from 'lucide-react';
import { useLocation, useParams, useNavigate } from 'react-router-dom'; // Fixed: react-router-dom is standard
import API from '../../../api/axios';


// --- Member Profile Modal Component ---
const MemberModal = ({ member, onClose }) => {
  if (!member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <div className="flex justify-end p-5">
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors group">
            <X className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
          </button>
        </div>

        {/* Profile Header Section */}
        <div className="flex flex-col items-center px-8 pb-8 border-b border-slate-50">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 font-bold text-3xl mb-4 border-[6px] border-white shadow-md">
            {member.name.substring(0, 2).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">{member.name}</h2>
          <p className="text-sm font-bold text-slate-400 mb-5">{member.id}</p>
          <div className="flex gap-2">
            <span className="px-4 py-1.5 bg-orange-50 text-orange-600 rounded-xl text-[11px] font-black border border-orange-100 uppercase tracking-wider">
              {member.role}
            </span>
            <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[11px] font-black border border-emerald-100 uppercase tracking-wider">
              {member.status}
            </span>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-10 space-y-8">
          {/* Contact Info */}
          <div>
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] mb-5">Contact Info</h4>
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400 font-semibold flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-300" /> Email
                </span>
                <span className="text-sm text-slate-800 font-bold">{member.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400 font-semibold flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-300" /> Phone
                </span>
                <span className="text-sm text-slate-800 font-bold">+92 300 1234567</span>
              </div>
            </div>
          </div>

          {/* Work Details */}
          <div>
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] mb-5">Work Details</h4>
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400 font-semibold flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-slate-300" /> Department
                </span>
                <span className="text-sm text-slate-800 font-bold">Engineering</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400 font-semibold flex items-center gap-3">
                  <Clock className="w-4 h-4 text-slate-300" /> Last Active
                </span>
                <span className="text-sm text-slate-800 font-bold">{member.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400 font-semibold flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-300" /> Joined
                </span>
                <span className="text-sm text-slate-800 font-bold">Dec 22, 2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatRow = ({ label, value, colorClass }) => (
  <div className="flex justify-between items-center p-3.5 rounded-xl border border-gray-100 bg-white shadow-sm mb-3">
    <span className="text-sm text-gray-400 font-semibold">{label}</span>
    <span className={`text-lg font-bold ${colorClass}`}>{value}</span>
  </div>
);

const RoleDistribution = ({ label, count, color, total }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="mb-4">
      <div className="flex justify-between text-[11px] font-bold mb-1.5">
        <span className="text-gray-400 uppercase tracking-tight">{label}</span>
        <span className="text-gray-900">{count}</span>
      </div>
      <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-700`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const MembersAndRoles = () => {
  const { orgId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [membersData, setMembersData] = useState()

  console.log("##########################???",membersData)

  useEffect(() => {
  const fetchWorkspaceMembers = async () => {
    try {
      const response = await API.get(`/organizations/${orgId}/members`);
      if(response.data.success) {
         // Yahan aap local state set kar sakte hain: setServerMembers(response.data.data);
         console.log(response.data)
         setMembersData(response.data.data)
      }
    } catch (err) {
      console.error("Frontend fetching breakdown:", err);
    }
  };
  if(orgId) fetchWorkspaceMembers();
}, [orgId]);

  // Organization data from navigation state
  const orgName = location.state?.orgName || "Organization";
  const adminEmail = location.state?.adminEmail || "admin@company.com";
  const adminName = location.state?.adminName || "Admin";

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedMember, setSelectedMember] = useState(null);

  // --- Dynamic Data ---
  // Table ka pehla row ab wahi Admin hai jo pichli screen se aaya hai
  // const membersData = useMemo(() => [
  //   { 
  //       id: "mem-001", 
  //       name: adminName, 
  //       email: adminEmail, 
  //       role: "ADMIN", 
  //       status: "Active", 
  //       time: "Just Now", 
  //       date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) + ", " + new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) 
  //   },
  //   { id: "mem-121", name: "Zain Ahmed", email: "zain@company.com", role: "MANAGER", status: "In Active", time: "5 hours ago", date: "Feb 03, 11:30" },
  //   { id: "mem-122", name: "Hamza Ali", email: "hamza@dev.com", role: "DEVELOPER", status: "Active", time: "1 hour ago", date: "Feb 03, 15:30" },
  //   { id: "mem-123", name: "Ayesha Noor", email: "ayesha@firm.com", role: "QA ENGINEER", status: "Active", time: "3 hours ago", date: "Feb 03, 13:30" },
  //   { id: "mem-124", name: "Bilal Khan", email: "bilal@service.com", role: "DEVELOPER", status: "Active", time: "10 mins ago", date: "Feb 03, 16:20" },
  //   { id: "mem-125", name: "Sarah Khan", email: "sarah.k@gmail.com", role: "DEVELOPER", status: "Active", time: "2 hours ago", date: "Feb 03, 14:30" },
  // ], [adminEmail, adminName]);

  // --- Filter Logic ---
  const filteredMembers = useMemo(() => {
    return membersData?.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'All' || member.role === roleFilter.toUpperCase();
      const matchesStatus = statusFilter === 'All' || member.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [searchTerm, roleFilter, statusFilter, membersData]);

  console.log("##########################################",membersData)

  // --- Sidebar Stats Calculations ---
  const stats = useMemo(() => {
    return {
      total: filteredMembers?.length,
      active: filteredMembers?.filter(m => m.status === 'Active').length,
      inactive: filteredMembers?.filter(m => m.status === 'In Active').length,
      suspended: filteredMembers?.filter(m => m.status === 'Suspended').length,
      devs: filteredMembers?.filter(m => m.role === 'DEV').length,
      qas: filteredMembers?.filter(m => m.role === 'QA').length,
      managers: filteredMembers?.filter(m => m.role === 'MANAGER').length,
      admins: filteredMembers?.filter(m => m.role === 'ORG_ADMIN').length,
    };
  }, [filteredMembers]);

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900 w-full overflow-hidden">
      
      {/* --- LEFT CONTENT --- */}
      <div className="flex-1 p-10 border-r border-gray-100 overflow-y-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
             <h1 className="text-2xl font-bold text-gray-900 leading-none">Members and Roles</h1>
          </div>
        </div>

        {/* Modal Integration */}
      {selectedMember && (
        <MemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}

        {/* Filters Row */}
        <div className="flex items-center gap-3 mb-8">
          <select 
            className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-500 font-medium outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="Developer">Developer</option>
            <option value="Manager">Manager</option>
            <option value="QA Engineer">QA Engineer</option>
            <option value="Admin">Admin</option>
          </select>

          <select 
            className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-500 font-medium outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="In Active">In Active</option>
          </select>

          <div className="relative flex-1 max-w-[240px] ml-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Members</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role(s)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMembers?.map((member) => (
                <tr
                onClick={() => setSelectedMember(member)}
                 key={member.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs uppercase shadow-sm">
                        {member.name.substring(0,2)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">{member.name}</div>
                        <div className="text-[10px] text-gray-400 font-bold">{member.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-500 font-medium">{member.email}</td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
                      member.role === 'ADMIN' ? 'text-blue-600 border-blue-100 bg-blue-50' :
                      member.role === 'DEVELOPER' ? 'text-rose-500 border-rose-100 bg-rose-50/20' : 
                      'text-orange-500 border-orange-100 bg-orange-50/20'
                    }`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${
                      member.status === 'Active' ? 'text-emerald-500 border-emerald-100 bg-emerald-50/50' : 'text-gray-400 border-gray-200 bg-gray-50/50'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-bold text-gray-700">{member.time}</div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase">{member.date}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- RIGHT SIDEBAR --- */}
      <div className="w-[380px] bg-white p-8 overflow-y-auto">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-100">
            {orgName.substring(0,2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-tight">{orgName}</h3>
            <p className="text-xs text-gray-400 font-medium">{adminEmail}</p>
          </div>
        </div>

        <div className="mb-12">
          <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Members Overview</h4>
          <StatRow label="Total Members" value={stats.total} colorClass="text-gray-900" />
          <StatRow label="Active" value={stats.active} colorClass="text-emerald-500" />
          <StatRow label="Inactive" value={stats.inactive} colorClass="text-gray-400" />
        </div>

        <div>
          <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">By Role</h4>
          <RoleDistribution label="Developers" count={stats.devs} color="bg-blue-600" total={stats.total} />
          <RoleDistribution label="QA Engineer" count={stats.qas} color="bg-emerald-500" total={stats.total} />
          <RoleDistribution label="Manager" count={stats.managers} color="bg-rose-500" total={stats.total} />
          <RoleDistribution label="Admin" count={stats.admins} color="bg-amber-400" total={stats.total} />
        </div>
      </div>
    </div>
  );
};

export default MembersAndRoles;