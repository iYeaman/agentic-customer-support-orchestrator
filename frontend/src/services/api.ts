import axios from 'axios';
import { TicketListResponse, TicketDetail, DashboardStats, Ticket, AuditListResponse, Audit } from '../types';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const res = await api.get('/dashboard/stats');
  return res.data;
};

export const getTickets = async (): Promise<TicketListResponse> => {
  const res = await api.get('/tickets/');
  return res.data;
};

export const getTicket = async (id: number): Promise<TicketDetail> => {
  const res = await api.get(`/tickets/${id}`);
  return res.data;
};

export const createTicket = async (data: any): Promise<Ticket> => {
  const res = await api.post('/tickets/', data);
  return res.data;
};

export const processTicket = async (id: number): Promise<any> => {
  const res = await api.post(`/tickets/${id}/process`);
  return res.data;
};

export const addMessage = async (id: number, message: string): Promise<any> => {
  const res = await api.post(`/tickets/${id}/messages`, {
    message,
    sender_type: 'agent',
    sender_name: 'Human Operator'
  });
  return res.data;
};

export const getAudits = async (params?: Record<string, any>): Promise<AuditListResponse> => {
  const res = await api.get('/audits', { params });
  return res.data;
};

export const getAudit = async (id: number): Promise<Audit> => {
  const res = await api.get(`/audits/${id}`);
  return res.data;
};
