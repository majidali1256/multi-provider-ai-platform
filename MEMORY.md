# 🧠 PROJECT MEMORY & ARCHITECTURE GUIDE

**Project:** Multi-Provider AI Platform — Capstone Benchmarking Engine  
**Repository:** `Zeppelin Lab / Multi-Provider AI Platform`  
**Fellowship:** AI & Generative AI Fellowship @ Zeppelin Lab (Project 4 Capstone / Weeks 7 & 8)  
**Developer Mode:** Solo Developer (`@majidali1256` — Working 100% Alone)

---

## 📐 Project Overview & Architecture

Multi-Provider AI Platform is an enterprise multi-LLM benchmark and router platform that compares Google Gemini, OpenAI, and Anthropic Claude side-by-side based on response latency (ms), token cost ($), response length, and output quality.

```
                          ┌───────────────────────────────┐
                          │    Next.js 16 Frontend UI     │
                          │    http://localhost:3070      │
                          └──────────────┬────────────────┘
                                         │ (REST API / Multi-Compare)
                                         ▼
                          ┌───────────────────────────────┐
                          │    FastAPI Backend Server     │
                          │    http://localhost:8004      │
                          └──────────────┬────────────────┘
                                         │
            ┌────────────────────────────┼────────────────────────────┐
            ▼                            ▼                            ▼
 ┌────────────────────┐       ┌────────────────────┐       ┌────────────────────┐
 │ Google Gemini API  │       │ OpenAI GPT-4o API  │       │ Anthropic Claude   │
 │ (Gemini Flash)     │       │ (GPT-4o-mini)      │       │ (Claude 3.5 Sonnet)│
 └────────────────────┘       └────────────────────┘       └────────────────────┘
```

---

## 🛠️ Tech Stack & Dependencies

| Layer | Technology | Key Libraries / Frameworks |
|---|---|---|
| **Frontend** | Next.js 16 (App Router) | React 19, Tailwind CSS v4, Framer Motion, Lucide Icons |
| **Backend** | Python 3.9–3.12 + FastAPI | Uvicorn, Pydantic v2, Python-dotenv, Tenacity |
| **LLM Providers** | Multi-Provider APIs | Google Gemini, OpenAI GPT-4o, Anthropic Claude |
| **Testing** | Pytest | Automated test suite in `backend/tests/` |

---

## 📋 API Endpoints

- `GET /api/health`: System status.
- `POST /api/compare`: Executes parallel multi-provider prompt generation and returns latency (ms), cost ($), and response output side-by-side.
- `GET /api/demo`: Preloaded multi-LLM benchmark demo comparison.
