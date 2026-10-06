import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/api';
import { DashboardStats } from '../types';
import { Ticket as TicketIcon, CheckCircle2, Clock, AlertTriangle, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(data => {
      setStats(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading || !stats) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  const categoryData = Object.entries(stats.category_distribution).map(([name, value]) => ({ name, value }));
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e'];

  const statCards = [
    { title: 'Total Tickets', value: stats.total_tickets, icon: TicketIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Open Tickets', value: stats.open_tickets, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Resolved', value: stats.resolved_tickets, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Escalated', value: stats.escalated_tickets, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          <Activity className="w-5 h-5 text-primary-600" />
          <span className="text-sm font-medium">AI Resolution Rate: <span className="text-primary-600 font-bold">{stats.ai_resolution_rate.toFixed(1)}%</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-lg ${card.bg} flex items-center justify-center shrink-0`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Tickets by Category</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">AI Performance Insights</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-500 font-medium">Average Triage Time</p>
              <p className="text-xl font-bold text-gray-900 mt-1">1.2 seconds</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-500 font-medium">Auto-Resolution Confidence</p>
              <p className="text-xl font-bold text-gray-900 mt-1">94% average</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-500 font-medium">Top Auto-Resolved Category</p>
              <p className="text-xl font-bold text-gray-900 mt-1">Billing & Passwords</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
