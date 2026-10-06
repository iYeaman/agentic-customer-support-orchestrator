import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAudits } from '../services/api';
import { AuditListResponse } from '../types';
import { format } from 'date-fns';
import { RefreshCw } from 'lucide-react';
import { cn } from '../components/Layout';

export default function AuditList() {
  const [data, setData] = useState<AuditListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');

  const loadData = () => {
    setLoading(true);
    getAudits(filterAction ? { action: filterAction } : {}).then(res => {
      setData(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [filterAction]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      success: "bg-emerald-100 text-emerald-800",
      failed: "bg-rose-100 text-rose-800",
      warning: "bg-amber-100 text-amber-800",
      pending: "bg-blue-100 text-blue-800"
    };
    return cn("px-2 py-0.5 rounded text-xs font-medium capitalize", styles[status] || "bg-gray-100 text-gray-800");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Audit Logs</h1>
        <div className="flex items-center gap-3">
          <input 
            type="text" 
            placeholder="Filter by action..." 
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-primary-500 focus:border-primary-500 outline-none"
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
          />
          <button 
            onClick={loadData}
            disabled={loading}
            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && !data ? (
          <div className="p-8 text-center text-gray-500">Loading audit logs...</div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 font-medium">No audit events found.</p>
            {filterAction && (
              <button 
                onClick={() => setFilterAction('')} 
                className="mt-2 text-primary-600 hover:underline text-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-900 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Resource</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.items.map(audit => (
                  <tr key={audit.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap text-xs">
                      {format(new Date(audit.timestamp), 'MMM d, HH:mm:ss')}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{audit.actor}</span>
                      <span className="text-[10px] uppercase ml-2 text-gray-400 font-mono tracking-wider">{audit.actorType}</span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap font-medium text-gray-800">{audit.action}</td>
                    <td className="px-6 py-3 whitespace-nowrap capitalize text-xs">
                      {audit.resourceType} <span className="font-mono text-gray-500 ml-1">#{audit.resourceId}</span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className={getStatusBadge(audit.status)}>{audit.status}</span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-right">
                      <Link to={`/audit/${audit.id}`} className="text-primary-600 hover:text-primary-800 font-medium text-sm px-3 py-1 rounded hover:bg-primary-50 transition-colors">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
