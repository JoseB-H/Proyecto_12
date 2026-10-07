# YitetsuAI Setup Guide

## Requirements

- Docker Desktop or Docker Engine
- Python 3.12+
- Git

## Quick start with Docker

```bash
docker-compose up -d --build
docker exec yitetsuai_ollama ollama pull llama2
curl http://localhost:8000/docs
```

## Local development

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Useful commands

```bash
make up
make down
make logs
make pull-model
```

## Database notes

The PostgreSQL schema is defined in `init.sql` and includes:

- `users`
- `conversations`
- `documents`
- `audit_log`

The `documents` table includes a vector column for semantic search using `pgvector`.

## Ethics validation

Every AI response is validated against the project ethics policy:

- No replacement of human labor
- Critical reasoning with `however`, `but`, or `alternatively`
- Transparency about limitations and uncertainty
- Audit logging for actions
