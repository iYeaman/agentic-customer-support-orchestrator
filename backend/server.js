require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const DEMO_MODE = !process.env.OPENAI_API_KEY;
const openai = DEMO_MODE ? null : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Database Mock
let data = {
  customers: [
    { id: 1, name: "Alice Smith", email: "alice@example.com", created_at: new Date().toISOString() },
    { id: 2, name: "Bob Jones", email: "bob@example.com", created_at: new Date().toISOString() }
  ],
  tickets: [],
  messages: [],
  executions: [],
  escalations: [],
  audits: []
};

// Seed Data
const seedTickets = [
  { id: 1, customer_id: 1, subject: "I was charged twice for my subscription this month", description: "I was charged twice for my subscription this month", category: "billing", priority: "high", status: "open", sentiment: "negative", confidence: 0.95, created_at: new Date().toISOString() },
  { id: 2, customer_id: 2, subject: "The API is returning a 500 internal server error", description: "The API is returning a 500 internal server error", category: "technical", priority: "urgent", status: "resolved", sentiment: "negative", confidence: 0.88, created_at: new Date().toISOString() },
  { id: 3, customer_id: 1, subject: "I need a refund for my last purchase", description: "I need a refund for my last purchase", category: "refund", priority: "normal", status: "escalated", sentiment: "neutral", confidence: 0.90, created_at: new Date().toISOString() }
];

data.tickets = seedTickets;
seedTickets.forEach(t => {
  data.messages.push({
    id: data.messages.length + 1,
    ticket_id: t.id,
    sender_type: "customer",
    sender_name: "Customer",
    message: t.subject,
    created_at: new Date().toISOString()
  });
});

let ticketIdCounter = data.tickets.length + 1;
let msgIdCounter = data.messages.length + 1;
let execIdCounter = 1;
let escIdCounter = 1;
let auditIdCounter = 1;

function addAudit(actor, actorType, action, resourceType, resourceId, status, description, prev = null, next = null, meta = {}) {
  const audit = {
    id: auditIdCounter++,
    timestamp: new Date().toISOString(),
    actor,
    actorType,
    action,
    resourceType,
    resourceId,
    status,
    description,
    previousState: prev,
    newState: next,
    metadata: meta
  };
  data.audits.unshift(audit);
  return audit;
}

// Seed Initial Audits
seedTickets.forEach(t => {
  addAudit('System', 'system', 'Ticket Created', 'ticket', t.id, 'success', `Ticket #${t.id} created initially.`);
});

// Endpoints
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/dashboard/stats', (req, res) => {
  const total = data.tickets.length;
  const open = data.tickets.filter(t => t.status === 'open').length;
  const resolved = data.tickets.filter(t => t.status === 'resolved').length;
  const escalated = data.tickets.filter(t => t.status === 'escalated').length;

  const cats = {};
  data.tickets.forEach(t => { cats[t.category || 'general'] = (cats[t.category || 'general'] || 0) + 1; });

  const pris = {};
  data.tickets.forEach(t => { pris[t.priority || 'normal'] = (pris[t.priority || 'normal'] || 0) + 1; });

  res.json({
    total_tickets: total,
    open_tickets: open,
    resolved_tickets: resolved,
    escalated_tickets: escalated,
    avg_response_time_minutes: 15.5,
    ai_resolution_rate: total > 0 ? (resolved / total) * 100 : 0,
    category_distribution: cats,
    priority_distribution: pris
  });
});

app.get('/api/tickets', (req, res) => {
  res.json({ total: data.tickets.length, items: data.tickets });
});

app.post('/api/tickets', (req, res) => {
  const { customer_name, customer_email, subject, description } = req.body;
  
  let customer = data.customers.find(c => c.email === customer_email);
  if (!customer) {
    customer = { id: data.customers.length + 1, name: customer_name, email: customer_email, created_at: new Date().toISOString() };
    data.customers.push(customer);
  }

  const ticket = {
    id: ticketIdCounter++,
    customer_id: customer.id,
    subject,
    description,
    status: 'open',
    priority: 'normal',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  data.tickets.push(ticket);

  data.messages.push({
    id: msgIdCounter++,
    ticket_id: ticket.id,
    sender_type: 'customer',
    sender_name: customer.name,
    message: description,
    created_at: new Date().toISOString()
  });

  addAudit(customer.name, 'customer', 'Ticket Created', 'ticket', ticket.id, 'success', `Ticket submitted via portal.`);

  res.json(ticket);
});

app.get('/api/tickets/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const ticket = data.tickets.find(t => t.id === id);
  if (!ticket) return res.status(404).json({ error: 'Not found' });

  const customer = data.customers.find(c => c.id === ticket.customer_id);
  const messages = data.messages.filter(m => m.ticket_id === id);
  const executions = data.executions.filter(e => e.ticket_id === id);
  const escalation = data.escalations.find(e => e.ticket_id === id);

  res.json({ ...ticket, customer, messages, executions, escalation });
});

app.post('/api/tickets/:id/process', async (req, res) => {
  const id = parseInt(req.params.id);
  const ticket = data.tickets.find(t => t.id === id);
  if (!ticket) return res.status(404).json({ error: 'Not found' });

  let triage = { category: "general", priority: "normal", sentiment: "neutral", confidence: 0.8, requires_human: false, reason: "Default triage" };
  const text = (ticket.description + " " + ticket.subject).toLowerCase();
  
  if (text.includes("security") || text.includes("hack")) { triage.category = "security"; triage.priority = "urgent"; triage.requires_human = true; }
  else if (text.includes("charge") || text.includes("subscription")) { triage.category = "billing"; }
  else if (text.includes("error") || text.includes("api") || text.includes("500")) { triage.category = "technical"; triage.priority = "urgent"; }
  else if (text.includes("refund")) { triage.category = "refund"; triage.requires_human = true; }
  else if (text.includes("password") || text.includes("account")) { triage.category = "account"; }

  ticket.category = triage.category;
  ticket.priority = triage.priority;
  ticket.sentiment = triage.sentiment;
  ticket.confidence = triage.confidence;

  data.executions.push({
    id: execIdCounter++,
    ticket_id: id,
    agent_name: "TriageAgent",
    action: "classify",
    status: "success",
    output: JSON.stringify(triage),
    duration: 1.2,
    created_at: new Date().toISOString()
  });

  addAudit('TriageAgent', 'ai', 'Ticket Classified', 'ticket', id, 'success', `Classified as ${triage.category} with ${triage.priority} priority.`, null, triage);

  let responseMsg = "";

  if (triage.requires_human || triage.category === "security") {
    ticket.status = "escalated";
    data.escalations.push({
      id: escIdCounter++,
      ticket_id: id,
      reason: triage.reason,
      priority: triage.priority,
      summary: "Escalated to human support.",
      status: "pending",
      created_at: new Date().toISOString()
    });
    responseMsg = "Your request has been escalated to our human support team.";
    data.messages.push({ id: msgIdCounter++, ticket_id: id, sender_type: "system", sender_name: "System", message: responseMsg, created_at: new Date().toISOString() });
  } else {
    let agentResult = { response: "I have handled your request.", resolved: true };
    if (triage.category === "billing") { agentResult.response = "I have reviewed your billing issue and processed a fix."; }
    else if (triage.category === "technical") { agentResult.response = "Our technical team is working on the bug you reported."; agentResult.resolved = false; }
    else if (triage.category === "account") { agentResult.response = "I've sent a password reset link to your email."; }

    ticket.status = agentResult.resolved ? "resolved" : "open";
    ticket.assigned_agent = triage.category + " AI";

    data.executions.push({
      id: execIdCounter++,
      ticket_id: id,
      agent_name: triage.category + "Agent",
      action: "resolve",
      status: "success",
      output: JSON.stringify(agentResult),
      duration: 2.1,
      created_at: new Date().toISOString()
    });
    
    responseMsg = agentResult.response;
    data.messages.push({ id: msgIdCounter++, ticket_id: id, sender_type: "agent", sender_name: "AI Assistant", message: responseMsg, created_at: new Date().toISOString() });
    addAudit(triage.category + 'Agent', 'ai', 'Ticket Resolved', 'ticket', id, 'success', `Agent provided resolution: ${agentResult.resolved}`);
  }

  res.json({ ticket_id: id, status: ticket.status, final_response: responseMsg });
});

app.get('/api/audits', (req, res) => {
  let results = [...data.audits];
  
  // Basic filtering mock
  if (req.query.action) results = results.filter(a => a.action.toLowerCase().includes(req.query.action.toLowerCase()));
  if (req.query.actorType) results = results.filter(a => a.actorType.toLowerCase() === req.query.actorType.toLowerCase());
  if (req.query.resourceId) results = results.filter(a => a.resourceId == req.query.resourceId);
  
  // sort
  const sort = req.query.sort || 'newest';
  results.sort((a, b) => {
    return sort === 'newest' ? new Date(b.timestamp) - new Date(a.timestamp) : new Date(a.timestamp) - new Date(b.timestamp);
  });
  
  res.json({ total: results.length, items: results });
});

app.get('/api/audits/:id', (req, res) => {
  const audit = data.audits.find(a => a.id == req.params.id);
  if (!audit) return res.status(404).json({ error: 'Not found' });
  res.json(audit);
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Node.js backend running on http://localhost:${PORT}`);
});
