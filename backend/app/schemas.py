from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any
from datetime import datetime

class CustomerBase(BaseModel):
    name: str
    email: EmailStr

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class TicketMessageBase(BaseModel):
    message: str

class TicketMessageCreate(TicketMessageBase):
    sender_type: str = "customer"
    sender_name: str

class TicketMessage(TicketMessageBase):
    id: int
    ticket_id: int
    sender_type: str
    sender_name: str
    created_at: datetime

    class Config:
        from_attributes = True

class AgentExecution(BaseModel):
    id: int
    ticket_id: int
    agent_name: str
    action: str
    input: Optional[str] = None
    output: Optional[str] = None
    status: str
    duration: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Escalation(BaseModel):
    id: int
    ticket_id: int
    reason: str
    priority: str
    summary: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class TicketBase(BaseModel):
    subject: str
    description: str

class TicketCreate(TicketBase):
    customer_name: str
    customer_email: EmailStr

class TicketUpdate(BaseModel):
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    sentiment: Optional[str] = None
    assigned_agent: Optional[str] = None
    confidence: Optional[float] = None

class Ticket(TicketBase):
    id: int
    customer_id: int
    category: Optional[str] = None
    priority: str
    status: str
    sentiment: Optional[str] = None
    assigned_agent: Optional[str] = None
    confidence: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TicketDetail(Ticket):
    customer: Customer
    messages: List[TicketMessage] = []
    executions: List[AgentExecution] = []
    escalation: Optional[Escalation] = None

    class Config:
        from_attributes = True

class TicketListResponse(BaseModel):
    total: int
    items: List[TicketDetail]

class DashboardStats(BaseModel):
    total_tickets: int
    open_tickets: int
    resolved_tickets: int
    escalated_tickets: int
    avg_response_time_minutes: float
    ai_resolution_rate: float
    category_distribution: Any
    priority_distribution: Any

class ProcessResponse(BaseModel):
    ticket_id: int
    status: str
    agent_executions: List[AgentExecution]
    final_response: Optional[str] = None
