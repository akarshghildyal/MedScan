"""
OpenRouter LLM Client for MedScan

A lightweight async client for interacting with OpenRouter API.
Supports both text and vision models.
"""

import httpx
import json
import base64
from typing import Optional, List, Dict, Any, Union
from pathlib import Path
from app.core.config import settings


class LLMClient:
    """Async client for OpenRouter API."""
    
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = settings.OPENROUTER_BASE_URL
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://medscan.app",  # Required by OpenRouter
            "X-Title": "MedScan"
        }
    
    async def chat(
        self,
        messages: List[Dict[str, Any]],
        model: str,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        response_format: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Send a chat completion request to OpenRouter.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model identifier (e.g., 'google/gemini-2.0-flash-exp:free')
            temperature: Sampling temperature (0-1)
            max_tokens: Maximum tokens in response
            response_format: Optional format specification (e.g., {"type": "json_object"})
            
        Returns:
            Dict with 'content' (str), 'model' (str), 'usage' (dict)
        """
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        if response_format:
            payload["response_format"] = response_format
        
        async with httpx.AsyncClient(timeout=60.0) as client:
                try:
                    response = await client.post(
                        f"{self.base_url}/chat/completions",
                        headers=self.headers,
                        json=payload
                    )
                    response.raise_for_status()
                    data = response.json()
                    
                    return {
                        "content": data["choices"][0]["message"]["content"],
                        "model": data.get("model", model),
                        "usage": data.get("usage", {})
                    }
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 429 and attempt < 2:
                        import asyncio
                        wait = (attempt + 1) * 3  # 3s, 6s
                        await asyncio.sleep(wait)
                        last_error = e
                        continue
                    raise LLMError(f"HTTP error: {e.response.status_code} - {e.response.text}")
                except httpx.RequestError as e:
                    raise LLMError(f"Request error: {str(e)}")
                except (KeyError, IndexError) as e:
                    raise LLMError(f"Unexpected response format: {str(e)}")
            raise LLMError(f"Rate limited after 3 retries: {last_error}")
    
    async def chat_with_image(
        self,
        prompt: str,
        image_data: Union[bytes, str],
        model: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> Dict[str, Any]:
        """
        Send a vision request with an image.
        
        Args:
            prompt: Text prompt for the model
            image_data: Base64 string or bytes of the image
            model: Vision-capable model identifier
            system_prompt: Optional system prompt
            temperature: Sampling temperature
            max_tokens: Maximum tokens in response
            
        Returns:
            Dict with 'content', 'model', 'usage'
        """
        # Convert bytes to base64 if needed
        if isinstance(image_data, bytes):
            image_b64 = base64.b64encode(image_data).decode('utf-8')
        else:
            image_b64 = image_data
        
        messages = []
        
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        messages.append({
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{image_b64}"
                    }
                },
                {
                    "type": "text",
                    "text": prompt
                }
            ]
        })
        
        return await self.chat(
            messages=messages,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens
        )
    
    def parse_json_response(self, content: str) -> Dict[str, Any]:
        """
        Parse JSON from LLM response, handling markdown code blocks.
        
        Args:
            content: Raw response content from LLM
            
        Returns:
            Parsed JSON as dict
        """
        # Remove markdown code blocks if present
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        elif content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        
        try:
            return json.loads(content.strip())
        except json.JSONDecodeError as e:
            raise LLMError(f"Failed to parse JSON response: {str(e)}\nContent: {content[:200]}")


class LLMError(Exception):
    """Custom exception for LLM-related errors."""
    pass


# Singleton instance
llm_client = LLMClient()
