import json
from typing import Dict, Any, Optional
from openai import OpenAI
from app.config import settings

class AIService:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = settings.OPENAI_MODEL
        self.demo_mode = settings.DEMO_MODE
        if not self.demo_mode:
            self.client = OpenAI(api_key=self.api_key)
        else:
            self.client = None

    def generate_json(self, system_prompt: str, user_prompt: str, fallback_response: Dict[Any, Any] = None) -> Dict[Any, Any]:
        if self.demo_mode:
            return fallback_response or {}

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={ "type": "json_object" },
                temperature=0.1
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"AI Service Error: {str(e)}")
            return fallback_response or {}

    def generate_text(self, system_prompt: str, user_prompt: str, fallback_text: str = "") -> str:
        if self.demo_mode:
            return fallback_text

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.5
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"AI Service Error: {str(e)}")
            return fallback_text
