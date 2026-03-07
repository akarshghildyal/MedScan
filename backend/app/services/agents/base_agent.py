"""
Base Agent Class for MedScan Agent Pipeline

Provides a common interface for LLM-based agents:
- System prompt management
- LLM call wrapper
- Standardized output format
- Logging
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from datetime import datetime
import logging

from app.services.llm.llm_client import llm_client, LLMError


logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """
    Abstract base class for all MedScan agents.
    
    Each agent must implement:
    - name: Agent identifier
    - system_prompt: Instructions for the LLM
    - process(): Main processing logic
    """
    
    def __init__(self):
        self.llm = llm_client
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Unique identifier for the agent."""
        pass
    
    @property
    @abstractmethod
    def system_prompt(self) -> str:
        """System prompt that defines agent behavior."""
        pass
    
    @property
    @abstractmethod
    def model(self) -> str:
        """LLM model to use for this agent."""
        pass
    
    @abstractmethod
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process input and return structured output.
        
        Args:
            input_data: Agent-specific input data
            
        Returns:
            Agent-specific output data
        """
        pass
    
    async def _call_llm(
        self,
        prompt: str,
        temperature: float = 0.3,
        max_tokens: int = 2048,
        expect_json: bool = False
    ) -> Dict[str, Any]:
        """
        Make an LLM call with the agent's system prompt.
        
        Args:
            prompt: User prompt
            temperature: Sampling temperature
            max_tokens: Max response tokens
            expect_json: Whether to parse response as JSON
            
        Returns:
            LLM response with 'content' key
        """
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ]
        
        logger.info(f"Agent {self.name}: Making LLM call")
        
        try:
            response = await self.llm.chat(
                messages=messages,
                model=self.model,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            if expect_json:
                response["parsed"] = self.llm.parse_json_response(response["content"])
            
            logger.info(f"Agent {self.name}: LLM call successful")
            return response
            
        except LLMError as e:
            logger.error(f"Agent {self.name}: LLM error - {str(e)}")
            raise AgentError(f"LLM call failed: {str(e)}")
    
    def _create_output(
        self,
        success: bool,
        data: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a standardized output format."""
        return {
            "agent": self.name,
            "success": success,
            "timestamp": datetime.utcnow().isoformat(),
            "data": data or {},
            "error": error
        }


class AgentError(Exception):
    """Custom exception for agent-related errors."""
    pass
