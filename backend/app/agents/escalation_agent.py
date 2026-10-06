def run(ai_service, ticket, conversation, triage_result):
    system_prompt = f"""You are an escalation AI agent.
The triage agent provided this classification: {triage_result}
Your job is to determine why this needs human intervention, assign priority, and generate a polite response to the customer explaining the delay.
Output MUST be valid JSON with the following schema:
{{
  "reason": "Internal reason for escalation",
  "priority": "normal" | "high" | "urgent",
  "summary": "Short summary for the human agent",
  "customer_message": "Polite message to the customer explaining they are being transferred to a human"
}}"""

    fallback = {
        "reason": "Requires manual review or authorization",
        "priority": "high",
        "summary": "Customer issue needs human attention.",
        "customer_message": "Your request requires specialized assistance. I've escalated your ticket to our human support team. They will be in touch with you shortly."
    }
    
    if ai_service.demo_mode:
        if triage_result.get("category") == "security":
            fallback["reason"] = "Suspected security incident"
            fallback["priority"] = "urgent"
            fallback["summary"] = "Customer reported a potential account compromise. Immediate review required."
        elif triage_result.get("category") == "refund":
            fallback["reason"] = "Refund requires manager approval"
            fallback["priority"] = "normal"
            fallback["summary"] = "Customer requested a refund which exceeds automated thresholds."
        return fallback

    return ai_service.generate_json(system_prompt, conversation, fallback_response=fallback)
