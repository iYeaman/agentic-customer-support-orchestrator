export interface Customer {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  sender_type: 'customer' | 'agent' | 'system';
  sender_name: string;
  message: string;
  created_at: string;
}

export interface AgentExecution {
  id: number;
  ticket_id: number;
  agent_name: string;
  action: string;
  input?: string;
  output?: string;
  status: string;
  duration?: number;
  created_at: string;
}

export interface Escalation {
  id: number;
  ticket_id: number;
  reason: string;
  priority: string;
  summary: string;
  status: string;
  created_at: string;
}

export interface Ticket {
  id: number;
  customer_id: number;
  subject: string;
  description: string;
  category?: string;
  priority: string;
  status: string;
  sentiment?: string;
  assigned_agent?: string;
  confidence?: number;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface TicketDetail extends Ticket {
  customer: Customer;
  messages: TicketMessage[];
  executions: AgentExecution[];
  escalation?: Escalation;
}

export interface TicketListResponse {
  total: number;
  items: TicketDetail[];
}

export interface DashboardStats {
  total_tickets: number;
  open_tickets: number;
  resolved_tickets: number;
  escalated_tickets: number;
  avg_response_time_minutes: number;
  ai_resolution_rate: number;
  category_distribution: Record<string, number>;
  priority_distribution: Record<string, number>;
}

export interface Audit {
  id: number;
  timestamp: string;
  actor: string;
  actorType: 'human' | 'ai' | 'system' | 'customer';
  action: string;
  resourceType: string;
  resourceId: number | string;
  status: 'success' | 'failed' | 'pending' | 'warning';
  description: string;
  previousState?: any;
  newState?: any;
  metadata?: any;
}

export interface AuditListResponse {
  total: number;
  items: Audit[];
}
