import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAudit } from '../services/api';
import { Audit } from '../types';
import { format } from 'date-fns';
import BackButton from '../components/BackButton';
import { cn } from '../components/Layout';
import { Activity, Server, User, Bot } from 'lucide-react';

export default function AuditDetail() {
  const { id } = useParams();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      getAudit(Number(id))
        .then(res => {
          setAudit(res);
          setLoading(false);
        })
        .catch(() => {
          setError('Audit log not found');
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading audit log...</div>;
  if (error || !audit) return (
    <div className="p-8 text-center space-y-4">
      <p className="text-rose-600 font-medium">{error || 'Unknown error'}</p>
      <BackButton fallback="/audit" label="Back to Audit Logs" />
    </div>
  );

  const getActorIcon = () => {
    switch (audit.actorType) {
      case 'system': return <Server className="w-5 h-5 text-gray-500" />;
      case 'human': return <User className="w-5 h-5 text-blue-500" />;
      case 'ai': return <Bot className="w-5 h-5 text-primary-500" />;
      default: return <User className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <BackButton fallback="/audit" label="Back to Audit Logs" />
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-400" />
            Audit Event #{audit.id}
          </h1>
          <span className={cn("px-2.5 py-1 rounded text-xs font-semibold capitalize", 
            audit.status === 'success' ? 'bg-emerald-100 text-emerald-800' :
            audit.status === 'failed' ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-800'
          )}>
            {audit.status}
          </span>
        </div>
        
        <div className="p-6 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Timestamp</p>
              <p className="text-sm font-medium text-gray-900">{format(new Date(audit.timestamp), 'MMM d, yyyy HH:mm:ss')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Actor</p>
              <div className="flex items-center gap-1.5">
                {getActorIcon()}
                <p className="text-sm font-medium text-gray-900">{audit.actor}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Action</p>
              <p className="text-sm font-medium text-gray-900">{audit.action}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Resource</p>
              {audit.resourceType === 'ticket' ? (
                <Link to={`/tickets/${audit.resourceId}`} className="text-sm font-medium text-primary-600 hover:underline">
                  Ticket #{audit.resourceId}
                </Link>
              ) : (
                <p className="text-sm font-medium text-gray-900 capitalize">{audit.resourceType} #{audit.resourceId}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-3">Description</h3>
            <p className="text-sm text-gray-700">{audit.description}</p>
          </div>

          {(audit.previousState || audit.newState) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-3">State Changes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {audit.previousState && (
                  <div className="bg-rose-50 border border-rose-100 rounded-lg p-4 overflow-x-auto">
                    <p className="text-xs font-bold text-rose-800 mb-2 uppercase">Previous State</p>
                    <pre className="text-xs text-rose-900 font-mono">{JSON.stringify(audit.previousState, null, 2)}</pre>
                  </div>
                )}
                {audit.newState && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 overflow-x-auto">
                    <p className="text-xs font-bold text-emerald-800 mb-2 uppercase">New State</p>
                    <pre className="text-xs text-emerald-900 font-mono">{JSON.stringify(audit.newState, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {audit.metadata && Object.keys(audit.metadata).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-3">Metadata</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs text-gray-700 font-mono">{JSON.stringify(audit.metadata, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
