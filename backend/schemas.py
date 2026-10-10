from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class ContactCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Full name of sender")
    email: EmailStr = Field(..., description="Valid contact email address")
    phone: Optional[str] = Field(None, max_length=50, description="Optional phone number")
    message: str = Field(..., min_length=1, description="Message content")

class ContactResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    message: str
    created_at: datetime

    class Config:
        from_attributes = True

class StatusResponse(BaseModel):
    status: str
    database: str
    details: Optional[str] = None
