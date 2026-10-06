def run(ai_service, ticket, conversation):
    system_prompt = """You are a billing specialist AI agent for customer support.
Analyze the customer's billing issue and provide a helpful, polite, and accurate response.
If the issue involves a refund, state that it has been requested but requires human approval.
Output MUST be valid JSON with the following schema:
{
  "response": "The message to send to the customer",
  "resolved": boolean,
  "action_taken": "description of the system action you simulated"
}"""

    fallback = {
        "response": "I've reviewed your billing concern. Let me escalate this to our finance team to ensure it's handled correctly.",
        "resolved": False,
        "action_taken": "Escalated to finance"
    }
    
    if ai_service.demo_mode:
        text = ticket.description.lower()
        if "twice" in text or "duplicate" in text:
            fallback["response"] = "I apologize for the duplicate charge. I have identified the error in our payment gateway and have initiated a refund for the extra charge. It should appear on your statement in 3-5 business days."
            fallback["resolved"] = True
            fallback["action_taken"] = "Refunded duplicate charge"
        return fallback

    return ai_service.generate_json(system_prompt, conversation, fallback_response=fallback)
