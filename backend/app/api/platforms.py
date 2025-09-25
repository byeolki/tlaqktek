from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.connected_platform import ConnectedPlatform
from app.schemas.platform import ConnectedPlatformCreate, ConnectedPlatformResponse
from app.api.deps import get_current_user
from app.core.encryption import encrypt_credentials

router = APIRouter(prefix="/platforms", tags=["Connected platforms"])

@router.post("/connect", response_model=ConnectedPlatformResponse)
def connect_platform(
    platform_data: ConnectedPlatformCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(ConnectedPlatform).filter(
        ConnectedPlatform.user_id == current_user.id,
        ConnectedPlatform.platform_name == platform_data.platform_name
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="platform already connected")

    encrypted_creds = encrypt_credentials(platform_data.platform_user_id, platform_data.password)

    new_platform = ConnectedPlatform(
        user_id=current_user.id,
        platform_name=platform_data.platform_name,
        platform_user_id=platform_data.platform_user_id,
        encrypted_password=encrypted_creds
    )

    db.add(new_platform)
    db.commit()
    db.refresh(new_platform)
    return new_platform

@router.get("/", response_model=list[ConnectedPlatformResponse])
def get_connected_platforms(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    platforms = db.query(ConnectedPlatform).filter(ConnectedPlatform.user_id == current_user.id).all()
    return platforms

@router.delete("/{platform_name}")
def disconnect_platform(
    platform_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    platform = db.query(ConnectedPlatform).filter(
        ConnectedPlatform.platform_name == platform_name,
        ConnectedPlatform.user_id == current_user.id
    ).first()

    if not platform:
        raise HTTPException(status_code=404, detail="platform not found")

    db.delete(platform)
    db.commit()
    return {"message": "platform disconnected successfully"}
