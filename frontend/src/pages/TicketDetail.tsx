import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTicket, processTicket } from '../services/api';
import { TicketDetail as ITicketDetail } from '../types';
import { format } from 'date-fns';
import { Bot, User, Clock, AlertCircle, Play, ShieldAlert, CheckCircle2 } from 'lucide-react';
import BackButton from '../components/BackButton';

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<ITicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadTicket();
    }
  }, [id]);

  const loadTicket = () => {
    getTicket(Number(id)).then(data => {
      setTicket(data);
      setLoading(false);
      setError('');
    }).catch(err => {
      console.error(err);
      setError('Failed to load ticket details.');
      setLoading(false);
    });
  };

  const handleProcess = async () => {
    if (!id) return;
    setProcessing(true);
    try {
      await processTicket(Number(id));
      await loadTicket();
    } catch (err) {
      console.error(err);
      alert('Failed to process ticket');
    }
    setProcessing(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading ticket...</div>;
  if (error || !ticket) return (
    <div className="p-8 text-center space-y-4">
      <p className="text-rose-600 font-medium">{error || 'Ticket not found'}</p>
      <BackButton fallback="/tickets" label="Back to Tickets" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <BackButton fallback="/tickets" label="Back to Tickets" />
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{ticket.subject}</h1>
          <p className="text-sm text-gray-500 mt-1">Ticket #{ticket.id} • Created {format(new Date(ticket.created_at), 'PPp')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleProcess}
            disabled={processing || ticket.status === 'resolved'}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {processing ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Play className="w-4 h-4" />}
            {processing ? 'AI Processing...' : 'Trigger AI Triage'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4" /> Customer Interaction
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {ticket.messages.map(msg => (
                <div key={msg.id} className={`flex gap-4 ${msg.sender_type === 'agent' || msg.sender_type === 'system' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender_type === 'agent' ? 'bg-primary-100 text-primary-700' : 
                    msg.sender_type === 'system' ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {msg.sender_type === 'agent' ? <Bot className="w-4 h-4" /> : msg.sender_type === 'system' ? <AlertCircle className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`flex flex-col ${msg.sender_type === 'agent' || msg.sender_type === 'system' ? 'items-end' : ''}`}>
                    <span className="text-xs text-gray-500 mb-1">{msg.sender_name} • {format(new Date(msg.created_at), 'p')}</span>
                    <div className={`px-4 py-3 rounded-2xl max-w-lg ${
                      msg.sender_type === 'agent' ? 'bg-primary-600 text-white rounded-tr-sm' : 
                      msg.sender_type === 'system' ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-tr-sm' : 
                      'bg-gray-100 text-gray-900 rounded-tl-sm'
                    }`}>
                      <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {ticket.executions.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Bot className="w-4 h-4" /> AI Execution Timeline
                </h2>
              </div>
              <div className="p-6">
                <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
                  {ticket.executions.map((exec, idx) => (
                    <div key={idx} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-primary-500" />
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-semibold text-sm text-gray-900">{exec.agent_name}</span>
                        <span className="text-xs text-gray-500">{format(new Date(exec.created_at), 'p')} • {exec.duration?.toFixed(2)}s</span>
                      </div>
                      <p className="text-xs font-medium text-primary-600 mb-2 uppercase tracking-wider">{exec.action}</p>
                      <div className="bg-gray-50 rounded-md p-3 text-xs text-gray-600 font-mono overflow-x-auto">
                        {exec.output}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Properties</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase ${
                    ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                    ticket.status === 'escalated' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 mb-1">Category</p>
                <p className="text-sm font-medium capitalize text-gray-900">{ticket.category || 'Unassigned'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Priority</p>
                <p className="text-sm font-medium capitalize text-gray-900">{ticket.priority}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">AI Confidence</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${(ticket.confidence || 0) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium">{((ticket.confidence || 0) * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Assigned Agent</p>
                <p className="text-sm font-medium text-gray-900">{ticket.assigned_agent || 'Unassigned'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Customer Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm font-medium text-gray-900">{ticket.customer.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{ticket.customer.email}</p>
              </div>
            </div>
          </div>

          {ticket.escalation && (
            <div className="bg-rose-50 rounded-xl shadow-sm border border-rose-200 p-5">
              <h3 className="text-sm font-bold text-rose-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Escalation Active
              </h3>
              <p className="text-sm text-rose-800 mb-3">{ticket.escalation.summary}</p>
              <div className="bg-white/60 p-3 rounded text-xs text-rose-900 font-mono">
                Reason: {ticket.escalation.reason}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
