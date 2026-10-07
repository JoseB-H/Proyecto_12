# Proyecto_12

This repository contains the YitetsuAI MVP scaffold based on the architecture and delivery plan in the project brief.

## Included deliverables

- `main.py` — FastAPI MVP with ethics-aware response validation
- `docker-compose.yml` — Postgres, Redis, Ollama, and API services
- `init.sql` — PostgreSQL schema for users, conversations, documents, and audit logs
- `requirements.txt` — Python dependencies for the stack
- `SETUP.md` — installation and run instructions
- `Makefile` — common developer commands
- `Dockerfile` — container image for the API service

## Quick start

```bash
docker-compose up -d --build
docker exec yitetsuai_ollama ollama pull llama2
curl http://localhost:8000/docs
```

## Ethics guardrails

The project keeps the rules from the brief:

- Human-centered workflows, not replacement of labor
- Critical reasoning with "however", "but", or "alternatively"
- Transparency about limitations and evidence
- Audit logging for each action

