from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

def get_utc_now():
    return datetime.now(timezone.utc)

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=get_utc_now)
    
    tickets = relationship("Ticket", back_populates="customer")

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    subject = Column(String)
    description = Column(Text)
    category = Column(String, nullable=True) # billing, technical, account, etc.
    priority = Column(String, default="normal") # low, normal, high, urgent
    status = Column(String, default="open") # open, in_progress, resolved, escalated
    sentiment = Column(String, nullable=True) # positive, neutral, negative
    assigned_agent = Column(String, nullable=True) # agent name
    confidence = Column(Float, nullable=True) # AI confidence score
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)
    resolved_at = Column(DateTime, nullable=True)

    customer = relationship("Customer", back_populates="tickets")
    messages = relationship("TicketMessage", back_populates="ticket", cascade="all, delete-orphan")
    executions = relationship("AgentExecution", back_populates="ticket", cascade="all, delete-orphan")
    escalation = relationship("Escalation", back_populates="ticket", uselist=False, cascade="all, delete-orphan")

class TicketMessage(Base):
    __tablename__ = "ticket_messages"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    sender_type = Column(String) # 'customer', 'agent', 'system'
    sender_name = Column(String)
    message = Column(Text)
    created_at = Column(DateTime, default=get_utc_now)

    ticket = relationship("Ticket", back_populates="messages")

class AgentExecution(Base):
    __tablename__ = "agent_executions"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    agent_name = Column(String)
    action = Column(String)
    input = Column(Text, nullable=True)
    output = Column(Text, nullable=True)
    status = Column(String) # 'success', 'failure', 'pending'
    duration = Column(Float, nullable=True) # in seconds
    created_at = Column(DateTime, default=get_utc_now)

    ticket = relationship("Ticket", back_populates="executions")

class Escalation(Base):
    __tablename__ = "escalations"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), unique=True)
    reason = Column(Text)
    priority = Column(String)
    summary = Column(Text)
    status = Column(String, default="pending") # pending, acknowledged, resolved
    created_at = Column(DateTime, default=get_utc_now)

    ticket = relationship("Ticket", back_populates="escalation")
