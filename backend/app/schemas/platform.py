from pydantic import BaseModel, Field
from typing import Optional

class ConnectedPlatformCreate(BaseModel):
    platform_name: str = Field(..., pattern="^(bunjang|joongna)$")
    platform_user_id: str
    password: str

class ConnectedPlatformResponse(BaseModel):
    id: int
    platform_name: str
    platform_user_id: str

    class Config:
        from_attributes = True

class ConnectedPlatformUpdate(BaseModel):
    platform_user_id: Optional[str] = None
    password: Optional[str] = None
