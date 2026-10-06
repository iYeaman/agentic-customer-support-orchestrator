def run(ai_service, ticket, conversation):
    system_prompt = """You are a technical support AI agent.
Analyze the customer's technical issue and provide troubleshooting steps or an explanation.
Output MUST be valid JSON with the following schema:
{
  "response": "The message to send to the customer",
  "resolved": boolean,
  "action_taken": "description of the system action you simulated"
}"""

    fallback = {
        "response": "I see you're encountering a technical issue. I've logged the error details for our engineering team to review.",
        "resolved": False,
        "action_taken": "Logged bug report"
    }
    
    if ai_service.demo_mode:
        text = ticket.description.lower()
        if "500" in text or "api" in text:
            fallback["response"] = "We are currently experiencing a known issue with our API returning 500 errors. Our engineering team is already working on a fix. We will notify you once it's resolved."
            fallback["resolved"] = False
            fallback["action_taken"] = "Linked to active incident"
        return fallback

    return ai_service.generate_json(system_prompt, conversation, fallback_response=fallback)
