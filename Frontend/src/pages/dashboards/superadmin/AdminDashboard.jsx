import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronRight, MoreHorizontal, TerminalIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import API from '../../../api/axios';

const AdminDashboard = () => {
  // Dynamic Hooks State System
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Recent Critical Events Setup (Can be linked with an AuditLog model later)
  const [events] = useState([
    { id: 1, type: "Failed Login Attempts Exceed", user: "admin@acme.corp", org: "Acme Corp", time: "14:18 UTC" },
    { id: 2, type: "Failed Login Attempts Exceed", user: "admin@acme.corp", org: "Acme Corp", time: "14:18 UTC" }
  ]);

  useEffect(() => {
    const fetchDashboardContext = async () => {
      try {
        const response = await API.get('/admin/dashboard-overview');

        if (response.data.success) {
          setStats(response.data.data.stats);
          setChartData(response.data.data.chartData);
        }
      } catch (error) {
        console.error("Failed loading analytical server metrics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardContext();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Analytics Pipeline...</span>
      </div>
    );
  }

  // if (!stats) return <div className="p-8 text-center text-red-500 font-bold">Error loading telemetry framework dashboard context.</div>;

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] font-sans text-slate-900">
      <main className="flex-1">
        <div className="p-8 mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#111827]">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm">Platform governance and security overview</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Active Organizations Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Active Organizations</h3>
                <MoreHorizontal className="w-5 h-5 text-gray-300" />
              </div>
              <div className="text-5xl font-bold mb-2">{stats.activeOrgs}</div>
              <p className="text-gray-400 text-sm mb-10">Organizations in production</p>
              <div className="flex justify-between items-center">
                <span className="bg-gray-50 text-[10px] font-bold px-2 py-1 rounded border border-gray-200 text-gray-600">
                  {stats.suspendedOrgs} Suspended
                </span>
                <button className="text-blue-600 text-[11px] font-bold flex items-center gap-1 hover:underline">
                  View Organizations <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Users by Role Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Users by Role</h3>
                <MoreHorizontal className="w-5 h-5 text-gray-300" />
              </div>
              <div className="text-5xl font-bold mb-2">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-gray-400 text-sm mb-6">Total active users</p>
              
              {/* Dynamic Stacked Bar Calculation Mapping */}
              <div className="flex h-2 w-full rounded-full overflow-hidden mb-8 bg-slate-100">
                <div className="bg-blue-500 transition-all duration-500" style={{ width: `${(stats.roleDistribution.members / stats.totalUsers) * 100}%` }}></div>
                <div className="bg-yellow-400 transition-all duration-500" style={{ width: `${(stats.roleDistribution.managers / stats.totalUsers) * 100}%` }}></div>
                <div className="bg-red-500 transition-all duration-500" style={{ width: `${(stats.roleDistribution.admins / stats.totalUsers) * 100}%` }}></div>
              </div>

              <div className="flex justify-between">
                <div>
                  <div className="text-lg font-bold">{stats.roleDistribution.members}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-blue-500 rounded-sm"></span> Quality Assurance
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold">{stats.roleDistribution.managers}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-yellow-400 rounded-sm"></span> Managers
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold">{stats.roleDistribution.admins}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-red-500 rounded-sm"></span> Admins
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Organizations Growth</h3>
              <span className="text-xs text-gray-400 font-medium">Trend Analysis: Last 6 Months</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} dy={10} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" />
                  <Legend verticalAlign="bottom" height={36} iconType="plainline" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;