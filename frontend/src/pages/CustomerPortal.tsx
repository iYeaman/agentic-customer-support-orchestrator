import React, { useState } from 'react';
import { Send, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createTicket } from '../services/api';

export default function CustomerPortal() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', description: '' });
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        customer_name: form.name,
        customer_email: form.email,
        subject: form.subject,
        description: form.description
      };
      const res = await createTicket(data);
      setTicketId(res.id);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Error creating ticket');
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Request Submitted</h2>
          <p className="text-gray-500">Your support ticket has been received. Our AI Agentic System is currently reviewing your request.</p>
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm border border-gray-200">
            Ticket ID: #{ticketId}
          </div>
          <div className="pt-4 flex flex-col gap-3">
            <button 
              onClick={() => navigate(`/tickets/${ticketId}`)}
              className="w-full bg-primary-600 text-white rounded-lg px-4 py-2.5 font-medium hover:bg-primary-700 flex items-center justify-center gap-2 transition-colors"
            >
              View Request
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', description: '' }); }}
              className="text-gray-500 font-medium hover:text-gray-800 text-sm transition-colors"
            >
              Submit another request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">How can we help?</h1>
          <p className="text-gray-500 mt-2">Submit a request and our AI team will assist you immediately.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input required type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input required type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input required type="text" placeholder="Brief description of the issue" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
            <textarea required rows={4} placeholder="Please provide as much detail as possible..." className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-primary-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
          >
            {loading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <Send className="w-5 h-5" />}
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}
