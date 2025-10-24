from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field


class Account(BaseModel):
    full_name: str
    iban: str
    balance: Decimal
    created_at: datetime


class Transfer(BaseModel):
    id: int
    amount: Decimal
    from_full_name: Optional[str] = None
    from_iban: Optional[str] = None
    to_full_name: Optional[str] = None
    to_iban: Optional[str] = None
    created_at: datetime


class AccountDetail(BaseModel):
    account: Account
    transfers: List[Transfer]


class TransferCreate(BaseModel):
    fromIban: str = Field(..., regex=r"^TR[0-9]{24}$")
    toIban: str = Field(..., regex=r"^TR[0-9]{24}$")
    amount: Decimal = Field(..., gt=0)

    class Config:
        json_schema_extra = {
            "example": {
                "fromIban": "TR120006200000000123456789",
                "toIban": "TR560006200000000987654321",
                "amount": "10.00",
            }
        }


class TransferCreated(BaseModel):
    id: int


class ErrorResponse(BaseModel):
    error: str
