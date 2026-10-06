from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db_session
from app.services.ticket_service import TicketService
from app.agents.orchestrator import orchestrator
from app import schemas
from typing import List

router = APIRouter()

@router.get("/", response_model=schemas.TicketListResponse)
def get_tickets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db_session)):
    items, total = TicketService.get_tickets(db, skip=skip, limit=limit)
    return {"total": total, "items": items}

@router.post("/", response_model=schemas.Ticket)
def create_ticket(ticket: schemas.TicketCreate, db: Session = Depends(get_db_session)):
    return TicketService.create_ticket(db, ticket)

@router.get("/{ticket_id}", response_model=schemas.TicketDetail)
def get_ticket(ticket_id: int, db: Session = Depends(get_db_session)):
    ticket = TicketService.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.post("/{ticket_id}/messages", response_model=schemas.TicketMessage)
def add_message(ticket_id: int, message: schemas.TicketMessageCreate, db: Session = Depends(get_db_session)):
    return TicketService.add_message(db, ticket_id, message.sender_type, message.sender_name, message.message)

@router.post("/{ticket_id}/process", response_model=schemas.ProcessResponse)
def process_ticket(ticket_id: int, db: Session = Depends(get_db_session)):
    try:
        return orchestrator.process_ticket(db, ticket_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{ticket_id}/escalate", response_model=schemas.Escalation)
def escalate_ticket(ticket_id: int, reason: str = "Manual escalation", db: Session = Depends(get_db_session)):
    ticket = TicketService.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return TicketService.create_escalation(db, ticket_id, reason, "high", "Manually escalated by operator")
