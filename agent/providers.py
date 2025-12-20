"""LLM and embedding provider factories."""

from functools import lru_cache

from openai import AsyncOpenAI
from pydantic_ai.models.openai import OpenAIModel
from pydantic_ai.providers.openai import OpenAIProvider

from settings import load_settings


@lru_cache
def get_llm_model(model_choice: str | None = None) -> OpenAIModel:
    """Get the configured LLM model for the agent.

    Args:
        model_choice: Optional override for the model name.

    Returns:
        Configured OpenAI-compatible model.
    """
    settings = load_settings()

    # Create OpenAI provider with custom base URL if provided
    provider = OpenAIProvider(
        api_key=settings.llm_api_key,
        base_url=settings.llm_base_url,
    )

    model_name = model_choice or settings.llm_model

    return OpenAIModel(model_name, provider=provider)


def get_embedding_client() -> AsyncOpenAI:
    """Get an OpenAI client configured for embeddings.

    Returns:
        AsyncOpenAI client for embedding generation.
    """
    settings = load_settings()

    return AsyncOpenAI(
        api_key=settings.llm_api_key,
        base_url=settings.llm_base_url,
    )
