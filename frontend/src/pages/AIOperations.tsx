import React from 'react';
import { Bot, Zap, Shield, CreditCard, MonitorPlay, Users } from 'lucide-react';

export default function AIOperations() {
  const agents = [
    { name: 'Orchestrator Agent', icon: Bot, desc: 'Central routing and coordination', status: 'Active', tickets: 1245, time: '0.1s' },
    { name: 'Triage Agent', icon: Zap, desc: 'Intent classification & sentiment', status: 'Active', tickets: 1245, time: '1.2s' },
    { name: 'Billing Agent', icon: CreditCard, desc: 'Refunds and invoices', status: 'Active', tickets: 432, time: '2.4s' },
    { name: 'Technical Agent', icon: MonitorPlay, desc: 'Bugs and API issues', status: 'Active', tickets: 310, time: '3.1s' },
    { name: 'Account Agent', icon: Users, desc: 'Login and profile settings', status: 'Active', tickets: 450, time: '1.8s' },
    { name: 'Escalation Agent', icon: Shield, desc: 'Human handoff management', status: 'Active', tickets: 53, time: '0.8s' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AI Operations Center</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor the health and performance of the multi-agent system.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {agents.map((agent, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <agent.icon className="w-24 h-24" />
            </div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <agent.icon className="w-6 h-6 text-primary-700" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {agent.status}
              </span>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-gray-900">{agent.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{agent.desc}</p>
              
              <div className="grid grid-cols-2 gap-4 border-t pt-4 border-gray-100 mt-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Tickets Handled</p>
                  <p className="text-lg font-bold text-gray-900">{agent.tickets.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Avg Latency</p>
                  <p className="text-lg font-bold text-gray-900">{agent.time}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
