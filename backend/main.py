"""
FastAPI Backend Entry Point for Multi-Provider AI Platform.
Project 4 (Capstone) — AI & Generative AI Fellowship Program
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from backend.services.provider_router import benchmark_multi_providers

load_dotenv()

app = FastAPI(
    title="Multi-Provider AI Platform API",
    description="Unified benchmark and routing engine comparing OpenAI, Claude, and Gemini.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CompareRequest(BaseModel):
    prompt: str = Field(..., min_length=2, description="Prompt to compare across LLM providers")


@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "Multi-Provider AI Platform API",
        "version": "1.0.0"
    }


@app.post("/api/compare")
def compare_providers(request: CompareRequest):
    """Benchmarks prompt across Gemini, OpenAI, and Claude side-by-side."""
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
    return benchmark_multi_providers(request.prompt.strip())


@app.get("/api/demo")
def sample_demo():
    """Runs quick multi-provider benchmark demo."""
    sample_prompt = "Explain quantum computing principles in 3 bullet points."
    return benchmark_multi_providers(sample_prompt)
