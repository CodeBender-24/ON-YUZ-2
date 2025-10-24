from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List

from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from .config import get_settings
from .database import get_session
from .schemas import (
    Account,
    AccountDetail,
    ErrorResponse,
    Transfer,
    TransferCreate,
    TransferCreated,
)

settings = get_settings()

limiter = Limiter(key_func=get_remote_address, default_limits=[f"{settings.api_rate_limit_per_min}/minute"])

app = FastAPI(title="Alternatif Bank Demo API")

app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"error": "Çok fazla istek yapıldı."})

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    status_code = exc.status_code if exc.status_code else 500
    detail = exc.detail
    if isinstance(detail, dict) and "error" in detail:
        payload = detail
    elif isinstance(detail, str):
        payload = {"error": detail}
    else:
        payload = {"error": "Beklenmeyen hata"}
    return JSONResponse(status_code=status_code, content=payload)


@app.get("/api/health")
async def healthcheck(session: AsyncSession = Depends(get_session)) -> Dict[str, str]:
    await session.execute(text("SELECT 1"))
    return {"status": "ok"}


@app.get("/api/accounts", response_model=List[Account])
@limiter.limit("{}/minute".format(settings.api_rate_limit_per_min))
async def list_accounts(session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        text(
            "SELECT full_name, iban, balance, created_at FROM bank.accounts ORDER BY id"
        )
    )
    rows = result.mappings().all()
    return [Account(**row) for row in rows]


@app.get("/api/accounts/{iban}", response_model=AccountDetail)
@limiter.limit("{}/minute".format(settings.api_rate_limit_per_min))
async def account_detail(iban: str, session: AsyncSession = Depends(get_session)):
    account_result = await session.execute(
        text(
            """
            SELECT full_name, iban, balance, created_at
            FROM bank.accounts
            WHERE iban = :iban
            """
        ),
        {"iban": iban},
    )
    account_row = account_result.mappings().first()
    if not account_row:
        raise HTTPException(status_code=404, detail="Account not found")

    transfer_result = await session.execute(
        text(
            """
            SELECT id, amount, from_full_name, from_iban, to_full_name, to_iban, created_at
            FROM bank.transfers
            WHERE from_iban = :iban OR to_iban = :iban
            ORDER BY created_at DESC
            LIMIT 20
            """
        ),
        {"iban": iban},
    )
    transfers = [Transfer(**row) for row in transfer_result.mappings().all()]
    return AccountDetail(account=Account(**account_row), transfers=transfers)


@app.get("/api/transfers", response_model=List[Transfer])
@limiter.limit("{}/minute".format(settings.api_rate_limit_per_min))
async def list_transfers(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        text(
            """
            SELECT id, amount, from_full_name, from_iban, to_full_name, to_iban, created_at
            FROM bank.transfers
            ORDER BY created_at DESC
            LIMIT :limit OFFSET :offset
            """
        ),
        {"limit": limit, "offset": offset},
    )
    return [Transfer(**row) for row in result.mappings().all()]


@app.post("/api/transfers", response_model=TransferCreated, responses={400: {"model": ErrorResponse}})
@limiter.limit("{}/minute".format(settings.api_rate_limit_per_min))
async def create_transfer(
    payload: TransferCreate,
    session: AsyncSession = Depends(get_session),
):
    if payload.fromIban == payload.toIban:
        raise HTTPException(status_code=400, detail="Gönderen ve alıcı IBAN aynı olamaz.")

    try:
        amount_value = Decimal(payload.amount).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        result = await session.execute(
            text(
                "SELECT bank.send_money(:from_iban, :to_iban, :amount)::BIGINT AS id"
            ),
            {
                "from_iban": payload.fromIban,
                "to_iban": payload.toIban,
                "amount": amount_value,
            },
        )
        row = result.mappings().first()
        await session.commit()
    except DBAPIError as exc:
        await session.rollback()
        original = getattr(exc, "orig", None)
        error_message = None
        if original is not None:
            error_message = getattr(original, "message", None) or getattr(
                original, "detail", None
            )
            if not error_message and getattr(original, "args", None):
                error_message = original.args[0]
        if not error_message:
            error_message = "Transfer işlemi başarısız oldu."
        else:
            error_message = str(error_message)
        raise HTTPException(status_code=400, detail=error_message)

    if not row or row.get("id") is None:
        raise HTTPException(status_code=500, detail="Transfer işlemi tamamlanamadı.")

    return TransferCreated(id=row["id"])
