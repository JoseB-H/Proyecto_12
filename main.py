from __future__ import annotations

import uuid
from typing import Optional

from fastapi import FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="YitetsuAI",
    version="0.1.0",
    description="Ethical AI assistant MVP for human-augmented workflows.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ETHICAL_BLOCKLIST = [
    "automate",
    "eliminate jobs",
    "replace workers",
]

CRITICAL_HINTS = ["however", "but", "alternatively"]

USERS_DB: dict[str, dict[str, str]] = {}
TOKENS_DB: dict[str, str] = {}
AUDIT_LOG: list[dict[str, str]] = []


class RegisterRequest(BaseModel):
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)


class ChatRequest(BaseModel):
    prompt: str = Field(..., min_length=3)


def log_event(event: str, payload: str) -> None:
    AUDIT_LOG.append({"event": event, "payload": payload})


def validate_response(response: str) -> tuple[bool, Optional[str]]:
    lowered = response.lower()

    if any(pattern in lowered for pattern in ETHICAL_BLOCKLIST):
        return False, "Blocked: the response suggests replacing or eliminating human work."

    if not any(hint in lowered for hint in CRITICAL_HINTS):
        return False, "The response must include critical reasoning with however/but/alternatively."

    if "limitations" not in lowered and "uncertainty" not in lowered:
        return False, "The response must acknowledge limitations or uncertainty."

    if "source" not in lowered and "evidence" not in lowered:
        return False, "The response should cite evidence or a source for transparency."

    return True, None


def build_ai_response(prompt: str) -> str:
    return (
        f"Here is a practical approach for '{prompt}': start with a small pilot, document the workflow, and keep human review in the loop; however, "
        "this approach may require more setup time and governance. "
        "Alternatively, an incremental rollout can reduce adoption risk while preserving the team's judgment. "
        "The recommendation is grounded in general AI implementation principles and public source material, but it has limitations because local context, data quality, and regulatory requirements can change the answer."
    )


@app.get("/health")
def health() -> dict[str, str]:
    log_event("health_check", "service is running")
    return {"status": "ok", "service": "yitetsuai"}


@app.post("/auth/register", status_code=status.HTTP_201_CREATED)
def register_user(payload: RegisterRequest) -> dict[str, str]:
    if payload.email.lower() in USERS_DB:
        raise HTTPException(status_code=400, detail="User already exists")

    user_id = str(uuid.uuid4())
    USERS_DB[payload.email.lower()] = {
        "user_id": user_id,
        "email": payload.email.lower(),
        "password": payload.password,
        "full_name": payload.full_name,
    }
    token = uuid.uuid4().hex
    TOKENS_DB[token] = payload.email.lower()
    log_event("register_user", payload.email.lower())
    return {"user_id": user_id, "email": payload.email.lower(), "token": token}


@app.post("/auth/login")
def login_user(payload: LoginRequest) -> dict[str, str]:
    user = USERS_DB.get(payload.email.lower())
    if not user or user["password"] != payload.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = uuid.uuid4().hex
    TOKENS_DB[token] = payload.email.lower()
    log_event("login_user", payload.email.lower())
    return {"user_id": user["user_id"], "email": user["email"], "token": token}


@app.get("/users/me")
def get_current_user(authorization: str = Header(default="")) -> dict[str, str]:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = authorization.split(" ", 1)[1].strip()
    email = TOKENS_DB.get(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = USERS_DB[email]
    log_event("get_current_user", email)
    return {"user_id": user["user_id"], "email": user["email"], "full_name": user["full_name"]}


@app.post("/chat")
def chat(payload: ChatRequest) -> dict[str, object]:
    response_text = build_ai_response(payload.prompt)
    valid, reason = validate_response(response_text)
    if not valid:
        raise HTTPException(status_code=400, detail=reason)

    log_event("chat_request", payload.prompt)
    return {"response": response_text, "validated": True, "audit_count": len(AUDIT_LOG)}

