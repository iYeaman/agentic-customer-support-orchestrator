import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTickets } from '../services/api';
import { TicketListResponse } from '../types';
import { format } from 'date-fns';
import { cn } from '../components/Layout';

export default function TicketList() {
  const [data, setData] = useState<TicketListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTickets().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: "bg-blue-100 text-blue-800",
      resolved: "bg-emerald-100 text-emerald-800",
      escalated: "bg-rose-100 text-rose-800"
    };
    return cn("px-2.5 py-0.5 rounded-full text-xs font-medium capitalize", styles[status] || "bg-gray-100 text-gray-800");
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      urgent: "bg-red-100 text-red-800",
      high: "bg-orange-100 text-orange-800",
      normal: "bg-gray-100 text-gray-800",
      low: "bg-slate-100 text-slate-800"
    };
    return cn("px-2.5 py-0.5 rounded-full text-xs font-medium capitalize", styles[priority] || "bg-gray-100 text-gray-800");
  };

  if (loading) return <div className="p-8 text-center">Loading tickets...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tickets</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-900 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.items.map(ticket => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">#{ticket.id}</td>
                  <td className="px-6 py-4 max-w-md truncate">{ticket.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{ticket.customer?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">{ticket.category || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(ticket.status)}>{ticket.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getPriorityBadge(ticket.priority)}>{ticket.priority}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link to={`/tickets/${ticket.id}`} className="text-primary-600 hover:text-primary-800 font-medium text-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
