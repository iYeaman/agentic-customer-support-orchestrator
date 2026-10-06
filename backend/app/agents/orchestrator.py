import time
from sqlalchemy.orm import Session
from app.services.ticket_service import TicketService
from app.services.ai_service import AIService
from app.schemas import ProcessResponse
from app.agents import triage_agent, billing_agent, technical_agent, account_agent, escalation_agent

class OrchestratorAgent:
    def __init__(self):
        self.ai_service = AIService()

    def process_ticket(self, db: Session, ticket_id: int) -> ProcessResponse:
        ticket = TicketService.get_ticket(db, ticket_id)
        if not ticket:
            raise ValueError("Ticket not found")

        # Get full conversation history
        messages = [f"{m.sender_type.capitalize()}: {m.message}" for m in ticket.messages]
        conversation = "\n".join(messages)

        executions = []
        
        # Step 1: Triage
        start_time = time.time()
        triage_result = triage_agent.run(self.ai_service, ticket, conversation)
        duration = time.time() - start_time
        
        TicketService.update_ticket(db, ticket.id, {
            "category": triage_result["category"],
            "priority": triage_result["priority"],
            "sentiment": triage_result["sentiment"],
            "confidence": triage_result["confidence"]
        })
        
        ex1 = TicketService.add_execution(
            db, ticket.id, "TriageAgent", "classify", "success", 
            conversation, str(triage_result), duration
        )
        executions.append(ex1)

        # Step 2: Route to specific agent based on category or human escalation
        requires_human = triage_result.get("requires_human", False)
        category = triage_result.get("category", "general")
        confidence = triage_result.get("confidence", 0.0)
        
        if requires_human or confidence < 0.7 or category == "human_escalation" or category == "security":
            # Escalate
            start_time = time.time()
            escalation_result = escalation_agent.run(self.ai_service, ticket, conversation, triage_result)
            duration = time.time() - start_time
            
            ex2 = TicketService.add_execution(
                db, ticket.id, "EscalationAgent", "escalate", "success",
                str(triage_result), str(escalation_result), duration
            )
            executions.append(ex2)
            
            TicketService.create_escalation(
                db, ticket.id, 
                reason=escalation_result["reason"], 
                priority=escalation_result["priority"],
                summary=escalation_result["summary"]
            )
            
            response_msg = escalation_result["customer_message"]
            TicketService.add_message(db, ticket.id, "system", "System", response_msg)
            
            return ProcessResponse(ticket_id=ticket.id, status="escalated", agent_executions=executions, final_response=response_msg)
            
        else:
            # Route to specialist
            specialist = None
            if category == "billing" or category == "refund" or category == "order":
                specialist = billing_agent
            elif category == "technical":
                specialist = technical_agent
            elif category == "account":
                specialist = account_agent
            else:
                # Default to account agent for general
                specialist = account_agent
                
            start_time = time.time()
            agent_result = specialist.run(self.ai_service, ticket, conversation)
            duration = time.time() - start_time
            
            ex2 = TicketService.add_execution(
                db, ticket.id, f"{category.capitalize()}Agent", "resolve", "success",
                conversation, str(agent_result), duration
            )
            executions.append(ex2)
            
            response_msg = agent_result["response"]
            TicketService.add_message(db, ticket.id, "agent", "AI Assistant", response_msg)
            
            TicketService.update_ticket(db, ticket.id, {
                "assigned_agent": f"{category.capitalize()} AI",
                "status": "resolved" if agent_result.get("resolved", True) else "open"
            })
            
            return ProcessResponse(ticket_id=ticket.id, status="processed", agent_executions=executions, final_response=response_msg)

orchestrator = OrchestratorAgent()
