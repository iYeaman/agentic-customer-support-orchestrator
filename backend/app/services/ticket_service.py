from sqlalchemy.orm import Session
from app import models, schemas
from datetime import datetime, timezone

class TicketService:
    @staticmethod
    def get_ticket(db: Session, ticket_id: int) -> models.Ticket:
        return db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()

    @staticmethod
    def get_tickets(db: Session, skip: int = 0, limit: int = 100) -> tuple[list[models.Ticket], int]:
        query = db.query(models.Ticket)
        total = query.count()
        items = query.order_by(models.Ticket.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    @staticmethod
    def create_ticket(db: Session, ticket: schemas.TicketCreate) -> models.Ticket:
        # Get or create customer
        customer = db.query(models.Customer).filter(models.Customer.email == ticket.customer_email).first()
        if not customer:
            customer = models.Customer(name=ticket.customer_name, email=ticket.customer_email)
            db.add(customer)
            db.commit()
            db.refresh(customer)

        db_ticket = models.Ticket(
            customer_id=customer.id,
            subject=ticket.subject,
            description=ticket.description,
            status="open"
        )
        db.add(db_ticket)
        db.commit()
        db.refresh(db_ticket)

        # Add initial message
        db_message = models.TicketMessage(
            ticket_id=db_ticket.id,
            sender_type="customer",
            sender_name=customer.name,
            message=ticket.description
        )
        db.add(db_message)
        db.commit()

        return db_ticket

    @staticmethod
    def update_ticket(db: Session, ticket_id: int, updates: dict) -> models.Ticket:
        db_ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
        if db_ticket:
            for key, value in updates.items():
                setattr(db_ticket, key, value)
            db.commit()
            db.refresh(db_ticket)
        return db_ticket

    @staticmethod
    def add_message(db: Session, ticket_id: int, sender_type: str, sender_name: str, message: str) -> models.TicketMessage:
        db_message = models.TicketMessage(
            ticket_id=ticket_id,
            sender_type=sender_type,
            sender_name=sender_name,
            message=message
        )
        db.add(db_message)
        db.commit()
        db.refresh(db_message)
        return db_message

    @staticmethod
    def add_execution(db: Session, ticket_id: int, agent_name: str, action: str, 
                     status: str, input_text: str = None, output_text: str = None, duration: float = None) -> models.AgentExecution:
        exec_entry = models.AgentExecution(
            ticket_id=ticket_id,
            agent_name=agent_name,
            action=action,
            input=input_text,
            output=output_text,
            status=status,
            duration=duration
        )
        db.add(exec_entry)
        db.commit()
        db.refresh(exec_entry)
        return exec_entry

    @staticmethod
    def create_escalation(db: Session, ticket_id: int, reason: str, priority: str, summary: str) -> models.Escalation:
        esc = models.Escalation(
            ticket_id=ticket_id,
            reason=reason,
            priority=priority,
            summary=summary,
            status="pending"
        )
        db.add(esc)
        
        # update ticket status
        ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
        if ticket:
            ticket.status = "escalated"
            ticket.priority = priority
            ticket.assigned_agent = "human"
            
        db.commit()
        db.refresh(esc)
        return esc
