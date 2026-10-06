def run(ai_service, ticket, conversation):
    system_prompt = """You are an account management AI agent.
Assist the customer with account settings, login issues, or profile updates.
Output MUST be valid JSON with the following schema:
{
  "response": "The message to send to the customer",
  "resolved": boolean,
  "action_taken": "description of the system action you simulated"
}"""

    fallback = {
        "response": "I can help you with your account. Let me send you a secure link to manage your settings.",
        "resolved": True,
        "action_taken": "Sent settings link"
    }
    
    if ai_service.demo_mode:
        text = ticket.description.lower()
        if "log" in text or "password" in text:
            fallback["response"] = "I've sent a password reset link to your email address. Please follow the instructions there to regain access to your account."
            fallback["resolved"] = True
            fallback["action_taken"] = "Sent password reset"
        return fallback

    return ai_service.generate_json(system_prompt, conversation, fallback_response=fallback)
