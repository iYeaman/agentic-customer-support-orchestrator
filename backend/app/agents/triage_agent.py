def run(ai_service, ticket, conversation):
    system_prompt = """You are an expert customer support triage agent.
Your job is to analyze the incoming customer request and classify it.
Output MUST be valid JSON with the following schema:
{
  "category": "billing" | "technical" | "account" | "order" | "refund" | "general" | "security" | "human_escalation",
  "priority": "low" | "normal" | "high" | "urgent",
  "sentiment": "positive" | "neutral" | "negative",
  "confidence": float (0.0 to 1.0),
  "requires_human": boolean,
  "reason": "short explanation of reasoning"
}"""
    
    fallback = {
        "category": "general",
        "priority": "normal",
        "sentiment": "neutral",
        "confidence": 0.5,
        "requires_human": False,
        "reason": "Fallback classification due to demo mode or error."
    }
    
    # Demo mode mock logic based on keywords
    if ai_service.demo_mode:
        text = ticket.description.lower() + " " + ticket.subject.lower()
        if "charge" in text or "subscription" in text or "invoice" in text:
            fallback["category"] = "billing"
        elif "error" in text or "bug" in text or "500" in text or "api" in text:
            fallback["category"] = "technical"
        elif "log" in text or "account" in text or "password" in text:
            fallback["category"] = "account"
        elif "refund" in text:
            fallback["category"] = "refund"
            fallback["requires_human"] = True
        elif "fraud" in text or "security" in text or "access" in text:
            fallback["category"] = "security"
            fallback["priority"] = "urgent"
            fallback["requires_human"] = True
            
        return fallback

    return ai_service.generate_json(system_prompt, conversation, fallback_response=fallback)
